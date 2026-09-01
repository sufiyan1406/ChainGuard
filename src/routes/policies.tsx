import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Plus, Radio, Layers, Sparkles, Filter } from "lucide-react";
import { DemoLab } from "@/components/DemoLab";
import { PolicyCard } from "@/components/PolicyCard";
import { NumberRoll } from "@/components/motion/NumberRoll";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { usePolicies } from "@/hooks/usePolicies";
import { useAllRiskScores } from "@/hooks/useRiskScore";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress, formatEth } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/policies")({ component: PoliciesPage });

type FilterTab = "ALL" | "ACTIVE" | "CLAIMED" | "EXPIRED";

function PoliciesPage() {
  const wallet = useWallet();
  const { policies, loading, error } = usePolicies(wallet.address);
  const { readings } = useAllRiskScores();
  const [filter, setFilter] = useState<FilterTab>("ALL");

  const riskByLocation = useMemo(
    () => new Map(readings.map((r) => [r.locationId.toString(), r.riskScore])),
    [readings],
  );

  // Portfolio metrics calculation
  const metrics = useMemo(() => {
    let totalCover = 0n;
    let totalPayout = 0n;
    let activeCount = 0;
    let claimedCount = 0;

    for (const p of policies) {
      if (p.claimed || p.status === "Claimed") {
        totalPayout += p.payoutAmount;
        claimedCount++;
      } else if (p.status === "Active") {
        totalCover += p.coverageAmount;
        activeCount++;
      }
    }

    return {
      totalCoverEth: Number(formatEth(totalCover)),
      totalPayoutEth: Number(formatEth(totalPayout)),
      activeCount,
      claimedCount,
      totalCount: policies.length,
    };
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    if (filter === "ACTIVE") return policies.filter((p) => p.status === "Active" && !p.claimed);
    if (filter === "CLAIMED") return policies.filter((p) => p.claimed || p.status === "Claimed");
    if (filter === "EXPIRED") return policies.filter((p) => p.status === "Expired");
    return policies;
  }, [policies, filter]);

  return (
    <main className="bg-paper min-h-screen">
      {/* ── Page Header ── */}
      <header className="grid grid-cols-1 border-b border-line lg:grid-cols-12 bg-paper">
        <div className="border-b border-line px-5 py-8 md:px-8 md:py-10 lg:col-span-8 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-mint animate-pulse" />
            <p className="label font-mono text-[10px]">ON-CHAIN PARAMETRIC VAULT</p>
          </div>
          <SplitReveal
            text="MY POLICIES"
            as="h1"
            className="display mt-2 text-[clamp(3.5rem,10vw,6.5rem)] text-ink leading-none"
            delay={0.1}
          />
          <p className="mt-4 max-w-xl text-base text-ink-muted leading-relaxed">
            Every active certificate is continuously linked to live telemetry from the Arbitrum Stylus risk engine. Payouts settle automatically at flood score ≥80.
          </p>
        </div>

        <div className="relative min-h-48 overflow-hidden bg-dark lg:col-span-4 flex flex-col justify-end p-6">
          <img
            src="/editorial/dusk.jpg"
            alt="Still water at dusk"
            className="absolute inset-0 size-full object-cover opacity-60"
          />
          <div className="halftone-fine absolute inset-0" />
          <div className="relative z-10 text-paper">
            <p className="label text-mint font-mono text-[10px]">TELEMETRY FEED</p>
            <div className="flex items-center gap-2 mt-1">
              <Radio className="size-4 text-mint animate-pulse" />
              <span className="font-mono text-sm">Stylus Rust Oracle Polling (4s)</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Portfolio Overview Metrics Bar ── */}
      {wallet.connected && policies.length > 0 && (
        <RevealOnScroll direction="none">
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-line bg-paper-2/40">
            <div className="border-r border-b sm:border-b-0 border-line p-5">
              <p className="label text-[10px]">ACTIVE PORTFOLIO COVER</p>
              <div className="display mt-2 text-3xl md:text-4xl text-ink">
                <NumberRoll value={metrics.totalCoverEth} pad={1} /> <span className="text-xl">ETH</span>
              </div>
            </div>
            <div className="border-r border-b sm:border-b-0 border-line p-5">
              <p className="label text-[10px]">DISBURSED PAYOUTS</p>
              <div className="display mt-2 text-3xl md:text-4xl text-mint-fg">
                <NumberRoll value={metrics.totalPayoutEth} pad={1} /> <span className="text-xl">ETH</span>
              </div>
            </div>
            <div className="border-r border-line p-5">
              <p className="label text-[10px]">ACTIVE POLICIES</p>
              <div className="display mt-2 text-3xl md:text-4xl text-ink">
                <NumberRoll value={metrics.activeCount} pad={2} />
              </div>
            </div>
            <div className="p-5">
              <p className="label text-[10px]">CLAIMED & SETTLED</p>
              <div className="display mt-2 text-3xl md:text-4xl text-rose">
                <NumberRoll value={metrics.claimedCount} pad={2} />
              </div>
            </div>
          </div>
        </RevealOnScroll>
      )}

      {/* ── Main Layout: Policies & Demo Lab ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Filter Tabs & Policy List (8 cols) */}
        <div className="border-b border-line lg:col-span-8 lg:border-r lg:border-b-0 p-5 md:p-8">
          {/* Filter Tabs */}
          {wallet.connected && policies.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-line pb-4">
              <div className="flex items-center gap-1.5 bg-paper-2/70 p-1 border border-line rounded">
                {(["ALL", "ACTIVE", "CLAIMED", "EXPIRED"] as FilterTab[]).map((tab) => {
                  const isActive = filter === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilter(tab)}
                      className={cn(
                        "relative px-3.5 py-1.5 font-mono text-xs font-semibold uppercase transition-colors rounded-sm",
                        isActive ? "text-paper" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-policy-tab"
                          className="absolute inset-0 bg-ink rounded-sm"
                          transition={{ type: "spring", stiffness: 450, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{tab}</span>
                    </button>
                  );
                })}
              </div>

              <span className="font-mono text-xs text-ink-muted">
                Showing {filteredPolicies.length} of {policies.length}
              </span>
            </div>
          )}

          {/* Policy Cards List */}
          {!wallet.connected ? (
            <Empty
              title="Wallet Disconnected"
              body="Connect your wallet to inspect your on-chain parametric coverage certificates. In mock mode, a demo wallet is provided."
            />
          ) : loading ? (
            <div className="space-y-4">
              <div className="h-64 animate-pulse rounded border border-line bg-paper-2" />
              <div className="h-64 animate-pulse rounded border border-line bg-paper-2" />
            </div>
          ) : error ? (
            <Empty title="Could not load book" body={error} />
          ) : filteredPolicies.length === 0 ? (
            <Empty
              title={filter === "ALL" ? "Zero Active Cover" : `No ${filter.toLowerCase()} policies`}
              body={
                filter === "ALL"
                  ? `No certificates bound to ${formatAddress(wallet.address ?? "")}. Use the Demo Lab on the right to seed a Jakarta policy or bind cover.`
                  : `There are currently no certificates in the "${filter.toLowerCase()}" category.`
              }
              action={filter === "ALL"}
            />
          ) : (
            <motion.div layout className="space-y-5">
              <AnimatePresence mode="popLayout">
                {filteredPolicies.map((policy) => (
                  <PolicyCard
                    key={policy.policyId.toString()}
                    policy={policy}
                    riskScore={riskByLocation.get(policy.locationId.toString())}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Right Column: Demo Lab & Controls (4 cols) */}
        <div className="lg:col-span-4 bg-paper-2/20">
          <DemoLab />
        </div>
      </div>
    </main>
  );
}

function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-line bg-paper p-8 md:p-12 text-center rounded-sm"
    >
      <Layers className="size-12 mx-auto text-ink-muted/50 mb-3" />
      <h2 className="display text-4xl md:text-5xl text-ink">{title}</h2>
      <p className="mt-3 max-w-md mx-auto text-sm text-ink-muted leading-relaxed">{body}</p>
      {action && (
        <div className="mt-6 flex justify-center">
          <MagneticButton strength={0.3}>
            <Link
              to="/"
              className="inline-flex h-12 items-center bg-ink px-6 text-sm font-semibold text-paper shadow-md"
            >
              Bind New Cover
              <Plus className="ml-2 size-4 text-mint" />
            </Link>
          </MagneticButton>
        </div>
      )}
    </motion.div>
  );
}
