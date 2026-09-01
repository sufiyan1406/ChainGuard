import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Copy, Check, ExternalLink, Search, Radio, ShieldAlert, Cpu, Terminal } from "lucide-react";
import { GasComparison } from "@/components/GasComparison";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { CONTRACT_ERROR_MESSAGES } from "@/lib/errors";
import { LOCATIONS, padLocationId } from "@/lib/locations";
import { ADDRESSES, CHAIN_ID, RPC_URL } from "@/lib/config";
import { isMockMode } from "@/lib/contracts";
import { useContractRevision } from "@/hooks/useContractRevision";
import { useAllRiskScores } from "@/hooks/useRiskScore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/protocol")({ component: ProtocolPage });

function ProtocolPage() {
  useContractRevision();
  const mock = isMockMode();
  const { readings } = useAllRiskScores();
  const riskMap = new Map(readings.map((r) => [r.locationId.toString(), r.riskScore]));

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorSearch, setErrorSearch] = useState("");

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredErrors = Object.entries(CONTRACT_ERROR_MESSAGES).filter(
    ([code, message]) =>
      code.toLowerCase().includes(errorSearch.toLowerCase()) ||
      message.toLowerCase().includes(errorSearch.toLowerCase()),
  );

  return (
    <main className="bg-paper min-h-screen">
      {/* ── Page Header ── */}
      <header className="border-b border-line px-5 py-10 md:px-8 bg-paper">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-mint animate-pulse" />
          <p className="label font-mono text-[10px]">ON-CHAIN ARBITRUM SEPOLIA INFRASTRUCTURE</p>
        </div>
        <SplitReveal
          text="PROTOCOL REGISTRY"
          as="h1"
          className="display mt-2 text-[clamp(3.5rem,10vw,6.5rem)] text-ink leading-none"
          delay={0.1}
        />
        <p className="mt-4 max-w-2xl text-base text-ink-muted leading-relaxed">
          Verified smart contract addresses, monitored basin location matrices, Stylus WASM risk models, and EVM decoded reverts.
        </p>
      </header>

      {/* ── Network & Contract Address Matrix ── */}
      <section className="grid grid-cols-1 border-b border-line lg:grid-cols-12 bg-paper">
        {/* Mode Status (4 cols) */}
        <div className="border-b lg:border-b-0 lg:border-r border-line p-6 md:p-8 lg:col-span-4 bg-paper-2/30 flex flex-col justify-between">
          <div>
            <p className="label text-[10px]">EXECUTION RUNTIME</p>
            <p className="display mt-2 text-5xl md:text-6xl text-ink">
              {mock ? "Mock Mode" : "Sepolia Live"}
            </p>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
              {mock
                ? "Simulated smart contract state with instant local mock execution and simulated flood triggers."
                : "Connected to Arbitrum Sepolia RPC with viem contract abstractions."}
            </p>
          </div>
          <div className="mt-6 border-t border-line pt-4 font-mono text-xs text-ink-muted">
            Chain ID: <span className="text-ink font-semibold">{CHAIN_ID}</span> · Sepolia Testnet
          </div>
        </div>

        {/* Contract Address Cards (8 cols) */}
        <div className="lg:col-span-8 p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
            <p className="label text-[10px]">DEPLOYED CONTRACT INTERFACES</p>
            <span className="font-mono text-xs text-ink-muted">Click address to copy</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <ContractRow
              label="Stylus Risk Engine (Rust WASM)"
              address={ADDRESSES.riskEngine ?? "0x0000000000000000000000000000000000000000"}
              copied={copiedKey === "riskEngine"}
              onCopy={() => handleCopy("riskEngine", ADDRESSES.riskEngine ?? "")}
              tag="Rust WASM"
            />
            <ContractRow
              label="Insurance Pool (Solidity Underwriter)"
              address={ADDRESSES.insurancePool ?? "0x0000000000000000000000000000000000000000"}
              copied={copiedKey === "insurancePool"}
              onCopy={() => handleCopy("insurancePool", ADDRESSES.insurancePool ?? "")}
              tag="Solidity"
            />
            <ContractRow
              label="Policy NFT (ERC-721 Certificate)"
              address={ADDRESSES.policyNft ?? "0x0000000000000000000000000000000000000000"}
              copied={copiedKey === "policyNft"}
              onCopy={() => handleCopy("policyNft", ADDRESSES.policyNft ?? "")}
              tag="ERC-721"
            />
            <ContractRow
              label="Mock Telemetry Oracle"
              address={ADDRESSES.mockOracle ?? "0x0000000000000000000000000000000000000000"}
              copied={copiedKey === "mockOracle"}
              onCopy={() => handleCopy("mockOracle", ADDRESSES.mockOracle ?? "")}
              tag="Oracle"
            />
          </div>
        </div>
      </section>

      {/* ── Monitored Basin Registry ── */}
      <section className="border-b border-line">
        <div className="flex items-center justify-between border-b border-line px-5 py-5 md:px-8 bg-paper-2/20">
          <div>
            <p className="label text-[10px]">REGISTERED BASIN NODES</p>
            <h2 className="display mt-1 text-3xl md:text-4xl text-ink">Monitored Locations</h2>
          </div>
          <span className="font-mono text-xs text-ink-muted">{LOCATIONS.length} Active Nodes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line font-mono text-[11px] tracking-widest text-ink-muted uppercase bg-paper-2/40">
              <tr>
                <th className="px-5 py-3 font-semibold md:px-8">NODE ID</th>
                <th className="px-4 py-3 font-semibold">LOCATION NAME</th>
                <th className="px-4 py-3 font-semibold">REGION</th>
                <th className="px-4 py-3 font-semibold">PERIL HAZARD</th>
                <th className="px-4 py-3 font-semibold">BASE BPS</th>
                <th className="px-5 py-3 font-semibold md:px-8">LIVE RISK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono text-xs">
              {LOCATIONS.map((l) => {
                const liveScore = riskMap.get(l.id.toString()) ?? 0;
                const isTrigger = liveScore >= 80;
                return (
                  <tr key={l.id.toString()} className="hover:bg-paper-2/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-ink md:px-8">{padLocationId(l.id)}</td>
                    <td className="px-4 py-3.5 font-sans font-semibold text-sm text-ink">{l.name}</td>
                    <td className="px-4 py-3.5 text-ink-muted">{l.region}</td>
                    <td className="px-4 py-3.5">{l.hazard}</td>
                    <td className="px-4 py-3.5 tabular-nums">{l.basePremiumBps} bps</td>
                    <td className="px-5 py-3.5 md:px-8">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-bold tabular-nums",
                          isTrigger
                            ? "bg-rose text-paper animate-pulse"
                            : "bg-ink/10 text-ink",
                        )}
                      >
                        <span className={cn("size-1.5 rounded-full", isTrigger ? "bg-paper" : "bg-mint")} />
                        {liveScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Interactive Contract Error Decoder ── */}
      <section className="border-b border-line bg-dark text-dark-fg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-2 px-5 py-6 md:px-8">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-mint" />
              <p className="label text-mint font-mono text-[10px]">SOLIDITY CUSTOM REVERT MATRIX</p>
            </div>
            <h2 className="display mt-1 text-3xl md:text-4xl text-dark-fg">Decoded Errors</h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-dark-muted" />
            <input
              type="text"
              placeholder="Search error signatures…"
              value={errorSearch}
              onChange={(e) => setErrorSearch(e.target.value)}
              className="w-full bg-dark-2 pl-9 pr-4 py-2 text-xs font-mono text-dark-fg border border-dark-2 focus:border-mint outline-none rounded-sm"
            />
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-dark-2">
          {filteredErrors.map(([code, message]) => (
            <motion.li
              key={code}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-b border-dark-2 p-5 md:px-8 hover:bg-dark-2/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-mint">{code}</span>
                <span className="font-mono text-[10px] text-dark-muted uppercase">Custom Revert</span>
              </div>
              <p className="mt-2 text-xs text-dark-muted font-sans leading-relaxed">{message}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* ── Gas Comparison ── */}
      <GasComparison />
    </main>
  );
}

function ContractRow({
  label,
  address,
  copied,
  onCopy,
  tag,
}: {
  label: string;
  address: string;
  copied: boolean;
  onCopy: () => void;
  tag: string;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-line bg-paper-2/20 hover:bg-paper-2 hover:border-ink/40 transition-colors rounded-sm text-left group"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink font-sans text-xs">{label}</span>
          <span className="bg-ink/10 text-ink-muted text-[9px] px-1.5 py-0.5 rounded font-mono">
            {tag}
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] text-ink-muted group-hover:text-ink break-all">
          {address}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center font-mono text-[11px]">
        {copied ? (
          <span className="flex items-center gap-1 text-mint-fg font-bold bg-mint px-2 py-0.5 rounded">
            <Check className="size-3" /> COPIED
          </span>
        ) : (
          <span className="flex items-center gap-1 text-ink-muted group-hover:text-ink">
            <Copy className="size-3" /> COPY
          </span>
        )}
      </div>
    </button>
  );
}
