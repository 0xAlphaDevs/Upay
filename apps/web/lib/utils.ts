import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatAmount(amount: string | number, token: string): string {
  const n = Number(amount);
  if (isNaN(n)) return `${amount} ${token}`;
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${token}`;
}
