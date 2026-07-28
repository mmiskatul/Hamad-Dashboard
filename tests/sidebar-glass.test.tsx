import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "@/components/shell/Sidebar";
import en from "@/shared/i18n/messages/en.json";
import ar from "@/shared/i18n/messages/ar.json";
import { I18nProvider } from "@/shared/i18n/I18nProvider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} {...props} />
  ),
}));

vi.mock("@/shared/hooks/useDir", () => ({ useDir: () => "ltr" }));
vi.mock("@/shared/hooks/useSidebarState", () => ({
  useSidebarState: () => ({ collapsed: false, isMobile: false, isTablet: false, toggle: vi.fn() }),
}));
vi.mock("@/shared/api/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api/queries")>();
  return {
    ...actual,
    useAdminProfile: () => ({
      data: {
        name: "Mahfuz",
        email: "admin@oneai.app",
        avatarUrl: "/brand/logo-mark.svg",
        lastSignInAt: "2026-07-24T09:14:00Z",
      },
    }),
  };
});

describe("Sidebar glass surface", () => {
  it("renders the glass background and backdrop blur classes", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container } = render(
      <QueryClientProvider client={client}>
        <I18nProvider
          initialLocale="en"
          initialMessages={en as unknown as Record<string, unknown>}
          enMessages={en as unknown as Record<string, unknown>}
          arMessages={ar as unknown as Record<string, unknown>}
        >
          <Sidebar />
        </I18nProvider>
      </QueryClientProvider>,
    );

    const sidebar = container.querySelector("aside");
    expect(sidebar).not.toBeNull();
    expect(sidebar?.className).toContain("bg-[var(--surface-glass)]");
    expect(sidebar?.className).toContain("backdrop-blur-xl");
  });
});
