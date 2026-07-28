"use client";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { clsx } from "clsx";

export const Switch = ({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) => (
  <SwitchPrimitive.Root
    className={clsx(
      "relative h-6 w-10 shrink-0 cursor-pointer rounded-full border border-transparent bg-[var(--bg-muted)] transition data-[state=checked]:bg-[var(--success)]",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="block h-[18px] w-[18px] translate-x-0.5 rounded-full bg-[var(--bg-surface)] shadow-[var(--e2)] transition-transform data-[state=checked]:translate-x-[18px]" />
  </SwitchPrimitive.Root>
);
