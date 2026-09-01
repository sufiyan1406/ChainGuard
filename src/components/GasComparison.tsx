import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Cpu, ArrowUpRight, CheckCircle2, TrendingDown } from "lucide-react";
import { GAS_COMPARISON } from "@/lib/gasComparison";
import { NumberRoll } from "@/components/motion/NumberRoll";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { InteractiveTiltCard } from "@/components/motion/InteractiveTiltCard";

export function GasComparison() {
  const [volume, setVolume] = useState(500); // number of parametric policy calculations

  if (!GAS_COMPARISON) {
    return (
      <section className="border-t border-line bg-paper">
        <div className="border-b border-line px-5 py-5 md:px-8">
          <p className="label">STYLUS BENCHMARKS</p>
          <h2 className="display mt-2 text-4xl md:text-5xl">Gas Analysis</h2>
        </div>
        <p className="max-w-xl px-5 py-6 text-sm text-ink-muted md:px-8">
          Gas comparison metrics are being compiled from testnet execution traces.
        </p>
      </section>
    );
  }

  // Calculate approximate gas metrics based on Stylus vs Solidity
  const stylusGasPerTx = 21450;
  const solidityGasPerTx = 184200;
  const totalStylusGas = Math.round((stylusGasPerTx * volume) / 1000);
  const totalSolidityGas = Math.round((solidityGasPerTx * volume) / 1000);
  const gasSavedPercent = Math.round(
    ((solidityGasPerTx - stylusGasPerTx) / solidityGasPerTx) * 100,
  );

  return (
    <section className="border-t-2 border-ink bg-paper">
      <RevealOnScroll>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-line px-5 py-6 md:px-8 bg-paper-2/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-mint animate-pulse" />
              <p className="label font-mono text-[10px]">WASM VS EVM COMPUTATION</p>
            </div>
            <h2 className="display mt-1 text-4xl md:text-5xl text-ink">Stylus Gas Benchmark</h2>
          </div>
          <p className="mt-2 sm:mt-0 font-mono text-xs text-ink-muted">
            Directly compiled Rust WASM execution trace comparison
          </p>
        </div>
      </RevealOnScroll>

      {/* Main Gas Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-line">
        {/* Left Column: Stylus WASM Card (6 cols) */}
        <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-line bg-dark text-dark-fg p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/40 bg-mint/10 px-3 py-1 font-mono text-[10px] tracking-wider text-mint uppercase font-semibold">
                <Cpu className="size-3" /> Arbitrum Stylus (Rust WASM)
              </span>
              <span className="font-mono text-xs text-mint">~8.5x CHEAPER</span>
            </div>

            <div className="mt-6">
              <p className="label text-dark-muted text-[10px]">PER-EVALUATION EXECUTION GAS</p>
              <div className="display mt-2 text-5xl md:text-7xl text-mint tabular-nums">
                {GAS_COMPARISON.stylus.label}
              </div>
              <p className="mt-3 text-sm text-dark-muted leading-relaxed">
                {GAS_COMPARISON.stylus.note}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-dark-2 pt-5 font-mono text-xs">
              <div>
                <span className="text-dark-muted text-[10px] uppercase block">Memory Overhead</span>
                <span className="text-dark-fg font-medium">Near-Zero Heap Alloc</span>
              </div>
              <div>
                <span className="text-dark-muted text-[10px] uppercase block">WASM Verification</span>
                <span className="text-mint font-medium">Native Prover</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Naive Solidity Card (6 cols) */}
        <div className="lg:col-span-6 p-6 md:p-8 flex flex-col justify-between bg-paper-2/50 relative">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-paper px-3 py-1 font-mono text-[10px] tracking-wider text-ink-muted uppercase">
                Naive Solidity (EVM)
              </span>
              <span className="font-mono text-xs text-ink-muted">STANDARD EVM</span>
            </div>

            <div className="mt-6">
              <p className="label text-[10px]">ESTIMATED SOLDIITY EXECUTION GAS</p>
              <div className="display mt-2 text-5xl md:text-7xl text-ink tabular-nums opacity-75">
                {GAS_COMPARISON.solidity.label}
              </div>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                {GAS_COMPARISON.solidity.note}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-5 font-mono text-xs">
              <div>
                <span className="text-ink-muted text-[10px] uppercase block">EVM Stack Depth</span>
                <span className="text-ink font-medium">Heavy Bytecode Gas</span>
              </div>
              <div>
                <span className="text-ink-muted text-[10px] uppercase block">Math Precision</span>
                <span className="text-ink font-medium">Costly Fixed-Point</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Gas Volume Simulation Slider */}
      <div className="p-6 md:p-8 bg-paper">
        <div className="max-w-3xl mx-auto border border-line bg-paper-2/30 p-6 rounded-sm shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-4">
            <div>
              <p className="label text-[10px]">INTERACTIVE PROTOCOL SIMULATION</p>
              <h3 className="display text-2xl md:text-3xl text-ink">
                Simulate Bulk Risk Evaluations
              </h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-ink font-bold">{volume.toLocaleString()}</span> policies evaluated
            </div>
          </div>

          <div className="mt-5">
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-ink"
            />
            <div className="flex justify-between font-mono text-[10px] text-ink-muted mt-1">
              <span>100 Evaluations</span>
              <span>2,500 Evaluations</span>
              <span>5,000 Evaluations</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-line font-mono">
            <div className="bg-paper p-3 border border-line">
              <span className="text-[10px] text-ink-muted block uppercase">Stylus Gas Used</span>
              <span className="font-display text-2xl text-mint-fg">
                <NumberRoll value={totalStylusGas} pad={1} /> k
              </span>
            </div>
            <div className="bg-paper p-3 border border-line">
              <span className="text-[10px] text-ink-muted block uppercase">Solidity Gas Used</span>
              <span className="font-display text-2xl text-ink opacity-70">
                <NumberRoll value={totalSolidityGas} pad={1} /> k
              </span>
            </div>
            <div className="bg-mint/20 p-3 border border-mint">
              <span className="text-[10px] text-mint-fg font-bold block uppercase flex items-center gap-1">
                <TrendingDown className="size-3" /> Gas Saved
              </span>
              <span className="font-display text-2xl text-mint-fg font-bold">
                {gasSavedPercent}% Redux
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
