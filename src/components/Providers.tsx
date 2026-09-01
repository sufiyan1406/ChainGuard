import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { hydrateContractLayer } from "@/lib/contracts";
import { hydrateMock } from "@/lib/mockData";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 4_000, refetchOnWindowFocus: false },
    },
  });
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    hydrateMock();
    hydrateContractLayer();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
