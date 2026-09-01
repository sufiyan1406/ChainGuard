# ChainGuard integration contract

Frontend source of truth for talking to the protocol. The UI does not invent
function names, event names, error names, or location IDs beyond this file.

If the backend publishes a newer contract, update this document first, then
`src/lib/abis.ts` and `src/lib/locations.ts`.

## Network

| Field | Value |
| --- | --- |
| Name | Arbitrum Sepolia |
| Chain ID | `421614` |
| Default RPC | `https://sepolia-rollup.arbitrum.io/rpc` |

## Contracts

| Role | Env (Vite) | Notes |
| --- | --- | --- |
| Risk engine (Stylus) | `VITE_RISK_ENGINE_ADDRESS` | `getRiskScore(locationId)` |
| Insurance pool | `VITE_INSURANCE_POOL_ADDRESS` | `buyPolicy`, quotes, policy reads, payout events |
| Policy NFT | `VITE_POLICY_NFT_ADDRESS` | ERC-721 of bound policies (optional for v1 UI) |
| Mock oracle | `VITE_MOCK_ORACLE_ADDRESS` | Backend-only sensor pushes |

Addresses are unset until `contracts/deployments/sepolia.json` exists. The
frontend stays in **mock mode** until those addresses are provided.

Never put private keys in frontend env.

## Location table

`locationId` is `uint256`. Display names are UI-only.

| ID | Name | Region | Hazard | Base premium (bps) |
| --- | --- | --- | --- | --- |
| 1 | Jakarta | Indonesia | Flood | 420 |
| 2 | New Orleans | United States | Flood | 380 |
| 3 | Venice | Italy | Flood | 310 |
| 4 | Dhaka | Bangladesh | Flood | 460 |
| 5 | Miami | United States | Flood | 350 |
| 6 | Bangkok | Thailand | Flood | 340 |

If the backend table differs, this file must be updated before the UI.

## Functions

### Insurance pool

```
buyPolicy(uint256 locationId, uint256 coverageAmount) payable returns (uint256 policyId)
quotePremium(uint256 locationId, uint256 coverageAmount) view returns (uint256 premium)
getPolicy(uint256 policyId) view returns (Policy)
getPoliciesByHolder(address holder) view returns (uint256[] policyIds)
```

`buyPolicy` must be sent with `msg.value == quotePremium(...)`.

Coverage is in wei. Frontend bounds: `0.01 ETH` min, `5 ETH` max.

### Risk engine

```
getRiskScore(uint256 locationId) view returns (uint32 score)
getLastUpdated(uint256 locationId) view returns (uint256 timestamp)
getSensorValue(uint256 locationId) view returns (uint256 value)
```

Risk score is `0–100`. The frontend **does not** compute it. Payout trigger
threshold used by the mock (and expected on-chain) is **80**.

## Policy struct

```
struct Policy {
  uint256 policyId;
  address holder;
  uint256 locationId;
  uint256 coverageAmount;
  uint256 premiumPaid;
  uint256 purchasedAt;   // unix seconds
  uint256 expiresAt;     // unix seconds
  uint8 status;          // 0 Active, 1 Claimed, 2 Expired
  bool claimed;
  uint256 payoutAmount;
}
```

Timestamps stay unix seconds on the wire. The UI converts them for display only.

## Events

```
event PolicyPurchased(
  uint256 indexed policyId,
  address indexed holder,
  uint256 locationId,
  uint256 coverageAmount,
  uint256 premiumPaid
);

event PayoutTriggered(
  uint256 indexed policyId,
  address indexed holder,
  uint256 amount,
  uint32 riskScore
);
```

## Errors

```
error PolicyNotFound();
error AlreadyClaimed();
error InsufficientPremium();
error NotAuthorized();
error InvalidLocation();
error CoverageOutOfBounds();
```

Frontend mapping lives in `src/lib/errors.ts`.

## Premium

Until the pool exposes a different formula, mock premium is:

```
premium = coverageAmount * location.basePremiumBps / 10_000
```

Live mode always prefers `quotePremium` on the pool.

## Mode switch

`src/lib/contracts.ts` is the only mock/live branch. UI components never
inspect the chain themselves.
