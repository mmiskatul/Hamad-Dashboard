import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ConfigPricingPage from "@/app/(admin)/admin/config/pricing/page";
import en from "@/shared/i18n/messages/en.json";

vi.mock("@/shared/api/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api/queries")>();
  return {
    ...actual,
    useUnitPricing: () => ({
      data: {
        requestUnit: {
          size: 10,
          priceUsd: 1.5,
          enabled: true,
          updatedAt: "2026-07-25T10:00:00Z",
          updatedBy: "admin@oneai.app",
        },
        tokenUnit: {
          size: 1000,
          priceUsd: 0.25,
          enabled: false,
          updatedAt: "2026-07-25T10:00:00Z",
          updatedBy: "admin@oneai.app",
        },
        history: [
          {
            ts: "2026-07-25T10:00:00Z",
            actor: "admin@oneai.app",
            unit: "request",
            before: { size: 5, priceUsd: 2 },
            after: { size: 10, priceUsd: 1.5 },
            reason: "Align with provider costs",
          },
        ],
      },
      isLoading: false,
    }),
    useUpdateUnitPricing: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="en" messages={en}>
        <ConfigPricingPage />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("Unit Pricing page", () => {
  it("renders both unit sections with current Size, Price, and Enabled values", () => {
    const { container } = renderPage();

    // Title and subtitle are rendered.
    expect(screen.getByText(en.pricing.title)).not.toBeNull();
    expect(screen.getByText(en.pricing.subtitle)).not.toBeNull();

    // Each section has its own input pair.
    const requestSection = container.querySelector('[data-unit-section="request"]');
    const tokenSection = container.querySelector('[data-unit-section="token"]');
    expect(requestSection).not.toBeNull();
    expect(tokenSection).not.toBeNull();

    // Request unit values
    const requestSize = requestSection?.querySelector('[data-testid="requestUnit-size"]');
    const requestPrice = requestSection?.querySelector('[data-testid="requestUnit-price"]');
    expect(requestSize).not.toBeNull();
    expect(requestPrice).not.toBeNull();
    expect((requestSize as HTMLInputElement).value).toBe("10");
    expect((requestPrice as HTMLInputElement).value).toBe("1.5");

    // Token unit values
    const tokenSize = tokenSection?.querySelector('[data-testid="tokenUnit-size"]');
    const tokenPrice = tokenSection?.querySelector('[data-testid="tokenUnit-price"]');
    expect(tokenSize).not.toBeNull();
    expect(tokenPrice).not.toBeNull();
    expect((tokenSize as HTMLInputElement).value).toBe("1000");
    expect((tokenPrice as HTMLInputElement).value).toBe("0.25");

    // Switches reflect enabled state for each row.
    const switches = container.querySelectorAll('[role="switch"]');
    expect(switches.length).toBe(2);
    expect(switches[0]?.getAttribute("data-state")).toBe("checked");
    expect(switches[1]?.getAttribute("data-state")).toBe("unchecked");
  });
});
