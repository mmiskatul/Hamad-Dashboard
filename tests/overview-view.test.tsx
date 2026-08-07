import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import en from "@/shared/i18n/messages/en.json";

const useOverviewMock = vi.fn();
const useProvidersMock = vi.fn();

vi.mock("@/shared/api/queries", () => ({
  qk: {
    overview: ["overview"],
    providers: ["providers"],
  },
  useOverview: () => useOverviewMock(),
  useProviders: () => useProvidersMock(),
}));

vi.mock("@/features/overview/TimeRangeSegments", () => ({
  TimeRangeSegments: () => <div data-testid="time-range" />,
}));

import { OverviewView } from "@/features/overview/OverviewView";

function renderOverview() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="en" messages={en}>
        <OverviewView />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("OverviewView", () => {
  beforeEach(() => {
    useOverviewMock.mockReset();
    useProvidersMock.mockReset();
  });

  it("surfaces an error banner when the overview query fails", () => {
    useOverviewMock.mockReturnValue({
      data: undefined,
      isError: true,
      isFetching: false,
      error: new Error("overview: upstream unavailable"),
    });
    useProvidersMock.mockReturnValue({
      data: undefined,
      isError: false,
      isFetching: false,
      error: null,
    });

    renderOverview();
    const banner = screen.getByRole("alert");
    expect(banner.textContent).toContain("overview: upstream unavailable");
  });

  it("renders the four stat tiles when overview data is loaded", () => {
    useOverviewMock.mockReturnValue({
      data: {
        health: "healthy",
        providersUp: 6,
        providersTotal: 6,
        mrr: 18240,
        mrrDelta: 0.04,
        spend30d: 6918,
        spendMargin: 0.62,
        spendDelta: 0.12,
        activeUsers: 3412,
        activeUsersDelta: 0.02,
        newUsers: 214,
        sparklines: { mrr: [1, 2, 3], spend: [1, 2, 3], active: [1, 2, 3] },
        costByModel: [
          { modelId: "gpt", cost: 100, tokens: 1000 },
          { modelId: "gemini", cost: 200, tokens: 2000 },
        ],
      },
      isError: false,
      isFetching: false,
      error: null,
    });
    useProvidersMock.mockReturnValue({
      data: [
        {
          id: "prov_gpt",
          name: "OpenAI",
          modelId: "gpt",
          status: "operational",
          p50Ms: 500,
          p95Ms: 800,
          errorRate: 0.01,
          uptime: 0.99,
          circuit: "closed",
          sparkline: [1, 2, 3],
        },
      ],
      isError: false,
      isFetching: false,
      error: null,
    });

    const { container } = renderOverview();
    // All four stat tile labels should appear somewhere in the rendered
    // tree. Use queryAllByText with a function matcher so we accept any
    // case where the label string is present (the StatsCard wraps the
    // label in additional elements).
    const text = container.textContent ?? "";
    expect(text).toContain("Platform health");
    expect(text).toContain("MRR");
    expect(text).toContain("Token spend");
    expect(text).toContain("Active users");
    // The error banner must NOT be shown when data loaded successfully.
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
