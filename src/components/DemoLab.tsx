import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isMockMode, resetMock, seedSamplePolicy, simulateFlood } from "@/lib/contracts";
import { LOCATIONS, padLocationId } from "@/lib/locations";
import { useContractRevision } from "@/hooks/useContractRevision";
import { useWallet } from "@/hooks/useWallet";

export function DemoLab() {
  useContractRevision();
  const { connected, connect } = useWallet();
  const [locationId, setLocationId] = useState(1n);
  const [score, setScore] = useState(88);
  const [note, setNote] = useState<string | null>(null);

  if (!isMockMode()) {
    return (
      <aside className="border border-line bg-paper-2 px-5 py-6">
        <p className="label">Demo lab</p>
        <p className="mt-3 text-sm text-ink-muted">
          Live mode is on. Flood readings come from the oracle and risk engine —
          this panel does not push chain state.
        </p>
      </aside>
    );
  }

  return (
    <aside className="border border-ink bg-dark p-5 text-dark-fg md:p-6">
      <p className="label text-dark-muted">Demo lab · mock only</p>
      <h2 className="display mt-2 text-4xl">Trigger a flood</h2>
      <p className="mt-3 max-w-md text-sm text-dark-muted">
        Push a sensor reading into the mock risk engine. At 80 the parameter
        settles every active policy at that location.
      </p>

      <label className="label mt-6 block text-dark-muted">Location</label>
      <select
        className="mt-2 h-11 w-full bg-dark-2 px-3 text-sm text-dark-fg outline-none"
        value={locationId.toString()}
        onChange={(e) => setLocationId(BigInt(e.target.value))}
      >
        {LOCATIONS.map((l) => (
          <option key={l.id.toString()} value={l.id.toString()}>
            {padLocationId(l.id)} {l.name}
          </option>
        ))}
      </select>

      <label className="label mt-5 block text-dark-muted">
        Risk score · {score}
      </label>
      <input
        type="range"
        min={0}
        max={100}
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="mt-3 w-full accent-mint"
      />

      <div className="mt-6 flex flex-col gap-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            simulateFlood(locationId, score);
            setNote(
              score >= 80
                ? "Flood pushed. Active policies at this site should settle."
                : `Risk at site is now ${score}.`,
            );
          }}
        >
          Push reading
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            className="text-dark-fg hover:bg-dark-2"
            onClick={() => {
              if (!connected) void connect();
              seedSamplePolicy();
              setNote("Sample Jakarta policy added.");
            }}
          >
            Seed policy
          </Button>
          <Button
            variant="ghost"
            className="text-dark-fg hover:bg-dark-2"
            onClick={() => {
              resetMock();
              setNote("Mock book cleared.");
            }}
          >
            Reset book
          </Button>
        </div>
      </div>
      {note ? <p className="mt-4 text-sm text-mint">{note}</p> : null}
    </aside>
  );
}
