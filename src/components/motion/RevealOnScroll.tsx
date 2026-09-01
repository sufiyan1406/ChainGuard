import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

const directionMap = {
  up: { y: 40, x: 0 },
  left: { y: 0, x: -40 },
  right: { y: 0, x: 40 },
  none: { y: 0, x: 0 },
};

export function RevealOnScroll({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.2,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });
  const offset = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: offset.y, x: offset.x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: offset.y, x: offset.x }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* Stagger wrapper — wraps multiple RevealOnScroll children with incremental delays */
export function StaggerReveal({
  children,
  className = "",
  stagger = 0.08,
  direction = "up" as "up" | "left" | "right" | "none",
  baseDelay = 0,
}: {
  children: ReactNode[];
  className?: string;
  stagger?: number;
  direction?: "up" | "left" | "right" | "none";
  baseDelay?: number;
}) {
  return (
    <div className={className}>
      {(Array.isArray(children) ? children : [children]).map((child, i) => (
        <RevealOnScroll key={i} delay={baseDelay + i * stagger} direction={direction}>
          {child}
        </RevealOnScroll>
      ))}
    </div>
  );
}
