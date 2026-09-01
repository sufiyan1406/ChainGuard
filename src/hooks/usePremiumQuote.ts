import { useEffect, useState } from "react";
import { quotePremium } from "@/lib/contracts";
import { useContractRevision } from "./useContractRevision";

export function usePremiumQuote(locationId: bigint | null, coverageAmount: bigint | null) {
  const revision = useContractRevision();
  const [premium, setPremium] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locationId === null || coverageAmount === null) {
      setPremium(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    quotePremium(locationId, coverageAmount)
      .then((value) => {
        if (!cancelled) {
          setPremium(value);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPremium(null);
          setError(err instanceof Error ? err.message : "Could not quote premium.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locationId, coverageAmount, revision]);

  return { premium, loading, error };
}
