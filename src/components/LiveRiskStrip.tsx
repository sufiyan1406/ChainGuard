import { useAllRiskScores } from "@/hooks/useRiskScore";
import { locationLabel, padLocationId } from "@/lib/locations";
import { riskBand } from "@/lib/format";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { NumberRoll } from "@/components/motion/NumberRoll";
import { cn } from "@/lib/utils";

export function LiveRiskStrip() {
  const { readings, loading } = useAllRiskScores();

  return (
    <section>
      <RevealOnScroll>
        <div className="flex items-end justify-between border-b border-line px-5 py-4 md:px-6">
          <div>
            <p className="label">Live book</p>
            <h2 className="display mt-1 text-3xl md:text-4xl">Risk by site</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="heartbeat-dot inline-block size-1.5 rounded-full bg-mint" />
            <p className="font-mono text-[11px] text-ink-muted">
              {loading ? "Polling…" : "Refresh 4s"}
            </p>
          </div>
        </div>
      </RevealOnScroll>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {readings.map((r, i) => {
          const band = riskBand(r.riskScore);
          return (
            <RevealOnScroll key={r.locationId.toString()} delay={i * 0.06}>
              <div className="border-b border-r border-line px-4 py-4 last:border-r-0">
                <p className="label">
                  {padLocationId(r.locationId)}
                </p>
                <p className="mt-2 truncate text-sm">{locationLabel(r.locationId)}</p>
                <div
                  className={cn(
                    "display mt-3 text-4xl tabular-nums",
                    band === "trigger" ? "text-rose" : "text-ink",
                  )}
                >
                  <NumberRoll value={r.riskScore} pad={2} />
                </div>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}
