// Dashboard color palette
export const C = {
  bg: "#F9F7F2",
  purple: "#6B3FA0",
  purpleHover: "#5A3488",
  dark: "#15101C",
  ink: "#1B1622",
  body: "#4A4458",
  secondary: "#6B6577",
  muted: "#8B8595",
  veryMuted: "#A39DAD",
  border: "#ECE8F1",
  borderLight: "#F0EDF4",
  purpleBg: "#F4EFFA",
  purpleBorder: "#E7DEF5",
  almostWhite: "#FCFBFE",
  codeBg: "#1C1726",
  green: "#1F9D62",
  greenDark: "#1F7A4D",
  greenBg: "#E9F6EF",
  greenBorder: "#CFEBDC",
  usdcBlue: "#2775CA",
  red: "#B0473F",
  redBg: "#FBECEA",
} as const;

export const CHAINS = [
  { value: "base",     label: "Base",     color: "#0052FF" },
  { value: "ethereum", label: "Ethereum", color: "#627EEA" },
  { value: "arbitrum", label: "Arbitrum", color: "#12AAFF" },
  { value: "polygon",  label: "Polygon",  color: "#8247E5" },
];

export const TOKENS = ["USDC", "USDT", "ETH"];

export const TOKEN_COLOR: Record<string, string> = {
  USDC: "#2775CA",
  USDT: "#26A17B",
  ETH:  "#627EEA",
};
