import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useWalletClient } from "wagmi";
import { ArrowRight, Check, LoaderCircle, ShieldAlert, Sparkles, Activity, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { NumberRoll } from "@/components/motion/NumberRoll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { WaterWaveCanvas } from "@/components/motion/WaterWaveCanvas";
import { usePremiumQuote } from "@/hooks/usePremiumQuote";
import { useRiskScore, useAllRiskScores } from "@/hooks/useRiskScore";
import { useWallet } from "@/hooks/useWallet";
import { buyPolicy, isMockMode } from "@/lib/contracts";
import { formatEthUnit } from "@/lib/format";
import { LOCATIONS, padLocationId } from "@/lib/locations";
import { validateBuy } from "@/lib/validateBuy";
import { cn } from "@/lib/utils";
import type { Address, TxState } from "@/lib/types";

const PRESETS = ["0.05", "0.10", "0.25", "0.50", "1.00"];

export function BuyPolicyForm() {
  const wallet = useWallet();
  const { data: walletClient } = useWalletClient();
  const [locationId, setLocationId] = useState<bigint | null>(1n);
  const [coverageInput, setCoverageInput] = useState("0.10");
  const [tx, setTx] = useState<TxState>({ phase: "idle" });

  const { readings } = useAllRiskScores();
  const riskMap = useMemo(() => {
    return new Map(readings.map((r) => [r.locationId.toString(), r.riskScore]));
  }, [readings]);

  const parsed = useMemo(
    () =>
      validateBuy({
        locationId,
        coverageInput,
        connected: wallet.connected,
        isCorrectChain: wallet.isCorrectChain,
      }),
    [locationId, coverageInput, wallet.connected, wallet.isCorrectChain],
  );

  const { premium, loading: quoting, error: quoteError } = usePremiumQuote(
    parsed.coverage && locationId !== null ? locationId : null,
    parsed.coverage,
  );
  const { reading } = useRiskScore(locationId);

  const selectedLocation = useMemo(
    () => LOCATIONS.find((l) => l.id === locationId),
    [locationId],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parsed.ok || locationId === null || parsed.coverage === null) {
      setTx({
        phase: "error",
        message:
          parsed.errors.wallet ??
          parsed.errors.network ??
          parsed.errors.location ??
          parsed.errors.coverage ??
          "Check the form.",
      });
      return;
    }

    setTx({ phase: "pending", message: "Submitting buyPolicy…" });
    try {
      const result = await buyPolicy(locationId, parsed.coverage, {
        walletClient:
          !isMockMode() && walletClient && wallet.address
            ? {
                account: wallet.address as Address,
                writeContract: async (args) =>
                  walletClient.writeContract(args as never),
              }
            : undefined,
      });
      setTx({
        phase: "success",
        hash: result.txHash,
        policyId: result.policyId,
      });
    } catch (err) {
      setTx({
        phase: "error",
        message: err instanceof Error ? err.message : "Purchase failed.",
        code: err && typeof err === "object" && "code" in err ? String(err.code) : undefined,
      });
    }
  }

  if (tx.phase === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden border-2 border-mint bg-dark p-6 text-dark-fg md:p-10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-15">
          <Sparkles className="size-32 text-mint" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-xs font-mono tracking-widest text-mint uppercase">
            <span className="size-2 rounded-full bg-mint animate-ping" />
            Certificate Issued
          </div>
          <h2 className="display mt-4 text-6xl text-dark-fg md:text-8xl">Cover Bound</h2>
          <p className="mt-4 max-w-lg text-base text-dark-muted">
            Policy <span className="font-mono text-mint font-semibold">#{tx.policyId.toString().padStart(4, "0")}</span> is now active on-chain for{" "}
            <span className="text-dark-fg font-medium">{selectedLocation?.name}</span>. The Stylus risk engine watches telemetry 24/7. Settle parameter fires automatically at ≥80.
          </p>

          <div className="mt-6 rounded border border-dark-2 bg-dark-2/60 p-4 font-mono text-xs text-dark-muted">
            <p className="text-[10px] tracking-wider uppercase text-mint mb-1">Transaction Proof</p>
            <p className="break-all text-dark-fg">{tx.hash}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <MagneticButton strength={0.3}>
              <Link
                to="/policies"
                className="inline-flex h-12 items-center bg-mint px-6 text-sm font-semibold text-mint-fg transition-transform duration-150 active:scale-95"
              >
                View in My Policies
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </MagneticButton>
            <Button
              variant="outline"
              size="lg"
              className="border-dark-muted/40 text-dark-fg hover:bg-dark-2"
              onClick={() => setTx({ phase: "idle" })}
            >
              Bind Another Site
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-line bg-paper">
      {/* ────────────────────────────────────────────────────────── */}
      {/* COMPARTMENT 01: LOCATION MATRIX (Left 7 Cols)              */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="border-b border-line lg:col-span-7 lg:border-r lg:border-b-0 flex flex-col justify-between bg-paper">
        <div>
          {/* Header with matrix tag */}
          <div className="border-b border-line px-5 py-5 md:px-8 bg-paper-2/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-ink animate-pulse" />
                <p className="label">01 — Location Grid</p>
              </div>
              <h2 className="display mt-1 text-3xl md:text-4xl text-ink">Select Monitored Basin</h2>
            </div>
            <span className="hidden sm:inline-block font-mono text-[11px] text-ink-muted border border-line px-2 py-1 bg-paper">
              {LOCATIONS.length} ACTIVE SITES
            </span>
          </div>

          {/* Location Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 p-2 sm:p-4 gap-2.5">
            {LOCATIONS.map((loc) => {
              const selected = locationId === loc.id;
              const liveScore = riskMap.get(loc.id.toString()) ?? 0;
              const isTrigger = liveScore >= 80;
              const isElevated = liveScore >= 40;

              return (
                <motion.button
                  key={loc.id.toString()}
                  type="button"
                  onClick={() => setLocationId(loc.id)}
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  className={cn(
                    "relative flex flex-col justify-between p-4 text-left transition-all duration-200 border",
                    selected
                      ? "border-ink bg-ink text-paper shadow-lg z-10"
                      : "border-line bg-paper-2/30 text-ink hover:border-ink/50 hover:bg-paper-2",
                  )}
                >
                  {/* Active selection indicator line */}
                  {selected && (
                    <motion.div
                      layoutId="active-location-pill"
                      className="absolute -top-px -left-px -right-px h-1 bg-mint"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}

                  {/* Top: Location ID & Hazard */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        "font-mono text-[10px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded",
                        selected ? "bg-paper/20 text-paper" : "bg-ink/10 text-ink-muted",
                      )}
                    >
                      SITE {padLocationId(loc.id)}
                    </span>

                    {/* Live status badge */}
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          isTrigger
                            ? "bg-rose animate-ping"
                            : isElevated
                              ? "bg-amber-500 animate-pulse"
                              : "bg-mint",
                        )}
                      />
                      <span className={cn(selected ? "text-paper/80" : "text-ink-muted")}>
                        {liveScore} RISK
                      </span>
                    </div>
                  </div>

                  {/* Middle: City Name */}
                  <div className="my-3">
                    <h3 className="display text-3xl tracking-tight leading-none">{loc.name}</h3>
                    <p className={cn("text-xs mt-1", selected ? "text-paper/70" : "text-ink-muted")}>
                      {loc.region} · <span className="italic">{loc.hazard}</span>
                    </p>
                  </div>

                  {/* Bottom telemetry line */}
                  <div
                    className={cn(
                      "flex items-center justify-between border-t pt-2 mt-1 font-mono text-[10px]",
                      selected ? "border-paper/20 text-paper/60" : "border-line text-ink-subtle",
                    )}
                  >
                    <span>Base {loc.basePremiumBps} bps</span>
                    <span className="flex items-center gap-1">
                      <Radio className="size-3" /> Live Telemetry
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Bottom Location Notice */}
        <div className="border-t border-line px-5 py-3 md:px-8 bg-paper-2/20 flex items-center justify-between text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <Activity className="size-3.5 text-mint-fg" /> Real-time hydrological sensors synced to Arbitrum Stylus
          </span>
          <span className="font-mono text-[10px]">421614 SEPOLIA</span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* COMPARTMENT 02: UNDERWRITING TERMINAL (Right 5 Cols)       */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-5 bg-dark text-dark-fg flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 border-line">
        {/* Decorative corner crosshairs */}
        <span className="absolute top-2 left-2 font-mono text-[10px] text-dark-muted/40">+</span>
        <span className="absolute top-2 right-2 font-mono text-[10px] text-dark-muted/40">+</span>

        <div>
          {/* Terminal Header */}
          <div className="border-b border-dark-2 px-5 py-5 md:px-7 bg-dark-2/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-mint animate-pulse" />
                <p className="label text-mint font-mono text-[10px] tracking-widest uppercase">
                  02 — Underwriting Terminal
                </p>
              </div>
              <h2 className="display mt-1 text-3xl md:text-4xl text-dark-fg">Configure Cover</h2>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] text-dark-muted uppercase block">Active Site</span>
              <span className="font-mono text-xs text-mint font-semibold">
                {selectedLocation ? selectedLocation.name : "None"}
              </span>
            </div>
          </div>

          <div className="p-5 md:p-7 space-y-6">
            {/* Field: Coverage Amount */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="coverage" className="label text-dark-muted">
                  Coverage Amount (ETH)
                </label>
                <span className="font-mono text-[11px] text-dark-muted">Max 5.00 ETH</span>
              </div>

              <div className="relative mt-2">
                <input
                  id="coverage"
                  inputMode="decimal"
                  value={coverageInput}
                  onChange={(e) => setCoverageInput(e.target.value)}
                  className="h-14 w-full border-b-2 border-mint/60 bg-dark-2/40 px-3 font-display text-4xl text-dark-fg tabular-nums outline-none transition-colors focus:border-mint focus:bg-dark-2"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-xl text-dark-muted">
                  ETH
                </span>
              </div>

              {/* Preset Buttons with active indicator */}
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {PRESETS.map((p) => {
                  const isActive = coverageInput === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCoverageInput(p)}
                      className={cn(
                        "relative h-9 font-mono text-xs font-medium transition-colors",
                        isActive ? "bg-mint text-mint-fg font-bold" : "bg-dark-2 text-dark-muted hover:text-dark-fg hover:bg-dark-2/80",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-preset-glow"
                          className="absolute inset-0 border border-mint"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      {p}
                    </button>
                  );
                })}
              </div>
              {parsed.errors.coverage && (
                <p className="mt-2 text-xs text-rose">{parsed.errors.coverage}</p>
              )}
            </div>

            {/* Slip Section: Premium Quote Breakdown */}
            <div className="border border-dark-2 bg-dark-2/50 p-4 rounded-sm">
              <div className="flex items-center justify-between">
                <p className="label text-dark-muted text-[10px]">Quoted Premium (Due Now)</p>
                <span className="font-mono text-[10px] text-mint">STYLUS WASM ESTIMATE</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="display text-4xl text-mint tabular-nums">
                  {quoting ? (
                    <span className="animate-pulse text-dark-muted">Computing…</span>
                  ) : premium !== null ? (
                    formatEthUnit(premium)
                  ) : (
                    "—"
                  )}
                </div>
              </div>
              {quoteError && <p className="mt-1 text-xs text-rose">{quoteError}</p>}
              <p className="mt-2 border-t border-dark-2 pt-2 font-mono text-[10px] text-dark-muted leading-relaxed">
                Calculated on-chain via Stylus risk formula with zero slippage or adjuster spread.
              </p>
            </div>

            {/* Live Telemetry Sensor Gauge */}
            {reading && (
              <div className="border border-dark-2 bg-dark-2/30 p-4 rounded-sm">
                <RiskScoreGauge
                  score={reading.riskScore}
                  compact
                  label={`Live Sensor Risk · ${selectedLocation?.name ?? "Site"}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Terminal Checkout & Actions */}
        <div className="p-5 md:p-7 border-t border-dark-2 bg-dark-2/20">
          {/* Error displays */}
          <AnimatePresence>
            {parsed.errors.wallet && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 flex items-center gap-2 text-xs text-rose"
              >
                <ShieldAlert className="size-4 shrink-0" />
                <span>{parsed.errors.wallet}</span>
              </motion.div>
            )}
            {tx.phase === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 rounded border border-rose/30 bg-rose/10 p-2.5 text-xs text-rose"
              >
                {tx.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Magnetic CTA button */}
          <MagneticButton strength={0.25} className="w-full">
            <button
              type="submit"
              disabled={tx.phase === "pending" || tx.phase === "confirming"}
              className="shimmer-border relative w-full h-14 bg-mint text-mint-fg font-display text-xl tracking-wider uppercase flex items-center justify-center gap-3 transition-all hover:bg-mint/90 active:scale-[0.98] disabled:opacity-50"
            >
              {tx.phase === "pending" || tx.phase === "confirming" ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" />
                  <span>Processing on Sepolia…</span>
                </>
              ) : (
                <>
                  <span>Bind Parametric Cover</span>
                  <ArrowRight className="size-5" />
                </>
              )}
            </button>
          </MagneticButton>

          <p className="mt-3 text-center font-mono text-[10px] text-dark-muted">
            Calls <span className="text-dark-fg">buyPolicy(locationId, coverageAmount)</span> on Arbitrum Sepolia
          </p>
        </div>

        {/* Ambient generative flood wave at bottom of terminal */}
        <WaterWaveCanvas riskScore={reading?.riskScore ?? 30} height={36} className="w-full opacity-40" />
      </div>
    </form>
  );
}
