import type { UserSummary } from "@/shared/api/types";

const CSV_HEADERS = [
  "ID",
  "Name",
  "Email",
  "Tier",
  "Status",
  "Requests used",
  "Requests limit",
  "Tokens spent",
  "Cost (USD)",
  "Last active",
  "Signup date",
  "Platform",
  "Mobile",
] as const;

function escapeCsvValue(value: unknown): string {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function usersToCsv(users: UserSummary[]): string {
  const rows = users.map((user) => [
    user.id,
    user.name,
    user.email,
    user.tier,
    user.status,
    user.requestsUsed,
    user.requestsLimit,
    user.tokensSpent,
    user.costUsd,
    user.lastActiveAt,
    user.signupDate,
    user.platform,
    user.mobile,
  ]);

  return [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n") + "\r\n";
}

export function exportUsersToCsv(users: UserSummary[], filename: string): void {
  if (typeof document === "undefined") return;

  const blob = new Blob(["\uFEFF", usersToCsv(users)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
