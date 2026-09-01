/**
 * Single blockchain abstraction layer.
 *
 * UI and hooks talk only to this module. Mock vs live is decided here.
 */

import {
  createPublicClient,
  decodeEventLog,
  http,
  type PublicClient,
} from "viem";
import { getLocation, LOCATIONS } from "./locations";
import { insurancePoolAbi, riskEngineAbi, mockOracleAbi } from "./abis";
import { ADDRESSES, CHAIN_ID, RPC_URL, defaultMockMode, hasRealAddresses } from "./config";
import { ChainGuardError, decodeContractError } from "./errors";
import {
  buyPolicyMock,
  connectMockWallet,
  disconnectMockWallet,
  getAllRisksMock,
  getMockRevision,
  getPoliciesMock,
  getPolicyMock,
  getPayoutsMock,
  getRiskMock,
  quotePremiumMock,
  resetMock,
  seedSamplePolicy,
  simulateFlood,
  simulatePayout,
  subscribeMock,
  getMockState,
} from "./mockData";
import {
  ARBITRUM_SEPOLIA_CHAIN_ID,
  POLICY_DURATION_SECONDS,
  type Address,
  type Hex,
  type PayoutEvent,
  type Policy,
  type PolicyStatus,
  type RiskReading,
  type WalletState,
} from "./types";

export {
  simulateFlood,
  simulatePayout,
  resetMock,
  seedSamplePolicy,
  getAllRisksMock,
};

const MODE_KEY = "chainguard.mode";

let mockOverride: boolean | null = null;
let modeHydrated = false;

function readStoredMode(): boolean | null {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(MODE_KEY);
  if (v === "mock") return true;
  if (v === "live") return false;
  return null;
}

export function isMockMode(): boolean {
  if (mockOverride !== null) return mockOverride;
  if (!modeHydrated) return defaultMockMode();
  const stored = readStoredMode();
  if (stored !== null) return stored;
  return defaultMockMode();
}

export function setMockMode(next: boolean) {
  mockOverride = next;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(MODE_KEY, next ? "mock" : "live");
  }
  notify();
}

export function hydrateContractLayer() {
  if (typeof window === "undefined") return;
  modeHydrated = true;
  mockOverride = readStoredMode();
  notify();
}

export function canUseLiveMode(): boolean {
  return hasRealAddresses();
}

let revision = 0;
const listeners = new Set<() => void>();

function notify() {
  revision += 1;
  listeners.forEach((l) => l());
}

export function subscribeContractState(cb: () => void): () => void {
  const unsubMock = subscribeMock(() => {
    revision += 1;
    cb();
  });
  listeners.add(cb);
  return () => {
    unsubMock();
    listeners.delete(cb);
  };
}

export function getContractRevision(): number {
  return revision + getMockRevision();
}

let publicClient: PublicClient | null = null;

function getClient(): PublicClient {
  if (!publicClient) {
    publicClient = createPublicClient({
      transport: http(RPC_URL),
    });
  }
  return publicClient;
}

export function getLocations() {
  return LOCATIONS;
}

export async function quotePremium(
  locationId: bigint,
  coverageAmount: bigint,
): Promise<bigint> {
  if (isMockMode()) return quotePremiumMock(locationId, coverageAmount);

  // If RiskEngine is deployed on-chain, query live pricing
  if (ADDRESSES.riskEngine) {
    try {
      const bps = (await getClient().readContract({
        address: ADDRESSES.riskEngine,
        abi: riskEngineAbi,
        functionName: "pricePremium",
        args: [locationId],
      })) as bigint;
      if (typeof bps === "bigint" && bps > 0n) {
        return (coverageAmount * bps) / 10000n;
      }
    } catch {
      // Contract not yet deployed or returned empty data (0x) - fallback to location table
    }
  }

  // Fallback calculation from verified location matrix
  const loc = getLocation(locationId);
  const bps = BigInt(loc?.basePremiumBps ?? 400);
  return (coverageAmount * bps) / 10000n;
}

export async function buyPolicy(
  locationId: bigint,
  coverageAmount: bigint,
  helpers?: {
    walletClient?: {
      account: Address;
      writeContract: (args: Record<string, unknown>) => Promise<Hex>;
    };
  },
): Promise<{ policyId: bigint; txHash: Hex; premium: bigint }> {
  if (isMockMode()) {
    return buyPolicyMock(locationId, coverageAmount);
  }
  if (!ADDRESSES.insurancePool) {
    throw new ChainGuardError("Insurance pool address is not configured.");
  }
  if (!helpers?.walletClient) {
    throw new ChainGuardError("Connect a wallet to continue.", "WalletNotConnected");
  }
  try {
    const premium = await quotePremium(locationId, coverageAmount);
    const hash = await helpers.walletClient.writeContract({
      address: ADDRESSES.insurancePool,
      abi: insurancePoolAbi,
      functionName: "buyPolicy",
      args: [locationId, coverageAmount],
      value: premium,
      account: helpers.walletClient.account,
      chain: { id: CHAIN_ID },
    });
    const receipt = await getClient().waitForTransactionReceipt({ hash });
    let policyId = 0n;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: insurancePoolAbi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "PolicyPurchased") {
          policyId = decoded.args.policyId as bigint;
        }
      } catch {
        /* skip unrelated logs */
      }
    }
    return { policyId, txHash: hash, premium };
  } catch (error) {
    const decoded = decodeContractError(error);
    throw new ChainGuardError(decoded.message, decoded.code);
  }
}

export async function getPolicies(holder: Address): Promise<Policy[]> {
  if (isMockMode()) return getPoliciesMock(holder);
  if (!ADDRESSES.insurancePool) return [];
  try {
    const ids = (await getClient().readContract({
      address: ADDRESSES.insurancePool,
      abi: insurancePoolAbi,
      functionName: "getPoliciesByOwner",
      args: [holder],
    })) as readonly bigint[];
    const policies = await Promise.all(ids.map((id) => getPolicy(id)));
    return policies.sort((a, b) => Number(b.purchasedAt - a.purchasedAt));
  } catch {
    // Return empty list if address has no bytecode yet
    return [];
  }
}

export async function getPolicy(policyId: bigint): Promise<Policy> {
  if (isMockMode()) return getPolicyMock(policyId);
  if (!ADDRESSES.insurancePool) {
    throw new ChainGuardError("This policy does not exist.", "PolicyNotFound");
  }
  try {
    const raw = (await getClient().readContract({
      address: ADDRESSES.insurancePool,
      abi: insurancePoolAbi,
      functionName: "getPolicy",
      args: [policyId],
    })) as {
      policyId: bigint;
      holder: Address;
      locationId: bigint;
      coverageAmount: bigint;
      premiumPaid: bigint;
      startTimestamp: bigint;
      claimed: boolean;
    };
    return {
      policyId: raw.policyId,
      holder: raw.holder,
      locationId: raw.locationId,
      coverageAmount: raw.coverageAmount,
      premiumPaid: raw.premiumPaid,
      purchasedAt: raw.startTimestamp,
      expiresAt: raw.startTimestamp + BigInt(POLICY_DURATION_SECONDS),
      status: raw.claimed ? "Claimed" : "Active",
      claimed: raw.claimed,
      payoutAmount: raw.claimed ? raw.coverageAmount : 0n,
    };
  } catch (error) {
    const decoded = decodeContractError(error);
    throw new ChainGuardError(decoded.message, decoded.code);
  }
}

export async function getRiskScore(locationId: bigint): Promise<RiskReading> {
  if (isMockMode()) return getRiskMock(locationId);
  if (!ADDRESSES.mockOracle && !ADDRESSES.riskEngine) {
    return {
      locationId,
      riskScore: 0,
      updatedAt: 0n,
      sensorValue: 0n,
    };
  }
  try {
    const client = getClient();
    let rainfall = 0n;
    let riverLevel = 0n;
    let soilMoisture = 0n;
    let updatedAt = 0n;

    if (ADDRESSES.mockOracle) {
      try {
        const reading = (await client.readContract({
          address: ADDRESSES.mockOracle,
          abi: mockOracleAbi,
          functionName: "latestReading",
          args: [locationId],
        })) as {
          locationId: bigint;
          rainfall: bigint;
          riverLevel: bigint;
          soilMoisture: bigint;
          timestamp: bigint;
        };
        rainfall = reading.rainfall;
        riverLevel = reading.riverLevel;
        soilMoisture = reading.soilMoisture;
        updatedAt = reading.timestamp;
      } catch {
        /* fallback if no oracle reading exists */
      }
    }

    let riskScore = 0;
    if (ADDRESSES.riskEngine && (rainfall > 0n || riverLevel > 0n || soilMoisture > 0n)) {
      try {
        const rawScore = (await client.readContract({
          address: ADDRESSES.riskEngine,
          abi: riskEngineAbi,
          functionName: "calculateRiskScore",
          args: [
            [rainfall, riverLevel, soilMoisture],
            [40, 35, 25],
          ],
        })) as number;
        riskScore = Math.round(Number(rawScore) / 100);
      } catch {
        riskScore = 0;
      }
    }

    return {
      locationId,
      riskScore,
      updatedAt,
      sensorValue: rainfall,
    };
  } catch {
    return {
      locationId,
      riskScore: 0,
      updatedAt: 0n,
      sensorValue: 0n,
    };
  }
}

export async function getAllRiskScores(): Promise<RiskReading[]> {
  if (isMockMode()) return getAllRisksMock();
  return Promise.all(LOCATIONS.map((l) => getRiskScore(l.id)));
}

export function watchPayouts(
  holder: Address | null,
  onEvent: (event: PayoutEvent) => void,
): () => void {
  if (isMockMode()) {
    let seen = new Set(getPayoutsMock(holder ?? undefined).map((e) => e.policyId.toString()));
    return subscribeMock(() => {
      const latest = getPayoutsMock(holder ?? undefined);
      for (const event of latest) {
        const key = event.policyId.toString();
        if (!seen.has(key)) {
          seen = new Set(seen).add(key);
          onEvent(event);
        }
      }
    });
  }
  if (!ADDRESSES.insurancePool) return () => {};
  return getClient().watchContractEvent({
    address: ADDRESSES.insurancePool,
    abi: insurancePoolAbi,
    eventName: "PayoutTriggered",
    onLogs: (logs) => {
      for (const log of logs) {
        const args = log.args;
        if (!args.holder || !args.policyId || args.amount === undefined) continue;
        if (holder && args.holder.toLowerCase() !== holder.toLowerCase()) continue;
        onEvent({
          policyId: args.policyId,
          holder: args.holder,
          amount: args.amount,
          riskScore: Number(args.riskScore ?? 0),
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
          txHash: log.transactionHash,
        });
      }
    },
  });
}

export function connectDemoWallet(): Address {
  return connectMockWallet();
}

export function disconnectDemoWallet() {
  disconnectMockWallet();
}

export function getDemoWallet(): WalletState {
  const mock = getMockState();
  return {
    address: mock.wallet,
    chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
    connected: Boolean(mock.wallet),
    connecting: false,
    isCorrectChain: true,
    hasProvider: true,
  };
}

export function getDemoBalance(): bigint {
  return getMockState().balance;
}

export async function checkAndPayout(
  policyId: bigint,
  helpers?: {
    walletClient?: {
      account: Address;
      writeContract: (args: Record<string, unknown>) => Promise<Hex>;
    };
  },
): Promise<{ txHash: Hex; amount: bigint; riskScore: number }> {
  if (isMockMode()) {
    simulatePayout(policyId);
    return { txHash: "0xmocktx", amount: 100000000000000000n, riskScore: 8500 };
  }
  if (!ADDRESSES.insurancePool) {
    throw new ChainGuardError("Insurance pool address is not configured.");
  }
  if (!helpers?.walletClient) {
    throw new ChainGuardError("Connect a wallet to continue.", "WalletNotConnected");
  }
  try {
    const hash = await helpers.walletClient.writeContract({
      address: ADDRESSES.insurancePool,
      abi: insurancePoolAbi,
      functionName: "checkAndPayout",
      args: [policyId],
      account: helpers.walletClient.account,
      chain: { id: CHAIN_ID },
    });
    const receipt = await getClient().waitForTransactionReceipt({ hash });
    let amount = 0n;
    let riskScore = 8500;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: insurancePoolAbi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "PayoutTriggered") {
          amount = decoded.args.amount as bigint;
          riskScore = Number(decoded.args.riskScore ?? 8500);
        }
      } catch {
        /* skip unrelated logs */
      }
    }
    notify();
    return { txHash: hash, amount, riskScore };
  } catch (error) {
    const decoded = decodeContractError(error);
    throw new ChainGuardError(decoded.message, decoded.code);
  }
}

export async function pushOracleReading(
  locationId: bigint,
  rainfall: bigint,
  riverLevel: bigint,
  soilMoisture: bigint,
  helpers?: {
    walletClient?: {
      account: Address;
      writeContract: (args: Record<string, unknown>) => Promise<Hex>;
    };
  },
): Promise<{ txHash: Hex }> {
  if (isMockMode()) {
    const score = rainfall >= 25000n ? 100 : rainfall >= 12000n ? 50 : 0;
    simulateFlood(locationId, score);
    return { txHash: "0xmocktx" };
  }
  if (!ADDRESSES.mockOracle) {
    throw new ChainGuardError("Mock oracle address is not configured.");
  }
  if (!helpers?.walletClient) {
    throw new ChainGuardError("Connect a wallet to continue.", "WalletNotConnected");
  }
  try {
    const hash = await helpers.walletClient.writeContract({
      address: ADDRESSES.mockOracle,
      abi: mockOracleAbi,
      functionName: "pushReading",
      args: [locationId, rainfall, riverLevel, soilMoisture],
      account: helpers.walletClient.account,
      chain: { id: CHAIN_ID },
    });
    await getClient().waitForTransactionReceipt({ hash });
    notify();
    return { txHash: hash };
  } catch (error) {
    const decoded = decodeContractError(error);
    throw new ChainGuardError(decoded.message, decoded.code);
  }
}

function statusFromCode(code: number): PolicyStatus {
  if (code === 1) return "Claimed";
  if (code === 2) return "Expired";
  return "Active";
}

export { getLocation };
