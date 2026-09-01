import { useEffect, useRef, useState } from "react";
import { ChevronDown, Unplug, Wallet, Copy, Check, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress, formatEth } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WalletConnect({ compact = false }: { compact?: boolean }) {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copyAddress = () => {
    if (!wallet.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function onConnect() {
    setError(null);
    try {
      await wallet.connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect wallet.");
    }
  }

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          variant="ink"
          size={compact ? "sm" : "md"}
          onClick={() => void onConnect()}
          disabled={wallet.connecting}
          className="font-mono text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <Wallet className="size-3.5 mr-1 text-mint" />
          {wallet.connecting ? "Connecting…" : wallet.mock ? "Connect demo" : "Connect MetaMask"}
        </Button>
        {error ? <p className="max-w-48 text-right text-xs text-rose">{error}</p> : null}
        {!wallet.mock && !wallet.hasProvider ? (
          <p className="max-w-52 text-right text-[11px] text-ink-muted font-mono">
            MetaMask not detected. Use Mock mode for instant demo.
          </p>
        ) : null}
      </div>
    );
  }

  if (!wallet.isCorrectChain) {
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "md"}
        onClick={() => void wallet.switchNetwork()}
        disabled={wallet.isSwitching}
        className="font-mono text-xs border-rose text-rose hover:bg-rose/10"
      >
        Switch to Sepolia (421614)
      </Button>
    );
  }

  return (
    <div className="relative z-50" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex h-11 items-center gap-2 bg-ink px-3 text-paper transition-all duration-150 hover:bg-ink/90 shadow-sm rounded-sm",
          compact && "h-10",
          open && "ring-2 ring-mint",
        )}
      >
        <span className="size-2 rounded-full bg-mint animate-pulse" aria-hidden />
        <span className="font-mono text-xs tracking-tight font-medium">
          {wallet.address ? formatAddress(wallet.address) : "Connected"}
        </span>
        <ChevronDown
          className={cn("size-3.5 opacity-70 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-72 border-2 border-ink bg-paper p-4 shadow-2xl rounded-sm z-[100]"
          >
            <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
              <span className="label text-[10px] font-mono text-ink-muted">ACCOUNT DETAILS</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-mint/30 text-mint-fg font-semibold uppercase">
                {wallet.mock ? "Mock Demo Mode" : "Arbitrum Sepolia"}
              </span>
            </div>

            <div className="bg-paper-2/60 p-2.5 rounded border border-line">
              <p className="label text-[9px] text-ink-muted">WALLET ADDRESS</p>
              <div className="flex items-center justify-between gap-1 mt-1 font-mono text-xs text-ink break-all">
                <span>{wallet.address}</span>
              </div>
              <button
                type="button"
                onClick={copyAddress}
                className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-ink transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="size-3 text-mint" />
                    <span className="text-mint font-semibold">Address Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy Full Address</span>
                  </>
                )}
              </button>
            </div>

            {wallet.balance !== null && (
              <div className="mt-3 flex items-baseline justify-between border-b border-line pb-2">
                <span className="label text-[10px]">ETH BALANCE</span>
                <span className="font-mono text-sm font-bold text-ink tabular-nums">
                  {formatEth(wallet.balance)} ETH
                </span>
              </div>
            )}

            <p className="mt-3 text-[11px] text-ink-muted leading-relaxed font-sans">
              {wallet.mock
                ? "Deterministic testnet demo account with local state. All transactions simulate instant block inclusion."
                : "Live Web3 connection to Arbitrum Sepolia Testnet (Chain ID 421614)."}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full border-ink text-ink hover:bg-ink hover:text-paper font-mono text-xs"
              onClick={() => {
                setOpen(false);
                void wallet.disconnect();
              }}
            >
              <Unplug className="size-3.5 mr-1.5" />
              Disconnect Wallet
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
