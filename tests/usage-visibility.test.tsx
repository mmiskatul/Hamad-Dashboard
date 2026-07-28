import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UsageVisibilityToggle } from "@/features/config-usage/UsageVisibilityToggle";
import en from "@/shared/i18n/messages/en.json";

const setUsageVisibility = vi.fn();
const getUsageVisibility = vi.fn();

vi.mock("@/shared/api/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api/queries")>();
  return {
    ...actual,
    useUsageVisibility: () => ({
      data: {
        enabled: true,
        updatedAt: "2026-07-01T00:00:00.000Z",
        updatedBy: "admin@oneai.app",
      },
      isLoading: false,
    }),
    useSetUsageVisibility: () => ({
      mutate: (payload: { enabled: boolean }) => setUsageVisibility(payload),
    }),
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

describe("Usage visibility toggle", () => {
  beforeEach(() => {
    setUsageVisibility.mockReset();
    setUsageVisibility.mockResolvedValue(undefined);
  });

  it("renders the current state and round-trips a toggle click", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(
      <QueryClientProvider client={client}>
        <NextIntlClientProvider locale="en" messages={en}>
          <UsageVisibilityToggle />
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );

    const switchEl = container.querySelector("[role='switch']") as HTMLElement | null;
    expect(switchEl).not.toBeNull();
    expect(switchEl?.getAttribute("data-state")).toBe("checked");

    fireEvent.click(switchEl!);

    await waitFor(() => {
      expect(setUsageVisibility).toHaveBeenCalled();
    });
    expect(setUsageVisibility.mock.calls[0][0].enabled).toBe(false);
  });
});
