/**
 * Frontend ABI definitions matching backend contracts in shared/contract-abis/
 */

export const insurancePoolAbi = [
  {
    type: "function",
    name: "buyPolicy",
    stateMutability: "payable",
    inputs: [
      { name: "locationId", type: "uint256" },
      { name: "coverageAmount", type: "uint256" },
    ],
    outputs: [{ name: "policyId", type: "uint256" }],
  },
  {
    type: "function",
    name: "checkAndPayout",
    stateMutability: "nonpayable",
    inputs: [{ name: "policyId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getPoliciesByOwner",
    stateMutability: "view",
    inputs: [{ name: "holder", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getPolicy",
    stateMutability: "view",
    inputs: [{ name: "policyId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "policyId", type: "uint256" },
          { name: "holder", type: "address" },
          { name: "locationId", type: "uint256" },
          { name: "coverageAmount", type: "uint256" },
          { name: "premiumPaid", type: "uint256" },
          { name: "startTimestamp", type: "uint256" },
          { name: "claimed", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "PolicyPurchased",
    inputs: [
      { name: "policyId", type: "uint256", indexed: true },
      { name: "holder", type: "address", indexed: true },
      { name: "locationId", type: "uint256", indexed: false },
      { name: "coverage", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PayoutTriggered",
    inputs: [
      { name: "policyId", type: "uint256", indexed: true },
      { name: "holder", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "riskScore", type: "uint32", indexed: false },
    ],
  },
  {
    type: "error",
    name: "PolicyNotFound",
    inputs: [{ name: "policyId", type: "uint256" }],
  },
  {
    type: "error",
    name: "AlreadyClaimed",
    inputs: [{ name: "policyId", type: "uint256" }],
  },
  {
    type: "error",
    name: "InsufficientPremium",
    inputs: [
      { name: "required", type: "uint256" },
      { name: "sent", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "NotAuthorized",
    inputs: [{ name: "caller", type: "address" }],
  },
] as const;

export const riskEngineAbi = [
  {
    type: "function",
    name: "calculateRiskScore",
    stateMutability: "view",
    inputs: [
      { name: "signals", type: "int64[]" },
      { name: "weights", type: "uint8[]" },
    ],
    outputs: [{ name: "riskScore", type: "uint32" }],
  },
  {
    type: "function",
    name: "shouldTriggerPayout",
    stateMutability: "view",
    inputs: [{ name: "policyId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "pricePremium",
    stateMutability: "view",
    inputs: [{ name: "locationId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "updateLocationRisk",
    stateMutability: "nonpayable",
    inputs: [
      { name: "locationId", type: "uint256" },
      { name: "score", type: "uint32" },
    ],
    outputs: [],
  },
] as const;

export const mockOracleAbi = [
  {
    type: "function",
    name: "pushReading",
    stateMutability: "nonpayable",
    inputs: [
      { name: "locationId", type: "uint256" },
      { name: "rainfall", type: "int64" },
      { name: "riverLevel", type: "int64" },
      { name: "soilMoisture", type: "int64" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "latestReading",
    stateMutability: "view",
    inputs: [{ name: "locationId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "locationId", type: "uint256" },
          { name: "rainfall", type: "int64" },
          { name: "riverLevel", type: "int64" },
          { name: "soilMoisture", type: "int64" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "ReadingPushed",
    inputs: [
      { name: "locationId", type: "uint256", indexed: true },
      { name: "rainfall", type: "int64", indexed: false },
      { name: "riverLevel", type: "int64", indexed: false },
      { name: "soilMoisture", type: "int64", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
