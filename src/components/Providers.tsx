import { useEffect, useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";
import { WagmiProvider as StandardWagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrumSepolia } from "viem/chains";
import { PRIVY_APP_ID, isValidPrivyAppId } from "@/lib/config";
import { hydrateContractLayer } from "@/lib/contracts";
import { hydrateMock } from "@/lib/mockData";
import { wagmiConfig } from "@/lib/wagmiConfig";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
      },
    },
  });
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  useEffect(() => {
    hydrateMock();
    hydrateContractLayer();
  }, []);

  const hasPrivyAppId = isValidPrivyAppId(PRIVY_APP_ID);

  return (
    <QueryClientProvider client={queryClient}>
      {hasPrivyAppId ? (
        <PrivyProvider
          appId={PRIVY_APP_ID}
          config={{
            defaultChain: arbitrumSepolia,
            supportedChains: [arbitrumSepolia],
            appearance: {
              theme: "dark",
              accentColor: "#10b981",
            },
            embeddedWallets: {
              ethereum: {
                createOnLogin: "users-without-wallets",
              },
            },
          }}
        >
          <PrivyWagmiProvider config={wagmiConfig}>
            {children}
          </PrivyWagmiProvider>
        </PrivyProvider>
      ) : (
        <StandardWagmiProvider config={wagmiConfig}>
          {children}
        </StandardWagmiProvider>
      )}
    </QueryClientProvider>
  );
}
