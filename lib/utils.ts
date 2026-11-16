import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPct(val: number | null | undefined, includeSign = false): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const str = Math.abs(val).toFixed(2).replace(".", ",") + " %";
  if (includeSign) {
    if (val > 0) return `+${str}`;
    if (val < 0) return `-${str}`;
    return str;
  }
  return val.toFixed(2).replace(".", ",") + " %";
}

export function formatPoints(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const sign = val > 0 ? "+" : val < 0 ? "-" : "";
  return `${sign}${Math.abs(val).toFixed(2).replace(".", ",")} pt${Math.abs(val) > 1 ? "s" : ""}`;
}

export function formatNumber(val: number | bigint | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return new Intl.NumberFormat("fr-FR").format(Number(val));
}
