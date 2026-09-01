import { parseCoverage } from "./format.ts";
import { getLocation } from "./locations.ts";
import { MAX_COVERAGE_WEI, MIN_COVERAGE_WEI } from "./types.ts";

export type BuyInput = {
  locationId: bigint | null;
  coverageInput: string;
  connected: boolean;
  isCorrectChain: boolean;
};

export type BuyValidation = {
  ok: boolean;
  coverage: bigint | null;
  errors: {
    wallet?: string;
    network?: string;
    location?: string;
    coverage?: string;
  };
};

export function validateBuy(input: BuyInput): BuyValidation {
  const errors: BuyValidation["errors"] = {};

  if (!input.connected) {
    errors.wallet = "Connect a wallet to bind cover.";
  } else if (!input.isCorrectChain) {
    errors.network = "Switch to Arbitrum Sepolia.";
  }

  if (input.locationId === null) {
    errors.location = "Select a location.";
  } else if (!getLocation(input.locationId)) {
    errors.location = "That location is not in the underwriting table.";
  }

  const coverage = parseCoverage(input.coverageInput);
  if (!input.coverageInput.trim()) {
    errors.coverage = "Enter a coverage amount.";
  } else if (coverage === null) {
    errors.coverage = "Coverage must be a valid ETH amount.";
  } else if (coverage < MIN_COVERAGE_WEI) {
    errors.coverage = "Minimum coverage is 0.01 ETH.";
  } else if (coverage > MAX_COVERAGE_WEI) {
    errors.coverage = "Maximum coverage is 5 ETH.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    coverage: errors.coverage ? null : coverage,
    errors,
  };
}
