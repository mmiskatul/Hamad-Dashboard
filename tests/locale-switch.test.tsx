import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import React from "react";

// We mock `next/navigation` so the helper can be exercised under vitest+jsdom
// without a real Next router. The default URL starts at `/en/admin/users` so
// tests verify that the locale prefix is correctly stripped.
const routerPush = vi.fn();
const routerReplace = vi.fn();
const routerRefresh = vi.fn();
let mockPathname = "/en/admin/users";
const mockSearchParams = new URLSearchParams("stage=open");
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    replace: routerReplace,
    refresh: routerRefresh,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// `next-intl` is mocked at the boundary; the I18nProvider wraps the test
// harness with both EN/AR dictionaries so we can verify the synchronous
// message swap.
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Tests pull the helper into a tiny harness component so we can drive the
// hooks from jsdom without rendering the whole Topbar/AdminProfileMenu.
import { useSwitchLocale } from "@/shared/i18n/useSwitchLocale";
import {
  LOCALE_DIR_CHANGE_EVENT,
  announceLocaleChange,
  buildLocaleUrl,
  dirFor,
  isAppLocale,
  persistLocaleCookie,
  stripLocalePrefix,
} from "@/shared/i18n/useSwitchLocale";
import { I18nProvider } from "@/shared/i18n/I18nProvider";
import enMessages from "@/shared/i18n/messages/en.json";
import arMessages from "@/shared/i18n/messages/ar.json";
import { LOCALE_COOKIE } from "@/shared/i18n/config";

function Harness({
  next,
  initial = "en",
}: {
  next: "en" | "ar";
  initial?: "en" | "ar";
}) {
  const { switchTo, currentLocale } = useSwitchLocale();
  return (
    <div>
      <span data-testid="current">{currentLocale}</span>
      <button data-testid="go" onClick={() => switchTo(next)}>
        go
      </button>
    </div>
  );
}

function wrap(node: React.ReactNode, initial: "en" | "ar" = "en") {
  return render(
    <I18nProvider
      initialLocale={initial}
      initialMessages={(initial === "en" ? enMessages : arMessages) as unknown as Record<string, unknown>}
      enMessages={enMessages as unknown as Record<string, unknown>}
      arMessages={arMessages as unknown as Record<string, unknown>}
    >
      {node}
    </I18nProvider>,
  );
}

describe("locale-switch helpers", () => {
  beforeEach(() => {
    routerPush.mockReset();
    routerReplace.mockReset();
    routerRefresh.mockReset();
    mockPathname = "/en/admin/users";
    // Reset html attributes between tests
    document.documentElement.setAttribute("lang", "en");
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.remove("locale-switching");
    // Reset cookies
    document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0`;
  });

  afterEach(() => {
    document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0`;
  });

  it("dirFor maps app locales to ltr/rtl", () => {
    expect(dirFor("en")).toBe("ltr");
    expect(dirFor("ar")).toBe("rtl");
  });

  it("isAppLocale narrows to the supported union", () => {
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("ar")).toBe(true);
    expect(isAppLocale("fr")).toBe(false);
    expect(isAppLocale(null)).toBe(false);
    expect(isAppLocale(undefined)).toBe(false);
  });

  it("stripLocalePrefix removes a leading /en or /ar segment", () => {
    expect(stripLocalePrefix("/en/admin/users")).toBe("/admin/users");
    expect(stripLocalePrefix("/ar")).toBe("/");
    expect(stripLocalePrefix("/en")).toBe("/");
    expect(stripLocalePrefix("/en/")).toBe("/");
    expect(stripLocalePrefix("/admin/users")).toBe("/admin/users");
    // Locale not at the start should not be touched.
    expect(stripLocalePrefix("/admin/en-locale")).toBe("/admin/en-locale");
  });

  it("buildLocaleUrl preserves path and query, prefixing the new locale", () => {
    expect(buildLocaleUrl("ar", "/en/admin/users", "?stage=open")).toBe(
      "/ar/admin/users?stage=open",
    );
    expect(buildLocaleUrl("en", "/ar/admin", "")).toBe("/en/admin");
    // Root path falls back to /admin to match the (admin) route group.
    expect(buildLocaleUrl("en", "/", "")).toBe("/en/admin");
  });

  it("persistLocaleCookie writes the NEXT_LOCALE cookie readable from document.cookie", () => {
    persistLocaleCookie("ar");
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=ar`);
    persistLocaleCookie("en");
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=en`);
  });

  it("announceLocaleChange dispatches a CustomEvent with locale/dir payload", () => {
    const handler = vi.fn();
    document.documentElement.addEventListener(LOCALE_DIR_CHANGE_EVENT, handler);
    announceLocaleChange("ar");
    expect(handler).toHaveBeenCalledTimes(1);
    const ev = handler.mock.calls[0][0] as CustomEvent<{ locale: string; dir: string }>;
    expect(ev.detail).toEqual({ locale: "ar", dir: "rtl" });
    document.documentElement.removeEventListener(LOCALE_DIR_CHANGE_EVENT, handler);
  });
});

describe("useSwitchLocale", () => {
  beforeEach(() => {
    routerPush.mockReset();
    routerReplace.mockReset();
    routerRefresh.mockReset();
    mockPathname = "/en/admin/users";
    document.documentElement.setAttribute("lang", "en");
    document.documentElement.setAttribute("dir", "ltr");
    document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0`;
  });

  it("switchTo flips EN→AR, updates the cookie, fires the event, and navigates to the prefixed URL preserving query", () => {
    const { getByTestId } = wrap(<Harness next="ar" />);
    expect(getByTestId("current").textContent).toBe("en");

    const handler = vi.fn();
    document.documentElement.addEventListener(LOCALE_DIR_CHANGE_EVENT, handler);

    act(() => {
      fireEvent.click(getByTestId("go"));
    });

    // Cookie persisted so the next request lands on AR.
    expect(document.cookie).toContain(`${LOCALE_COOKIE}=ar`);
    // Event fired with the next locale + dir so listeners can update <html>.
    expect(handler).toHaveBeenCalledTimes(1);
    const ev = handler.mock.calls[0][0] as CustomEvent<{ locale: string; dir: string }>;
    expect(ev.detail).toEqual({ locale: "ar", dir: "rtl" });
    // Path preserved, query preserved, locale-prefixed URL built.
    expect(routerReplace).toHaveBeenCalledWith("/ar/admin/users?stage=open");
    expect(routerRefresh).toHaveBeenCalled();

    document.documentElement.removeEventListener(LOCALE_DIR_CHANGE_EVENT, handler);
  });

  it("switchTo AR→EN strips a leading /ar and navigates to /en/...", () => {
    mockPathname = "/ar/admin/users";
    document.documentElement.setAttribute("lang", "ar");
    document.documentElement.setAttribute("dir", "rtl");

    const { getByTestId } = wrap(<Harness next="en" initial="ar" />, "ar");
    act(() => {
      fireEvent.click(getByTestId("go"));
    });

    expect(document.cookie).toContain(`${LOCALE_COOKIE}=en`);
    expect(routerReplace).toHaveBeenCalledWith("/en/admin/users?stage=open");
  });

  it("switchTo handles an unprefixed pathname (rewritten by middleware)", () => {
    // When the middleware rewrites `/en/admin/users` → `/admin/users` for the
    // document tree, `usePathname()` returns the rewritten form. The helper
    // must still build a valid locale-prefixed URL.
    mockPathname = "/admin/users";

    const { getByTestId } = wrap(<Harness next="ar" />);
    act(() => {
      fireEvent.click(getByTestId("go"));
    });

    expect(routerReplace).toHaveBeenCalledWith("/ar/admin/users?stage=open");
  });

  it("switchTo updates React state synchronously so the current locale reflects the new language without waiting for the server", () => {
    // The "translation is not working" bug: previous implementation only
    // updated the URL/cookie and waited for the server round-trip, so the
    // visible language lagged behind the click. After the refactor, the
    // toggle swaps messages in React state on the very next render, so
    // `currentLocale` reflects the new locale inside the same `act()`.
    const { getByTestId } = wrap(<Harness next="ar" />);
    expect(getByTestId("current").textContent).toBe("en");

    act(() => {
      fireEvent.click(getByTestId("go"));
    });

    expect(getByTestId("current").textContent).toBe("ar");
  });
});
