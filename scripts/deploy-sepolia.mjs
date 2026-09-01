import { createWalletClient, createPublicClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Define Arbitrum Sepolia chain
const arbitrumSepolia = defineChain({
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.VITE_RPC_URL ||
        "https://sepolia-rollup.arbitrum.io/rpc",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Arbiscan", url: "https://sepolia.arbiscan.io" },
  },
});

// Parse .env.local
function loadEnv() {
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [k, ...v] = trimmed.split("=");
    if (k && v.length) env[k.trim()] = v.join("=").trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const rawKey = env.PRIVATE_KEY || process.env.PRIVATE_KEY;

  if (!rawKey) {
    console.error("\n❌ Error: PRIVATE_KEY not found in .env.local!");
    console.error("Please add: PRIVATE_KEY=0x... to your .env.local file and re-run.\n");
    process.exit(1);
  }

  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(formattedKey);

  console.log(`\n========================================`);
  console.log(`🛡️ Deploying ChainGuard Smart Contracts`);
  console.log(`Deployer: ${account.address}`);
  console.log(`Network:  Arbitrum Sepolia (421614)`);
  console.log(`========================================\n`);

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Balance: ${(Number(balance) / 1e18).toFixed(4)} ETH\n`);

  if (balance === 0n) {
    console.error("❌ Account has 0 ETH on Arbitrum Sepolia!");
    process.exit(1);
  }

  // Load compiled artifacts
  const outDir = path.join(rootDir, "backend", "contracts", "solidity", "out");
  const loadArtifact = (name) => {
    const p = path.join(outDir, `${name}.sol`, `${name}.json`);
    const json = JSON.parse(fs.readFileSync(p, "utf-8"));
    return {
      abi: json.abi,
      bytecode: json.bytecode.object,
    };
  };

  const mockOracleArtifact = loadArtifact("MockOracle");
  const policyNFTArtifact = loadArtifact("PolicyNFT");
  const riskEngineArtifact = loadArtifact("SolidityRiskEngine");
  const insurancePoolArtifact = loadArtifact("InsurancePool");

  // 1. Deploy MockOracle
  console.log("1️⃣ Deploying MockOracle...");
  const oracleHash = await walletClient.deployContract({
    abi: mockOracleArtifact.abi,
    bytecode: mockOracleArtifact.bytecode,
  });
  const oracleReceipt = await publicClient.waitForTransactionReceipt({ hash: oracleHash });
  const mockOracleAddress = oracleReceipt.contractAddress;
  console.log(`   ✅ MockOracle: ${mockOracleAddress}`);

  // 2. Deploy PolicyNFT
  console.log("2️⃣ Deploying PolicyNFT...");
  const nftHash = await walletClient.deployContract({
    abi: policyNFTArtifact.abi,
    bytecode: policyNFTArtifact.bytecode,
  });
  const nftReceipt = await publicClient.waitForTransactionReceipt({ hash: nftHash });
  const policyNFTAddress = nftReceipt.contractAddress;
  console.log(`   ✅ PolicyNFT: ${policyNFTAddress}`);

  // 3. Deploy SolidityRiskEngine
  console.log("3️⃣ Deploying SolidityRiskEngine...");
  const engineHash = await walletClient.deployContract({
    abi: riskEngineArtifact.abi,
    bytecode: riskEngineArtifact.bytecode,
  });
  const engineReceipt = await publicClient.waitForTransactionReceipt({ hash: engineHash });
  const riskEngineAddress = engineReceipt.contractAddress;
  console.log(`   ✅ SolidityRiskEngine: ${riskEngineAddress}`);

  // 4. Deploy InsurancePool
  console.log("4️⃣ Deploying InsurancePool...");
  const poolHash = await walletClient.deployContract({
    abi: insurancePoolArtifact.abi,
    bytecode: insurancePoolArtifact.bytecode,
    args: [policyNFTAddress, riskEngineAddress],
  });
  const poolReceipt = await publicClient.waitForTransactionReceipt({ hash: poolHash });
  const insurancePoolAddress = poolReceipt.contractAddress;
  console.log(`   ✅ InsurancePool: ${insurancePoolAddress}`);

  // 5. Authorize InsurancePool in PolicyNFT
  console.log("5️⃣ Authorizing InsurancePool in PolicyNFT...");
  const authHash = await walletClient.writeContract({
    address: policyNFTAddress,
    abi: policyNFTArtifact.abi,
    functionName: "setInsurancePool",
    args: [insurancePoolAddress],
  });
  await publicClient.waitForTransactionReceipt({ hash: authHash });
  console.log("   ✅ Pool authorized successfully!");

  // 6. Update .env.local
  console.log("\n📝 Updating .env.local with deployed contract addresses...");
  const envLocalPath = path.join(rootDir, ".env.local");
  let envContent = fs.readFileSync(envLocalPath, "utf-8");

  const updates = {
    VITE_RISK_ENGINE_ADDRESS: riskEngineAddress,
    NEXT_PUBLIC_RISK_ENGINE_ADDRESS: riskEngineAddress,
    VITE_INSURANCE_POOL_ADDRESS: insurancePoolAddress,
    NEXT_PUBLIC_INSURANCE_POOL_ADDRESS: insurancePoolAddress,
    VITE_POLICY_NFT_ADDRESS: policyNFTAddress,
    NEXT_PUBLIC_POLICY_NFT_ADDRESS: policyNFTAddress,
    VITE_MOCK_ORACLE_ADDRESS: mockOracleAddress,
    NEXT_PUBLIC_MOCK_ORACLE_ADDRESS: mockOracleAddress,
    VITE_USE_MOCK: "false",
    NEXT_PUBLIC_USE_MOCK: "false",
  };

  for (const [k, v] of Object.entries(updates)) {
    const regex = new RegExp(`^${k}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${k}=${v}`);
    } else {
      envContent += `\n${k}=${v}`;
    }
  }

  fs.writeFileSync(envLocalPath, envContent, "utf-8");

  console.log("\n🎉 ALL CONTRACTS DEPLOYED & CONFIGURED SUCCESSFULLY!");
  console.log("--------------------------------------------------");
  console.log(`Risk Engine:    ${riskEngineAddress}`);
  console.log(`Insurance Pool: ${insurancePoolAddress}`);
  console.log(`Policy NFT:     ${policyNFTAddress}`);
  console.log(`Mock Oracle:    ${mockOracleAddress}`);
  console.log("--------------------------------------------------");
  console.log("Your frontend is now 100% connected live to Arbitrum Sepolia!\n");
}

main().catch((err) => {
  console.error("\n❌ Deployment failed:", err.message || err);
  process.exit(1);
});
