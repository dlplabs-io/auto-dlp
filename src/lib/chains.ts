import { Chain } from 'viem';

export const vanaChain = {
  id: 1480,
  name: 'Vana',  
  nativeCurrency: {
    decimals: 18,
    name: 'Vana',
    symbol: 'VANA',
  },
  rpcUrls: {
    default: {
      http: [process.env.RPC_ENDPOINT || 'https://rpc.vana.org'],
    },
    public: {
      http: [process.env.RPC_ENDPOINT || 'https://rpc.vana.org'],
    },
  },
} as const satisfies Chain;
