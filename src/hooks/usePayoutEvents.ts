import { useEffect } from "react";
import { watchPayouts } from "@/lib/contracts";
import type { Address, PayoutEvent } from "@/lib/types";

export function usePayoutEvents(
  holder: Address | null,
  onEvent: (event: PayoutEvent) => void,
) {
  useEffect(() => {
    return watchPayouts(holder, onEvent);
  }, [holder, onEvent]);
}
