import { useEffect, useState } from "react";
import { getAllRiskScores, getRiskScore } from "@/lib/contracts";
import type { RiskReading } from "@/lib/types";
import { useContractRevision } from "./useContractRevision";

const POLL_MS = 4000;

export function useRiskScore(locationId: bigint | null) {
  const revision = useContractRevision();
  const [reading, setReading] = useState<RiskReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locationId === null) {
      setReading(null);
      return;
    }
    let cancelled = false;

    async function pull() {
      try {
        const next = await getRiskScore(locationId as bigint);
        if (!cancelled) {
          setReading(next);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load risk score.");
          setLoading(false);
        }
      }
    }

    setLoading(true);
    void pull();
    const id = window.setInterval(() => void pull(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [locationId, revision]);

  return { reading, loading, error };
}

export function useAllRiskScores() {
  const revision = useContractRevision();
  const [readings, setReadings] = useState<RiskReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function pull() {
      try {
        const next = await getAllRiskScores();
        if (!cancelled) {
          setReadings(next);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    void pull();
    const id = window.setInterval(() => void pull(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [revision]);

  return { readings, loading };
}
