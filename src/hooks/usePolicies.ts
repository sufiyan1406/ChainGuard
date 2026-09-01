import { useEffect, useState } from "react";
import { getPolicies } from "@/lib/contracts";
import type { Address, Policy } from "@/lib/types";
import { useContractRevision } from "./useContractRevision";

export function usePolicies(holder: Address | null) {
  const revision = useContractRevision();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!holder) {
      setPolicies([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getPolicies(holder)
      .then((rows) => {
        if (!cancelled) {
          setPolicies(rows);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load policies.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [holder, revision]);

  return { policies, loading, error, refreshKey: revision };
}
