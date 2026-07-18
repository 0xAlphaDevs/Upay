import { CHAIN_ID } from "@particle-network/universal-account-sdk";

export const CHAIN_ID_MAP: Record<string, number> = {
  base:     CHAIN_ID.BASE_MAINNET,
  ethereum: CHAIN_ID.ETHEREUM_MAINNET,
  arbitrum: CHAIN_ID.ARBITRUM_MAINNET_ONE,
  polygon:  CHAIN_ID.POLYGON_MAINNET,
};

// ERC-20 token addresses per chain (mainnet). Address zero = native ETH.
export const TOKEN_ADDRESS_MAP: Record<string, Record<string, string>> = {
  base: {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    ETH:  "0x0000000000000000000000000000000000000000",
  },
  ethereum: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    ETH:  "0x0000000000000000000000000000000000000000",
  },
  arbitrum: {
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    ETH:  "0x0000000000000000000000000000000000000000",
  },
  polygon: {
    USDC: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    ETH:  "0x0000000000000000000000000000000000000000",
  },
};

export const CHAIN_EXPLORER: Record<string, string> = {
  base:     "https://basescan.org/tx/",
  ethereum: "https://etherscan.io/tx/",
  arbitrum: "https://arbiscan.io/tx/",
  polygon:  "https://polygonscan.com/tx/",
};

export function getTokenAddress(chain: string, token: string): string {
  return TOKEN_ADDRESS_MAP[chain.toLowerCase()]?.[token.toUpperCase()] ?? "";
}

export function getChainId(chain: string): number {
  return CHAIN_ID_MAP[chain.toLowerCase()] ?? CHAIN_ID.BASE_MAINNET;
}

export function getExplorerUrl(chain: string, txHash: string): string {
  const base = CHAIN_EXPLORER[chain.toLowerCase()] ?? "https://basescan.org/tx/";
  return `${base}${txHash}`;
}

export function chainLabel(chain: string): string {
  const labels: Record<string, string> = {
    base:     "Base",
    ethereum: "Ethereum",
    arbitrum: "Arbitrum",
    polygon:  "Polygon",
  };
  return labels[chain.toLowerCase()] ?? chain;
}
