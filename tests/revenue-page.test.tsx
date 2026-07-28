import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RevenuePage from "@/app/(admin)/admin/revenue/page";
import en from "@/shared/i18n/messages/en.json";

vi.mock("@/shared/api/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api/queries")>();
  return {
    ...actual,
    useRevenue: () => ({
      data: {
        mrrSeries: [
          { month: "Jul", mrr: 1000 },
          { month: "Aug", mrr: 1100 },
          { month: "Sep", mrr: 1200 },
          { month: "Oct", mrr: 1300 },
          { month: "Nov", mrr: 1400 },
          { month: "Dec", mrr: 1500 },
          { month: "Jan", mrr: 1600 },
          { month: "Feb", mrr: 1700 },
          { month: "Mar", mrr: 1800 },
          { month: "Apr", mrr: 1900 },
          { month: "May", mrr: 2000 },
          { month: "Jun", mrr: 2100 },
        ],
        tierMix: [
          { tier: "free", users: 100, revenue: 0 },
          { tier: "pro", users: 50, revenue: 500 },
          { tier: "business", users: 10, revenue: 1000 },
        ],
        churn: [
          { month: "Jul", churn: 0.02, newMrr: 100 },
          { month: "Aug", churn: 0.025, newMrr: 110 },
          { month: "Sep", churn: 0.03, newMrr: 120 },
          { month: "Oct", churn: 0.022, newMrr: 130 },
          { month: "Nov", churn: 0.027, newMrr: 140 },
          { month: "Dec", churn: 0.029, newMrr: 150 },
          { month: "Jan", churn: 0.021, newMrr: 160 },
          { month: "Feb", churn: 0.024, newMrr: 170 },
          { month: "Mar", churn: 0.026, newMrr: 180 },
          { month: "Apr", churn: 0.023, newMrr: 190 },
          { month: "May", churn: 0.028, newMrr: 200 },
          { month: "Jun", churn: 0.022, newMrr: 210 },
        ],
        arpu: 12.5,
        arr: 25200,
        churnRate: 0.024,
        funnel: [
          { stage: "Visitors", value: 10000 },
          { stage: "Signups", value: 5000 },
          { stage: "Activated", value: 2000 },
          { stage: "Subscribed", value: 500 },
        ],
      },
      isLoading: false,
    }),
  };
});

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive">{children}</div>
    ),
  };
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="en" messages={en}>
        <RevenuePage />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("Revenue page", () => {
  it("renders MRR / ARR / ARPU / Churn stat cards with abbreviations and accessible info", () => {
    renderPage();
    // MRR has an info tooltip with the long form
    const mrrLabel = screen.getByRole("button", { name: "MRR" });
    expect(mrrLabel).not.toBeNull();
    const arrLabel = screen.getByRole("button", { name: "ARR" });
    expect(arrLabel).not.toBeNull();
    const arpuLabel = screen.getByRole("button", { name: "ARPU" });
    expect(arpuLabel).not.toBeNull();
  });

  it("renders the tier mix table with users, share and revenue totals", () => {
    renderPage();
    // Total row appears
    const totalCells = screen.getAllByText(/Total/i);
    expect(totalCells.length).toBeGreaterThan(0);
  });

  it("removes the Inspector action column from the conversion funnel table", () => {
    const { container } = renderPage();
    const buttons = container.querySelectorAll("button");
    // No button labeled "Inspector" anywhere
    const inspectorButtons = Array.from(buttons).filter((b) =>
      b.textContent?.trim() === "Inspector",
    );
    expect(inspectorButtons.length).toBe(0);
  });

  it("renders the conversion funnel with Step CR and Overall CR columns", () => {
    renderPage();
    // Step CR / Overall CR labels appear in the funnel table header. The
    // page now also has a horizontal FunnelChart which contains
    // "Overall CR" labels, so we scope to the funnel table.
    const stepHeader = screen.getAllByText("Step CR")[0]!;
    const overallHeader = screen.getAllByText("Overall CR")[0]!;
    expect(stepHeader).not.toBeNull();
    expect(overallHeader).not.toBeNull();
    const stepTable = stepHeader.closest("table");
    expect(stepTable).not.toBeNull();
    // 4 stages should produce 4 rows
    const rows = within(stepTable!).getAllByRole("row");
    // +1 for the header row
    expect(rows.length).toBe(5);
  });
});