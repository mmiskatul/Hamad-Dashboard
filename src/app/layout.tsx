import { type ReactNode } from "react";
import { Cairo, Roboto, Roboto_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner-toaster";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { THEME_COOKIE } from "@/shared/lib/auth";
import { defaultLocale, type AppLocale } from "@/shared/i18n/config";
import { I18nProvider } from "@/shared/i18n/I18nProvider";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-roboto-mono" });
const cairo = Cairo({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-cairo" });

export const metadata = {
  title: "OneAI Admin",
  description: "Single super-admin dashboard for the OneAI Hub platform.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const locale = (((await getLocale()) as string) ?? defaultLocale) as AppLocale;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const theme = cookieStore.get(THEME_COOKIE)?.value ?? "light";
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      suppressHydrationWarning
      className={`${roboto.variable} ${robotoMono.variable} ${cairo.variable}`}
      style={{
        fontFamily: `var(--font-roboto), system-ui, -apple-system, sans-serif`,
      }}
    >
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
        <ThemeProvider>
          <QueryProvider>
            <I18nProvider
              initialLocale={locale}
              initialMessages={messages as Record<string, unknown>}
            >
              {children}
            </I18nProvider>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
