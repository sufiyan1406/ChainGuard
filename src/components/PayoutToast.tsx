import { useCallback } from "react";
import { toast, Toaster } from "sonner";
import { usePayoutEvents } from "@/hooks/usePayoutEvents";
import { useWallet } from "@/hooks/useWallet";
import { formatEthUnit } from "@/lib/format";
import type { PayoutEvent } from "@/lib/types";

export function PayoutToast() {
  const { address } = useWallet();

  const onEvent = useCallback((event: PayoutEvent) => {
    toast.custom(
      () => (
        <div className="w-[min(100%,22rem)] border border-ink bg-mint p-4 text-mint-fg shadow-border">
          <p className="label text-mint-fg/70">Payout triggered</p>
          <p className="display mt-2 text-4xl">{formatEthUnit(event.amount, 3)}</p>
          <p className="mt-3 font-mono text-xs">
            Policy #{event.policyId.toString().padStart(4, "0")} · risk {event.riskScore}
          </p>
        </div>
      ),
      { duration: 8000 },
    );
  }, []);

  usePayoutEvents(address, onEvent);

  return (
    <Toaster
      position="top-right"
      visibleToasts={3}
      offset={16}
      toastOptions={{ unstyled: true }}
    />
  );
}
