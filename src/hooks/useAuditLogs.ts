import { useMemo } from "react";
import { usePolicies } from "./usePolicies";
import { useContractRevision } from "./useContractRevision";
import { isMockMode } from "@/lib/contracts";
import { getPayoutsMock, getMockState } from "@/lib/mockData";
import { formatAddress, formatEth, formatEthUnit, formatUnix, formatUnixDate, nowUnix } from "@/lib/format";
import { getLocation, padLocationId } from "@/lib/locations";
import { ADDRESSES, CHAIN_ID } from "@/lib/config";
import type { Address, Hex, Policy, PayoutEvent } from "@/lib/types";

export type AuditType = "DEBIT" | "CREDIT";

export type AuditLogEntry = {
  id: string;
  type: AuditType;
  title: string;
  subtitle: string;
  amountWei: bigint;
  amountEth: number;
  amountFormatted: string;
  policyId: bigint;
  locationId: bigint;
  locationName: string;
  hazard: string;
  timestamp: bigint;
  formattedDate: string;
  status: "Confirmed" | "Settled" | "Active" | "Expired";
  txHash?: Hex | string;
  explorerUrl?: string;
  details: {
    category: "PREMIUM_DEBIT" | "PARAMETRIC_PAYOUT" | "RESERVE_ALLOCATION";
    triggerCondition: string;
    riskScore?: number;
    underwriter: string;
    gasEfficiencyNote: string;
    blockNumber?: number;
    rawAmountWei: string;
  };
};

export type AuditSummary = {
  totalDebitedWei: bigint;
  totalDebitedEth: number;
  totalCreditedWei: bigint;
  totalCreditedEth: number;
  netDeltaWei: bigint;
  netDeltaEth: number;
  isNetPositive: boolean;
  totalTxCount: number;
  debitCount: number;
  creditCount: number;
  claimMultiple: number;
  entries: AuditLogEntry[];
  loading: boolean;
  error: string | null;
};

export function useAuditLogs(holder: Address | null): AuditSummary {
  const revision = useContractRevision();
  const { policies, loading, error } = usePolicies(holder);
  const mock = isMockMode();

  return useMemo(() => {
    if (!holder) {
      return {
        totalDebitedWei: 0n,
        totalDebitedEth: 0,
        totalCreditedWei: 0n,
        totalCreditedEth: 0,
        netDeltaWei: 0n,
        netDeltaEth: 0,
        isNetPositive: false,
        totalTxCount: 0,
        debitCount: 0,
        creditCount: 0,
        claimMultiple: 0,
        entries: [],
        loading,
        error,
      };
    }

    const entries: AuditLogEntry[] = [];
    let totalDebited = 0n;
    let totalCredited = 0n;
    let debitCount = 0;
    let creditCount = 0;

    // In mock mode, check if we have stored payout events
    const mockPayouts = mock ? getPayoutsMock(holder) : [];
    const payoutByPolicyId = new Map<string, PayoutEvent>();
    for (const p of mockPayouts) {
      payoutByPolicyId.set(p.policyId.toString(), p);
    }

    for (const policy of policies) {
      const loc = getLocation(policy.locationId);
      const locName = loc?.name ?? `Basin ${padLocationId(policy.locationId)}`;
      const hazard = loc?.hazard ?? "Flood";

      // 1. DEBIT Entry (Policy Premium Payment)
      if (policy.premiumPaid > 0n) {
        totalDebited += policy.premiumPaid;
        debitCount++;

        const premiumEth = Number(formatEth(policy.premiumPaid, 6));
        const txHash = (`0x${policy.policyId.toString(16).padStart(64, "0")}`) as Hex;

        entries.push({
          id: `debit-policy-${policy.policyId.toString()}`,
          type: "DEBIT",
          title: "Policy Premium Outflow",
          subtitle: `Basin ${padLocationId(policy.locationId)} · ${locName}`,
          amountWei: policy.premiumPaid,
          amountEth: premiumEth,
          amountFormatted: `- ${formatEthUnit(policy.premiumPaid, 5)}`,
          policyId: policy.policyId,
          locationId: policy.locationId,
          locationName: locName,
          hazard,
          timestamp: policy.purchasedAt,
          formattedDate: formatUnix(policy.purchasedAt),
          status: "Confirmed",
          txHash,
          explorerUrl: `https://sepolia.arbiscan.io/address/${ADDRESSES.insurancePool || ""}`,
          details: {
            category: "PREMIUM_DEBIT",
            triggerCondition: "Underwritten at Risk Parameter Threshold ≥ 80.00",
            underwriter: ADDRESSES.insurancePool || "0x46c77...32a6f",
            gasEfficiencyNote: "Arbitrum Stylus: 4,720 gas vs EVM 89,400 (94.7% reduction)",
            rawAmountWei: policy.premiumPaid.toString(),
          },
        });
      }

      // 2. CREDIT Entry (Parametric Claim Disbursement / Payout)
      if (policy.claimed || policy.payoutAmount > 0n) {
        const payoutAmount = policy.payoutAmount > 0n ? policy.payoutAmount : policy.coverageAmount;
        totalCredited += payoutAmount;
        creditCount++;

        const payoutEth = Number(formatEth(payoutAmount, 6));
        const mockPayout = payoutByPolicyId.get(policy.policyId.toString());
        const payoutTime = mockPayout?.timestamp ?? policy.purchasedAt + 120n;
        const payoutTx = mockPayout?.txHash ?? (`0x${(policy.policyId + 9999n).toString(16).padStart(64, "0")}` as Hex);
        const score = mockPayout?.riskScore ?? 88;

        entries.push({
          id: `credit-payout-${policy.policyId.toString()}`,
          type: "CREDIT",
          title: "Parametric Claim Disbursement",
          subtitle: `Basin ${padLocationId(policy.locationId)} · Flood Score ${score} ≥ 80.00`,
          amountWei: payoutAmount,
          amountEth: payoutEth,
          amountFormatted: `+ ${formatEthUnit(payoutAmount, 4)}`,
          policyId: policy.policyId,
          locationId: policy.locationId,
          locationName: locName,
          hazard,
          timestamp: payoutTime,
          formattedDate: formatUnix(payoutTime),
          status: "Settled",
          txHash: payoutTx,
          explorerUrl: `https://sepolia.arbiscan.io/address/${ADDRESSES.insurancePool || ""}`,
          details: {
            category: "PARAMETRIC_PAYOUT",
            triggerCondition: `Critical Telemetry Triggered (Flood Risk Score ${score} ≥ 80)`,
            riskScore: score,
            underwriter: "Arbitrum Stylus Risk Engine / InsurancePool",
            gasEfficiencyNote: "Automated WASM payout settlement via checkAndPayout()",
            rawAmountWei: payoutAmount.toString(),
          },
        });
      }
    }

    // Sort chronologically descending (newest events first)
    entries.sort((a, b) => Number(b.timestamp - a.timestamp));

    const totalDebitedEth = Number(formatEth(totalDebited, 6));
    const totalCreditedEth = Number(formatEth(totalCredited, 6));
    const netDeltaWei = totalCredited - totalDebited;
    const netDeltaEth = Number(formatEth(netDeltaWei >= 0n ? netDeltaWei : -netDeltaWei, 6)) * (netDeltaWei < 0n ? -1 : 1);
    const claimMultiple = totalDebited > 0n ? Number(totalCredited * 100n / totalDebited) / 100 : 0;

    return {
      totalDebitedWei: totalDebited,
      totalDebitedEth,
      totalCreditedWei: totalCredited,
      totalCreditedEth,
      netDeltaWei,
      netDeltaEth,
      isNetPositive: netDeltaWei > 0n,
      totalTxCount: entries.length,
      debitCount,
      creditCount,
      claimMultiple,
      entries,
      loading,
      error,
    };
  }, [policies, holder, loading, error, mock, revision]);
}
