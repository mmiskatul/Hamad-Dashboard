import { clsx } from "clsx";
import { type ReactNode } from "react";

type NumericProps = {
  value: ReactNode;
  className?: string;
  /** Render as <span> by default. */
  as?: "span" | "div" | "p";
  ariaLabel?: string;
  /** Optional suffix rendered inline (e.g. "d", "%", "ms"). Kept LTR inside the wrap. */
  suffix?: string;
};

/**
 * Wraps every numeric / currency / ID / timestamp display so the browser
 * renders it LTR with bidi isolation and tabular Roboto Mono figures.
 */
export function Numeric({ value, className, as = "span", ariaLabel, suffix }: NumericProps) {
  const Comp = as;
  return (
    <Comp
      dir="ltr"
      aria-label={ariaLabel}
      className={clsx(
        "_num inline-block whitespace-nowrap",
        className,
      )}
    >
      {value}
      {suffix ? <span className="ms-0.5">{suffix}</span> : null}
    </Comp>
  );
}
