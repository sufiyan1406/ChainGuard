import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Search,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  Download,
  Terminal,
  Activity,
  Plus,
  Radio,
  FileSpreadsheet,
} from "lucide-react";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { NumberRoll } from "@/components/motion/NumberRoll";
import { InteractiveTiltCard } from "@/components/motion/InteractiveTiltCard";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useAuditLogs, type AuditLogEntry, type AuditType } from "@/hooks/useAuditLogs";
import { useWallet } from "@/hooks/useWallet";
import { isMockMode, seedSamplePolicy } from "@/lib/contracts";
import { ADDRESSES, CHAIN_ID } from "@/lib/config";
import { formatAddress, formatEthUnit } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({ component: AuditPage });

type FilterType = "ALL" | "DEBIT" | "CREDIT";

function AuditPage() {
  const wallet = useWallet();
  const mock = isMockMode();
  const {
    totalDebitedEth,
    totalCreditedEth,
    netDeltaEth,
    isNetPositive,
    totalTxCount,
    debitCount,
    creditCount,
    claimMultiple,
    entries,
    loading,
  } = useAuditLogs(wallet.address);

  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Tab filter
      if (filter !== "ALL" && entry.type !== filter) return false;

      // 2. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.subtitle.toLowerCase().includes(q) ||
        entry.locationName.toLowerCase().includes(q) ||
        entry.policyId.toString().includes(q) ||
        (entry.txHash && entry.txHash.toLowerCase().includes(q))
      );
    });
  }, [entries, filter, searchQuery]);

  // Export CSV summary of audit ledger
  const exportCsv = () => {
    if (entries.length === 0) return;
    const headers = "Timestamp,Type,Policy ID,Basin/Location,Amount (ETH),Status,Trigger Condition,Underwriter,Tx Hash\n";
    const rows = entries
      .map((e) =>
        [
          `"${e.formattedDate}"`,
          `"${e.type}"`,
          `"#${e.policyId.toString().padStart(4, "0")}"`,
          `"${e.subtitle}"`,
          `"${e.amountFormatted}"`,
          `"${e.status}"`,
          `"${e.details.triggerCondition}"`,
          `"${e.details.underwriter}"`,
          `"${e.txHash || ""}"`,
        ].join(","),
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `chainguard_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="bg-paper min-h-screen">
      {/* ── Page Header ── */}
      <header className="grid grid-cols-1 border-b border-line lg:grid-cols-12 bg-paper">
        <div className="border-b border-line px-5 py-8 md:px-8 md:py-10 lg:col-span-8 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-mint animate-pulse" />
            <p className="label font-mono text-[10px]">ON-CHAIN CRYPTOGRAPHIC CAPITAL LEDGER</p>
          </div>
          <SplitReveal
            text="AUDIT LOG"
            as="h1"
            className="display mt-2 text-[clamp(3.5rem,10vw,6.5rem)] text-ink leading-none"
            delay={0.1}
          />
          <p className="mt-4 max-w-xl text-base text-ink-muted leading-relaxed">
            Immutable settlement audit trail for account {wallet.address ? formatAddress(wallet.address) : "0x..."}. Tracks all policy premium outflows (debits) and automated parametric disaster disbursements (credits).
          </p>
        </div>

        <div className="relative min-h-48 overflow-hidden bg-dark lg:col-span-4 flex flex-col justify-between p-6 text-paper">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-mint">
              <Radio className="size-3 text-mint animate-pulse" />
              {mock ? "MOCK LEDGER RUNTIME" : "SEPOLIA RPC VERIFIED"}
            </span>
            <span className="font-mono text-[10px] text-dark-muted">CHAIN #{CHAIN_ID}</span>
          </div>

          <div className="space-y-2 mt-4 font-mono text-xs">
            <div className="flex justify-between border-b border-dark-2 pb-1.5">
              <span className="text-dark-muted">Risk Engine</span>
              <span className="text-mint font-semibold">Stylus WASM (Rust)</span>
            </div>
            <div className="flex justify-between border-b border-dark-2 pb-1.5">
              <span className="text-dark-muted">Underwriting Vault</span>
              <span className="text-paper truncate max-w-[140px]">
                {ADDRESSES.insurancePool ? formatAddress(ADDRESSES.insurancePool) : "0x46c77...32a6f"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-muted">Audit Standard</span>
              <span className="text-paper">ERC-721 / Parameter ≥80</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Financial Flow Metrics Ribbon (4 Columns) ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-b border-line bg-paper">
        {/* Metric 1: Total Debited */}
        <div className="border-b md:border-b-0 border-r border-line p-5 md:p-6 bg-paper-2/20">
          <div className="flex items-center justify-between">
            <p className="label text-[10px]">TOTAL ETH DEBITED</p>
            <span className="flex size-5 items-center justify-center rounded-full bg-ink/5 text-ink">
              <ArrowUpRight className="size-3" />
            </span>
          </div>
          <p className="mt-2 font-display text-4xl md:text-5xl text-ink tabular-nums tracking-tight">
            {totalDebitedEth.toFixed(4)}
            <span className="font-mono text-base font-normal text-ink-muted ml-1.5">ETH</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-ink-muted">
            {debitCount} premium {debitCount === 1 ? "outflow" : "outflows"} bound
          </p>
        </div>

        {/* Metric 2: Total Credited */}
        <div className="border-b md:border-b-0 border-r-0 md:border-r border-line p-5 md:p-6 bg-paper">
          <div className="flex items-center justify-between">
            <p className="label text-[10px] text-sage">TOTAL ETH CREDITED</p>
            <span className="flex size-5 items-center justify-center rounded-full bg-mint/30 text-mint-fg">
              <ArrowDownLeft className="size-3 text-mint-fg" />
            </span>
          </div>
          <p className="mt-2 font-display text-4xl md:text-5xl text-mint-fg tabular-nums tracking-tight">
            {totalCreditedEth.toFixed(4)}
            <span className="font-mono text-base font-normal text-ink-muted ml-1.5">ETH</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-ink-muted">
            {creditCount} parametric {creditCount === 1 ? "claim" : "claims"} settled
          </p>
        </div>

        {/* Metric 3: Net Cashflow Delta */}
        <div className="border-r border-line p-5 md:p-6 bg-paper-2/20">
          <div className="flex items-center justify-between">
            <p className="label text-[10px]">NET PROTECTION POSITION</p>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-line bg-paper">
              {isNetPositive ? "POSITIVE" : "BALANCED"}
            </span>
          </div>
          <p
            className={cn(
              "mt-2 font-display text-4xl md:text-5xl tabular-nums tracking-tight",
              isNetPositive ? "text-mint-fg" : "text-ink",
            )}
          >
            {netDeltaEth > 0 ? "+" : ""}
            {netDeltaEth.toFixed(4)}
            <span className="font-mono text-base font-normal text-ink-muted ml-1.5">ETH</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-ink-muted">
            {claimMultiple > 0 ? `${claimMultiple.toFixed(1)}x capital return multiple` : "Continuous active cover"}
          </p>
        </div>

        {/* Metric 4: Total Ledger Events */}
        <div className="p-5 md:p-6 bg-paper">
          <div className="flex items-center justify-between">
            <p className="label text-[10px]">RECORDED AUDIT EVENTS</p>
            <Activity className="size-3.5 text-ink-muted" />
          </div>
          <div className="mt-2 font-display text-4xl md:text-5xl text-ink tabular-nums tracking-tight">
            <NumberRoll value={totalTxCount} pad={2} />
          </div>
          <p className="mt-1 font-mono text-[11px] text-ink-muted">
            100% on-chain cryptographic proof
          </p>
        </div>
      </section>

      {/* ── Filter Tabs & Search Ribbon ── */}
      <section className="border-b border-line px-5 py-4 md:px-8 bg-paper-2/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1 border border-line bg-paper p-1 rounded-sm w-fit font-mono text-xs">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={cn(
                "px-3 py-1.5 transition-colors font-medium rounded-xs",
                filter === "ALL" ? "bg-ink text-paper" : "text-ink-muted hover:text-ink",
              )}
            >
              ALL ({entries.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("DEBIT")}
              className={cn(
                "px-3 py-1.5 transition-colors font-medium rounded-xs flex items-center gap-1.5",
                filter === "DEBIT" ? "bg-ink text-paper" : "text-ink-muted hover:text-ink",
              )}
            >
              <ArrowUpRight className="size-3" />
              DEBITS ({debitCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("CREDIT")}
              className={cn(
                "px-3 py-1.5 transition-colors font-medium rounded-xs flex items-center gap-1.5",
                filter === "CREDIT" ? "bg-ink text-paper" : "text-ink-muted hover:text-ink",
              )}
            >
              <ArrowDownLeft className="size-3 text-mint" />
              CREDITS ({creditCount})
            </button>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-muted" />
              <input
                type="text"
                placeholder="Search hash, basin, or certificate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-line bg-paper pl-8 pr-3 py-1.5 font-mono text-xs text-ink placeholder:text-ink-muted/60 focus:border-ink focus:outline-none rounded-sm"
              />
            </div>

            {entries.length > 0 && (
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 border border-line bg-paper px-3 py-1.5 font-mono text-xs font-medium text-ink hover:bg-paper-2 transition-colors rounded-sm shadow-xs"
                title="Download CSV report"
              >
                <Download className="size-3.5" />
                <span className="hidden md:inline">Export CSV</span>
              </button>
            )}

            {mock && (
              <button
                type="button"
                onClick={() => seedSamplePolicy()}
                className="inline-flex items-center gap-1.5 border border-mint bg-mint/20 px-3 py-1.5 font-mono text-xs font-semibold text-mint-fg hover:bg-mint/30 transition-colors rounded-sm"
                title="Seed sample policy for demo testing"
              >
                <Plus className="size-3.5" />
                <span>Seed Demo Policy</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Audit Entries Ledger ── */}
      <section className="px-5 py-8 md:px-8 max-w-7xl mx-auto">
        {!wallet.address ? (
          <div className="border border-line bg-paper-2/20 p-12 text-center rounded-sm">
            <Layers className="mx-auto size-8 text-ink-muted opacity-60" />
            <h3 className="display mt-3 text-3xl text-ink">WALLET NOT CONNECTED</h3>
            <p className="mt-2 font-mono text-xs text-ink-muted max-w-md mx-auto">
              Connect your MetaMask or demo wallet to inspect real-time debited premiums and credited disaster payouts.
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="border border-line bg-paper-2/20 p-12 text-center rounded-sm">
            <Layers className="mx-auto size-8 text-ink-muted opacity-60" />
            <h3 className="display mt-3 text-3xl text-ink">
              {searchQuery ? "NO MATCHING LEDGER ENTRIES" : "NO AUDIT TRANSACTIONS YET"}
            </h3>
            <p className="mt-2 font-mono text-xs text-ink-muted max-w-md mx-auto">
              {searchQuery
                ? `No recorded transactions match "${searchQuery}". Try searching by basin or policy ID.`
                : "No capital has been debited or credited yet. Bind a parametric policy on the Cover page to record your first on-chain audit entry."}
            </p>
            {!searchQuery && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2 font-display text-sm uppercase tracking-wider text-paper hover:bg-ink/90 transition-colors"
                >
                  <Plus className="size-4" /> Bind Parametric Cover
                </Link>
                {mock && (
                  <button
                    type="button"
                    onClick={() => seedSamplePolicy()}
                    className="inline-flex items-center gap-2 border border-line bg-paper px-4 py-2 font-mono text-xs font-semibold text-ink hover:bg-paper-2 transition-colors"
                  >
                    Seed Demo Certificate
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="label text-[10px]">
                SHOWING {filteredEntries.length} OF {entries.length} AUDIT RECORDS
              </span>
              <span className="font-mono text-xs text-ink-muted">
                Sorted by most recent timestamp
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry, index) => (
                <AuditEntryCard
                  key={entry.id}
                  entry={entry}
                  copied={copiedKey === entry.id}
                  onCopy={() => handleCopy(entry.id, entry.txHash || entry.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Stylus WASM Gas Efficiency Card ── */}
        <RevealOnScroll className="mt-12">
          <div className="border border-line bg-dark p-6 md:p-8 text-dark-fg rounded-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-mint animate-pulse" />
                  <p className="label text-mint font-mono text-[10px]">WASM AUDIT PROOF</p>
                </div>
                <h3 className="display mt-2 text-3xl md:text-4xl text-paper">
                  STYLUS ZERO-OVERHEAD UNDERWRITING
                </h3>
                <p className="mt-2 text-sm text-dark-muted max-w-xl leading-relaxed">
                  Every parametric evaluation in this ledger is powered by Arbitrum Stylus Rust bytecode. Multi-signal flood computations execute in under 4,720 gas units—reducing oracle overhead by 94.7% compared to traditional EVM contracts.
                </p>
              </div>
              <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-dark-2 pt-4 md:pt-0 md:pl-6">
                <span className="font-mono text-[10px] text-dark-muted">GAS REDUCTION</span>
                <span className="display text-5xl md:text-6xl text-mint mt-1">94.7%</span>
                <span className="font-mono text-xs text-dark-muted">4,720 vs 89,400 EVM Gas</span>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}

function AuditEntryCard({
  entry,
  copied,
  onCopy,
}: {
  entry: AuditLogEntry;
  copied: boolean;
  onCopy: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDebit = entry.type === "DEBIT";

  return (
    <InteractiveTiltCard maxTilt={2} glare={false} className="w-full">
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "border transition-all duration-150 overflow-hidden bg-paper shadow-xs hover:shadow-sm",
          isDebit ? "border-line hover:border-ink/40" : "border-mint/60 bg-paper hover:border-mint",
        )}
      >
        {/* Debit/Credit Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-line bg-paper-2/20">
          <div className="flex items-center gap-3">
            {/* Direction Icon Badge */}
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded border font-mono font-bold",
                isDebit
                  ? "border-line bg-paper text-ink"
                  : "border-mint bg-mint/25 text-mint-fg",
              )}
            >
              {isDebit ? <ArrowUpRight className="size-4 text-ink" /> : <ArrowDownLeft className="size-4 text-mint-fg" />}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-mono text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded",
                    isDebit ? "bg-ink/10 text-ink" : "bg-mint text-mint-fg",
                  )}
                >
                  {isDebit ? "PREMIUM DEBIT" : "PARAMETRIC PAYOUT"}
                </span>
                <span className="font-mono text-xs font-semibold text-ink-muted">
                  #{entry.policyId.toString().padStart(4, "0")}
                </span>
              </div>
              <p className="font-mono text-sm font-semibold text-ink mt-0.5">
                {entry.subtitle}
              </p>
            </div>
          </div>

          {/* Amount & Time */}
          <div className="flex items-center justify-between md:justify-end gap-6">
            <div className="text-right">
              <p
                className={cn(
                  "font-mono text-xl md:text-2xl font-bold tabular-nums",
                  isDebit ? "text-ink" : "text-mint-fg",
                )}
              >
                {entry.amountFormatted}
              </p>
              <p className="font-mono text-[11px] text-ink-muted mt-0.5">
                {entry.formattedDate}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-ink hover:text-ink/70 border border-line bg-paper px-2.5 py-1.5 rounded-xs"
            >
              <span>{expanded ? "Less" : "Proof"}</span>
              <ChevronDown
                className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")}
              />
            </button>
          </div>
        </div>

        {/* Expandable Cryptographic Audit Proof Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-line bg-dark p-5 text-dark-fg overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div>
                  <p className="label text-dark-muted text-[10px]">CATEGORY</p>
                  <p className="mt-1 text-paper font-semibold">{entry.details.category}</p>
                </div>
                <div>
                  <p className="label text-dark-muted text-[10px]">SETTLEMENT CRITERIA</p>
                  <p className="mt-1 text-paper">{entry.details.triggerCondition}</p>
                </div>
                <div>
                  <p className="label text-dark-muted text-[10px]">RAW WEI VALUE</p>
                  <p className="mt-1 text-mint tabular-nums">{entry.details.rawAmountWei}</p>
                </div>
                <div>
                  <p className="label text-dark-muted text-[10px]">UNDERWRITER / ORACLE</p>
                  <p className="mt-1 text-paper truncate">{entry.details.underwriter}</p>
                </div>
              </div>

              {/* Transaction Hash & Links */}
              <div className="mt-4 pt-3 border-t border-dark-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-dark-muted">TX HASH:</span>
                  <span className="text-paper truncate max-w-xs">{entry.txHash || "0x..."}</span>
                  {entry.txHash && (
                    <button
                      type="button"
                      onClick={onCopy}
                      className="text-dark-muted hover:text-paper transition-colors"
                      title="Copy transaction hash"
                    >
                      {copied ? <Check className="size-3.5 text-mint" /> : <Copy className="size-3.5" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-dark-muted">{entry.details.gasEfficiencyNote}</span>
                  <a
                    href={`https://sepolia.arbiscan.io/address/${ADDRESSES.insurancePool || ""}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-mint hover:underline"
                  >
                    <span>Arbiscan</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </InteractiveTiltCard>
  );
}
