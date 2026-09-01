# ChainGuard frontend — what’s in the box

Parametric flood micro-insurance UI. Bind cover, watch live risk, get paid
when the water parameter crosses the line.

The live preview runs on the App Builder stack (**TanStack Start + Vite +
React + TypeScript**), not a nested Next.js app. The architecture still
matches the hackathon brief: one contract layer, mock and live modes, wagmi/viem,
Arbitrum Sepolia.

## Demo flow (mock)

1. **Connect demo** in the header (no MetaMask required).
2. On **Cover**, pick a city, set coverage, read the premium, **Bind cover**.
3. Open **Policies**. The new certificate is on the book with a live risk gauge.
4. In the **Demo lab**, push a flood reading to **80+**.
5. Risk numbers update within a few seconds. A mint **payout toast** appears.
6. The policy stamps **Claimed** and shows the payout amount.

Toggle **Mock / Live** in the header. Live stays locked until contract
addresses are provided.

## Routes

| Path | What it is |
| --- | --- |
| `/` | Editorial home, how-it-works, buy-policy flow, live risk strip |
| `/policies` | Wallet’s policies, gauges, demo lab |
| `/protocol` | Addresses, location table, decoded errors, gas panel |

## File map (brief → this repo)

| Brief (`frontend/…`) | Here |
| --- | --- |
| `app/page.tsx` | `src/routes/index.tsx` |
| `app/policies/page.tsx` | `src/routes/policies.tsx` |
| `app/layout.tsx` | `src/routes/__root.tsx` |
| `components/WalletConnect.tsx` | `src/components/WalletConnect.tsx` |
| `components/BuyPolicyForm.tsx` | `src/components/BuyPolicyForm.tsx` |
| `components/PolicyCard.tsx` | `src/components/PolicyCard.tsx` |
| `components/RiskScoreGauge.tsx` | `src/components/RiskScoreGauge.tsx` |
| `components/PayoutToast.tsx` | `src/components/PayoutToast.tsx` |
| `lib/contracts.ts` | `src/lib/contracts.ts` |
| `lib/mockData.ts` | `src/lib/mockData.ts` |
| `lib/wagmiConfig.ts` | `src/lib/wagmiConfig.ts` |
| `hooks/usePolicies.ts` | `src/hooks/usePolicies.ts` |
| `hooks/useRiskScore.ts` | `src/hooks/useRiskScore.ts` |

Also:

- `src/hooks/useWallet.ts` — mock demo wallet or MetaMask
- `src/hooks/usePayoutEvents.ts` — `PayoutTriggered` listener
- `src/hooks/usePremiumQuote.ts`
- `src/components/DemoLab.tsx` — mock oracle / flood push
- `src/components/GasComparison.tsx` — empty until `docs/gas-comparison.md`
- `src/lib/abis.ts` — ABI copies (do not edit `shared/contract-abis/`)
- `src/lib/locations.ts` — location table
- `src/lib/errors.ts` — Solidity error → copy
- `src/lib/validateBuy.ts` — form validation
- `docs/INTEGRATION_CONTRACT.md` — wire format

## Architecture

```
UI components
    ↓
hooks
    ↓
src/lib/contracts.ts
    ↓
mock book  OR  viem + Sepolia
```

One switch: `isMockMode()` in `contracts.ts`. Default is mock until

- `VITE_RISK_ENGINE_ADDRESS`
- `VITE_INSURANCE_POOL_ADDRESS`

are set (and optionally `VITE_USE_MOCK=false`).

## Implemented

- MetaMask / injected wallet + wrong-network handling (Arbitrum Sepolia `421614`)
- Demo wallet so the preview works without an extension
- Buy flow: location → coverage → premium → pending → success / error
- My policies + empty / loading / error states
- Risk gauge (display only — no local calculation)
- 4s risk polling
- `PayoutTriggered` toast (policy id, amount, risk)
- Custom error decoding (`PolicyNotFound`, `AlreadyClaimed`, `InsufficientPremium`, `NotAuthorized`, …)
- Location names from the documented table
- Unix timestamps converted only for display
- Gas panel that **does not invent numbers**
- Form validation tests
- How-it-works strip for the live demo

## Not invented

- Contract addresses (pending backend deployment)
- Risk formula (engine returns the score)
- Gas benchmarks (panel stays “unpublished”)
- Extra location IDs

## Going live on Sepolia

1. Drop addresses into env (`VITE_*` in this stack; the brief’s `NEXT_PUBLIC_*` names map 1:1).
2. If `shared/contract-abis/` is generated, point `src/lib/abis.ts` at those files — don’t hand-edit the generated tree.
3. Flip the header to **Live**, connect MetaMask on Arbitrum Sepolia, bind cover twice.

## Design

Editorial modernism: cream paper, ink, mint, sage, mauve, condensed **Anton**
display, IBM Plex body/mono, sharp frames, halftone over grainy site photography.
Not a neon crypto dashboard.
