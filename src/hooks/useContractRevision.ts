import { useSyncExternalStore } from "react";
import { getContractRevision, subscribeContractState } from "@/lib/contracts";

export function useContractRevision(): number {
  return useSyncExternalStore(
    subscribeContractState,
    getContractRevision,
    getContractRevision,
  );
}
