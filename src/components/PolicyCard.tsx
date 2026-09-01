import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Waves, Clock, CheckCircle2, ChevronDown, Radio, ExternalLink } from "lucide-react";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { InteractiveTiltCard } from "@/components/motion/InteractiveTiltCard";
import { WaterWaveCanvas } from "@/components/motion/WaterWaveCanvas";
import { locationLabel, padLocationId, LOCATIONS } from "@/lib/locations";
import { formatAddress, formatEthUnit, formatUnixDate } from "@/lib/format";
import type { Policy } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PolicyCard({
  policy,
  riskScore = 0,
}: {
  policy: Policy;
  riskScore?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const locationInfo = LOCATIONS.find((l) => l.id === policy.locationId);
  const isClaimed = policy.claimed || policy.status === "Claimed";
  const isExpired = policy.status === "Expired";
  const isTrigger = riskScore >= 80;

  return (
    <InteractiveTiltCard maxTilt={4} glare={true} className="w-full">
      <motion.article
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "relative flex flex-col border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md",
          isClaimed
            ? "border-mint/60 bg-paper"
            : isExpired
              ? "border-line bg-paper-2/40 opacity-75"
              : "border-line bg-paper hover:border-ink/40",
        )}
      >
        {/* Holographic foil line for claimed certificates */}
        {isClaimed && (
          <div className="h-1.5 w-full bg-gradient-to-r from-mint via-sage to-mint animate-pulse" />
        )}

        {/* Card Header */}
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 bg-paper-2/20">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded border border-ink/20 bg-paper font-mono text-xs font-bold text-ink">
              #{policy.policyId.toString().padStart(4, "0")}
            </span>
            <div>
              <p className="label font-mono text-[10px]">PARAMETRIC CERTIFICATE</p>
              <p className="font-mono text-xs font-semibold text-ink">
                BASIN {padLocationId(policy.locationId)} · {locationInfo?.region ?? "Global"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Physical rubber stamp for Claimed policies */}
            {isClaimed ? (
              <div className="stamp-slam flex items-center gap-1.5 rounded border-2 border-mint bg-mint px-3 py-1 text-xs font-display tracking-widest text-mint-fg uppercase shadow-md">
                <CheckCircle2 className="size-3.5" />
                CLAIM SETTLED
              </div>
            ) : isExpired ? (
              <span className="rounded border border-line bg-paper-2 px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider text-ink-muted uppercase">
                EXPIRED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded border border-ink bg-ink px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider text-paper uppercase">
                <span className="size-1.5 rounded-full bg-mint animate-ping" />
                ACTIVE COVER
              </span>
            )}
          </div>
        </header>

        {/* Card Body */}
        <div className="grid gap-0 md:grid-cols-12 relative">
          {/* Left Column: Basin Details (7 cols) */}
          <div className="border-b border-line p-5 md:col-span-7 md:border-r md:border-b-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="label font-mono text-[10px]">
                  LAT/LONG SENSOR NODE {padLocationId(policy.locationId)}
                </span>
                <span className="text-xs font-mono text-ink-muted">{locationInfo?.hazard ?? "Flood"}</span>
              </div>
              <h3 className="display mt-2 text-4xl md:text-5xl text-ink">
                {locationLabel(policy.locationId)}
              </h3>

              <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="border border-line/60 bg-paper-2/30 p-2.5 rounded-sm">
                  <dt className="label text-[9px]">COVERAGE</dt>
                  <dd className="mt-1 font-mono font-bold text-base text-ink tabular-nums">
                    {formatEthUnit(policy.coverageAmount)}
                  </dd>
                </div>
                <div className="border border-line/60 bg-paper-2/30 p-2.5 rounded-sm">
                  <dt className="label text-[9px]">PREMIUM</dt>
                  <dd className="mt-1 font-mono font-medium text-base text-ink tabular-nums">
                    {formatEthUnit(policy.premiumPaid)}
                  </dd>
                </div>
                <div className="border border-line/60 bg-paper-2/30 p-2.5 rounded-sm">
                  <dt className="label text-[9px]">BOUND DATE</dt>
                  <dd className="mt-1 font-mono text-xs text-ink-muted">
                    {formatUnixDate(policy.purchasedAt)}
                  </dd>
                </div>
                <div className="border border-line/60 bg-paper-2/30 p-2.5 rounded-sm">
                  <dt className="label text-[9px]">EXPIRY</dt>
                  <dd className="mt-1 font-mono text-xs text-ink-muted">
                    {formatUnixDate(policy.expiresAt)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Claimed Payout Callout Banner */}
            {isClaimed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center justify-between rounded border border-mint bg-mint/15 p-3 text-sm text-mint-fg"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-mint" />
                  <div>
                    <p className="font-semibold text-xs uppercase tracking-wider">Settled on Parameter ≥80</p>
                    <p className="font-mono text-xs text-ink-muted">Immediate smart contract disbursement</p>
                  </div>
                </div>
                <span className="font-display text-2xl text-ink tabular-nums">
                  {formatEthUnit(policy.payoutAmount)}
                </span>
              </motion.div>
            )}
          </div>

          {/* Right Column: Live Risk Radar (5 cols) */}
          <div className="p-5 md:col-span-5 flex flex-col justify-between bg-paper-2/20 relative overflow-hidden">
            <RiskScoreGauge score={riskScore} compact label="Live Basin Telemetry" />

            <div className="mt-4 flex items-center justify-between border-t border-line/80 pt-3">
              <span className="flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                <Radio className="size-3 text-mint animate-pulse" />
                {isTrigger ? "TRIGGER TRIGGERED" : "POLLING STYLUS 4S"}
              </span>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-ink hover:text-ink/70"
              >
                <span>{expanded ? "Hide Log" : "Audit Proof"}</span>
                <ChevronDown
                  className={cn("size-3.5 transition-transform duration-200", expanded && "rotate-180")}
                />
              </button>
            </div>

            {/* Subtle background water wave */}
            <WaterWaveCanvas riskScore={riskScore} height={40} className="w-full mt-2 opacity-30" />
          </div>
        </div>

        {/* Expandable Audit & Telemetry Drawer */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-line bg-dark p-5 text-dark-fg overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <p className="label text-dark-muted text-[10px]">HOLDER CONTRACT</p>
                  <p className="mt-1 text-mint break-all">{formatAddress(policy.holder)}</p>
                </div>
                <div>
                  <p className="label text-dark-muted text-[10px]">SETTLEMENT TRIGGER</p>
                  <p className="mt-1 text-dark-fg">Flood Parameter ≥ 80.00</p>
                </div>
                <div>
                  <p className="label text-dark-muted text-[10px]">CHAIN STATUS</p>
                  <p className="mt-1 text-dark-fg">Arbitrum Sepolia #421614</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Footer */}
        <footer className="flex items-center justify-between border-t border-line px-5 py-2.5 font-mono text-[11px] text-ink-muted bg-paper">
          <span>Holder: {formatAddress(policy.holder)}</span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-mint" /> Stylus WASM Verified
          </span>
        </footer>
      </motion.article>
    </InteractiveTiltCard>
  );
}
