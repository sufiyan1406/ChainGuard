import { http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { createConfig } from "@privy-io/wagmi";
import { RPC_URL } from "./config";

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(RPC_URL),
  },
});

export const targetChain = arbitrumSepolia;
