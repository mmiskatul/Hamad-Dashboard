"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="light"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-[var(--bg-surface-inverse)] text-[var(--text-inverse)] border border-[var(--border-default)] shadow-[var(--e4)]",
        },
      }}
    />
  );
}
