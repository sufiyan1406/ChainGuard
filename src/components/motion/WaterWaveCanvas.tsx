import { useEffect, useRef } from "react";

interface WaterWaveCanvasProps {
  riskScore?: number;
  className?: string;
  height?: number;
}

export function WaterWaveCanvas({
  riskScore = 30,
  className = "",
  height = 80,
}: WaterWaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    canvas.height = height;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    // Calculate wave intensity based on risk score (0 to 100)
    const normalizedRisk = Math.min(100, Math.max(0, riskScore)) / 100;
    const isTrigger = riskScore >= 80;

    const render = () => {
      phaseRef.current += 0.02 + normalizedRisk * 0.03;
      ctx.clearRect(0, 0, width, height);

      // Primary wave
      ctx.beginPath();
      const primaryColor = isTrigger
        ? "rgba(181, 82, 72, 0.25)"
        : "rgba(182, 232, 194, 0.35)";
      ctx.fillStyle = primaryColor;

      const baseWaterLevel = height * (0.85 - normalizedRisk * 0.45);
      const amp1 = 6 + normalizedRisk * 12;
      const freq1 = 0.015;

      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 4) {
        const y =
          baseWaterLevel +
          Math.sin(x * freq1 + phaseRef.current) * amp1 +
          Math.cos(x * 0.008 + phaseRef.current * 0.7) * (amp1 * 0.5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Secondary layered wave
      ctx.beginPath();
      const secondaryColor = isTrigger
        ? "rgba(181, 82, 72, 0.45)"
        : "rgba(20, 18, 16, 0.15)";
      ctx.fillStyle = secondaryColor;

      const amp2 = 4 + normalizedRisk * 8;
      const freq2 = 0.022;

      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 4) {
        const y =
          baseWaterLevel +
          3 +
          Math.sin(x * freq2 - phaseRef.current * 1.2) * amp2 +
          Math.sin(x * 0.01 + phaseRef.current * 0.5) * (amp2 * 0.3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animRef.current);
    };
  }, [riskScore, height]);

  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
