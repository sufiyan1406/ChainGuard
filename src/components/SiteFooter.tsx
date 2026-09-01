export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="border-b border-line px-5 py-8 md:border-b-0 md:border-r">
          <p className="display text-3xl">ChainGuard</p>
          <p className="mt-3 max-w-sm text-sm text-ink-muted">
            Parametric flood micro-insurance on Arbitrum Sepolia. Cover binds on-chain.
            Payouts fire on the parameter — not a claims adjuster.
          </p>
        </div>
        <div className="border-b border-line px-5 py-8 md:border-b-0 md:border-r">
          <p className="label">Network</p>
          <ul className="mt-3 space-y-1 font-mono text-sm">
            <li>Arbitrum Sepolia</li>
            <li>Chain ID 421614</li>
            <li>Stylus risk engine</li>
          </ul>
        </div>
        <div className="bg-dark px-5 py-8 text-dark-fg">
          <p className="label text-dark-muted">Notice</p>
          <p className="mt-3 text-sm text-dark-muted">
            Demo product for a hackathon. Not an offer of insurance. Mock mode uses
            local state; live mode talks to deployed contracts only.
          </p>
        </div>
      </div>
    </footer>
  );
}
