import Decimal from "decimal.js";

export function formatCurrency(value: number | string, currency: string = "USD"): string {
  const d = new Decimal(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(d.toNumber());
}

export function formatNumber(value: number | string): string {
  return new Intl.NumberFormat("en-US").format(new Decimal(value).toNumber());
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatBytes(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const decimals = i === 0 ? 0 : v < 10 ? 2 : v < 100 ? 1 : 0;
  return `${v.toFixed(decimals)} ${units[i]}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: string | Date, locale: string = "en"): string {
  const now = Date.now();
  const ts = (typeof date === "string" ? new Date(date) : date).getTime();
  const diff = (ts - now) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diff / 86400), "day");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / (86400 * 7)), "week");
  if (abs < 86400 * 365) return rtf.format(Math.round(diff / (86400 * 30)), "month");
  return rtf.format(Math.round(diff / (86400 * 365)), "year");
}

/** Wrap a value so the browser renders it LTR with bidi isolation. */
export function isolateBidi(value: string): string {
  return `\u2066${value}\u2069`;
}

export function initials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

/**
 * Format an E.164 phone number for human readability.
 *  - Keeps the leading "+" and country code separated.
 *  - Groups the national number in 3s, with a final 2-4 if needed.
 *  - Falls back to the raw value when it doesn't look like E.164.
 *  - Returns "" for empty/nullish input.
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (!trimmed.startsWith("+") || digits.length < 5 || digits.length > 15) {
    return trimmed;
  }

  // Common calling codes used by dashboard data. Longer codes must match first.
  const callingCodes = ["971", "966", "880", "91", "86", "81", "61", "55", "49", "44", "33", "20", "1"];
  const callingCode = callingCodes.find((code) => digits.startsWith(code));
  if (!callingCode) return trimmed;

  const rest = digits.slice(callingCode.length);
  if (!rest) return `+${callingCode}`;

  // Prefer a final four-digit block (e.g. +1 555 555 0123), then groups of three.
  const groups: string[] = [];
  let cursor = 0;
  const headLength = rest.length > 4 ? rest.length - 4 : 0;
  while (cursor < headLength) {
    const remainingHead = headLength - cursor;
    const size = remainingHead === 4 ? 2 : Math.min(3, remainingHead);
    groups.push(rest.slice(cursor, cursor + size));
    cursor += size;
  }
  groups.push(rest.slice(cursor));
  return `+${callingCode} ${groups.join(" ")}`;
}