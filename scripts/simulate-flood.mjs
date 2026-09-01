/**
 * 🌊 ChainGuard Flood Simulation Script
 * ─────────────────────────────────────────
 * Pushes escalating sensor readings to the MockOracle contract on Arbitrum Sepolia.
 * The frontend (in Live mode) will poll these readings and update the UI in real-time.
 *
 * Usage:
 *   node scripts/simulate-flood.mjs                    # Gradual flood over 60s (default)
 *   node scripts/simulate-flood.mjs --instant           # Jump straight to flood level
 *   node scripts/simulate-flood.mjs --duration 120      # Gradual over 120 seconds
 *   node scripts/simulate-flood.mjs --location 2        # Simulate for Manila (location 2)
 *   node scripts/simulate-flood.mjs --reset             # Reset all readings to zero
 *
 * Prerequisites:
 *   - DEPLOYER_PRIVATE_KEY in .env.local (same account that deployed the contracts)
 *   - MockOracle contract deployed
 */

import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// ─── Load .env.local ───
const envPath = path.join(rootDir, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx > 0) {
    env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
}

const rawKey = env.PRIVATE_KEY || process.env.PRIVATE_KEY;
if (!rawKey) {
  console.error("❌ PRIVATE_KEY not found in .env.local");
  console.error("Please add: PRIVATE_KEY=0x... to your .env.local file");
  process.exit(1);
}

const PRIVATE_KEY = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

const MOCK_ORACLE = env.VITE_MOCK_ORACLE_ADDRESS;
if (!MOCK_ORACLE) {
  console.error("❌ VITE_MOCK_ORACLE_ADDRESS not found in .env.local");
  process.exit(1);
}

const RPC_URL = env.VITE_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";

// ─── Chain config ───
const arbitrumSepolia = defineChain({
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: arbitrumSepolia,
  transport: http(RPC_URL),
});
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(RPC_URL),
});

const oracleAbi = [
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
];

// ─── Location IDs (matching frontend LOCATIONS) ───
const LOCATIONS = {
  1: "Jakarta, Indonesia",
  2: "Manila, Philippines",
  3: "Mumbai, India",
  4: "Bangkok, Thailand",
  5: "Dhaka, Bangladesh",
};

// ─── Flood simulation stages ───
// Scale must match SolidityRiskEngine thresholds:
//   Rainfall:     0 at ≤2000, max at ≥25000
//   River level:  0 at ≤150,  max at ≥600
//   Soil moisture: 0 at ≤4500, max at ≥9000
const FLOOD_STAGES = [
  { label: "☀️  CALM",       rainfall: 1000,  riverLevel: 100,  soilMoisture: 3000 },
  { label: "🌤️  LIGHT RAIN",  rainfall: 4000,  riverLevel: 180,  soilMoisture: 4800 },
  { label: "🌧️  MODERATE",    rainfall: 8000,  riverLevel: 250,  soilMoisture: 5500 },
  { label: "⛈️  HEAVY RAIN",  rainfall: 14000, riverLevel: 350,  soilMoisture: 6500 },
  { label: "🌊 SEVERE",       rainfall: 19000, riverLevel: 450,  soilMoisture: 7500 },
  { label: "🚨 FLOOD!",       rainfall: 23000, riverLevel: 550,  soilMoisture: 8500 },
  { label: "💥 CRITICAL!",    rainfall: 26000, riverLevel: 620,  soilMoisture: 9200 },
];

// ─── Parse CLI args ───
const args = process.argv.slice(2);
const isInstant = args.includes("--instant");
const isReset = args.includes("--reset");
const durationIdx = args.indexOf("--duration");
const locationIdx = args.indexOf("--location");
const duration = durationIdx >= 0 ? parseInt(args[durationIdx + 1]) : 60;
const targetLocation = locationIdx >= 0 ? parseInt(args[locationIdx + 1]) : 1;

async function pushReading(locationId, rainfall, riverLevel, soilMoisture) {
  const block = await publicClient.getBlock();
  const baseFee = block.baseFeePerGas ?? 200000000n;
  const maxFee = baseFee * 3n;

  const hash = await walletClient.writeContract({
    address: MOCK_ORACLE,
    abi: oracleAbi,
    functionName: "pushReading",
    args: [BigInt(locationId), BigInt(rainfall), BigInt(riverLevel), BigInt(soilMoisture)],
    maxFeePerGas: maxFee,
    maxPriorityFeePerGas: maxFee / 10n,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

async function resetAll() {
  console.log("\n🔄 Resetting all locations to zero...\n");
  for (const [id, name] of Object.entries(LOCATIONS)) {
    process.stdout.write(`  Resetting ${name} (ID ${id})... `);
    const hash = await pushReading(parseInt(id), 0, 0, 0);
    console.log(`✅ ${hash.slice(0, 10)}...`);
  }
  console.log("\n✅ All readings reset to zero.\n");
}

async function simulateInstant(locationId) {
  const name = LOCATIONS[locationId] || `Location ${locationId}`;
  const flood = FLOOD_STAGES[FLOOD_STAGES.length - 1];
  console.log(`\n🚨 INSTANT FLOOD on ${name}`);
  console.log(`   Rainfall: ${flood.rainfall} | River: ${flood.riverLevel} | Soil: ${flood.soilMoisture}`);
  
  const hash = await pushReading(locationId, flood.rainfall, flood.riverLevel, flood.soilMoisture);
  console.log(`   ✅ TX: ${hash}`);
  console.log(`\n🌊 Flood active! Check the frontend in Live mode.\n`);
}

async function simulateGradual(locationId, durationSec) {
  const name = LOCATIONS[locationId] || `Location ${locationId}`;
  const stageInterval = (durationSec * 1000) / FLOOD_STAGES.length;

  console.log(`
╔══════════════════════════════════════════════════╗
║        🌊 CHAINGUARD FLOOD SIMULATION 🌊         ║
╠══════════════════════════════════════════════════╣
║  Location:  ${name.padEnd(36)}║
║  Duration:  ${(durationSec + "s (" + FLOOD_STAGES.length + " stages)").padEnd(36)}║
║  Interval:  ${(Math.round(stageInterval / 1000) + "s between stages").padEnd(36)}║
╚══════════════════════════════════════════════════╝
`);

  for (let i = 0; i < FLOOD_STAGES.length; i++) {
    const stage = FLOOD_STAGES[i];
    const progress = "█".repeat(i + 1) + "░".repeat(FLOOD_STAGES.length - i - 1);

    console.log(`  [${progress}] Stage ${i + 1}/${FLOOD_STAGES.length}: ${stage.label}`);
    console.log(`     📊 Rainfall: ${stage.rainfall}  |  River: ${stage.riverLevel}  |  Soil: ${stage.soilMoisture}`);
    
    process.stdout.write(`     ⏳ Pushing to oracle... `);
    const hash = await pushReading(locationId, stage.rainfall, stage.riverLevel, stage.soilMoisture);
    console.log(`✅ ${hash.slice(0, 18)}...`);

    if (i < FLOOD_STAGES.length - 1) {
      const waitSec = Math.round(stageInterval / 1000);
      console.log(`     ⏰ Next stage in ${waitSec}s...\n`);
      await new Promise((r) => setTimeout(r, stageInterval));
    }
  }

  console.log(`
╔══════════════════════════════════════════════════╗
║  🚨 FLOOD EVENT COMPLETE — ${name.padEnd(21)}║
║  The frontend should now show CRITICAL status.   ║
║                                                  ║
║  Next: Call checkAndPayout() to trigger payouts! ║
║  Or run: node scripts/simulate-flood.mjs --reset ║
╚══════════════════════════════════════════════════╝
`);
}

// ─── Main ───
async function main() {
  console.log(`\n🔗 Connected: ${account.address}`);
  console.log(`📡 Oracle:    ${MOCK_ORACLE}`);
  console.log(`🌐 RPC:       ${RPC_URL}\n`);

  if (isReset) {
    await resetAll();
  } else if (isInstant) {
    await simulateInstant(targetLocation);
  } else {
    await simulateGradual(targetLocation, duration);
  }
}

main().catch((err) => {
  console.error("❌ Simulation failed:", err.message || err);
  process.exit(1);
});
