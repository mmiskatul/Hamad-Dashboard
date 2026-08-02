import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, LOCALE_COOKIE, locales, type AppLocale } from "@/shared/i18n/config";
import {
  getSession,
  REFRESH_COOKIE,
  SESSION_COOKIE,
} from "@/shared/lib/auth";

export default async function RootIndex() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: AppLocale =
    localeCookie && (locales as readonly string[]).includes(localeCookie)
      ? (localeCookie as AppLocale)
      : defaultLocale;

  if (
    (await getSession()) ||
    (cookieStore.has(REFRESH_COOKIE) && cookieStore.has(SESSION_COOKIE))
  ) {
    redirect(`/${locale}/admin`);
  }
  redirect(`/${locale}/login`);
}
