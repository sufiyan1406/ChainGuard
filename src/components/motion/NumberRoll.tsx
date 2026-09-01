import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NumberRollProps {
  value: number;
  className?: string;
  pad?: number;
  duration?: number;
}

export function NumberRoll({
  value,
  className = "",
  pad = 2,
  duration = 0.5,
}: NumberRollProps) {
  const str = Math.round(value).toString().padStart(pad, "0");
  const digits = str.split("");

  return (
    <span className={`inline-flex ${className}`} aria-label={str}>
      {digits.map((digit, i) => (
        <Digit key={`pos-${i}`} digit={digit} duration={duration} />
      ))}
    </span>
  );
}

function Digit({ digit, duration }: { digit: string; duration: number }) {
  const [current, setCurrent] = useState(digit);
  const [prev, setPrev] = useState(digit);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      setCurrent(digit);
      return;
    }
    if (digit !== current) {
      setPrev(current);
      setCurrent(digit);
    }
  }, [digit, current]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    return <span>{digit}</span>;
  }

  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ width: "0.65em", height: "1em" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={current}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{
            duration,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
