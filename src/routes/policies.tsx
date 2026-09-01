import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoLab } from "@/components/DemoLab";
import { PolicyCard } from "@/components/PolicyCard";
import { usePolicies } from "@/hooks/usePolicies";
import { useAllRiskScores } from "@/hooks/useRiskScore";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/lib/format";

export const Route = createFileRoute("/policies")({ component: PoliciesPage });

function PoliciesPage() {
  const wallet = useWallet();
  const { policies, loading, error } = usePolicies(wallet.address);
  const { readings } = useAllRiskScores();
  const riskByLocation = new Map(readings.map((r) => [r.locationId.toString(), r.riskScore]));

  return (
    <main>
      <header className="grid grid-cols-1 border-b border-line lg:grid-cols-2">
        <div className="border-b border-line px-5 py-8 md:px-8 md:py-10 lg:border-r lg:border-b-0">
          <p className="label">Book</p>
          <h1 className="display mt-2 text-[clamp(3.5rem,12vw,7rem)]">Policies</h1>
          <p className="mt-4 max-w-md text-sm text-ink-muted">
            Every bound policy, with live risk from the engine. Payouts stamp the
            certificate when the flood parameter crosses 80.
          </p>
        </div>
        <div className="relative min-h-48 overflow-hidden bg-dark">
          <img
            src="/editorial/dusk.jpg"
            alt="Still water at dusk"
            className="absolute inset-0 size-full object-cover opacity-80"
          />
          <div className="halftone-fine absolute inset-0" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="border-b border-line lg:col-span-8 lg:border-r lg:border-b-0">
          {!wallet.connected ? (
            <Empty
              title="Wallet closed"
              body="Connect a wallet to read the policies bound to that address. Mock mode uses a demo wallet."
            />
          ) : loading ? (
            <div className="space-y-px">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : error ? (
            <Empty title="Could not load" body={error} />
          ) : policies.length === 0 ? (
            <Empty
              title="No cover yet"
              body={`Nothing on the book for ${formatAddress(wallet.address ?? "")}. Bind a policy, or seed one from the demo lab.`}
              action
            />
          ) : (
            <div className="flex flex-col gap-px bg-line">
              {policies.map((policy) => (
                <PolicyCard
                  key={policy.policyId.toString()}
                  policy={policy}
                  riskScore={riskByLocation.get(policy.locationId.toString())}
                />
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-4">
          <DemoLab />
        </div>
      </div>
    </main>
  );
}

function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: boolean;
}) {
  return (
    <div className="px-5 py-16 md:px-8">
      <h2 className="display text-5xl">{title}</h2>
      <p className="mt-4 max-w-md text-sm text-ink-muted">{body}</p>
      {action ? (
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center bg-ink px-4 text-sm text-paper"
        >
          Bind cover
        </Link>
      ) : null}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="h-64 animate-pulse bg-paper-2" aria-hidden />
  );
}
