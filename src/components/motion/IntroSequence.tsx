import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrambleText } from "./ScrambleText";

export function IntroSequence() {
  const [percent, setPercent] = useState(0);
  const [complete, setComplete] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Fast, smooth counter from 0 to 100% over ~900ms
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 14) + 6;
      if (current >= 100) {
        current = 100;
        setPercent(100);
        clearInterval(interval);
        setTimeout(() => setComplete(true), 250);
        setTimeout(() => setDismissed(true), 800);
      } else {
        setPercent(current);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {!complete && (
        <motion.div
          key="intro-curtain"
          onClick={() => {
            setComplete(true);
            setDismissed(true);
          }}
          initial={{ opacity: 1, y: "0%" }}
          exit={{
            y: "-100%",
            transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col justify-between bg-dark p-6 md:p-12 text-dark-fg cursor-pointer select-none overflow-hidden"
        >
          {/* Subtle noise grain texture */}
          <div className="intro-grain absolute inset-0 pointer-events-none opacity-40" />

          {/* Top telemetry bar */}
          <div className="relative z-10 flex items-center justify-between border-b border-dark-2 pb-4 font-mono text-xs text-dark-muted">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-mint animate-ping" />
              <span className="text-dark-fg font-semibold">CHAINGUARD PROTOCOL</span>
            </div>
            <span>STYLUS WASM // ARBITRUM SEPOLIA</span>
          </div>

          {/* Center Brand & Scramble Title */}
          <div className="relative z-10 my-auto">
            <p className="label text-mint font-mono text-xs tracking-[0.25em] mb-2 uppercase">
              PARAMETRIC RISK ENGINE
            </p>
            <h1 className="display text-6xl md:text-8xl lg:text-9xl text-dark-fg tracking-tight">
              <ScrambleText text="CHAINGUARD" speed={25} delay={50} />
            </h1>
            <p className="font-mono text-xs md:text-sm text-dark-muted mt-3 max-w-md">
              Autonomous flood micro-insurance settling on raw water parameters.
            </p>
          </div>

          {/* Bottom Progress Bar & Counter */}
          <div className="relative z-10 space-y-3 font-mono">
            <div className="flex items-baseline justify-between text-xs text-dark-muted">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-mint" /> INITIALIZING TELEMETRY ORACLES…
              </span>
              <span className="font-display text-4xl text-mint tabular-nums">
                {percent.toString().padStart(3, "0")}%
              </span>
            </div>

            {/* Razor-thin glowing progress bar */}
            <div className="h-1 w-full bg-dark-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-mint"
                style={{ width: `${percent}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-dark-muted/60 pt-1">
              <span>NODE: SEPOLIA #421614</span>
              <span>CLICK TO SKIP</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
