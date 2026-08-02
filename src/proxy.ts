import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "ar"] as const;
type Locale = (typeof LOCALES)[number];

// Mirrors next-intl's internal constant. We set this on the rewritten
// request so `getRequestConfig` resolves the locale from the URL on the
// first request (no manual refresh needed after a locale switch).
const NEXT_INTL_LOCALE_HEADER = "x-next-intl-locale";
const ACCESS_COOKIE = process.env.ADMIN_ACCESS_COOKIE ?? "admin_access";
const REFRESH_COOKIE = process.env.ADMIN_REFRESH_COOKIE ?? "admin_refresh";
const SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE ?? "admin_session";

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Inspect leading segment
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const locale = first && isLocale(first) ? first : preferredLocale(request);
  const hasLocalePrefix = Boolean(first && isLocale(first));
  const normalizedPath = hasLocalePrefix
    ? `/${segments.slice(1).join("/")}`
    : pathname;

  if (isProtectedPath(normalizedPath) && !hasActiveAccessToken(request)) {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (refreshToken && sessionToken) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("returnTo", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(refreshUrl);
    }
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (!hasLocalePrefix) {
    return NextResponse.next();
  }

  // Strip the locale prefix and rewrite to the same path under the default
  const rest = "/" + segments.slice(1).join("/");
  const target = rest === "/" ? "/" : rest;

  const url = request.nextUrl.clone();
  url.pathname = target;

  // Propagate the URL-derived locale to the rewritten request so the
  // next-intl request config (which reads `x-next-intl-locale`) sees the
  // new locale on the first render — no manual refresh required.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NEXT_INTL_LOCALE_HEADER, locale);

  const response = NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
  // Persist locale preference so server-side getLocale() can pick it up
  // when the URL doesn't carry a locale prefix (e.g. typed URL on first
  // visit) and so the next request is consistent with the user choice.
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

function preferredLocale(request: NextRequest): Locale {
  const value = request.cookies.get("NEXT_LOCALE")?.value;
  return value && isLocale(value) ? value : "en";
}

function isProtectedPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function hasActiveAccessToken(request: NextRequest): boolean {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return false;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
    ) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now() + 5_000;
  } catch {
    return false;
  }
}

export const config = {
  // Skip framework assets, API routes, static files, and router prefetches.
  matcher: [
    {
      source: "/((?!_next|api|favicon.ico|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
