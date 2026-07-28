import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(process.cwd(), "src");

const INTL_WHITELIST = new Set([
  "src/shared/lib/format.ts",
  "src/shared/i18n/config.ts",
  "src/shared/i18n/messages/en.json",
  "src/shared/i18n/messages/ar.json",
]);

const TABLE_WHITELIST = new Set([
  "src/components/ui/table.tsx",
  "src/components/charts/ChartWrapper.tsx",
  "src/components/charts/AreaChart.tsx",
  "src/components/charts/BarChart.tsx",
  "src/components/charts/LineChart.tsx",
  "src/components/charts/PieChart.tsx",
  "src/components/charts/Sparkline.tsx",
  "src/features/revenue/FunnelChart.tsx",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.(tsx?|css)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function toRel(file: string): string {
  const normalized = file.replace(/\\/g, "/");
  const cwd = process.cwd().replace(/\\/g, "/");
  return normalized.replace(cwd + "/", "");
}

describe("DRY audit", () => {
  const files = walk(SRC);

  it("forbids toLocaleString / toLocaleDateString outside the format helpers", () => {
    const offenders = files.filter((file) => {
      const rel = toRel(file);
      if (INTL_WHITELIST.has(rel)) return false;
      const src = readFileSync(file, "utf8");
      return /toLocaleString|toLocaleDateString/.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it("forbids new Intl.* outside the format helpers", () => {
    const offenders = files.filter((file) => {
      const rel = toRel(file);
      if (INTL_WHITELIST.has(rel)) return false;
      const src = readFileSync(file, "utf8");
      return /new\s+Intl\./.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it("forbids adapter className=\"rounded border\"", () => {
    const offenders = files.filter((file) => {
      const src = readFileSync(file, "utf8");
      return /className="rounded border/.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it("forbids raw <table> markup outside the table primitive and chart wrappers", () => {
    const offenders = files.filter((file) => {
      const rel = toRel(file);
      if (TABLE_WHITELIST.has(rel)) return false;
      const src = readFileSync(file, "utf8");
      return /<table\b/.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it("forbids text-left / text-right / border-l / border-r", () => {
    const offenders = files.filter((file) => {
      const src = readFileSync(file, "utf8");
      return /\b(text-left|text-right|border-l-[^s]|border-r-[^s])\b/.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it("forbids physical padding/margin classes (pl-, pr-, ml-, mr-)", () => {
    const offenders = files.filter((file) => {
      const src = readFileSync(file, "utf8");
      return /\b(pl|pr|ml|mr)-(?:[0-9]|px|py)\b/.test(src);
    });
    expect(offenders).toEqual([]);
  });
});
