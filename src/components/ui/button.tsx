import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] border text-sm font-medium leading-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--action-primary)] text-[var(--text-on-accent)] border-transparent hover:bg-[var(--action-primary-hover)]",
        neutral:
          "bg-[var(--action-neutral)] text-[var(--text-on-neutral)] border-transparent hover:bg-[var(--action-neutral-hover)]",
        danger: "bg-[var(--danger)] text-white border-transparent hover:brightness-90",
        ghost:
          "bg-transparent text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]",
        outline:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-subtle)]",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={clsx(buttonStyles({ variant, size }), className)} {...props} />;
});
