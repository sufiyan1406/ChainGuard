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

export const ADDRESSES = {
  riskEngine: asAddress(import.meta.env.VITE_RISK_ENGINE_ADDRESS),
  insurancePool: asAddress(import.meta.env.VITE_INSURANCE_POOL_ADDRESS),
  policyNft: asAddress(import.meta.env.VITE_POLICY_NFT_ADDRESS),
  mockOracle: asAddress(import.meta.env.VITE_MOCK_ORACLE_ADDRESS),
};

export function hasRealAddresses(): boolean {
  return Boolean(ADDRESSES.insurancePool && ADDRESSES.riskEngine);
}

/**
 * Mock is the default until real Sepolia addresses are provided.
 * Set VITE_USE_MOCK=false to force live mode (still requires addresses).
 */
export function defaultMockMode(): boolean {
  const flag = import.meta.env.VITE_USE_MOCK;
  if (flag === "false" || flag === "0") return !hasRealAddresses();
  if (flag === "true" || flag === "1") return true;
  return !hasRealAddresses();
}
