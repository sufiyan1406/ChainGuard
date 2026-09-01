import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { locationLabel, padLocationId } from "@/lib/locations";
import { formatAddress, formatEthUnit, formatUnixDate } from "@/lib/format";
import type { Policy } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PolicyCard({
  policy,
  riskScore,
}: {
  policy: Policy;
  riskScore?: number;
}) {
  const statusTone =
    policy.status === "Claimed"
      ? "bg-mint text-mint-fg"
      : policy.status === "Expired"
        ? "bg-paper-2 text-ink-muted"
        : "bg-ink text-paper";

  return (
    <article className="flex flex-col border border-line bg-paper">
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="label">Policy</p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            #{policy.policyId.toString().padStart(4, "0")}
          </p>
        </div>
        <span className={cn("px-2 py-1 text-[10px] font-medium tracking-[0.16em] uppercase", statusTone)}>
          {policy.status}
        </span>
      </header>

      <div className="grid gap-0 md:grid-cols-2">
        <div className="border-b border-line px-5 py-5 md:border-r md:border-b-0">
          <p className="label">Location {padLocationId(policy.locationId)}</p>
          <h3 className="display mt-2 text-4xl md:text-5xl">{locationLabel(policy.locationId)}</h3>
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="label">Coverage</dt>
              <dd className="mt-1 font-mono tabular-nums">{formatEthUnit(policy.coverageAmount)}</dd>
            </div>
            <div>
              <dt className="label">Premium</dt>
              <dd className="mt-1 font-mono tabular-nums">{formatEthUnit(policy.premiumPaid)}</dd>
            </div>
            <div>
              <dt className="label">Bound</dt>
              <dd className="mt-1 font-mono text-xs">{formatUnixDate(policy.purchasedAt)}</dd>
            </div>
            <div>
              <dt className="label">Expires</dt>
              <dd className="mt-1 font-mono text-xs">{formatUnixDate(policy.expiresAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="px-5 py-5">
          <RiskScoreGauge
            score={riskScore ?? 0}
            compact
            label="Live risk"
          />
          {policy.claimed ? (
            <p className="mt-5 border-t border-line pt-4 text-sm">
              Payout settled · {formatEthUnit(policy.payoutAmount)}
            </p>
          ) : null}
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 font-mono text-[11px] text-ink-muted">
        <span>Holder {formatAddress(policy.holder)}</span>
        <span>Flood parameter</span>
      </footer>
    </article>
  );
}
