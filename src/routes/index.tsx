import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Zap, Waves, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { BuyPolicyForm } from "@/components/BuyPolicyForm";
import { LiveRiskStrip } from "@/components/LiveRiskStrip";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { InteractiveTiltCard } from "@/components/motion/InteractiveTiltCard";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      
      {/* DISTINCT SECTION: BIND COVER */}
      <section id="bind" className="border-t-2 border-ink bg-paper">
        <RevealOnScroll>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-line px-5 py-6 md:px-8 bg-paper-2/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2 bg-mint rounded-full animate-ping" />
                <p className="label font-mono text-[11px] text-ink font-semibold">ON-CHAIN PARAMETRIC COVER</p>
              </div>
              <h2 className="display mt-1 text-4xl md:text-6xl text-ink">Buy a Policy</h2>
            </div>
            <p className="max-w-md text-xs sm:text-right text-ink-muted mt-2 sm:mt-0 font-mono">
              [ 01 Select Site ] → [ 02 Underwrite ETH ] → [ Instant Chain Settlement ]
            </p>
          </div>
        </RevealOnScroll>
        <BuyPolicyForm />
      </section>

      <LiveRiskStrip />
    </main>
  );
}

function Hero() {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex min-h-[28rem] flex-col justify-between border-b border-line px-5 py-8 md:min-h-[34rem] md:px-8 md:py-10 lg:border-r lg:border-b-0">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="size-2 rounded-full bg-mint animate-pulse" />
            <p className="label font-mono text-[10px]">PARAMETRIC FLOOD COVER · ARBITRUM SEPOLIA</p>
          </motion.div>
          <div>
            <SplitReveal
              text="COVER"
              as="h1"
              className="display text-[clamp(4.5rem,15vw,9.5rem)] text-ink leading-none tracking-tight"
              delay={0.2}
              stagger={0.06}
            />
            <motion.p
              className="mt-5 max-w-md text-base text-ink-muted md:text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              Micro-insurance that pays when the water parameter crosses the line.
              No claims adjusters. No waiting on paperwork. The code settles the contract.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <MagneticButton strength={0.25}>
                <a
                  href="#bind"
                  className="inline-flex h-13 items-center bg-ink px-6 pr-5 text-sm font-semibold text-paper transition-transform duration-150 active:scale-[0.96] shadow-lg"
                >
                  Bind cover
                  <ArrowRight className="ml-2.5 size-4 text-mint" />
                </a>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Link
                  to="/policies"
                  className="inline-flex h-13 items-center px-6 text-sm font-medium text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] transition-colors duration-150 hover:bg-ink hover:text-paper"
                >
                  My policies
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </div>

        <div className="grid min-h-[22rem] grid-cols-[1fr_4.5rem] grid-rows-[1fr_8.5rem] lg:min-h-[34rem]">
          <motion.div
            className="relative overflow-hidden bg-dark group"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src="/editorial/delta.jpg"
              alt="Aerial river delta over a city grid"
              className="absolute inset-0 size-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="halftone-fine absolute inset-0 mix-blend-multiply" />
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-dark/80 backdrop-blur-md px-2.5 py-1 border border-dark-2">
              <span className="size-1.5 rounded-full bg-mint animate-ping" />
              <span className="font-mono text-[10px] text-paper">ORACLE SYNC: ACTIVE</span>
            </div>
            <p className="absolute bottom-4 left-4 font-mono text-[11px] tracking-widest text-paper uppercase">
              Jakarta basin · site 01
            </p>
          </motion.div>
          <motion.div
            className="relative overflow-hidden bg-sage"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="halftone absolute inset-0 opacity-30" />
          </motion.div>
          <motion.div
            className="bg-mauve"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />
          <motion.div
            className="relative overflow-hidden bg-dark group"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src="/editorial/dusk.jpg"
              alt="Still water at dusk"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
        {[
          {
            type: "image" as const,
            src: "/editorial/concrete.jpg",
            alt: "Rain-stained brutalist concrete",
            badge: "INFRASTRUCTURE",
          },
          {
            type: "image" as const,
            src: "/editorial/water.jpg",
            alt: "Rain on dark water",
            badge: "HYDROLOGY",
          },
          {
            type: "dark" as const,
            text: "Placing flood cover for households and small books on a public chain. The risk engine is Stylus Rust. The pool is the underwriter.",
            footer: "Arbitrum Stylus WASM",
            icon: Zap,
          },
          {
            type: "mint" as const,
            text: "We don't wait on volume. We move capital when the parameter says so — and the firms that bind cover get paid in the same block.",
            footer: "Payout on Trigger ≥80",
            icon: ShieldCheck,
          },
        ].map((item, i) => (
          <RevealOnScroll key={i} delay={i * 0.1}>
            {item.type === "image" ? (
              <div
                className={`relative min-h-52 overflow-hidden border-b border-line sm:min-h-64 group ${
                  i === 0 ? "border-r" : i === 1 ? "lg:border-r" : ""
                }`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-dark/70 text-paper font-mono text-[9px] px-2 py-0.5 tracking-wider backdrop-blur-sm">
                  {item.badge}
                </span>
              </div>
            ) : item.type === "dark" ? (
              <div className="flex min-h-52 flex-col justify-between border-b border-line bg-dark p-6 text-dark-fg sm:min-h-64 lg:border-r lg:border-b-0">
                <div className="flex items-center justify-between">
                  <span className="label text-mint font-mono text-[10px]">01 ENGINE</span>
                  {item.icon && <item.icon className="size-4 text-mint" />}
                </div>
                <p className="text-sm leading-relaxed text-dark-fg/90">{item.text}</p>
                <p className="label text-dark-muted font-mono">{item.footer}</p>
              </div>
            ) : (
              <div className="flex min-h-52 flex-col justify-between bg-mint p-6 text-mint-fg sm:min-h-64">
                <div className="flex items-center justify-between">
                  <span className="label text-mint-fg/80 font-mono text-[10px]">02 SETTLEMENT</span>
                  {item.icon && <item.icon className="size-4 text-mint-fg" />}
                </div>
                <p className="text-sm leading-relaxed font-medium">{item.text}</p>
                <p className="label text-mint-fg/80 font-mono font-bold">{item.footer}</p>
              </div>
            )}
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Connect", body: "Demo wallet in mock mode, or MetaMask on Arbitrum Sepolia." },
    { n: "02", title: "Bind", body: "Pick a city, set coverage in ETH, pay the algorithmic quoted premium." },
    { n: "03", title: "Watch", body: "Hydrological risk scores poll every 4s from the Stylus Rust oracle." },
    { n: "04", title: "Settle", body: "At risk score 80 the flood parameter pays out in the very next block." },
  ];

  return (
    <section className="border-t border-line bg-paper-2/20">
      <RevealOnScroll>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-line px-5 py-6 md:px-8 bg-paper">
          <div>
            <p className="label font-mono text-[10px]">THE PROTOCOL BOOK</p>
            <h2 className="display mt-1 text-4xl md:text-5xl text-ink">How it Works</h2>
          </div>
          <p className="text-xs font-mono text-ink-muted mt-2 sm:mt-0">
            Autonomous 4-step parametric lifecycle
          </p>
        </div>
      </RevealOnScroll>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <RevealOnScroll key={step.n} delay={0.08 * i}>
            <InteractiveTiltCard maxTilt={5} className="h-full">
              <div
                className={`flex h-full min-h-52 flex-col justify-between border-b border-line p-6 sm:odd:border-r lg:border-b-0 bg-paper transition-colors duration-200 hover:bg-paper-2 ${
                  i < 3 ? "lg:border-r" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink bg-ink/10 px-2 py-0.5 rounded">
                    {step.n}
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted">STEP</span>
                </div>
                <div className="mt-4">
                  <h3 className="display text-4xl text-ink tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed">{step.body}</p>
                </div>
              </div>
            </InteractiveTiltCard>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
