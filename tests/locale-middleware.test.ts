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

vi.mock("next/server", () => ({
  NextResponse: {
    rewrite: (...args: unknown[]) => rewrite(...(args as Parameters<typeof rewrite>)),
    next: (...args: unknown[]) => next(...(args as Parameters<typeof next>)),
  },
}));

import { middleware } from "@/middleware";

function makeRequest(pathname: string) {
  const url = new URL(`http://localhost${pathname}`);
  // Mirror the NextRequest.nextUrl shape — it's a URL with a `clone()` method.
  const nextUrl = Object.assign(new URL(url.toString()), { clone() { return new URL(url.toString()); } });
  const headers = new Headers();
  return {
    nextUrl,
    headers,
  } as unknown as Parameters<typeof middleware>[0];
}

describe("locale middleware", () => {
  beforeEach(() => {
    rewrite.mockClear();
    next.mockClear();
  });

  it("passes through when there is no locale prefix", () => {
    middleware(makeRequest("/admin/users"));
    expect(next).toHaveBeenCalledTimes(1);
    expect(rewrite).not.toHaveBeenCalled();
  });

  it("rewrites /en/admin → /admin with the next-intl locale header on the request", () => {
    const res = middleware(makeRequest("/en/admin")) as unknown as {
      _init: { request: { headers: Headers } } | undefined;
      cookies: { set: ReturnType<typeof vi.fn> };
    };
    expect(rewrite).toHaveBeenCalledTimes(1);
    expect(res._init).toBeDefined();
    expect(res._init?.request?.headers.get("x-next-intl-locale")).toBe("en");
  });

  it("rewrites /ar/admin/users → /admin/users and sets the AR cookie", () => {
    const res = middleware(makeRequest("/ar/admin/users")) as unknown as {
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
    middleware(makeRequest("/admin/users"));
    expect(next).toHaveBeenCalled();
    expect(rewrite).not.toHaveBeenCalled();
  });
});
