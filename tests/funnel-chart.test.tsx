import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { FunnelChart } from "@/features/revenue/FunnelChart";

const sample = [
  { stage: "Visitors", value: 24000 },
  { stage: "Signups", value: 10420 },
  { stage: "Activated", value: 6420 },
  { stage: "Subscribed", value: 2452 },
];

describe("FunnelChart", () => {
  it("renders one row per stage with proportional bar widths", () => {
    const { container } = render(<FunnelChart rows={sample} />);
    const items = container.querySelectorAll('[aria-label="Conversion funnel"] > li');
    expect(items.length).toBe(4);
    const widths = Array.from(items).map((li) => {
      const inner = li.querySelector('[role="presentation"] > div');
      const style = (inner as HTMLElement | null)?.getAttribute("style") ?? "";
      const m = style.match(/width:\s*(\d+(?:\.\d+)?)%/);
      return m ? Number(m[1]) : NaN;
    });
    // First row (Visitors) must be the widest and exactly 100%
    expect(widths[0]).toBe(100);
    // Each subsequent row must be strictly narrower than the previous one
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThan(widths[i - 1]!);
    }
  });

  it("emits a screen-reader accessible table with the same CR columns", () => {
    render(<FunnelChart rows={sample} />);
    // The ChartWrapper renders a sr-only <table>; query it via the caption.
    const caption = screen.getByText("Conversion funnel");
    const table = caption.closest("table");
    expect(table).not.toBeNull();
    const rows = within(table as HTMLElement).getAllByRole("row");
    // 1 header + 4 stage rows
    expect(rows.length).toBe(5);
  });

  it("falls back gracefully when given an empty list", () => {
    const { container } = render(<FunnelChart rows={[]} />);
    const items = container.querySelectorAll('[aria-label="Conversion funnel"] > li');
    expect(items.length).toBe(0);
  });
});
