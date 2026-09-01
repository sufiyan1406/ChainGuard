# 🛡️ ChainGuard

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1e3a8a,100:06b6d4&height=220&section=header&text=ChainGuard&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Parametric%20Disaster%20Micro-Insurance%20on%20Arbitrum&descAlignY=60&descSize=18" width="100%"/>

### 🌊 When disaster strikes, protection shouldn't wait.

**ChainGuard** is a parametric disaster micro-insurance platform that uses **Arbitrum + Rust/Stylus + smart contracts + automated sensor triggers** to deliver transparent, programmable insurance payouts.

<br/>

[![Arbitrum](https://img.shields.io/badge/Arbitrum-Sepolia-28A0F0?style=for-the-badge\&logo=arbitrum\&logoColor=white)](https://arbitrum.io/)
[![Rust](https://img.shields.io/badge/Rust-Stylus-000000?style=for-the-badge\&logo=rust\&logoColor=white)](https://www.rust-lang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-Smart%20Contracts-363636?style=for-the-badge\&logo=solidity\&logoColor=white)](https://soliditylang.org/)
[![Privy](https://img.shields.io/badge/Wallet-Privy-6C47FF?style=for-the-badge)](https://www.privy.io/)
[![Viem](https://img.shields.io/badge/Web3-Viem-000000?style=for-the-badge)](https://viem.sh/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#-license)

<br/>

### 🚨 Disaster detected → Risk calculated → Payout triggered

</div>

---

## 🎬 Demo

<div align="center">

<!-- Replace the image URL below with your actual demo GIF -->

<img src="docs/demo/chainguard-demo.gif" alt="ChainGuard Demo" width="900"/>

</div>

> 💡 **Demo GIF coming soon.**
>
> Replace `docs/demo/chainguard-demo.gif` with your recorded application walkthrough.

---

## 📸 Demo Screenshots

Showcase the most important parts of the application here.

### 🏠 Dashboard

<p align="center">
  <img src="docs/demo/dashboard.png" alt="ChainGuard Dashboard" width="850"/>
</p>

### 💳 Buy Insurance Policy

<p align="center">
  <img src="docs/demo/buy-policy.png" alt="Buy Insurance Policy" width="850"/>
</p>

### 📊 Risk Monitoring

<p align="center">
  <img src="docs/demo/risk-monitoring.png" alt="Risk Monitoring Dashboard" width="850"/>
</p>

### 💰 Automated Payout

<p align="center">
  <img src="docs/demo/payout.png" alt="Automated Payout" width="850"/>
</p>

> 📌 **Tip:** Replace these placeholder images with screenshots from your actual application.

---

# 🌍 The Problem

Millions of smallholder farmers, gig workers, and small businesses operate in regions exposed to:

* 🌊 Floods
* ☀️ Drought
* 🔥 Extreme heat
* 🌧️ Extreme rainfall
* 📈 Rapid environmental changes

Traditional insurance often depends on:

```text
Disaster
   ↓
Manual inspection
   ↓
Claim submission
   ↓
Human verification
   ↓
Paperwork
   ↓
Approval
   ↓
Payout
```

For small policies, this process can be **too slow, expensive, and operationally inefficient**.

### The result?

People who need protection the most can struggle to access it.

---

# 💡 Our Solution

## ChainGuard

ChainGuard transforms disaster insurance into a **programmable, parametric system**.

Instead of relying on manual claim assessment:

```text
        🌧️ SENSOR DATA
              │
              ▼
       ┌───────────────┐
       │  Mock Oracle  │
       └───────┬───────┘
               │
               ▼
      ┌─────────────────┐
      │ Rust Risk Engine│
      │    Stylus/WASM  │
      └────────┬────────┘
               │
          Risk Score
               │
               ▼
       ┌───────────────┐
       │ Policy Trigger│
       └───────┬───────┘
               │
        Threshold Met?
           /       \
         NO         YES
         │           │
         ▼           ▼
      Monitor      💰 PAYOUT
```

When predefined disaster conditions are reached, the smart-contract system can trigger the policy payout according to the programmed rules.

---

# ⚡ Why ChainGuard?

| Traditional Insurance       | ChainGuard                       |
| --------------------------- | -------------------------------- |
| Manual assessment           | ⚡ Parametric trigger             |
| Slow claims                 | 🚀 Automated execution           |
| Centralized decisions       | 🔗 On-chain rules                |
| Limited transparency        | 👁️ Verifiable blockchain state  |
| Expensive manual processing | 💻 Programmable infrastructure   |
| Difficult micro-claims      | 🛡️ Designed for micro-insurance |

---

# 🧠 How It Works

### 1️⃣ User connects

The user connects through **Privy** and accesses ChainGuard using their wallet.

### 2️⃣ User selects coverage

The user chooses:

* Location
* Coverage amount

### 3️⃣ Premium is calculated

The ChainGuard Risk Engine evaluates the location's risk characteristics and determines the required premium.

### 4️⃣ Policy is purchased

The user sends the premium to the **InsurancePool** smart contract.

A **Policy NFT** is minted to represent the policy.

### 5️⃣ Environmental data arrives

The oracle provides sensor readings such as:

* 🌧️ Rainfall
* 🌊 River level
* 🌱 Soil moisture

### 6️⃣ Risk is calculated

The Rust/Stylus Risk Engine processes the data and calculates a normalized risk score.

```text
0 ─────────────────────────────── 10000
LOW                                  HIGH
```

Example:

```text
Risk Score = 8125
Risk       = 81.25%
```

### 7️⃣ Trigger condition is evaluated

If the risk exceeds the configured threshold:

```text
Risk ≥ Trigger Threshold
          ↓
     Payout Eligible
```

### 8️⃣ Smart contract executes payout

The policy can be checked and the payout executed on-chain.

No manual claim assessment is required for the parametric trigger.

---

# 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       ChainGuard UI                         │
│                  React / Next.js Frontend                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │     Privy      │
                    │ Wallet / Auth  │
                    └───────┬────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Viem / Wagmi │
                     └──────┬───────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │  Arbitrum Sepolia    │
                 │     Chain 421614     │
                 └──────────┬───────────┘
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
          ▼                 ▼                  ▼
 ┌────────────────┐ ┌──────────────┐ ┌────────────────┐
 │ InsurancePool  │ │  PolicyNFT   │ │  MockOracle    │
 │                │ │              │ │                │
 │ Buy / Payout   │ │ Policy NFTs  │ │ Sensor Data    │
 └───────┬────────┘ └──────────────┘ └───────┬────────┘
         │                                   │
         │                                   │
         └────────────────┬──────────────────┘
                          ▼
                 ┌─────────────────┐
                 │ Rust Risk Engine│
                 │ Arbitrum Stylus │
                 │      WASM       │
                 └─────────────────┘
```

---

# 🧩 Core Components

## 🦀 Rust + Arbitrum Stylus Risk Engine

The computational core of ChainGuard.

Responsibilities:

* Risk-score calculation
* Weighted anomaly analysis
* Sensor-data processing
* Volatility handling
* Premium calculation
* Payout-trigger evaluation
* Rolling sensor history

The risk score is normalized to:

```text
0 → 10000
```

where:

```text
10000 = 100.00% risk
```

---

## 🏦 InsurancePool

The main insurance smart contract.

Responsible for:

* Policy purchase
* Premium validation
* Policy tracking
* Payout execution
* Pool liquidity
* Policy ownership interaction

Core operations:

```solidity
buyPolicy(...)
checkAndPayout(...)
getPoliciesByOwner(...)
```

---

## 🎫 PolicyNFT

Every insurance policy is represented by an ERC-721 token.

This provides an on-chain representation of policy ownership.

```text
User
 ↓
Policy Purchase
 ↓
PolicyNFT #123
 ↓
Ownership recorded on-chain
```

---

## 🌦️ MockOracle

The oracle layer stores environmental readings for each location.

Example:

```text
Location: 101

Rainfall:     250 mm
River Level:  600 cm
Soil Moisture: 95%
```

These readings feed the risk engine.

---

# 📊 Risk Model

ChainGuard uses sensor signals to evaluate disaster risk.

Example signals:

```text
Rainfall
River Level
Soil Moisture
```

The risk engine processes these against baseline parameters and produces a normalized risk score.

### Example

```text
NORMAL

Rainfall       → 20 mm
River Level    → 150 cm
Soil Moisture  → Normal

Risk Score     → LOW
Payout         → ❌
```

```text
FLOOD

Rainfall       → 250 mm
River Level    → 600 cm
Soil Moisture  → Saturated

Risk Score     → HIGH
Payout         → ✅
```

---

# 🧪 Disaster Simulation

ChainGuard includes a demo scenario system.

### 🟢 NORMAL

```text
Low rainfall
Normal river level
Normal soil moisture

→ Low risk
→ No payout
```

### 🟡 WARNING

```text
Elevated environmental readings

→ Increased risk
→ Monitor
```

### 🔴 FLOOD

```text
Extreme rainfall
High river level
Saturated soil

→ Risk threshold exceeded
→ Payout condition triggered
```

---

# 🔗 Smart Contract Flow

```text
                 BUY POLICY
                     │
                     ▼
              InsurancePool
                     │
                     ├──── Premium validation
                     │
                     └──── Mint PolicyNFT
                              │
                              ▼
                         Policy Created
                              │
                              │
                    Environmental Event
                              │
                              ▼
                         MockOracle
                              │
                              ▼
                       RiskEngine
                              │
                              ▼
                       Risk Calculation
                              │
                     ┌────────┴────────┐
                     │                 │
                  Below              Above
                 threshold          threshold
                     │                 │
                     ▼                 ▼
                   WAIT             PAYOUT
                                       │
                                       ▼
                                InsurancePool
                                       │
                                       ▼
                                    💰 ETH
```

---

# 🛠️ Tech Stack

### Frontend

* React / Next.js
* TypeScript
* Viem
* Wagmi
* Privy

### Blockchain

* Arbitrum Sepolia
* Solidity
* Foundry
* OpenZeppelin
* ERC-721

### Risk Engine

* Rust
* Arbitrum Stylus
* WebAssembly

### Infrastructure

* Alchemy
* Arbiscan
* GitHub

---

# 📁 Project Structure

```text
ChainGuard/
│
├── contracts/
│   ├── risk-engine/
│   │   ├── src/
│   │   │   └── lib.rs
│   │   ├── Cargo.toml
│   │   └── stylus.toml
│   │
│   ├── solidity/
│   │   ├── src/
│   │   │   ├── InsurancePool.sol
│   │   │   ├── PolicyNFT.sol
│   │   │   ├── MockOracle.sol
│   │   │   └── Errors.sol
│   │   │
│   │   ├── script/
│   │   └── test/
│   │
│   └── deployments/
│       └── sepolia.json
│
├── shared/
│   └── contract-abis/
│
├── docs/
│   ├── INTEGRATION_CONTRACT.md
│   └── demo/
│
├── chainguardfrontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── ...
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js
* npm
* Git
* Rust
* Cargo
* `wasm32-unknown-unknown`
* `cargo-stylus`
* Foundry

You also need:

* Privy application
* Alchemy Arbitrum Sepolia RPC
* Arbitrum Sepolia test ETH
* Deployed ChainGuard contracts

---

# 🔐 Environment Variables

Create:

```text
chainguardfrontend/.env.local
```

Example:

```env
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_CHAIN_ID=421614
NEXT_PUBLIC_RPC_URL=

NEXT_PUBLIC_RISK_ENGINE_ADDRESS=
NEXT_PUBLIC_INSURANCE_POOL_ADDRESS=
NEXT_PUBLIC_POLICY_NFT_ADDRESS=
NEXT_PUBLIC_MOCK_ORACLE_ADDRESS=
```

> ⚠️ Never put private keys in frontend environment variables.

Backend deployment secrets must remain backend/deployment-only.

---

# ▶️ Running the Frontend

```bash
cd chainguardfrontend
npm install
npm run dev
```

Then open the local development URL shown by Next.js.

---

# 🦀 Running the Risk Engine Tests

```bash
cd contracts/risk-engine
cargo test
```

---

# 🧪 Running Solidity Tests

```bash
cd contracts/solidity
forge test -vvv
```

---

# 🌐 Deployment

ChainGuard targets:

```text
Network:   Arbitrum Sepolia
Chain ID:  421614
Currency:  ETH
```

Deployment consists of:

```text
Rust Stylus RiskEngine
        ↓
MockOracle
        ↓
PolicyNFT
        ↓
InsurancePool
```

After deployment, the contract addresses are stored in:

```text
contracts/deployments/sepolia.json
```

---

# 🔍 Verification

The complete system should be tested through:

```text
Connect Wallet
      ↓
Buy Policy
      ↓
Policy NFT Minted
      ↓
Environmental Reading
      ↓
Risk Calculation
      ↓
Flood Condition
      ↓
Payout Trigger
      ↓
Payout Received
```

Each important operation should be verifiable through the Arbitrum Sepolia explorer.

---

# 🎯 Hackathon Demo Flow

For a clean live demonstration:

### STEP 1

Connect a wallet using Privy.

### STEP 2

Choose:

```text
Location 101
Coverage Amount
```

### STEP 3

Show the calculated premium.

### STEP 4

Purchase the policy.

### STEP 5

Show the newly created Policy NFT.

### STEP 6

Start with:

```text
🟢 NORMAL
```

Show that the risk is below the payout threshold.

### STEP 7

Inject:

```text
🔴 FLOOD
```

with extreme sensor readings.

### STEP 8

Show:

```text
Risk Score ↑
```

### STEP 9

Execute:

```text
checkAndPayout(policyId)
```

### STEP 10

Show:

```text
💰 PAYOUT TRIGGERED
```

This demonstrates the complete ChainGuard lifecycle.

---

# 📸 Demo Gallery

> Replace the images below with actual screenshots/GIFs.

| Feature           | Screenshot                 |
| ----------------- | -------------------------- |
| Dashboard         | `docs/demo/dashboard.png`  |
| Wallet Connection | `docs/demo/wallet.png`     |
| Policy Purchase   | `docs/demo/buy-policy.png` |
| Risk Monitoring   | `docs/demo/risk.png`       |
| Flood Trigger     | `docs/demo/flood.png`      |
| Payout            | `docs/demo/payout.png`     |

---

# 🗺️ Roadmap

```text
[x] Core insurance architecture
[x] Rust risk engine
[x] Solidity insurance contracts
[x] Policy NFT
[x] Mock oracle
[x] Arbitrum Sepolia integration
[x] Privy wallet integration
[ ] Production-grade oracle
[ ] Multi-disaster coverage
[ ] Multi-location risk models
[ ] Mainnet deployment
[ ] Real-world sensor integrations
[ ] Liquidity providers
[ ] Insurance pool governance
```

---

# 🔮 Future Vision

ChainGuard is designed to move beyond a hackathon prototype.

Future versions could integrate:

### 🌐 Real-world oracles

Connect verified weather and environmental data directly to the protocol.

### 🛰️ Satellite data

Use satellite-derived information for:

* Flood detection
* Drought monitoring
* Agricultural risk

### 🌎 Multi-location coverage

Create independent risk models for different geographic regions.

### 🧑‍🌾 Micro-insurance

Enable affordable protection for:

* Smallholder farmers
* Gig workers
* Small businesses
* Disaster-prone communities

### ⚡ Automated claims

Move toward a system where verified parametric conditions can trigger payouts with minimal human intervention.

---

# 🔐 Security Considerations

ChainGuard is currently a **hackathon/testnet project**.

It should NOT be considered production-ready insurance infrastructure.

Important areas for production hardening include:

* Oracle security
* Contract audits
* Economic attack resistance
* Liquidity management
* Reentrancy protection
* Access control
* Risk-model validation
* Oracle manipulation resistance
* Emergency mechanisms
* Regulatory compliance

---

# 👥 Team

<div align="center">

### Built with ☕ + 🧠 + ⛓️

| Contributor       | Role                      |
| ----------------- | ------------------------- |
| **Your Name**     | Full-Stack / Blockchain   |
| **Team Member 2** | Backend / Smart Contracts |
| **Team Member 3** | Frontend / Product        |

</div>

---

# 🏆 Built For

<div align="center">

### 🚀 Hackathon Project

**ChainGuard**

> Programmable protection for a world of unpredictable disasters.

<br/>

**Built on Arbitrum. Powered by Rust. Secured by smart contracts.**

</div>

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,50:1e3a8a,100:0f172a&height=120&section=footer" width="100%"/>

### 🛡️ ChainGuard

### *Protection that activates when the world changes.*

</div>
