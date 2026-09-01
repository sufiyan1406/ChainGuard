import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrambleText } from "./ScrambleText";

const SESSION_KEY = "chainguard-intro-seen";

export function IntroSequence() {
  const [phase, setPhase] = useState<"scramble" | "hold" | "exit" | "done">("scramble");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || sessionStorage.getItem(SESSION_KEY)) {
      setPhase("done");
      return;
    }

    setShow(true);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const onScrambleComplete = useCallback(() => {
    setTimeout(() => setPhase("hold"), 300);
    setTimeout(() => setPhase("exit"), 1400);
    setTimeout(() => {
      setPhase("done");
      setShow(false);
      document.body.style.overflow = "";
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 2200);
  }, []);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Grain overlay */}
          <div className="intro-grain absolute inset-0 pointer-events-none" />

          {/* Logo */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4"
            animate={
              phase === "exit"
                ? { y: -30, opacity: 0, filter: "blur(8px)" }
                : { y: 0, opacity: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="display text-5xl text-dark-fg md:text-7xl lg:text-8xl">
              <ScrambleText
                text="CHAINGUARD"
                speed={35}
                delay={200}
                onComplete={onScrambleComplete}
              />
            </h1>

            <motion.p
              className="font-mono text-xs tracking-[0.3em] text-dark-muted uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={
                phase !== "scramble"
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Parametric flood cover · Arbitrum Sepolia
            </motion.p>
          </motion.div>

          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-mint/40"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: 0,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
