import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import en from "@/shared/i18n/messages/en.json";
import { exportUsersToCsv, usersToCsv } from "@/shared/lib/csv";
import type { UserSummary } from "@/shared/api/types";

const routerPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  usePathname: () => "/admin/users",
  useParams: () => ({}),
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

const sample: UserSummary = {
  id: "usr_test_001",
  email: "ada@example.com",
  name: "Ada \"Queen\" Lovelace, PhD",
  tier: "pro",
  status: "active",
  requestsUsed: 0,
  requestsLimit: 5000,
  tokensSpent: 0,
  costUsd: 0,
  lastActiveAt: "2026-07-25T00:00:00.000Z",
  signupDate: "2026-07-25T00:00:00.000Z",
  platform: "web",
};

vi.mock("@/shared/api/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api/queries")>();
  return {
    ...actual,
    useUsers: () => ({ data: [sample], isLoading: false }),
    useCreateUser: () => ({
      mutateAsync: vi.fn().mockResolvedValue(sample),
      isPending: false,
    }),
  };
});

import UsersPage from "@/app/(admin)/admin/users/page";

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="en" messages={en}>
        <UsersPage />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("users CSV export", () => {
  it("emits a CSV with comma, quote, and newline escaping", () => {
    const csv = usersToCsv([sample]);
    const lines = csv.split("\r\n");
    // header + 1 row + trailing empty
    expect(lines.length).toBe(3);
    expect(lines[0]).toContain("ID,Name,Email");
    // Quotes inside the name are escaped and the field is quoted because
    // it contains a comma, quote, and a comma.
    expect(lines[1]).toContain(`"Ada ""Queen"" Lovelace, PhD"`);
  });

  it("renders an empty CSV (header only) when no users are provided", () => {
    expect(usersToCsv([])).toBe("ID,Name,Email,Tier,Status,Requests used,Requests limit,Tokens spent,Cost (USD),Last active,Signup date,Platform,Mobile\r\n");
  });

  it("triggers a CSV download when the Export button is clicked", () => {
    const click = vi.fn();
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    const originalCreateEl = document.createElement.bind(document);
    const anchorClick = vi.fn();
    const createElement = vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
      const el = originalCreateEl(tag);
      if (tag === "a") {
        Object.defineProperty(el, "click", { value: anchorClick });
      }
      return el;
    }) as typeof document.createElement);

    renderPage();

    const exportButton = screen.getByTestId("export-users-button");
    fireEvent.click(exportButton);

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(createElement).toHaveBeenCalledWith("a");

    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    createElement.mockRestore();
    void click;
  });
});
