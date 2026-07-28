"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "./useMediaQuery";

const STORAGE_KEY = "admin.sidebar.collapsed";

/**
 * Reads/writes the desktop sidebar collapsed state from `localStorage`.
 * Defaults:
 *   - `< 768px` viewport (mobile) -> collapsed (off-canvas drawer)
 *   - `768px <= viewport < 1280px` (tablet) -> collapsed but visible as 64px icon-rail
 *   - `>= 1280px` viewport (desktop) -> expanded
 *
 * The hook is safe to call from server components — it returns the desktop
 * default until mounted, then synchronises with `localStorage`. Multiple
 * components stay in sync via a custom `admin:sidebar` window event.
 *
 * Cross-component sync: each hook instance has a unique ref id. The listener
 * ignores events that originate from its own instance, so a `toggle()` call
 * never causes `setState` inside another component's render cycle.
 */
export function useSidebarState() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1279px)");
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const instanceIdRef = useRef(`ssr-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "true") setCollapsed(true);
      else if (raw === "false") setCollapsed(false);
      else setCollapsed(isMobile);
    } catch {
      setCollapsed(isMobile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the viewport changes category, sync the default — but only if the
  // user has not explicitly toggled in the past.
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === null) setCollapsed(isMobile);
    } catch {
      // ignore
    }
  }, [isMobile, mounted]);

  // Cross-component sync: when one consumer toggles, broadcast to others.
  useEffect(() => {
    const onSync = (e: Event) => {
      const detail = (e as CustomEvent<{ collapsed: boolean; source?: string }>).detail;
      if (typeof detail?.collapsed !== "boolean") return;
      if (detail.source === instanceIdRef.current) return; // ignore self
      setCollapsed(detail.collapsed);
    };
    window.addEventListener("admin:sidebar", onSync);
    return () => window.removeEventListener("admin:sidebar", onSync);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      // Defer side effects to a microtask so they happen AFTER the render
      // commit, not during the reducer.
      queueMicrotask(() => {
        try {
          window.localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        window.dispatchEvent(
          new CustomEvent("admin:sidebar", {
            detail: { collapsed: next, source: instanceIdRef.current },
          }),
        );
      });
      return next;
    });
  }, []);

  const set = useCallback((value: boolean) => {
    setCollapsed(value);
    queueMicrotask(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, String(value));
      } catch {
        // ignore
      }
      window.dispatchEvent(
        new CustomEvent("admin:sidebar", {
          detail: { collapsed: value, source: instanceIdRef.current },
        }),
      );
    });
  }, []);

  return { collapsed, toggle, set, mounted, isMobile, isTablet } as const;
}
