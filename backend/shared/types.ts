// Shared TypeScript types for ChainGuard Frontend & Backend integration

export interface SensorReading {
  locationId: string; // uint256 stringified
  rainfall: bigint;   // int64 mm x 100
  riverLevel: bigint; // int64 cm
  soilMoisture: bigint; // int64 % x 100
  timestamp: number;  // Unix timestamp (seconds)
}

export interface Policy {
  policyId: string;
  holder: string;
  locationId: string;
  coverageAmount: bigint;
  premiumPaid: bigint;
  startTimestamp: number;
  claimed: boolean;
}

export interface DeploymentAddresses {
  chainId: number;
  network: string;
  contracts: {
    RiskEngine: string;
    MockOracle: string;
    PolicyNFT: string;
    InsurancePool: string;
  };
}
