import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/shared/i18n/messages/en.json";
import type { UserSummary } from "@/shared/api/types";

const push = vi.fn();
const mutateAsync = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/shared/api/queries", () => ({
  useUsers: () => ({ data: [] }),
  useCreateUser: () => ({ mutateAsync }),
}));

vi.mock("@/features/users/UserFilters", () => ({
  UserFilters: () => <div data-testid="user-filters" />,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import UsersPage from "@/app/(admin)/admin/users/page";
import { UserTable } from "@/features/users/UserTable";
import { CreateUserModal } from "@/components/modals/CreateUserModal";

const renderWithIntl = (ui: React.ReactNode) =>
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>,
  );

const user: UserSummary = {
  id: "usr_test_001",
  name: "Test User",
  email: "test@example.com",
  tier: "pro",
  status: "active",
  requestsUsed: 12,
  requestsLimit: 5000,
  tokensSpent: 1200,
  costUsd: 1.23,
  lastActiveAt: "2026-07-25T10:00:00.000Z",
  signupDate: "2026-07-01T10:00:00.000Z",
  platform: "web",
};

describe("users page actions", () => {
  beforeEach(() => {
    push.mockClear();
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(user);
  });

  it("opens the create-user dialog from the New user button", () => {
    renderWithIntl(<UsersPage />);

    fireEvent.click(screen.getByTestId("new-user-button"));

    expect(screen.getByRole("dialog", { name: "Create user" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("submits the create-user form with the selected values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithIntl(
      <CreateUserModal open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Tier"), {
      target: { value: "business" },
    });
    fireEvent.click(screen.getByTestId("create-user-submit"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Ada Lovelace",
        email: "ada@example.com",
        tier: "business",
        status: "active",
      });
    });
  });

  it("navigates to the user detail route from the per-row Open action", () => {
    renderWithIntl(<UserTable data={[user]} />);

    const openButtons = screen.getAllByRole("button", { name: /Open/i });
    fireEvent.click(openButtons[0]);

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/admin/users/usr_test_001");
  });
});
