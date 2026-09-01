/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string;
  readonly VITE_RISK_ENGINE_ADDRESS?: string;
  readonly VITE_INSURANCE_POOL_ADDRESS?: string;
  readonly VITE_POLICY_NFT_ADDRESS?: string;
  readonly VITE_MOCK_ORACLE_ADDRESS?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
