"use client";
import { type ReactNode } from "react";

export function DataTableToolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}
