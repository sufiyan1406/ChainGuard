import { useCallback, useMemo } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import {
  connectDemoWallet,
  disconnectDemoWallet,
  getDemoBalance,
  getDemoWallet,
  isMockMode,
} from "@/lib/contracts";
import { PRIVY_APP_ID, isValidPrivyAppId } from "@/lib/config";
import { ARBITRUM_SEPOLIA_CHAIN_ID, type Address, type WalletState } from "@/lib/types";
import { useContractRevision } from "./useContractRevision";

function useSafePrivy() {
  const hasPrivy = isValidPrivyAppId(PRIVY_APP_ID);
  if (!hasPrivy) {
    return {
      hasPrivy: false,
      login: () => {},
      logout: async () => {},
      authenticated: false,
      ready: true,
      user: null as { wallet?: { address?: string } } | null,
      wallets: [],
    };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const privy = usePrivy();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { wallets } = useWallets();
  return { hasPrivy: true, ...privy, wallets };
}

export function useWallet() {
  const revision = useContractRevision();
  const mock = isMockMode();
  const privy = useSafePrivy();
  const account = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const injected = connectors.find((c) => c.type === "injected") ?? connectors[0];
  const activePrivyWallet = privy.wallets?.[0] ?? null;

  const wallet: WalletState = useMemo(() => {
    if (mock) return getDemoWallet();

    const address = (account.address ?? activePrivyWallet?.address ?? (privy.user?.wallet?.address as Address) ?? null) as Address | null;
    const chainId = account.chainId ?? Number(activePrivyWallet?.chainId?.replace("eip155:", "") ?? 421614);

    return {
      address,
      chainId,
      connected: Boolean(address) && (account.status === "connected" || privy.authenticated || Boolean(activePrivyWallet)),
      connecting: isPending || (!privy.ready && privy.hasPrivy) || account.status === "connecting" || account.status === "reconnecting",
      isCorrectChain: chainId === ARBITRUM_SEPOLIA_CHAIN_ID || chainId === 0,
      hasProvider: typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: unknown }).ethereum || (privy.wallets?.length ?? 0) > 0),
    };
  }, [mock, revision, account.address, account.chainId, account.status, activePrivyWallet, privy.authenticated, privy.ready, privy.hasPrivy, privy.wallets, privy.user?.wallet?.address, isPending]);

  const connect = useCallback(async () => {
    if (mock) {
      connectDemoWallet();
      return;
    }
    if (injected) {
      try {
        await connectAsync({ connector: injected });
        return;
      } catch {
        // Fallback to Privy if injected was rejected or not ready
      }
    }
    if (privy.hasPrivy) {
      if (!privy.authenticated) {
        privy.login();
        return;
      }
    }
  }, [mock, privy, injected, connectAsync]);

  const disconnect = useCallback(async () => {
    if (mock) {
      disconnectDemoWallet();
      return;
    }
    if (privy.hasPrivy && privy.authenticated) {
      try {
        await privy.logout();
      } catch (err) {
        console.warn("Privy session logout notice:", err);
      }
    }
    try {
      await disconnectAsync();
    } catch (err) {
      console.warn("Wagmi disconnect notice:", err);
    }
  }, [mock, privy, disconnectAsync]);

  const switchNetwork = useCallback(async () => {
    if (mock) return;
    if (activePrivyWallet) {
      await activePrivyWallet.switchChain(ARBITRUM_SEPOLIA_CHAIN_ID);
    } else {
      await switchChainAsync({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID });
    }
  }, [mock, activePrivyWallet, switchChainAsync]);

  const balance = mock ? getDemoBalance() : null;

  return {
    ...wallet,
    mock,
    balance,
    connect,
    disconnect,
    switchNetwork,
    isSwitching,
    hasPrivy: privy.hasPrivy,
  };
}
