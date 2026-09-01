import { ARBITRUM_SEPOLIA_CHAIN_ID, type Address } from "./types";

function asAddress(value: string | undefined): Address | null {
  if (!value) return null;
  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) return null;
  return value as Address;
}

export const CHAIN_ID = Number(
  import.meta.env.VITE_CHAIN_ID ?? ARBITRUM_SEPOLIA_CHAIN_ID,
);

export const RPC_URL =
  import.meta.env.VITE_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc";

export const PRIVY_APP_ID =
  import.meta.env.VITE_PRIVY_APP_ID ??
  import.meta.env.NEXT_PUBLIC_PRIVY_APP_ID ??
  "";

export function isValidPrivyAppId(id: string | undefined): boolean {
  if (!id) return false;
  if (id === "clx0123456789abcdef" || id.includes("0123456789")) return false;
  return /^[a-z0-9_-]{20,50}$/i.test(id);
}

// Live deployed contracts registry on Arbitrum Sepolia
const DEFAULT_DEPLOYED_CONTRACTS = {
  RiskEngine: "0x946358e31014888e24d0d10fa6dcb63aa78f7599",
  InsurancePool: "0x46c77203efabe8a7a034e7f03d2f0bc68fb32a6f",
  PolicyNFT: "0xe849d1aad65788d9f89ba0c79d0d1e80ed076ea1",
  MockOracle: "0x30d2cb4f73d12cac62caf06bcdbbc98f4bc6331b",
};

export const ADDRESSES = {
  riskEngine:
    asAddress(import.meta.env.VITE_RISK_ENGINE_ADDRESS) ??
    asAddress(DEFAULT_DEPLOYED_CONTRACTS.RiskEngine),
  insurancePool:
    asAddress(import.meta.env.VITE_INSURANCE_POOL_ADDRESS) ??
    asAddress(DEFAULT_DEPLOYED_CONTRACTS.InsurancePool),
  policyNft:
    asAddress(import.meta.env.VITE_POLICY_NFT_ADDRESS) ??
    asAddress(DEFAULT_DEPLOYED_CONTRACTS.PolicyNFT),
  mockOracle:
    asAddress(import.meta.env.VITE_MOCK_ORACLE_ADDRESS) ??
    asAddress(DEFAULT_DEPLOYED_CONTRACTS.MockOracle),
};

export function hasRealAddresses(): boolean {
  return Boolean(ADDRESSES.insurancePool && ADDRESSES.riskEngine);
}

/**
 * Mock is the default unless real Sepolia addresses exist and VITE_USE_MOCK=false.
 */
export function defaultMockMode(): boolean {
  const flag = import.meta.env.VITE_USE_MOCK;
  if (flag === "false" || flag === "0") return !hasRealAddresses();
  if (flag === "true" || flag === "1") return true;
  return !hasRealAddresses();
}
