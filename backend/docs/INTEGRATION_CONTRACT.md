# ChainGuard Integration Contract

This document defines the frozen interface contract between the ChainGuard Backend (on-chain smart contracts & risk engine) and Frontend applications.

---

## Network & Target

- **Chain**: Arbitrum Sepolia
- **Chain ID**: `421614`
- **Currency**: ETH (Wei / Gwei)

---

## Contract Interfaces

### 1. Risk Engine (`IRiskEngine`)

Stylus Rust WASM Contract handling parametric risk math.

```solidity
interface IRiskEngine {
    function calculateRiskScore(
        int64[] calldata signals,
        uint8[] calldata weights
    ) external view returns (uint32 riskScore);

    function shouldTriggerPayout(
        uint256 policyId
    ) external view returns (bool);

    function pricePremium(
        uint256 locationId
    ) external view returns (uint256 premiumAmount);
}
```

- **`calculateRiskScore`**: Returns normalized risk score between `0` and `10000` (basis points, where 10000 = 100%).
- **`shouldTriggerPayout`**: Evaluates policy location oracle data and returns `true` if trigger threshold (>= 7500 / 75% risk) is breached.
- **`pricePremium`**: Returns required premium in Wei for a policy at given `locationId`.

---

### 2. Insurance Pool (`InsurancePool`)

Core pool handling policy purchases, ETH liquidity, and automatic parametric payout execution.

```solidity
interface IInsurancePool {
    struct Policy {
        uint256 policyId;
        address holder;
        uint256 locationId;
        uint256 coverageAmount;
        uint256 premiumPaid;
        uint256 startTimestamp;
        bool claimed;
    }

    function buyPolicy(
        uint256 locationId,
        uint256 coverageAmount
    ) external payable returns (uint256 policyId);

    function checkAndPayout(
        uint256 policyId
    ) external;

    function getPoliciesByOwner(
        address holder
    ) external view returns (uint256[] memory policyIds);

    function getPolicy(
        uint256 policyId
    ) external view returns (Policy memory);
}
```

---

### 3. Policy NFT (`PolicyNFT`)

ERC-721 token representing ownership of a disaster micro-insurance policy.

```solidity
interface IPolicyNFT {
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function balanceOf(address owner) external view returns (uint256 balance);
}
```

---

### 4. Mock Oracle (`MockOracle`)

Oracle storing weather sensor readings per location.

```solidity
interface IMockOracle {
    struct SensorReading {
        uint256 locationId;
        int64 rainfall;    // mm, scaled x100 (e.g. 25000 = 250.00mm)
        int64 riverLevel;  // cm (e.g. 600 = 600cm)
        int64 soilMoisture;// %, scaled x100 (e.g. 9500 = 95.00%)
        uint256 timestamp; // Unix timestamp in seconds
    }

    function pushReading(
        uint256 locationId,
        int64 rainfall,
        int64 riverLevel,
        int64 soilMoisture
    ) external;

    function latestReading(
        uint256 locationId
    ) external view returns (SensorReading memory);
}
```

---

## Events

```solidity
event PolicyPurchased(
    uint256 indexed policyId,
    address indexed holder,
    uint256 locationId,
    uint256 coverage
);

event PayoutTriggered(
    uint256 indexed policyId,
    address indexed holder,
    uint256 amount,
    uint32 riskScore
);
```

---

## Custom Errors

```solidity
error PolicyNotFound(uint256 policyId);
error AlreadyClaimed(uint256 policyId);
error InsufficientPremium(uint256 required, uint256 sent);
error NotAuthorized(address caller);
```

---

## Shared Exports & Artifact Locations

- **Deployed Addresses**: `contracts/deployments/sepolia.json`
- **Contract ABIs**: `shared/contract-abis/*.json`
- **TypeScript Types**: `shared/types.ts`
