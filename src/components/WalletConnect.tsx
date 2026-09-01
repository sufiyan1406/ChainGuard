import { useEffect, useRef, useState } from "react";
import { ChevronDown, Unplug, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress, formatEth } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WalletConnect({ compact = false }: { compact?: boolean }) {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
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
        >
          <Wallet className="size-3.5" />
          {wallet.connecting ? "Connecting" : wallet.mock ? "Connect demo" : "Connect MetaMask"}
        </Button>
        {error ? <p className="max-w-48 text-right text-xs text-rose">{error}</p> : null}
        {!wallet.mock && !wallet.hasProvider ? (
          <p className="max-w-52 text-right text-xs text-ink-muted">
            MetaMask not detected. Stay in mock mode for the demo.
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
      >
        Switch to Sepolia
      </Button>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex h-11 items-center gap-2 bg-ink px-3 text-paper transition-colors duration-150 hover:bg-ink/90",
          compact && "h-10",
        )}
      >
        <span className="size-1.5 rounded-full bg-mint" aria-hidden />
        <span className="font-mono text-xs tracking-tight">
          {wallet.address ? formatAddress(wallet.address) : "Connected"}
        </span>
        <ChevronDown className="size-3.5 opacity-70" />
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-1 w-64 border border-ink bg-paper p-3 shadow-border">
          <p className="label">Wallet</p>
          <p className="mt-1 break-all font-mono text-xs text-ink">{wallet.address}</p>
          {wallet.balance !== null ? (
            <p className="mt-2 font-mono text-sm tabular-nums">
              {formatEth(wallet.balance)} ETH
            </p>
          ) : null}
          <p className="mt-1 text-xs text-ink-muted">
            {wallet.mock ? "Mock wallet · Arbitrum Sepolia" : "Arbitrum Sepolia"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              setOpen(false);
              void wallet.disconnect();
            }}
          >
            <Unplug className="size-3.5" />
            Disconnect
          </Button>
        </div>
      ) : null}
    </div>
  );
}
