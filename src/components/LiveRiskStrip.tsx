import { useAllRiskScores } from "@/hooks/useRiskScore";
import { locationLabel, padLocationId } from "@/lib/locations";
import { riskBand } from "@/lib/format";
import { cn } from "@/lib/utils";

export function LiveRiskStrip() {
  const { readings, loading } = useAllRiskScores();

  return (
    <section>
      <div className="flex items-end justify-between border-b border-line px-5 py-4 md:px-6">
        <div>
          <p className="label">Live book</p>
          <h2 className="display mt-1 text-3xl md:text-4xl">Risk by site</h2>
        </div>
        <p className="font-mono text-[11px] text-ink-muted">
          {loading ? "Polling…" : "Refresh 4s"}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {readings.map((r) => {
          const band = riskBand(r.riskScore);
          return (
            <div
              key={r.locationId.toString()}
              className="border-b border-r border-line px-4 py-4 last:border-r-0"
            >
              <p className="label">
                {padLocationId(r.locationId)}
              </p>
              <p className="mt-2 truncate text-sm">{locationLabel(r.locationId)}</p>
              <p
                className={cn(
                  "display mt-3 text-4xl tabular-nums",
                  band === "trigger" ? "text-rose" : "text-ink",
                )}
              >
                {r.riskScore.toString().padStart(2, "0")}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
