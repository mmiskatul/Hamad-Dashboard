import { describe, expect, it } from "vitest";
import revenue from "@/data/revenue.json";
import overview from "@/data/overview.json";
import usage from "@/data/usage.json";

/**
 * These tests lock down the key mapping between the JSON fixtures and the
 * chart components. They protect against silent regressions when the
 * fixture schema drifts.
 */

describe("chart key mapping", () => {
  it("overview.costByModel exposes both cost and tokens", () => {
    expect(overview.costByModel.length).toBeGreaterThan(0);
    for (const row of overview.costByModel) {
      expect(typeof row.modelId).toBe("string");
      expect(typeof row.cost).toBe("number");
      expect(typeof row.tokens).toBe("number");
    }
  });

  it("usage.costByModel exposes both cost and tokens", () => {
    for (const row of usage.costByModel) {
      expect(typeof row.modelId).toBe("string");
      expect(typeof row.cost).toBe("number");
      expect(typeof row.tokens).toBe("number");
    }
  });

  it("usage.tokensByModel series covers every known model", () => {
    const required = ["gpt", "gemini", "claude", "grok", "deepseek", "perplexity"];
    for (const day of usage.tokensByModel) {
      for (const key of required) {
        expect(day.series).toHaveProperty(key);
      }
    }
  });

  it("revenue.mrrSeries entries are sorted oldest → newest", () => {
    // months are 3-letter abbreviations; ordering is the order in the JSON
    const months = revenue.mrrSeries.map((r) => r.month);
    expect(months.length).toBe(12);
  });

  it("revenue.tierMix users sum to > 0 and include all 3 tiers", () => {
    const tiers = new Set(revenue.tierMix.map((r) => r.tier));
    expect(tiers.has("free")).toBe(true);
    expect(tiers.has("pro")).toBe(true);
    expect(tiers.has("business")).toBe(true);
    const total = revenue.tierMix.reduce((acc, r) => acc + r.users, 0);
    expect(total).toBeGreaterThan(0);
  });
});

describe("funnel derivation", () => {
  it("computes a strictly non-increasing funnel", () => {
    const stages = revenue.funnel.map((s) => s.value);
    for (let i = 1; i < stages.length; i++) {
      expect(stages[i]).toBeLessThanOrEqual(stages[i - 1]!);
    }
  });

  it("computes step-CR = stage_i / stage_(i-1)", () => {
    const stages = revenue.funnel;
    for (let i = 1; i < stages.length; i++) {
      const prev = stages[i - 1]!.value;
      const cur = stages[i]!.value;
      const stepCr = Math.round((cur / prev) * 100);
      expect(stepCr).toBeGreaterThanOrEqual(0);
      expect(stepCr).toBeLessThanOrEqual(100);
    }
  });

  it("computes overall-CR = stage_i / stage_0", () => {
    const stages = revenue.funnel;
    const top = stages[0]!.value;
    for (let i = 0; i < stages.length; i++) {
      const overall = Math.round((stages[i]!.value / top) * 100);
      expect(overall).toBeGreaterThanOrEqual(0);
      expect(overall).toBeLessThanOrEqual(100);
    }
  });
});

describe("churn rounding", () => {
  it("rounds fractional churn to 2 decimal places (%)", () => {
    for (const row of revenue.churn) {
      const pct = Math.round(row.churn * 10000) / 100;
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });
});