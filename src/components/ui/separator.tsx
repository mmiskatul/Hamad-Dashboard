"use client";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { clsx } from "clsx";

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={clsx(
        "shrink-0 bg-[var(--border-default)]",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}
