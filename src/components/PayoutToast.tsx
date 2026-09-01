import { useCallback } from "react";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldAlert, Sparkles, ArrowUpRight } from "lucide-react";
import { usePayoutEvents } from "@/hooks/usePayoutEvents";
import { useWallet } from "@/hooks/useWallet";
import { formatEthUnit } from "@/lib/format";
import type { PayoutEvent } from "@/lib/types";

export function PayoutToast() {
  const { address } = useWallet();

  const onEvent = useCallback((event: PayoutEvent) => {
    toast.custom(
      () => (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="shimmer-border w-[min(100%,24rem)] border-2 border-ink bg-mint p-5 text-mint-fg shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest uppercase bg-mint-fg/10 px-2 py-0.5 rounded">
              <span className="size-2 rounded-full bg-rose animate-ping" />
              FLOOD PARAMETER SETTLED
            </span>
            <span className="font-mono text-xs font-semibold text-mint-fg/80">≥ 80.00 SCORE</span>
          </div>

          <div className="mt-3">
            <p className="font-mono text-xs text-mint-fg/80">Automated Smart Contract Payout</p>
            <p className="display mt-1 text-5xl text-mint-fg tabular-nums tracking-tight">
              {formatEthUnit(event.amount, 3)}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-mint-fg/20 pt-2.5 font-mono text-xs">
            <span>Policy #{event.policyId.toString().padStart(4, "0")}</span>
            <span className="text-rose font-bold">Flood Risk {event.riskScore}</span>
          </div>
        </motion.div>
      ),
      { duration: 9000 },
    );
  }, []);

  usePayoutEvents(address, onEvent);

  return (
    <Toaster
      position="top-right"
      visibleToasts={4}
      offset={20}
      toastOptions={{ unstyled: true }}
    />
  );
}
