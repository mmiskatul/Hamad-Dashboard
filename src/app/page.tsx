import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, LOCALE_COOKIE, locales, type AppLocale } from "@/shared/i18n/config";

/**
 * Root landing route. There is no UI at `/` — this file only exists to
 * issue a server-side redirect so visiting the bare host lands the admin
 * somewhere useful:
 *   - If a valid `admin_session` cookie is present, jump straight to
 *     `/<locale>/admin` (the overview).
 *   - Otherwise, drop the admin on `/<locale>/login` so the login flow
 *     can pick the right locale-prefixed URL.
 *
 * Locale is resolved from the same `NEXT_LOCALE` cookie the rest of the
 * app reads, falling back to the default (en) when missing or invalid.
 */
export default async function RootIndex() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session")?.value;

  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: AppLocale =
    localeCookie && (locales as readonly string[]).includes(localeCookie)
      ? (localeCookie as AppLocale)
      : defaultLocale;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie)) as {
        expiresAt?: string;
      };
      if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
        redirect(`/${locale}/admin`);
      }
    } catch {
      // bad cookie — drop through to login
    }
  }
  redirect(`/${locale}/login`);
}
