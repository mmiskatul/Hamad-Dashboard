"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { dirFor, LOCALE_DIR_CHANGE_EVENT } from "./helpers";
import type { AppLocale } from "./constants";
import { messages as allMessages } from "./all-messages";

/**
 * Synchronous client-side locale + messages store.
 *
 * Why this exists: `useTranslations()` rebuilds its dictionary from the
 * `messages` object passed to `NextIntlClientProvider`. When the locale
 * changes, the messages prop on the provider has to change for the new
 * translations to flush. If the provider only updates after the server
 * round-trip, the UI shows the old language for a beat — the visible
 * "toggle did nothing" bug.
 *
 * The fix: ship both EN and AR message bundles in the client bundle and
 * swap them in React state on toggle. The provider re-renders with the
 * new messages on the very next tick, so every `useTranslations` call
 * observes the new locale immediately.
 *
 * The server still renders the right locale on the next request (the
 * middleware and request config resolve it from the URL/cookie), so a
 * hard reload also works correctly.
 */
type Messages = Record<string, unknown>;

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  messages: AbstractIntlMessages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return ctx;
}

export function I18nProvider({
  children,
  initialLocale,
  initialMessages,
  enMessages = allMessages.en,
  arMessages = allMessages.ar,
}: {
  children: React.ReactNode;
  initialLocale: AppLocale;
  initialMessages: Messages;
  /** Both message bundles must be provided so the toggle can swap synchronously. */
  enMessages?: Messages;
  arMessages?: Messages;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [messages, setMessages] = useState<AbstractIntlMessages>(
    initialMessages as AbstractIntlMessages,
  );

  const setLocale = useCallback((next: AppLocale) => {
    if (next === "en" || next === "ar") {
      const nextMessages = next === "en" ? enMessages : arMessages;
      setLocaleState(next);
      setMessages(nextMessages as AbstractIntlMessages);
      // Mirror the change on <html> so layout direction is in sync.
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("lang", next);
        document.documentElement.setAttribute("dir", dirFor(next));
        document.documentElement.dispatchEvent(
          new CustomEvent(LOCALE_DIR_CHANGE_EVENT, {
            detail: { locale: next, dir: dirFor(next) },
          }),
        );
      }
    }
  }, [enMessages, arMessages]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, messages }),
    [locale, setLocale, messages],
  );

  return (
    <I18nContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="UTC"
      >
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}

