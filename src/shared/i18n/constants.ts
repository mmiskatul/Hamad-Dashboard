/**
 * Client-safe i18n constants. These can be imported from client components
 * without pulling in `next/headers` (which is restricted to server modules).
 */
export const locales = ["en", "ar"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";
