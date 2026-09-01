import { createFileRoute } from "@tanstack/react-router";
import { GasComparison } from "@/components/GasComparison";
import { CONTRACT_ERROR_MESSAGES } from "@/lib/errors";
import { LOCATIONS, padLocationId } from "@/lib/locations";
import { ADDRESSES, CHAIN_ID, RPC_URL } from "@/lib/config";
import { isMockMode } from "@/lib/contracts";
import { useContractRevision } from "@/hooks/useContractRevision";

export const Route = createFileRoute("/protocol")({ component: ProtocolPage });

function ProtocolPage() {
  useContractRevision();
  const mock = isMockMode();

  return (
    <main>
      <header className="border-b border-line px-5 py-10 md:px-8">
        <p className="label">On-chain</p>
        <h1 className="display mt-2 text-[clamp(3.5rem,12vw,7rem)]">Protocol</h1>
        <p className="mt-4 max-w-xl text-sm text-ink-muted">
          Addresses, location table, custom errors, and the Stylus gas panel.
          The UI never invents a function name or a location ID.
        </p>
      </header>

      <section className="grid grid-cols-1 border-b border-line md:grid-cols-2">
        <div className="border-b border-line px-5 py-8 md:border-r md:border-b-0 md:px-8">
          <p className="label">Mode</p>
          <p className="display mt-2 text-6xl">{mock ? "Mock" : "Live"}</p>
          <p className="mt-3 text-sm text-ink-muted">
            {mock
              ? "All reads and writes go through the mock book. Flip to Live once Sepolia addresses exist."
              : "Reads and writes go to Arbitrum Sepolia via viem."}
          </p>
        </div>
        <div className="px-5 py-8 md:px-8">
          <p className="label">Network</p>
          <dl className="mt-4 space-y-2 font-mono text-sm">
            <Row k="Chain ID" v={String(CHAIN_ID)} />
            <Row k="RPC" v={RPC_URL} />
            <Row k="Risk engine" v={ADDRESSES.riskEngine ?? "pending"} />
            <Row k="Insurance pool" v={ADDRESSES.insurancePool ?? "pending"} />
            <Row k="Policy NFT" v={ADDRESSES.policyNft ?? "pending"} />
            <Row k="Mock oracle" v={ADDRESSES.mockOracle ?? "pending"} />
          </dl>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="border-b border-line px-5 py-5 md:px-8">
          <p className="label">Location table</p>
          <h2 className="display mt-1 text-4xl">Sites</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-line font-mono text-[11px] tracking-widest text-ink-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium md:px-8">ID</th>
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Region</th>
                <th className="px-3 py-3 font-medium">Hazard</th>
                <th className="px-5 py-3 font-medium md:px-8">Premium bps</th>
              </tr>
            </thead>
            <tbody>
              {LOCATIONS.map((l) => (
                <tr key={l.id.toString()} className="border-b border-line">
                  <td className="px-5 py-3 font-mono md:px-8">{padLocationId(l.id)}</td>
                  <td className="px-3 py-3">{l.name}</td>
                  <td className="px-3 py-3 text-ink-muted">{l.region}</td>
                  <td className="px-3 py-3">{l.hazard}</td>
                  <td className="px-5 py-3 font-mono tabular-nums md:px-8">{l.basePremiumBps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="border-b border-line px-5 py-5 md:px-8">
          <p className="label">Solidity errors</p>
          <h2 className="display mt-1 text-4xl">Decoded</h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2">
          {Object.entries(CONTRACT_ERROR_MESSAGES).map(([code, message]) => (
            <li key={code} className="border-b border-line px-5 py-4 md:odd:border-r md:px-8">
              <p className="font-mono text-sm">{code}</p>
              <p className="mt-1 text-sm text-ink-muted">{message}</p>
            </li>
          ))}
        </ul>
      </section>

      <GasComparison />
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-ink-muted">{k}</dt>
      <dd className="break-all text-ink">{v}</dd>
    </div>
  );
}
