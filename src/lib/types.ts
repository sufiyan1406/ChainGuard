export type Address = `0x${string}`;
export type Hex = `0x${string}`;

export type PolicyStatus = "Active" | "Claimed" | "Expired";

export type Policy = {
  policyId: bigint;
  holder: Address;
  locationId: bigint;
  coverageAmount: bigint;
  premiumPaid: bigint;
  purchasedAt: bigint;
  expiresAt: bigint;
  status: PolicyStatus;
  claimed: boolean;
  payoutAmount: bigint;
};

export type RiskReading = {
  locationId: bigint;
  riskScore: number;
  updatedAt: bigint;
  sensorValue: bigint;
};

export type PayoutEvent = {
  policyId: bigint;
  holder: Address;
  amount: bigint;
  riskScore: number;
  timestamp: bigint;
  txHash?: Hex;
};

export type Location = {
  id: bigint;
  name: string;
  region: string;
  hazard: "Flood";
  basePremiumBps: number;
  description: string;
};

export type TxState =
  | { phase: "idle" }
  | { phase: "quoting" }
  | { phase: "pending"; message: string }
  | { phase: "confirming"; hash: Hex }
  | { phase: "success"; hash: Hex; policyId: bigint }
  | { phase: "error"; message: string; code?: string };

export type WalletState = {
  address: Address | null;
  chainId: number;
  connected: boolean;
  connecting: boolean;
  isCorrectChain: boolean;
  hasProvider: boolean;
};

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const POLICY_DURATION_SECONDS = 90 * 24 * 60 * 60;
export const RISK_PAYOUT_THRESHOLD = 80;
export const MIN_COVERAGE_WEI = 10n ** 16n; // 0.01 ETH
export const MAX_COVERAGE_WEI = 5n * 10n ** 18n; // 5 ETH
export const MOCK_WALLET: Address = "0xA11CE00000000000000000000000000000000C0";
