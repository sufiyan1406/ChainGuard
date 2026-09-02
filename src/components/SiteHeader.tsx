import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { WalletConnect } from "@/components/WalletConnect";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { clockLabel } from "@/lib/format";
import { canUseLiveMode, isMockMode, setMockMode } from "@/lib/contracts";
import { useContractRevision } from "@/hooks/useContractRevision";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const NAV = [
  { to: "/", label: "Cover" },
  { to: "/policies", label: "Policies" },
  { to: "/audit", label: "Audit Log" },
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
    <header className="scan-line sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <Link to="/" className="display text-xl leading-none text-ink md:text-2xl">
            <ScrambleText text="ChainGuard" speed={40} delay={400} />
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
          {NAV.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.6 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                to={item.to}
                className={cn(
                  "text-sm tracking-wide transition-colors duration-150",
                  pathname === item.to ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <LanguageSwitcher />
          <ModeSwitch mock={mock} />
          <WalletConnect compact />
        </motion.div>
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
    <div className="relative hidden h-10 items-stretch border border-ink text-[10px] font-medium tracking-widest uppercase sm:flex">
      {/* Sliding active indicator */}
      <motion.div
        className="absolute top-0 bottom-0 bg-ink"
        initial={false}
        animate={{
          left: mock ? 0 : "50%",
          right: mock ? "50%" : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      <button
        type="button"
        className={cn("relative z-10 px-2.5 transition-colors duration-200", mock ? "text-paper" : "text-ink")}
        onClick={() => setMockMode(true)}
      >
        Mock
      </button>
      <button
        type="button"
        className={cn(
          "relative z-10 px-2.5 transition-colors duration-200",
          !mock ? "text-paper" : "text-ink",
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
