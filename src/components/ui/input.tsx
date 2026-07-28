import { clsx } from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Optional small label rendered on the trailing edge inside the field. */
  suffix?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, suffix, ...props }, ref) {
    if (suffix) {
      return (
        <div
          className={clsx(
            "flex h-10 w-full items-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-surface)] pe-3 ps-4 text-sm text-[var(--text-primary)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--border-focus)]",
            className,
          )}
        >
          <input
            ref={ref}
            className="grow bg-transparent outline-none placeholder:text-[var(--text-secondary)]"
            {...props}
          />
          <span className="ms-2 text-xs text-[var(--text-secondary)] _num">{suffix}</span>
        </div>
      );
    }
    return (
      <input
        ref={ref}
        className={clsx(
          "h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]",
          className,
        )}
        {...props}
      />
    );
  },
);

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "min-h-[88px] w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx("text-sm font-medium text-[var(--text-primary)]", className)}
      {...props}
    />
  );
}
