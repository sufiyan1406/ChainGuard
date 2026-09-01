import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BuyPolicyForm } from "@/components/BuyPolicyForm";
import { LiveRiskStrip } from "@/components/LiveRiskStrip";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <section id="bind" className="border-t border-line">
        <div className="flex items-end justify-between border-b border-line px-5 py-5 md:px-6">
          <div>
            <p className="label">Bind cover</p>
            <h2 className="display mt-1 text-4xl md:text-5xl">Buy a policy</h2>
          </div>
          <p className="hidden max-w-xs text-right text-xs text-ink-muted md:block">
            Location → coverage → premium → purchase. One transaction.
          </p>
        </div>
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
          <p className="label">Parametric flood cover · Arbitrum Sepolia</p>
          <div>
            <h1 className="display text-[clamp(4.25rem,14vw,8.75rem)]">Cover</h1>
            <p className="mt-5 max-w-md text-base text-ink-muted md:text-lg">
              Micro-insurance that pays when the water parameter crosses the line.
              No adjuster. No waiting on a claim file. The contract is the policy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#bind"
                className="inline-flex h-12 items-center bg-ink px-5 pr-4 text-sm text-paper transition-transform duration-150 active:scale-[0.96]"
              >
                Bind cover
                <ArrowRight className="ml-2 size-4" />
              </a>
              <Link
                to="/policies"
                className="inline-flex h-12 items-center px-5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--color-ink)] transition-colors duration-150 hover:bg-ink hover:text-paper"
              >
                My policies
              </Link>
            </div>
          </div>
        </div>

        <div className="grid min-h-[22rem] grid-cols-[1fr_4.5rem] grid-rows-[1fr_8.5rem] lg:min-h-[34rem]">
          <div className="relative overflow-hidden bg-dark">
            <img
              src="/editorial/delta.jpg"
              alt="Aerial river delta over a city grid"
              className="absolute inset-0 size-full object-cover opacity-85"
            />
            <div className="halftone-fine absolute inset-0 mix-blend-multiply" />
            <p className="absolute bottom-4 left-4 font-mono text-[11px] tracking-widest text-paper uppercase">
              Jakarta basin · site 01
            </p>
          </div>
          <div className="relative overflow-hidden bg-sage" aria-hidden>
            <div className="halftone absolute inset-0 opacity-30" />
          </div>
          <div className="bg-mauve" aria-hidden />
          <div className="relative overflow-hidden bg-dark">
            <img
              src="/editorial/dusk.jpg"
              alt="Still water at dusk"
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
        <div className="relative min-h-52 overflow-hidden border-b border-r border-line sm:min-h-64">
          <img
            src="/editorial/concrete.jpg"
            alt="Rain-stained brutalist concrete"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="relative min-h-52 overflow-hidden border-b border-line sm:min-h-64 lg:border-r">
          <img
            src="/editorial/water.jpg"
            alt="Rain on dark water"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="flex min-h-52 flex-col justify-between border-b border-line bg-dark p-5 text-dark-fg sm:min-h-64 lg:border-r lg:border-b-0">
          <p className="text-sm leading-relaxed">
            Placing flood cover for households and small books on a public chain.
            The risk engine is Stylus. The pool is the underwriter.
          </p>
          <p className="label text-dark-muted">Since 2026</p>
        </div>
        <div className="flex min-h-52 flex-col justify-between bg-mint p-5 text-mint-fg sm:min-h-64">
          <p className="text-sm leading-relaxed">
            We don’t wait on volume. We move capital when the parameter says so —
            and the firms that bind cover get paid in the same block.
          </p>
          <p className="label text-mint-fg/70">Payout on trigger</p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Connect", body: "Demo wallet in mock, or MetaMask on Arbitrum Sepolia." },
    { n: "02", title: "Bind", body: "Pick a city, set coverage, pay the quoted premium." },
    { n: "03", title: "Watch", body: "Risk scores poll every four seconds from the engine." },
    { n: "04", title: "Settle", body: "At 80 the flood parameter pays. No claim form." },
  ];

  return (
    <section className="border-t border-line">
      <div className="border-b border-line px-5 py-5 md:px-6">
        <p className="label">The book</p>
        <h2 className="display mt-1 text-4xl md:text-5xl">How it works</h2>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={step.n}
            className={`flex min-h-44 flex-col justify-between border-b border-line px-5 py-6 sm:odd:border-r lg:border-b-0 ${
              i < 3 ? "lg:border-r" : ""
            }`}
          >
            <p className="label">{step.n}</p>
            <div>
              <h3 className="display text-4xl">{step.title}</h3>
              <p className="mt-3 text-sm text-ink-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
