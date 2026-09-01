import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, RotateCcw, Plus, Radio, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { NumberRoll } from "@/components/motion/NumberRoll";
import { isMockMode, resetMock, seedSamplePolicy, simulateFlood } from "@/lib/contracts";
import { LOCATIONS, padLocationId } from "@/lib/locations";
import { useContractRevision } from "@/hooks/useContractRevision";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

export function DemoLab() {
  useContractRevision();
  const { connected, connect } = useWallet();
  const [locationId, setLocationId] = useState(1n);
  const [score, setScore] = useState(88);
  const [note, setNote] = useState<string | null>(null);

  if (!isMockMode()) {
    return (
      <aside className="border-l border-line bg-paper-2 p-6">
        <p className="label">DEMO LAB · LIVE NETWORK</p>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed">
          Live mode is active. Flood readings are directly fetched from the Stylus risk engine and oracle contracts on Arbitrum Sepolia.
        </p>
      </aside>
    );
  }

  const isTrigger = score >= 80;

  return (
    <aside className="border-l border-ink bg-dark p-6 text-dark-fg flex flex-col justify-between h-full min-h-[30rem]">
      <div>
        <div className="flex items-center justify-between border-b border-dark-2 pb-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-mint animate-pulse" />
            <p className="label text-mint font-mono text-[10px] uppercase">
              DEMO LAB · MOCK ENGINE
            </p>
          </div>
          <span className="font-mono text-[10px] text-dark-muted">SIMULATOR</span>
        </div>

        <h2 className="display mt-4 text-3xl md:text-4xl text-dark-fg">Simulate Flood</h2>
        <p className="mt-2 text-xs text-dark-muted leading-relaxed">
          Manually push a sensor reading into the risk engine. At score ≥80, all active certificates at this site will immediately settle payout!
        </p>

        {/* Location Dropdown */}
        <div className="mt-6">
          <label className="label text-dark-muted text-[10px] block mb-1.5">
            TARGET BASIN LOCATION
          </label>
          <select
            className="h-11 w-full border border-dark-2 bg-dark-2 px-3 font-mono text-xs text-dark-fg outline-none focus:border-mint transition-colors rounded-sm"
            value={locationId.toString()}
            onChange={(e) => setLocationId(BigInt(e.target.value))}
          >
            {LOCATIONS.map((l) => (
              <option key={l.id.toString()} value={l.id.toString()}>
                {padLocationId(l.id)} · {l.name} ({l.hazard})
              </option>
            ))}
          </select>
        </div>

        {/* Risk Score Slider */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="label text-dark-muted text-[10px]">
              HYDROLOGICAL RISK SCORE
            </label>
            <span
              className={cn(
                "font-mono text-xs font-bold px-2 py-0.5 rounded",
                isTrigger ? "bg-rose text-paper" : "bg-dark-2 text-mint",
              )}
            >
              {score} / 100 {isTrigger ? "TRIGGER" : "NORMAL"}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="mt-3 w-full h-2 bg-dark-2 rounded-lg appearance-none cursor-pointer accent-mint"
          />

          <div className="flex justify-between font-mono text-[10px] text-dark-muted mt-1.5">
            <span>0 Calm</span>
            <span className="text-rose font-semibold">80 Trigger Line</span>
            <span>100 Max</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-dark-2 space-y-3">
        <MagneticButton strength={0.25} className="w-full">
          <button
            type="button"
            className={cn(
              "w-full h-12 font-display text-lg tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98] rounded-sm",
              isTrigger
                ? "bg-rose text-paper hover:bg-rose/90 shadow-lg"
                : "bg-mint text-mint-fg hover:bg-mint/90",
            )}
            onClick={() => {
              simulateFlood(locationId, score);
              setNote(
                score >= 80
                  ? `⚡ Flood Level ${score} PUSHED! Active policies at this site are settling.`
                  : `Hydrological risk updated to ${score}.`,
              );
            }}
          >
            <Zap className="size-4" />
            {isTrigger ? "Push Flood Trigger (≥80)" : "Push Sensor Reading"}
          </button>
        </MagneticButton>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="border border-dark-2 text-dark-fg hover:bg-dark-2 font-mono text-xs"
            onClick={() => {
              if (!connected) void connect();
              seedSamplePolicy();
              setNote("Sample Jakarta coverage policy added to book.");
            }}
          >
            <Plus className="size-3.5 mr-1 text-mint" /> Seed Policy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="border border-dark-2 text-dark-fg hover:bg-dark-2 font-mono text-xs"
            onClick={() => {
              resetMock();
              setNote("Mock state reset to clean book.");
            }}
          >
            <RotateCcw className="size-3.5 mr-1 text-dark-muted" /> Reset State
          </Button>
        </div>

        {note && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded border border-mint/30 bg-mint/10 p-2.5 font-mono text-xs text-mint"
          >
            {note}
          </motion.div>
        )}
      </div>
    </aside>
  );
}
