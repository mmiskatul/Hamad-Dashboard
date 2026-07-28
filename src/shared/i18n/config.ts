import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, LOCALE_COOKIE, locales, type AppLocale } from "./constants";

export { locales, defaultLocale, LOCALE_COOKIE };
export type { AppLocale };

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  let locale: AppLocale = defaultLocale;
  let resolved = false;

  // 1. Locale segment from the URL (next-intl's own routing style).
  if (requested && (locales as readonly string[]).includes(requested)) {
    locale = requested as AppLocale;
    resolved = true;
  } else {
    // 2. Header set by our custom middleware on the rewritten request.
    try {
      const h = await headers();
      const headerLocale = h.get("x-next-intl-locale");
      if (headerLocale && (locales as readonly string[]).includes(headerLocale)) {
        locale = headerLocale as AppLocale;
        resolved = true;
      }
    } catch {
      // headers() may not be available outside a request scope
    }
    // 3. Cookie fallback. The middleware writes this on every rewrite, and
    //    `useSwitchLocale` writes it client-side before navigating.
    if (!resolved) {
      try {
        const store = await cookies();
        const cookieValue = store.get(LOCALE_COOKIE)?.value;
        if (cookieValue && (locales as readonly string[]).includes(cookieValue)) {
          locale = cookieValue as AppLocale;
        }
      } catch {
        // cookies() may not be available outside a request scope
      }
    }
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    // Pin a stable timeZone so server and client agree when
    // `formatDate` / `formatRelativeTime` etc. are used inside rendered
    // markup. Without this, next-intl throws ENVIRONMENT_FALLBACK on
    // hydration because the runtime TZ differs between Node and the
    // browser. UTC is the only safe cross-environment default.
    timeZone: "UTC",
    // Locale-formatted numbers/dates should follow the user's selected
    // language even when the server runs in a different region.
    onError() {
      // Swallow `MISSING_MESSAGE` warnings raised in dev — they are
      // caught by tests/i18n-completeness.test.ts so the production
      // console is not polluted.
    },
  };
});
