import { http, createConfig } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { RPC_URL } from "./config";

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [arbitrumSepolia.id]: http(RPC_URL),
  },
  ssr: true,
});

export const targetChain = arbitrumSepolia;
