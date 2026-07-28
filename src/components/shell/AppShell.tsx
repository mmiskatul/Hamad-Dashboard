"use client";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toaster } from "@/components/ui/sonner-toaster";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import {
  LOCALE_DIR_CHANGE_EVENT,
  dirFor,
  isAppLocale,
} from "@/shared/i18n/useSwitchLocale";

function RouteFade({ children }: { children: React.ReactNode }) {
  // Re-mount the wrapper so the CSS keyframe re-runs on every navigation.
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey((value) => value + 1);
  }, [children]);
  return (
    <div data-route-fade key={key}>
      {children}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { collapsed, isMobile, isTablet } = useSidebarState();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the viewport leaves mobile.
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  // Brief CSS cross-fade on <main> when the locale flips so AR ↔ EN
  // feels deliberate (250ms total). The locale toggle in Topbar dispatches
  // a `locale:dir-change` CustomEvent on <html> just before navigation.
  //
  // We also flip `html[lang]` and `html[dir]` immediately so the rendered
  // layout direction and language attribute don't go stale while waiting
  // for the server-rendered page to land. The RootLayout will set these
  // again on the next request, but doing it on the client keeps the UI
  // honest during the navigation.
  useEffect(() => {
    const root = document.documentElement;
    const handleLocaleChange = (event: Event) => {
      // Flip lang/dir synchronously using the event payload. Falls back to
      // the current attribute if the event doesn't carry a locale.
      const detail = (event as CustomEvent<{ locale?: string; dir?: "ltr" | "rtl" }>).detail;
      const localeAttr = root.getAttribute("lang");
      const nextLocale = detail?.locale ?? localeAttr ?? "en";
      const nextDir = detail?.dir ?? (isAppLocale(nextLocale) ? dirFor(nextLocale) : "ltr");
      root.setAttribute("lang", nextLocale);
      root.setAttribute("dir", nextDir);
      // Trigger the cross-fade animation.
      root.classList.remove("locale-switching");
      // Force reflow so the animation re-runs even on back-to-back clicks.
      void root.offsetWidth;
      root.classList.add("locale-switching");
      window.setTimeout(() => root.classList.remove("locale-switching"), 250);
    };
    root.addEventListener(LOCALE_DIR_CHANGE_EVENT, handleLocaleChange);
    return () => root.removeEventListener(LOCALE_DIR_CHANGE_EVENT, handleLocaleChange);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Sidebar
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-[var(--bg-canvas)]/70 backdrop-blur-sm md:hidden"
        />
      )}

      <div
        className={clsx(
          "transition-[width,transform,padding] duration-200",
          isMobile
            ? "ps-0"
            : isTablet
              ? "md:ps-16"
              : collapsed
                ? "md:ps-0 xl:ps-0"
                : "md:ps-60 xl:ps-60",
        )}
      >
        <Topbar onMobileSidebar={() => setMobileOpen((v) => !v)} />
        <RouteFade>
          <main className="mx-auto max-w-[1200px] p-5 md:p-8">{children}</main>
        </RouteFade>
      </div>
      <Toaster />
    </div>
  );
}
