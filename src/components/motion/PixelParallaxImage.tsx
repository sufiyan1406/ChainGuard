import { useRef, useState, useEffect, useMemo, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { isIntroDone, onIntroDone } from "./IntroSequence";

interface PixelParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  rows?: number;
  cols?: number;
  delay?: number;
  maxTilt?: number;
  parallaxStrength?: number;
  children?: ReactNode;
}

export function PixelParallaxImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  rows = 7,
  cols = 10,
  delay = 0.1,
  maxTilt = 6,
  parallaxStrength = 14,
  children,
}: PixelParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldReveal, setShouldReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  // Wait for BOTH: intro loader dismissed AND element in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let inViewport = false;
    let introFinished = isIntroDone();

    function tryReveal() {
      if (inViewport && introFinished) {
        setShouldReveal(true);
      }
    }

    // 1. Watch for intro completion
    const unsubIntro = onIntroDone(() => {
      introFinished = true;
      tryReveal();
    });

    // 2. Watch for element entering viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inViewport = true;
          observer.disconnect();
          tryReveal();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      unsubIntro();
    };
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 220, mass: 0.8 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  const imageTranslateX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-parallaxStrength, parallaxStrength]),
    springConfig,
  );
  const imageTranslateY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [-parallaxStrength, parallaxStrength]),
    springConfig,
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / (rect.height || 1) - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Generate pixel block delays with organic staggering
  const pixelBlocks = useMemo(() => {
    const blocks: Array<{ id: number; blockDelay: number }> = [];
    for (let i = 0; i < rows * cols; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const distanceFactor = (r / rows + c / cols) * 0.5;
      const jitter = (((i * 17 + 7) % 31) / 31) * 0.3;
      blocks.push({
        id: i,
        blockDelay: delay + distanceFactor + jitter,
      });
    }
    return blocks;
  }, [rows, cols, delay]);

  // Auto-cleanup after the longest block delay + animation duration
  useEffect(() => {
    if (!shouldReveal || revealDone) return;
    const maxBlockDelay = Math.max(...pixelBlocks.map((b) => b.blockDelay));
    const timer = setTimeout(() => setRevealDone(true), (maxBlockDelay + 0.5) * 1000);
    return () => clearTimeout(timer);
  }, [shouldReveal, revealDone, pixelBlocks]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className={`relative overflow-hidden select-none ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="absolute inset-0"
      >
        {/* Parallax Image Layer */}
        <motion.div
          style={{
            x: imageTranslateX,
            y: imageTranslateY,
            scale: 1.08,
          }}
          className="absolute inset-[-8%] w-[116%] h-[116%]"
        >
          <img
            src={src}
            alt={alt}
            className={`size-full object-cover ${imageClassName}`}
          />
        </motion.div>

        {/* Floating Children / Badges with 3D depth */}
        {children && (
          <div
            style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
            className="pointer-events-none absolute inset-0 z-10"
          >
            {children}
          </div>
        )}

        {/* Pixel Grid Reveal Overlay */}
        {!revealDone && (
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {pixelBlocks.map((block) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 1 }}
                animate={shouldReveal ? { opacity: 0 } : { opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: block.blockDelay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ willChange: "opacity" }}
                className="bg-[var(--color-ink)]"
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
