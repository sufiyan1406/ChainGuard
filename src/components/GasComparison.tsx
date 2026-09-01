import { GAS_COMPARISON } from "@/lib/gasComparison";

export function GasComparison() {
  if (!GAS_COMPARISON) {
    return (
      <section className="border border-line bg-paper">
        <div className="border-b border-line px-5 py-5 md:px-6">
          <p className="label">Stylus vs Solidity</p>
          <h2 className="display mt-2 text-4xl md:text-5xl">Gas, unpublished</h2>
        </div>
        <p className="max-w-xl px-5 py-6 text-sm text-ink-muted md:px-6">
          The protocol gas comparison has not been published yet. This panel
          will show the documented Stylus risk engine numbers against a naive
          Solidity implementation — never invented benchmarks.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-line">
      <div className="border-b border-line px-5 py-5 md:px-6">
        <p className="label">Stylus vs Solidity</p>
        <h2 className="display mt-2 text-4xl md:text-5xl">Gas on the book</h2>
        <p className="mt-2 text-sm text-ink-muted">{GAS_COMPARISON.source}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-line bg-mint px-5 py-8 text-mint-fg md:border-r md:border-b-0 md:px-6">
          <p className="label text-mint-fg/70">Stylus risk engine</p>
          <p className="display mt-3 text-6xl tabular-nums">{GAS_COMPARISON.stylus.label}</p>
          <p className="mt-3 text-sm">{GAS_COMPARISON.stylus.note}</p>
        </div>
        <div className="bg-dark px-5 py-8 text-dark-fg md:px-6">
          <p className="label text-dark-muted">Naive Solidity</p>
          <p className="display mt-3 text-6xl tabular-nums">{GAS_COMPARISON.solidity.label}</p>
          <p className="mt-3 text-sm text-dark-muted">{GAS_COMPARISON.solidity.note}</p>
        </div>
      </div>
    </section>
  );
}
