import { describe, expect, it, vi, beforeEach } from "vitest";

// We mock the parts of `next/server` we depend on so we can verify that
// the middleware sets the next-intl header on the rewritten request and
// writes the NEXT_LOCALE cookie on the response.
const rewrite = vi.fn((url: URL, init?: { request?: { headers: Headers } }) => {
  const response = {
    cookies: { set: vi.fn() },
    _init: init,
    _url: url,
  };
  return response;
});
const next = vi.fn(() => ({ _kind: "next" }));
const redirect = vi.fn((url: URL) => ({ _kind: "redirect", _url: url }));

vi.mock("next/server", () => ({
  NextResponse: {
    rewrite: (...args: unknown[]) => rewrite(...(args as Parameters<typeof rewrite>)),
    next: (...args: unknown[]) => next(...(args as Parameters<typeof next>)),
    redirect: (...args: unknown[]) => redirect(...(args as Parameters<typeof redirect>)),
  },
}));

import { proxy } from "@/proxy";

function makeRequest(
  pathname: string,
  cookieValues: Record<string, string> = { admin_access: activeAccessToken() },
) {
  const url = new URL(`http://localhost${pathname}`);
  // Mirror the NextRequest.nextUrl shape — it's a URL with a `clone()` method.
  const nextUrl = Object.assign(new URL(url.toString()), { clone() { return new URL(url.toString()); } });
  const headers = new Headers();
  return {
    url: url.toString(),
    nextUrl,
    headers,
    cookies: {
      get(name: string) {
        const value = cookieValues[name];
        return value ? { name, value } : undefined;
      },
    },
  } as unknown as Parameters<typeof proxy>[0];
}

function activeAccessToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 900 }),
  ).toString("base64url");
  return `header.${payload}.signature`;
}

describe("locale middleware", () => {
  beforeEach(() => {
    rewrite.mockClear();
    next.mockClear();
    redirect.mockClear();
  });

  it("passes through when there is no locale prefix", () => {
    proxy(makeRequest("/admin/users"));
    expect(next).toHaveBeenCalledTimes(1);
    expect(rewrite).not.toHaveBeenCalled();
  });

  it("rewrites /en/admin → /admin with the next-intl locale header on the request", () => {
    const res = proxy(makeRequest("/en/admin")) as unknown as {
      _init: { request: { headers: Headers } } | undefined;
      cookies: { set: ReturnType<typeof vi.fn> };
    };
    expect(rewrite).toHaveBeenCalledTimes(1);
    expect(res._init).toBeDefined();
    expect(res._init?.request?.headers.get("x-next-intl-locale")).toBe("en");
  });

  it("rewrites /ar/admin/users → /admin/users and sets the AR cookie", () => {
    const res = proxy(makeRequest("/ar/admin/users")) as unknown as {
      _init: { request: { headers: Headers } } | undefined;
      cookies: { set: ReturnType<typeof vi.fn> };
    };
    expect(rewrite).toHaveBeenCalledTimes(1);
    expect(res._init?.request?.headers.get("x-next-intl-locale")).toBe("ar");
    expect(res.cookies.set).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "ar",
      expect.objectContaining({ path: "/", sameSite: "lax" }),
    );
  });

  it("does not strip a non-locale prefix", () => {
    proxy(makeRequest("/admin/users"));
    expect(next).toHaveBeenCalled();
    expect(rewrite).not.toHaveBeenCalled();
  });

  it("redirects an unauthenticated admin request to the localized login", () => {
    const response = proxy(makeRequest("/ar/admin/users", {})) as unknown as {
      _kind: string;
      _url: URL;
    };
    expect(response._kind).toBe("redirect");
    expect(response._url.pathname).toBe("/ar/login");
  });

  it("redirects an expired access token through refresh when session cookies exist", () => {
    const response = proxy(
      makeRequest("/en/admin", {
        admin_access: "expired.invalid.token",
        admin_refresh: "refresh-token",
        admin_session: "session-token",
      }),
    ) as unknown as { _kind: string; _url: URL };
    expect(response._kind).toBe("redirect");
    expect(response._url.pathname).toBe("/api/auth/refresh");
    expect(response._url.searchParams.get("returnTo")).toBe("/en/admin");
  });
});
