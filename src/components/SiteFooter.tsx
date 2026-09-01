import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ScrambleText } from "@/components/motion/ScrambleText";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <RevealOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="border-b border-line px-5 py-8 md:border-b-0 md:border-r">
            <p className="display text-3xl text-ink">
              <ScrambleText text="ChainGuard" speed={40} delay={200} />
            </p>
            <p className="mt-3 max-w-sm text-sm text-ink-muted leading-relaxed">
              Parametric flood micro-insurance on Arbitrum Sepolia. Cover binds on-chain.
              Payouts fire on the parameter — not a claims adjuster.
            </p>
          </div>
          <div className="border-b border-line px-5 py-8 md:border-b-0 md:border-r bg-paper-2/30">
            <p className="label text-[10px]">NETWORK & EXECUTION</p>
            <ul className="mt-3 space-y-1.5 font-mono text-xs">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-mint" /> Arbitrum Sepolia Testnet
              </li>
              <li className="text-ink-muted">Chain ID 421614</li>
              <li className="text-ink-muted">Stylus WASM Risk Engine (Rust)</li>
            </ul>
          </div>
          <div className="bg-dark px-5 py-8 text-dark-fg">
            <p className="label text-mint font-mono text-[10px]">DEMO NOTICE</p>
            <p className="mt-3 text-xs text-dark-muted leading-relaxed">
              Parametric hackathon prototype for Arbitrum Stylus. Mock mode uses
              local reactive state; live mode talks directly to deployed contracts on Sepolia.
            </p>
          </div>
        </div>
      </RevealOnScroll>
    </footer>
  );
}
