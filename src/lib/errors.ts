export const CONTRACT_ERROR_MESSAGES: Record<string, string> = {
  PolicyNotFound: "This policy does not exist.",
  AlreadyClaimed: "Payout already settled for this policy.",
  InsufficientPremium: "Premium sent is below the quoted amount.",
  NotAuthorized: "This wallet cannot perform that action.",
  InvalidLocation: "That location is not in the underwriting table.",
  CoverageOutOfBounds: "Coverage is outside the allowed range.",
  WalletNotConnected: "Connect a wallet to continue.",
  WrongNetwork: "Switch to Arbitrum Sepolia to continue.",
  UserRejected: "Transaction was rejected in the wallet.",
};

export function decodeContractError(error: unknown): { code?: string; message: string } {
  if (!error) return { message: "Something went wrong." };

  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? `${error.name} ${error.message} ${"shortMessage" in error ? String((error as { shortMessage?: string }).shortMessage) : ""}`
        : JSON.stringify(error);

  for (const code of Object.keys(CONTRACT_ERROR_MESSAGES)) {
    if (raw.includes(code)) {
      return { code, message: CONTRACT_ERROR_MESSAGES[code] };
    }
  }

  if (/user rejected|denied|rejected the request/i.test(raw)) {
    return { code: "UserRejected", message: CONTRACT_ERROR_MESSAGES.UserRejected };
  }

  if (/insufficient funds/i.test(raw)) {
    return { message: "Wallet does not have enough ETH for premium and gas." };
  }

  const short =
    error && typeof error === "object" && "shortMessage" in error
      ? String((error as { shortMessage: string }).shortMessage)
      : error instanceof Error
        ? error.message
        : "Transaction failed.";

  return { message: short };
}

export class ChainGuardError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "ChainGuardError";
    this.code = code;
  }
}
