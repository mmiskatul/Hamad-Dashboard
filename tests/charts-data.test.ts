import { describe, expect, it } from "vitest";
import overview from "@/data/overview.json";
import revenue from "@/data/revenue.json";
import usage from "@/data/usage.json";

function isVaried(values: number[]): boolean {
  if (values.length === 0) return false;
  if (values.every((v) => v === 0)) return false;
  const distinct = new Set(values);
  return distinct.size >= 2;
}

describe("chart fixtures", () => {
  it("overview sparklines are varied", () => {
    expect(isVaried(overview.sparklines.mrr)).toBe(true);
    expect(isVaried(overview.sparklines.spend)).toBe(true);
    expect(isVaried(overview.sparklines.active)).toBe(true);
  });

  it("overview costByModel is varied and non-zero", () => {
    const costs = overview.costByModel.map((row) => row.cost);
    expect(isVaried(costs)).toBe(true);
  });

  it("revenue mrr-series has 12 varied months", () => {
    expect(revenue.mrrSeries.length).toBe(12);
    expect(isVaried(revenue.mrrSeries.map((row) => row.mrr))).toBe(true);
  });

  it("revenue churn series has 12 varied values", () => {
    expect(revenue.churn.length).toBe(12);
    expect(isVaried(revenue.churn.map((row) => row.churn))).toBe(true);
  });

  it("revenue tier mix is varied", () => {
    expect(isVaried(revenue.tierMix.map((row) => row.users))).toBe(true);
  });

  it("revenue funnel has 4 stages each non-zero", () => {
    expect(revenue.funnel.length).toBe(4);
    expect(revenue.funnel.every((stage) => stage.value > 0)).toBe(true);
  });

  it("usage tokensByModel has 14 days of varied data", () => {
    expect(usage.tokensByModel.length).toBe(14);
    const allTokens = usage.tokensByModel.flatMap((day) => Object.values(day.series));
    expect(isVaried(allTokens)).toBe(true);
  });

  it("usage costByModel is varied", () => {
    expect(isVaried(usage.costByModel.map((row) => row.cost))).toBe(true);
  });
});
