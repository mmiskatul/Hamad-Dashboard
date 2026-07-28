"use client";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LOCALE_COOKIE, type AppLocale } from "./constants";
import {
  buildLocaleUrl,
  dirFor,
  isAppLocale,
  LOCALE_DIR_CHANGE_EVENT,
  stripLocalePrefix,
} from "./helpers";
import { useI18n } from "./I18nProvider";

// Keep the existing named exports so current call sites and tests do not
// need to move when the shared helpers live in their own non-circular file.
export {
  buildLocaleUrl,
  dirFor,
  isAppLocale,
  LOCALE_DIR_CHANGE_EVENT,
  stripLocalePrefix,
};

/** Persist the chosen locale before the next server request. */
export function persistLocaleCookie(locale: AppLocale): void {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

/** Notify layout listeners that locale and direction changed. */
export function announceLocaleChange(locale: AppLocale): void {
  if (typeof document === "undefined") return;
  const detail = { locale, dir: dirFor(locale) };
  document.documentElement.dispatchEvent(
    new CustomEvent(LOCALE_DIR_CHANGE_EVENT, { detail }),
  );
}

/**
 * Switch locale immediately in React, then reconcile the URL/server state.
 *
 * `setLocale` swaps the `NextIntlClientProvider` messages synchronously so
 * every `useTranslations()` call re-renders in the same React update. The
 * navigation that follows only exists to make the locale-prefixed URL and
 * server cookie durable; it is not responsible for the visible language
 * change.
 */
export function useSwitchLocale() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { locale: currentLocale, setLocale } = useI18n();

  const switchTo = useCallback(
    (nextLocale: AppLocale) => {
      if (!isAppLocale(nextLocale) || nextLocale === currentLocale) return;

      // 1. Swap locale + complete message dictionary immediately. This is
      //    the state update that makes all translations change in one render.
      //    `setLocale` already dispatches the dir-change event + updates
      //    <html lang/dir>, so we don't call `announceLocaleChange` again.
      setLocale(nextLocale);
      // 2. Persist for reloads/server rendering.
      persistLocaleCookie(nextLocale);
      // 3. Reconcile the URL without depending on it for the UI update.
      const search = searchParams ? searchParams.toString() : "";
      const url = buildLocaleUrl(nextLocale, pathname, search);
      router.replace(url);
      router.refresh();
    },
    [currentLocale, pathname, router, searchParams, setLocale],
  );

  return { switchTo, currentLocale };
}
