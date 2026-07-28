import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { CostByModelCard } from "@/features/overview/CostByModelCard";
import en from "@/shared/i18n/messages/en.json";

const rows = [
  { modelId: "gpt" as const, cost: 2134, tokens: 8000000 },
  { modelId: "gemini" as const, cost: 2542, tokens: 11500000 },
  { modelId: "claude" as const, cost: 3125, tokens: 15000000 },
  { modelId: "grok" as const, cost: 3378, tokens: 18500000 },
  { modelId: "deepseek" as const, cost: 4016, tokens: 22000000 },
  { modelId: "perplexity" as const, cost: 4244, tokens: 25500000 },
];

function renderCard() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <CostByModelCard rows={rows} days={30} />
    </NextIntlClientProvider>,
  );
}

describe("CostByModelCard", () => {
  it("renders every model and a Share column with proportional widths", () => {
    const { container } = renderCard();
    // Sort is descending by cost, so perplexity should be first.
    const headerCells = screen.getAllByRole("columnheader");
    const shareHeader = headerCells.find((th) => th.textContent?.includes("Share"));
    expect(shareHeader).toBeDefined();
    // Find each row's share bar; the largest (perplexity) must be at 100%
    const bars = Array.from(
      container.querySelectorAll('[role="presentation"] > div'),
    );
    expect(bars.length).toBeGreaterThan(0);
    const widths = bars.map((b) => {
      const style = b.getAttribute("style") ?? "";
      const m = style.match(/width:\s*(\d+(?:\.\d+)?)%/);
      return m ? Number(m[1]) : NaN;
    });
    // The first share bar (perplexity, top of list) must be the widest
    expect(widths[0]).toBe(100);
  });

  it("renders a Total row with 100% share label", () => {
    renderCard();
    const totalCells = screen.getAllByText("Total");
    expect(totalCells.length).toBeGreaterThan(0);
    const totalRow = totalCells[0]!.closest("tr");
    expect(totalRow).not.toBeNull();
    expect(totalRow!.textContent).toContain("100%");
  });
});
