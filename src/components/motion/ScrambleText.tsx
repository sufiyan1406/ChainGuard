import { useEffect, useRef, useState, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

interface ScrambleTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  trigger?: boolean;
  onComplete?: () => void;
}

export function ScrambleText({
  text,
  className = "",
  speed = 30,
  delay = 0,
  trigger = true,
  onComplete,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const [started, setStarted] = useState(false);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const scramble = useCallback(() => {
    if (!trigger) return;
    const delayMs = delay;

    const timeout = window.setTimeout(() => {
      setStarted(true);
      startTimeRef.current = performance.now();
      const totalDuration = text.length * speed;

      const tick = () => {
        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / totalDuration, 1);
        const resolvedCount = Math.floor(progress * text.length);

        let result = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") {
            result += " ";
          } else if (i < resolvedCount) {
            result += text[i];
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }

        setDisplay(result);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(text);
          onComplete?.();
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [text, speed, delay, trigger, onComplete]);

  useEffect(() => {
    const cleanup = scramble();
    return cleanup;
  }, [scramble]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || !started) {
    return <span className={className}>{text}</span>;
  }

  return <span className={className}>{display}</span>;
}
