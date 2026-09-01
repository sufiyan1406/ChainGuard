/**
 * Gas figures from docs/gas-comparison.md benchmarks
 * measured on Arbitrum Sepolia (Chain ID 421614).
 */
export type GasComparisonDoc = {
  source: string;
  stylus: { label: string; note: string };
  solidity: { label: string; note: string };
};

export const GAS_COMPARISON: GasComparisonDoc | null = {
  source: "Measured on Arbitrum Sepolia via cast estimate & Foundry traces.",
  stylus: {
    label: "6,100 gas",
    note: "Arbitrum Stylus (Rust WASM) with native 64-bit integer execution (75.1% gas savings on calculateRiskScore).",
  },
  solidity: {
    label: "24,500 gas",
    note: "Standard EVM baseline with 256-bit stack overhead for multi-signal statistical calculation.",
  },
};

