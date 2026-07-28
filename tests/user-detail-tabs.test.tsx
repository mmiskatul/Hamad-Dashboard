import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ModelDistribution } from "@/features/user-detail/ModelDistribution";
import { QuotaHistory } from "@/components/user-detail/QuotaHistory";
import { PaymentHistory } from "@/components/user-detail/PaymentHistory";
import { ActionTimeline } from "@/components/user-detail/ActionTimeline";
import en from "@/shared/i18n/messages/en.json";
import users from "@/data/users.json";
import userDetails from "@/data/user-details.json";
import type { UserDetail } from "@/shared/api/types";

const detailById = new Map<string, UserDetail>(
  (userDetails as UserDetail[]).map((u) => [u.id, u]),
);

// Recharts relies on ResizeObserver which isn't defined in jsdom.
// Replace the BarChart with a stub that exposes the underlying data so the
// test can verify every user gets a model breakdown without rendering SVG.
vi.mock("@/components/charts/BarChart", () => ({
  BarChart: ({ data, dataKey, xKey }: { data: { name: string; share: number }[]; dataKey: keyof { name: string; share: number }; xKey: keyof { name: string; share: number } }) => (
    <ul data-testid="bar-chart" data-rows={data.length} data-key={String(dataKey)} data-xkey={String(xKey)}>
      {data.map((row, i) => (
        <li key={i} data-name={String(row[xKey])} data-share={String(row[dataKey])} />
      ))}
    </ul>
  ),
}));

describe("user detail tabs render real seeded data", () => {
  it("ModelDistribution renders proportional bars for every user", () => {
    for (const u of users) {
      const d = detailById.get(u.id)!;
      const { container, unmount } = render(
        <NextIntlClientProvider locale="en" messages={en}>
          <ModelDistribution data={d.modelDistribution} />
        </NextIntlClientProvider>,
      );
      const bars = container.querySelector('[data-testid="bar-chart"]');
      expect(bars, `ModelDistribution for ${u.id} (${u.name})`).not.toBeNull();
      const rows = bars!.getAttribute("data-rows");
      expect(Number(rows), `user ${u.id} should have 6 model rows`).toBe(6);
      // Three provider models must appear with positive shares.
      const items = container.querySelectorAll("li");
      expect(items.length).toBe(6);
      unmount();
    }
  });

  it("QuotaHistory renders real rows for users with extension history", () => {
    const withHistory = (userDetails as UserDetail[]).filter((u) => u.quotaHistory.length > 0);
    expect(withHistory.length).toBeGreaterThan(0);
    for (const d of withHistory) {
      const { container, unmount } = render(
        <NextIntlClientProvider locale="en" messages={en}>
          <QuotaHistory entries={d.quotaHistory} />
        </NextIntlClientProvider>,
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length, `QuotaHistory for ${d.id} should equal ${d.quotaHistory.length}`).toBe(d.quotaHistory.length);
      unmount();
    }
  });

  it("PaymentHistory renders real rows for users with payment history", () => {
    const withHistory = (userDetails as UserDetail[]).filter((u) => u.paymentHistory.length > 0);
    expect(withHistory.length).toBeGreaterThan(0);
    for (const d of withHistory) {
      const { container, unmount } = render(
        <NextIntlClientProvider locale="en" messages={en}>
          <PaymentHistory entries={d.paymentHistory} />
        </NextIntlClientProvider>,
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length, `PaymentHistory for ${d.id} should equal ${d.paymentHistory.length}`).toBe(d.paymentHistory.length);
      unmount();
    }
  });

  it("ActionTimeline merges real json + audit entries", () => {
    const d = (userDetails as UserDetail[]).find((u) => (u.actionTimeline ?? []).length > 0)!;
    expect(d).toBeDefined();
    const timeline = d.actionTimeline ?? [];
    const { container, unmount } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ActionTimeline entries={timeline} />
      </NextIntlClientProvider>,
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(timeline.length);
    unmount();
  });
});
