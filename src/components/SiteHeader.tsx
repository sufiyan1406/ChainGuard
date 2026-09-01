import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { WalletConnect } from "@/components/WalletConnect";
import { clockLabel } from "@/lib/format";
import { canUseLiveMode, isMockMode, setMockMode } from "@/lib/contracts";
import { useContractRevision } from "@/hooks/useContractRevision";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Cover" },
  { to: "/policies", label: "Policies" },
  { to: "/protocol", label: "Protocol" },
] as const;

export function SiteHeader() {
  useContractRevision();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [time, setTime] = useState("--:--");
  const mock = isMockMode();

  useEffect(() => {
    setTime(clockLabel());
    const id = window.setInterval(() => setTime(clockLabel()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <Link to="/" className="display text-xl leading-none text-ink md:text-2xl">
            ChainGuard
          </Link>
          <div className="hidden items-center gap-3 font-mono text-[11px] tracking-wide text-ink-muted sm:flex">
            <span className="tabular-nums">{time}</span>
            <span aria-hidden className="text-line-strong/30">
              /
            </span>
            <span>Sepolia 421614</span>
          </div>
        </div>

        <nav className="hidden items-center gap-5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-sm tracking-wide transition-colors duration-150",
                pathname === item.to ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeSwitch mock={mock} />
          <WalletConnect compact />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "inline-flex h-11 min-w-11 shrink-0 items-center px-3 text-sm",
              pathname === item.to ? "bg-ink text-paper" : "text-ink-muted",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function ModeSwitch({ mock }: { mock: boolean }) {
  const liveReady = canUseLiveMode();
  return (
    <div className="hidden h-10 items-stretch border border-ink text-[10px] font-medium tracking-widest uppercase sm:flex">
      <button
        type="button"
        className={cn("px-2.5", mock ? "bg-ink text-paper" : "bg-paper text-ink")}
        onClick={() => setMockMode(true)}
      >
        Mock
      </button>
      <button
        type="button"
        className={cn(
          "px-2.5",
          !mock ? "bg-ink text-paper" : "bg-paper text-ink",
          !liveReady && "opacity-50",
        )}
        onClick={() => {
          if (!liveReady) return;
          setMockMode(false);
        }}
        title={liveReady ? "Use deployed Sepolia contracts" : "Live mode waits on contract addresses"}
      >
        Live
      </button>
    </div>
  );
}
