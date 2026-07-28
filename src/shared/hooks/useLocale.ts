"use client";
import { useLocale } from "next-intl";
export { useLocale as useLocaleRaw };
export function useActiveLocale() {
  return useLocale();
}
