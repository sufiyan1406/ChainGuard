import { formatEther, parseEther } from "viem";

export function formatEth(wei: bigint, digits = 4): string {
  const n = Number(formatEther(wei));
  if (!Number.isFinite(n)) return formatEther(wei);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  });
}

export function formatEthUnit(wei: bigint, digits = 4): string {
  return `${formatEth(wei, digits)} ETH`;
}

export function parseCoverage(input: string): bigint | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return parseEther(trimmed);
  } catch {
    return null;
  }
}

export function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatUnix(seconds: bigint | number): string {
  const ms = Number(seconds) * 1000;
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  return new Date(ms).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUnixDate(seconds: bigint | number): string {
  const ms = Number(seconds) * 1000;
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function riskBand(score: number): "calm" | "elevated" | "severe" | "trigger" {
  if (score >= 80) return "trigger";
  if (score >= 61) return "severe";
  if (score >= 31) return "elevated";
  return "calm";
}

export function riskLabel(score: number): string {
  switch (riskBand(score)) {
    case "trigger":
      return "Trigger";
    case "severe":
      return "Severe";
    case "elevated":
      return "Elevated";
    default:
      return "Calm";
  }
}

export function nowUnix(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

export function clockLabel(date = new Date()): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
