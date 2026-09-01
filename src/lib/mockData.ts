import { getLocation, LOCATIONS } from "./locations";
import { nowUnix } from "./format";
import { ChainGuardError } from "./errors";
import {
  MAX_COVERAGE_WEI,
  MIN_COVERAGE_WEI,
  MOCK_WALLET,
  POLICY_DURATION_SECONDS,
  RISK_PAYOUT_THRESHOLD,
  type Address,
  type Hex,
  type PayoutEvent,
  type Policy,
  type RiskReading,
} from "./types";

type SerializedPolicy = Omit<
  Policy,
  | "policyId"
  | "locationId"
  | "coverageAmount"
  | "premiumPaid"
  | "purchasedAt"
  | "expiresAt"
  | "payoutAmount"
> & {
  policyId: string;
  locationId: string;
  coverageAmount: string;
  premiumPaid: string;
  purchasedAt: string;
  expiresAt: string;
  payoutAmount: string;
};

type SerializedRisk = Omit<RiskReading, "locationId" | "updatedAt" | "sensorValue"> & {
  locationId: string;
  updatedAt: string;
  sensorValue: string;
};

type SerializedPayout = Omit<
  PayoutEvent,
  "policyId" | "amount" | "timestamp"
> & {
  policyId: string;
  amount: string;
  timestamp: string;
};

type Persisted = {
  nextId: number;
  wallet: Address | null;
  balance: string;
  policies: SerializedPolicy[];
  risks: SerializedRisk[];
  payouts: SerializedPayout[];
};

const STORAGE_KEY = "chainguard.mock.v1";

function defaultRisks(): RiskReading[] {
  const now = nowUnix();
  const seeds: Array<[bigint, number, bigint]> = [
    [1n, 18, 420n],
    [2n, 24, 510n],
    [3n, 12, 280n],
    [4n, 29, 640n],
    [5n, 16, 330n],
    [6n, 21, 390n],
  ];
  return seeds.map(([locationId, riskScore, sensorValue]) => ({
    locationId,
    riskScore,
    sensorValue,
    updatedAt: now,
  }));
}

function serialize(state: MockState): Persisted {
  return {
    nextId: state.nextId,
    wallet: state.wallet,
    balance: state.balance.toString(),
    policies: state.policies.map((p) => ({
      ...p,
      policyId: p.policyId.toString(),
      locationId: p.locationId.toString(),
      coverageAmount: p.coverageAmount.toString(),
      premiumPaid: p.premiumPaid.toString(),
      purchasedAt: p.purchasedAt.toString(),
      expiresAt: p.expiresAt.toString(),
      payoutAmount: p.payoutAmount.toString(),
    })),
    risks: state.risks.map((r) => ({
      ...r,
      locationId: r.locationId.toString(),
      updatedAt: r.updatedAt.toString(),
      sensorValue: r.sensorValue.toString(),
    })),
    payouts: state.payouts.map((e) => ({
      ...e,
      policyId: e.policyId.toString(),
      amount: e.amount.toString(),
      timestamp: e.timestamp.toString(),
    })),
  };
}

function deserialize(raw: Persisted): MockState {
  return {
    nextId: raw.nextId,
    wallet: raw.wallet,
    balance: BigInt(raw.balance),
    policies: raw.policies.map((p) => ({
      ...p,
      policyId: BigInt(p.policyId),
      locationId: BigInt(p.locationId),
      coverageAmount: BigInt(p.coverageAmount),
      premiumPaid: BigInt(p.premiumPaid),
      purchasedAt: BigInt(p.purchasedAt),
      expiresAt: BigInt(p.expiresAt),
      payoutAmount: BigInt(p.payoutAmount),
    })),
    risks: raw.risks.map((r) => ({
      ...r,
      locationId: BigInt(r.locationId),
      updatedAt: BigInt(r.updatedAt),
      sensorValue: BigInt(r.sensorValue),
    })),
    payouts: raw.payouts.map((e) => ({
      ...e,
      policyId: BigInt(e.policyId),
      amount: BigInt(e.amount),
      timestamp: BigInt(e.timestamp),
    })),
  };
}

export type MockState = {
  nextId: number;
  wallet: Address | null;
  balance: bigint;
  policies: Policy[];
  risks: RiskReading[];
  payouts: PayoutEvent[];
};

function freshState(): MockState {
  return {
    nextId: 1,
    wallet: null,
    balance: 10n * 10n ** 18n,
    policies: [],
    risks: defaultRisks(),
    payouts: [],
  };
}

function load(): MockState {
  if (typeof localStorage === "undefined") return freshState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    return deserialize(JSON.parse(raw) as Persisted);
  } catch {
    return freshState();
  }
}

function save(state: MockState) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(state)));
}

let state: MockState = freshState();
let revision = 0;
const listeners = new Set<() => void>();

function emit() {
  revision += 1;
  save(state);
  listeners.forEach((l) => l());
}

export function hydrateMock() {
  if (typeof window === "undefined") return;
  state = load();
  revision += 1;
  listeners.forEach((l) => l());
}

export function subscribeMock(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getMockRevision(): number {
  return revision;
}

export function getMockState(): MockState {
  return state;
}

export function quotePremiumMock(locationId: bigint, coverageAmount: bigint): bigint {
  const loc = getLocation(locationId);
  if (!loc) throw new ChainGuardError("That location is not in the underwriting table.", "InvalidLocation");
  if (coverageAmount < MIN_COVERAGE_WEI || coverageAmount > MAX_COVERAGE_WEI) {
    throw new ChainGuardError("Coverage is outside the allowed range.", "CoverageOutOfBounds");
  }
  return (coverageAmount * BigInt(loc.basePremiumBps)) / 10000n;
}

export function connectMockWallet(): Address {
  state = { ...state, wallet: MOCK_WALLET };
  emit();
  return MOCK_WALLET;
}

export function disconnectMockWallet() {
  state = { ...state, wallet: null };
  emit();
}

export async function buyPolicyMock(
  locationId: bigint,
  coverageAmount: bigint,
): Promise<{ policyId: bigint; txHash: Hex; premium: bigint }> {
  if (!state.wallet) {
    throw new ChainGuardError("Connect a wallet to continue.", "WalletNotConnected");
  }
  const loc = getLocation(locationId);
  if (!loc) throw new ChainGuardError("That location is not in the underwriting table.", "InvalidLocation");
  if (coverageAmount < MIN_COVERAGE_WEI || coverageAmount > MAX_COVERAGE_WEI) {
    throw new ChainGuardError("Coverage is outside the allowed range.", "CoverageOutOfBounds");
  }

  const premium = quotePremiumMock(locationId, coverageAmount);
  if (state.balance < premium) {
    throw new ChainGuardError("Wallet does not have enough ETH for premium and gas.", "InsufficientPremium");
  }

  await delay(720);

  const purchasedAt = nowUnix();
  const policy: Policy = {
    policyId: BigInt(state.nextId),
    holder: state.wallet,
    locationId,
    coverageAmount,
    premiumPaid: premium,
    purchasedAt,
    expiresAt: purchasedAt + BigInt(POLICY_DURATION_SECONDS),
    status: "Active",
    claimed: false,
    payoutAmount: 0n,
  };

  const txHash = (`0x${crypto.randomUUID().replace(/-/g, "").padEnd(64, "0")}`) as Hex;

  state = {
    ...state,
    nextId: state.nextId + 1,
    balance: state.balance - premium,
    policies: [policy, ...state.policies],
  };
  emit();

  await delay(480);
  return { policyId: policy.policyId, txHash, premium };
}

export function getPoliciesMock(holder: Address): Policy[] {
  const now = nowUnix();
  return state.policies
    .filter((p) => p.holder.toLowerCase() === holder.toLowerCase())
    .map((p) => expireIfNeeded(p, now));
}

export function getPolicyMock(policyId: bigint): Policy {
  const found = state.policies.find((p) => p.policyId === policyId);
  if (!found) throw new ChainGuardError("This policy does not exist.", "PolicyNotFound");
  return expireIfNeeded(found, nowUnix());
}

export function getRiskMock(locationId: bigint): RiskReading {
  const found = state.risks.find((r) => r.locationId === locationId);
  if (found) return found;
  return {
    locationId,
    riskScore: 0,
    updatedAt: nowUnix(),
    sensorValue: 0n,
  };
}

export function getAllRisksMock(): RiskReading[] {
  return state.risks;
}

export function getPayoutsMock(holder?: Address): PayoutEvent[] {
  if (!holder) return state.payouts;
  return state.payouts.filter((e) => e.holder.toLowerCase() === holder.toLowerCase());
}

export function simulateFlood(locationId: bigint, riskScore: number) {
  const clamped = Math.max(0, Math.min(100, Math.round(riskScore)));
  const sensorValue = BigInt(200 + clamped * 12);
  state = {
    ...state,
    risks: state.risks.map((r) =>
      r.locationId === locationId
        ? { ...r, riskScore: clamped, sensorValue, updatedAt: nowUnix() }
        : r,
    ),
  };
  emit();

  if (clamped >= RISK_PAYOUT_THRESHOLD) {
    triggerPayoutsForLocation(locationId, clamped);
  }
}

export function simulatePayout(policyId: bigint) {
  const policy = state.policies.find((p) => p.policyId === policyId);
  if (!policy) throw new ChainGuardError("This policy does not exist.", "PolicyNotFound");
  if (policy.claimed) throw new ChainGuardError("Payout already settled for this policy.", "AlreadyClaimed");
  const risk = getRiskMock(policy.locationId);
  settlePayout(policy, Math.max(risk.riskScore, RISK_PAYOUT_THRESHOLD));
}

export function resetMock() {
  const wallet = state.wallet;
  state = { ...freshState(), wallet };
  emit();
}

export function seedSamplePolicy() {
  if (!state.wallet) connectMockWallet();
  const holder = state.wallet ?? MOCK_WALLET;
  const purchasedAt = nowUnix() - 3n * 24n * 60n * 60n;
  const policy: Policy = {
    policyId: BigInt(state.nextId),
    holder,
    locationId: 1n,
    coverageAmount: 10n ** 17n,
    premiumPaid: quotePremiumMock(1n, 10n ** 17n),
    purchasedAt,
    expiresAt: purchasedAt + BigInt(POLICY_DURATION_SECONDS),
    status: "Active",
    claimed: false,
    payoutAmount: 0n,
  };
  state = {
    ...state,
    nextId: state.nextId + 1,
    wallet: holder,
    policies: [policy, ...state.policies],
  };
  emit();
  return policy;
}

function triggerPayoutsForLocation(locationId: bigint, riskScore: number) {
  const now = nowUnix();
  for (const policy of state.policies) {
    const live = expireIfNeeded(policy, now);
    if (live.locationId !== locationId) continue;
    if (live.status !== "Active" || live.claimed) continue;
    settlePayout(live, riskScore);
  }
}

function settlePayout(policy: Policy, riskScore: number) {
  const event: PayoutEvent = {
    policyId: policy.policyId,
    holder: policy.holder,
    amount: policy.coverageAmount,
    riskScore,
    timestamp: nowUnix(),
    txHash: (`0x${crypto.randomUUID().replace(/-/g, "").padEnd(64, "0")}`) as Hex,
  };
  state = {
    ...state,
    balance: state.wallet?.toLowerCase() === policy.holder.toLowerCase()
      ? state.balance + policy.coverageAmount
      : state.balance,
    policies: state.policies.map((p) =>
      p.policyId === policy.policyId
        ? {
            ...p,
            status: "Claimed" as const,
            claimed: true,
            payoutAmount: policy.coverageAmount,
          }
        : p,
    ),
    payouts: [event, ...state.payouts],
  };
  emit();
}

function expireIfNeeded(policy: Policy, now: bigint): Policy {
  if (policy.status === "Active" && now > policy.expiresAt) {
    return { ...policy, status: "Expired" };
  }
  return policy;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MOCK_LOCATIONS = LOCATIONS;
