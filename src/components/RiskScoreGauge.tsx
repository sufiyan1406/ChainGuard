import { motion } from "framer-motion";
import { NumberRoll } from "@/components/motion/NumberRoll";
import { riskBand, riskLabel } from "@/lib/format";
import { RISK_PAYOUT_THRESHOLD } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RiskScoreGauge({
  score,
  compact = false,
  label,
}: {
  score: number;
  compact?: boolean;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const band = riskBand(clamped);

  return (
    <div className={cn("flex flex-col", compact ? "gap-2" : "gap-4")}>
      <div className="flex items-end justify-between gap-4">
        <div>
          {label ? <p className="label mb-2">{label}</p> : null}
          <div
            className={cn(
              "font-display leading-none tabular-nums text-ink",
              compact ? "text-5xl" : "text-7xl md:text-8xl",
            )}
          >
            <NumberRoll value={clamped} pad={2} />
          </div>
        </div>
        <div className="pb-1 text-right">
          <p
            className={cn(
              "text-xs font-medium tracking-[0.18em] uppercase",
              band === "trigger" ? "text-rose" : "text-ink-muted",
            )}
          >
            {riskLabel(clamped)}
          </p>
          <p className="mt-1 font-mono text-[11px] text-ink-subtle">
            Payout ≥ {RISK_PAYOUT_THRESHOLD}
          </p>
        </div>
      </div>

      <div className="relative h-2 w-full bg-paper-2">
        <motion.div
          className={cn(
            "h-full",
            band === "trigger" ? "bg-rose" : "bg-ink",
          )}
          initial={{ width: "0%" }}
          animate={{ width: `${clamped}%` }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 18,
            mass: 0.8,
          }}
        />
        <motion.span
          className="absolute top-0 h-2 w-px bg-rose"
          style={{ left: `${RISK_PAYOUT_THRESHOLD}%` }}
          aria-hidden
          animate={
            clamped >= 70
              ? { opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }
              : { opacity: 1, scale: 1 }
          }
          transition={
            clamped >= 70
              ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              : {}
          }
        />
      </div>

      {!compact ? (
        <div className="flex justify-between font-mono text-[10px] tracking-wider text-ink-subtle uppercase">
          <span>Calm</span>
          <span>Elevated</span>
          <span>Severe</span>
          <span className={cn(band === "trigger" && "text-rose")}>Trigger</span>
        </div>
      ) : null}
    </div>
  );
}
