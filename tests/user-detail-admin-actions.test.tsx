import { describe, expect, it, vi, beforeAll } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import en from "@/shared/i18n/messages/en.json";
import type { UserDetail } from "@/shared/api/types";

beforeAll(() => {
  // Recharts uses ResizeObserver; jsdom doesn't ship it.
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

vi.mock("@/components/charts/BarChart", () => ({
  BarChart: ({ data }: { data: { name: string; share: number }[] }) => (
    <ul data-testid="bar-chart" data-rows={data.length}>
      {data.map((row, i) => (
        <li key={i} data-name={row.name} data-share={row.share} />
      ))}
    </ul>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/admin/users/usr_rt",
  useParams: () => ({ id: "usr_rt" }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/dropdown-menu", async () => {
  const React = await import("react");
  return {
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) => (
      <button type="button" onClick={onSelect}>{children}</button>
    ),
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const grantUserQuota = vi.fn();
const setUserStatus = vi.fn();
const setUserQuotaOverride = vi.fn();
const resetUserQuotaOverride = vi.fn();

const userDetail: UserDetail = {
  id: "usr_rt",
  email: "ada@example.com",
  name: "Ada Lovelace",
  tier: "pro",
  status: "active",
  requestsUsed: 0,
  requestsLimit: 5000,
  tokensSpent: 0,
  costUsd: 0,
  lastActiveAt: "2026-07-25T00:00:00.000Z",
  signupDate: "2026-07-25T00:00:00.000Z",
  platform: "web",
  avatarUrl: "/brand/logo-mark.svg",
  signupSource: "web",
  paymentHistory: [],
  quotaHistory: [],
  renewals: [],
  modelDistribution: { gpt: 0, gemini: 0, claude: 0, grok: 0, deepseek: 0, perplexity: 0 },
  ticketIds: [],
  memory: { count: 0, bytesUsed: 0, lastUpdatedAt: "2026-07-25T00:00:00.000Z", topCategories: [] },
  actionTimeline: [],
};

vi.mock("@/shared/api/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api/queries")>();
  return {
    ...actual,
    useUser: () => ({ data: userDetail, isLoading: false }),
    useAudit: () => ({ data: [] }),
    useAdminProfile: () => ({ data: { id: "admin", name: "Admin", email: "admin@oneai.app" } }),
    useConfigTiers: () => ({
      data: [
        { id: "free", name: "Free", monthlyUsd: 0, requestsLimit: 100, tokensLimit: 0, models: [], features: { fileUpload: false, voice: false, priority: false } },
        { id: "pro", name: "Pro", monthlyUsd: 20, requestsLimit: 5000, tokensLimit: 100000, models: [], features: { fileUpload: true, voice: true, priority: true } },
      ],
    }),
    useGrantUserQuota: () => ({ mutateAsync: grantUserQuota, isPending: false }),
    useSetUserStatus: () => ({ mutateAsync: setUserStatus, isPending: false }),
    useSetUserQuotaOverride: () => ({ mutateAsync: setUserQuotaOverride, isPending: false }),
    useResetUserQuotaOverride: () => ({ mutateAsync: resetUserQuotaOverride, isPending: false }),
  };
});

import UserDetailPage from "@/app/(admin)/admin/users/[id]/page";

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="en" messages={en}>
        <UserDetailPage />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

async function switchToQuotaTab() {
  const quotaTab = screen.getByRole("tab", { name: en.userDetail.tabs.quota });
  quotaTab.focus();
  fireEvent.keyDown(quotaTab, { key: "Enter", code: "Enter", charCode: 13 });
  fireEvent.click(quotaTab);
  await waitFor(() => {
    expect(screen.getByTestId("grant-tokens-open")).not.toBeNull();
  });
}

describe("user detail admin actions", () => {
  it("opens the suspend modal and submits the reason to the backend", async () => {
    setUserStatus.mockResolvedValueOnce({ ...userDetail, status: "suspended" });
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: en.userDetail.suspend }));
    const textarea = await screen.findByLabelText(en.userDetail.suspendReason);
    fireEvent.change(textarea, { target: { value: "Repeated payment failures" } });
    fireEvent.click(screen.getByTestId("suspend-confirm"));
    await waitFor(() => {
      expect(setUserStatus).toHaveBeenCalledWith({
        status: "suspended",
        reason: "Repeated payment failures",
        actor: "Admin",
      });
    });
  });

  it("opens the grant tokens modal and submits the amount to the backend", async () => {
    grantUserQuota.mockResolvedValueOnce({
      user: { ...userDetail, requestsLimit: 5500 },
      entry: { date: "2026-08-03T00:00:00.000Z", amount: 500, by: "Admin", reason: "Compensation", newTotal: 5500 },
    });
    renderPage();
    await switchToQuotaTab();
    fireEvent.click(screen.getByTestId("grant-tokens-open"));
    fireEvent.click(screen.getByTestId("grant-tokens-submit"));
    await waitFor(() => {
      expect(grantUserQuota).toHaveBeenCalledWith({
        amount: 500,
        reason: "",
        actor: "Admin",
      });
    });
  });

  it("saves a quota override through the override card", async () => {
    setUserQuotaOverride.mockResolvedValueOnce({
      user: userDetail,
      override: {
        bypassQuota: true,
        customRequestsLimit: undefined,
        reason: "Q4 launch burst",
        setBy: "Admin",
        setAt: "2026-08-03T00:00:00.000Z",
      },
    });
    renderPage();
    await switchToQuotaTab();
    fireEvent.click(screen.getByTestId("quota-override-bypass"));
    fireEvent.change(screen.getByTestId("quota-override-reason"), {
      target: { value: "Q4 launch burst" },
    });
    fireEvent.click(screen.getByTestId("quota-override-save"));
    await waitFor(() => {
      expect(setUserQuotaOverride).toHaveBeenCalledTimes(1);
    });
    const call = setUserQuotaOverride.mock.calls[0]?.[0] as
      | { override: { bypassQuota: boolean; reason: string; setBy: string; setAt: string }; actor: string }
      | undefined;
    expect(call?.override.bypassQuota).toBe(true);
    expect(call?.override.reason).toBe("Q4 launch burst");
    expect(call?.override.setBy).toBe("Admin");
    expect(typeof call?.override.setAt).toBe("string");
    expect(call?.actor).toBe("Admin");
  });
});
