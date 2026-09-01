import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useWalletClient } from "wagmi";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";
import { usePremiumQuote } from "@/hooks/usePremiumQuote";
import { useRiskScore } from "@/hooks/useRiskScore";
import { useWallet } from "@/hooks/useWallet";
import { buyPolicy, isMockMode } from "@/lib/contracts";
import { formatEthUnit } from "@/lib/format";
import { LOCATIONS, padLocationId } from "@/lib/locations";
import { validateBuy } from "@/lib/validateBuy";
import { cn } from "@/lib/utils";
import type { Address, TxState } from "@/lib/types";

const PRESETS = ["0.05", "0.10", "0.25", "0.50", "1.00"];

export function BuyPolicyForm() {
  const wallet = useWallet();
  const { data: walletClient } = useWalletClient();
  const [locationId, setLocationId] = useState<bigint | null>(1n);
  const [coverageInput, setCoverageInput] = useState("0.10");
  const [tx, setTx] = useState<TxState>({ phase: "idle" });

  const parsed = useMemo(
    () =>
      validateBuy({
        locationId,
        coverageInput,
        connected: wallet.connected,
        isCorrectChain: wallet.isCorrectChain,
      }),
    [locationId, coverageInput, wallet.connected, wallet.isCorrectChain],
  );

  const { premium, loading: quoting, error: quoteError } = usePremiumQuote(
    parsed.coverage && locationId !== null ? locationId : null,
    parsed.coverage,
  );
  const { reading } = useRiskScore(locationId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parsed.ok || locationId === null || parsed.coverage === null) {
      setTx({
        phase: "error",
        message:
          parsed.errors.wallet ??
          parsed.errors.network ??
          parsed.errors.location ??
          parsed.errors.coverage ??
          "Check the form.",
      });
      return;
    }

    setTx({ phase: "pending", message: "Submitting buyPolicy…" });
    try {
      const result = await buyPolicy(locationId, parsed.coverage, {
        walletClient:
          !isMockMode() && walletClient && wallet.address
            ? {
                account: wallet.address as Address,
                writeContract: async (args) =>
                  walletClient.writeContract(args as never),
              }
            : undefined,
      });
      setTx({
        phase: "success",
        hash: result.txHash,
        policyId: result.policyId,
      });
    } catch (err) {
      setTx({
        phase: "error",
        message: err instanceof Error ? err.message : "Purchase failed.",
        code: err && typeof err === "object" && "code" in err ? String(err.code) : undefined,
      });
    }
  }

  if (tx.phase === "success") {
    return (
      <div className="border border-ink bg-mint p-6 text-mint-fg md:p-8">
        <p className="label text-mint-fg/70">Policy bound</p>
        <p className="display mt-3 text-6xl md:text-7xl">Covered</p>
        <p className="mt-4 max-w-md text-sm">
          Policy #{tx.policyId.toString().padStart(4, "0")} is on the book. Risk is
          watched continuously. If the flood parameter crosses the trigger, payout
          settles without a claim form.
        </p>
        <p className="mt-4 break-all font-mono text-[11px] text-mint-fg/70">{tx.hash}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/policies"
            className="inline-flex h-11 items-center bg-ink px-4 text-sm text-paper"
          >
            View policies
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              setTx({ phase: "idle" });
            }}
          >
            Bind another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-12">
      <div className="border-b border-line lg:col-span-7 lg:border-r lg:border-b-0">
        <div className="border-b border-line px-5 py-5 md:px-6">
          <p className="label">01 — Location</p>
          <h2 className="display mt-2 text-4xl md:text-5xl">Where to cover</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {LOCATIONS.map((loc) => {
            const selected = locationId === loc.id;
            return (
              <button
                key={loc.id.toString()}
                type="button"
                onClick={() => setLocationId(loc.id)}
                className={cn(
                  "flex min-h-24 flex-col items-start border-b border-line px-5 py-4 text-left transition-colors duration-150 sm:odd:border-r",
                  selected ? "bg-ink text-paper" : "bg-paper hover:bg-paper-2",
                )}
              >
                <span className={cn("label", selected && "text-paper/60")}>
                  {padLocationId(loc.id)} · {loc.hazard}
                </span>
                <span className="display mt-1 text-3xl">{loc.name}</span>
                <span className={cn("mt-1 text-xs", selected ? "text-paper/70" : "text-ink-muted")}>
                  {loc.region}
                </span>
              </button>
            );
          })}
        </div>
        {parsed.errors.location ? (
          <p className="px-5 py-3 text-sm text-rose">{parsed.errors.location}</p>
        ) : null}
      </div>

      <div className="lg:col-span-5">
        <div className="border-b border-line px-5 py-5 md:px-6">
          <p className="label">02 — Coverage</p>
          <h2 className="display mt-2 text-4xl md:text-5xl">How much</h2>
        </div>

        <div className="px-5 py-5 md:px-6">
          <label htmlFor="coverage" className="label">
            Coverage amount (ETH)
          </label>
          <input
            id="coverage"
            inputMode="decimal"
            value={coverageInput}
            onChange={(e) => setCoverageInput(e.target.value)}
            className="mt-2 h-14 w-full border-b border-ink bg-transparent font-display text-5xl tabular-nums outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCoverageInput(p)}
                className={cn(
                  "h-9 px-3 font-mono text-xs",
                  coverageInput === p ? "bg-ink text-paper" : "bg-paper-2 text-ink hover:bg-line",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          {parsed.errors.coverage ? (
            <p className="mt-2 text-sm text-rose">{parsed.errors.coverage}</p>
          ) : null}

          <div className="mt-8 border-t border-line pt-5">
            <p className="label">03 — Premium due now</p>
            <p className="display mt-2 text-5xl tabular-nums">
              {quoting ? "—" : premium !== null ? formatEthUnit(premium) : "—"}
            </p>
            {quoteError ? <p className="mt-2 text-sm text-rose">{quoteError}</p> : null}
            <p className="mt-2 text-xs text-ink-muted">
              Quoted from the location table. Paid in ETH with the purchase transaction.
            </p>
          </div>

          {reading ? (
            <div className="mt-8 border-t border-line pt-5">
              <RiskScoreGauge score={reading.riskScore} compact label="Current risk at site" />
            </div>
          ) : null}

          <div className="mt-8">
            {parsed.errors.wallet ? (
              <p className="mb-3 text-sm text-rose">{parsed.errors.wallet}</p>
            ) : null}
            {parsed.errors.network ? (
              <p className="mb-3 text-sm text-rose">{parsed.errors.network}</p>
            ) : null}
            {tx.phase === "error" ? (
              <p className="mb-3 text-sm text-rose">{tx.message}</p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="xl"
              className="w-full"
              disabled={tx.phase === "pending" || tx.phase === "confirming"}
            >
              {tx.phase === "pending" || tx.phase === "confirming" ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {tx.phase === "pending" ? "Confirming" : "Binding"}
                </>
              ) : (
                <>
                  Bind cover
                  <Check className="size-4" />
                </>
              )}
            </Button>
            <p className="mt-3 text-xs text-ink-muted">
              Calls <span className="font-mono">buyPolicy(locationId, coverageAmount)</span>
              {wallet.mock ? " through the mock contract layer." : " on the insurance pool."}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
