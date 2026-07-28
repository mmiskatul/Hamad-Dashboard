"use client";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { clsx } from "clsx";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={clsx(
        "inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={clsx(
        "inline-flex items-center justify-center rounded-[var(--radius-xs)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] data-[state=active]:bg-[var(--bg-surface)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-[var(--e1)]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={clsx("mt-6", className)} {...props} />;
}
