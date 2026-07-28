import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "ar"] as const;
type Locale = (typeof LOCALES)[number];

// Mirrors next-intl's internal constant. We set this on the rewritten
// request so `getRequestConfig` resolves the locale from the URL on the
// first request (no manual refresh needed after a locale switch).
const NEXT_INTL_LOCALE_HEADER = "x-next-intl-locale";

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Inspect leading segment
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (!first || !isLocale(first)) {
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
  requestHeaders.set(NEXT_INTL_LOCALE_HEADER, first);

  const response = NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
  // Persist locale preference so server-side getLocale() can pick it up
  // when the URL doesn't carry a locale prefix (e.g. typed URL on first
  // visit) and so the next request is consistent with the user choice.
  response.cookies.set("NEXT_LOCALE", first, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  // Match every path except next internals and files with extensions
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
