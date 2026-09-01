import { useCallback, useMemo } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import {
  connectDemoWallet,
  disconnectDemoWallet,
  getDemoBalance,
  getDemoWallet,
  isMockMode,
} from "@/lib/contracts";
import { ARBITRUM_SEPOLIA_CHAIN_ID, type WalletState } from "@/lib/types";
import { useContractRevision } from "./useContractRevision";

export function useWallet() {
  const revision = useContractRevision();
  const mock = isMockMode();
  const account = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const injected = connectors.find((c) => c.type === "injected") ?? connectors[0];

  const wallet: WalletState = useMemo(() => {
    if (mock) return getDemoWallet();
    const address = account.address ?? null;
    const chainId = account.chainId ?? 0;
    return {
      address,
      chainId,
      connected: Boolean(address) && account.status === "connected",
      connecting: isPending || account.status === "connecting" || account.status === "reconnecting",
      isCorrectChain: chainId === ARBITRUM_SEPOLIA_CHAIN_ID,
      hasProvider: typeof window !== "undefined" && Boolean(window.ethereum),
    };
  }, [mock, revision, account.address, account.chainId, account.status, isPending]);

  const connect = useCallback(async () => {
    if (mock) {
      connectDemoWallet();
      return;
    }
    if (!injected) {
      throw new Error("No injected wallet found. Install MetaMask.");
    }
    await connectAsync({ connector: injected });
  }, [mock, injected, connectAsync]);

  const disconnect = useCallback(async () => {
    if (mock) {
      disconnectDemoWallet();
      return;
    }
    await disconnectAsync();
  }, [mock, disconnectAsync]);

  const switchNetwork = useCallback(async () => {
    if (mock) return;
    await switchChainAsync({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID });
  }, [mock, switchChainAsync]);

  const balance = mock ? getDemoBalance() : null;

  return {
    ...wallet,
    mock,
    balance,
    connect,
    disconnect,
    switchNetwork,
    isSwitching,
  };
}

declare global {
  interface Window {
    ethereum?: unknown;
  }
}
