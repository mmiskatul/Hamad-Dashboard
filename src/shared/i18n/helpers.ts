import { locales, type AppLocale } from "./constants";

export const LOCALE_DIR_CHANGE_EVENT = "locale:dir-change";

export function dirFor(locale: AppLocale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isAppLocale(
  value: string | null | undefined,
): value is AppLocale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Strip a leading `/en` or `/ar` segment from a path. */
export function stripLocalePrefix(path: string): string {
  const match = path.match(/^\/(en|ar)(?=\/|$)/);
  if (!match) return path;
  const rest = path.slice(match[0].length);
  return rest === "" ? "/" : rest;
}

/** Build a locale-prefixed URL while preserving path + query string. */
export function buildLocaleUrl(
  locale: AppLocale,
  path: string,
  search: string,
): string {
  const cleanPath = stripLocalePrefix(path);
  const tail = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  const suffix = search && search.startsWith("?") ? search : search ? `?${search}` : "";
  const finalPath = tail === "/" ? "/admin" : tail;
  return `/${locale}${finalPath}${suffix}`;
}
