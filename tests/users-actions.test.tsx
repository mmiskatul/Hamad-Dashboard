import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import React from "react";

const routerPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  usePathname: () => "/admin/users",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

// The dropdown menu from Radix UI uses portals/portalled content that is hard
// to drive reliably under jsdom. Render the menu as a plain wrapper so the
// action button is the only DOM element we need to click.
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

// `sonner` renders to a portal that jsdom doesn't support cleanly. Stub it out
// so the modal's toast.success call doesn't throw under the test runner.
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/shared/api/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api/queries")>();
  const sampleUser = {
    id: "usr_test_001",
    email: "ada@example.com",
    name: "Ada Lovelace",
    tier: "pro" as const,
    status: "active" as const,
    requestsUsed: 0,
    requestsLimit: 5000,
    tokensSpent: 0,
    costUsd: 0,
    lastActiveAt: "2026-07-25T00:00:00.000Z",
    signupDate: "2026-07-25T00:00:00.000Z",
    platform: "web" as const,
  };
  return {
    ...actual,
    useUsers: () => ({ data: [sampleUser], isLoading: false }),
    useCreateUser: () => ({
      mutateAsync: vi.fn().mockResolvedValue(sampleUser),
      isPending: false,
    }),
  };
});

import UsersPage from "@/app/(admin)/admin/users/page";
import en from "@/shared/i18n/messages/en.json";

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

describe("Users page action wiring", () => {
  beforeEach(() => {
    routerPush.mockClear();
  });

  it("navigates to /admin/users/[id] when the per-row Open button is clicked", () => {
    renderPage();
    const openButtons = screen.getAllByRole("button", { name: /open/i });
    expect(openButtons.length).toBeGreaterThan(0);
    fireEvent.click(openButtons[0]);
    expect(routerPush).toHaveBeenCalledWith("/admin/users/usr_test_001");
  });

  it("opens the create-user modal when the New user button is clicked", async () => {
    renderPage();
    const newUserButton = screen.getByTestId("new-user-button");
    expect(newUserButton).not.toBeNull();

    // Modal is closed initially — no name input is present.
    expect(screen.queryByLabelText(/name/i)).toBeNull();

    fireEvent.click(newUserButton);

    // After clicking, the modal renders its form fields.
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).not.toBeNull();
      expect(screen.getByLabelText(/email/i)).not.toBeNull();
    });
  });
});