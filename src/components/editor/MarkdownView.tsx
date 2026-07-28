"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Read-only Markdown renderer with accessibility baked in:
 *  - `role="article"` so screen readers treat the output as a discrete document.
 *  - `aria-label` so the article has a name (override per call site).
 *  - Tailwind classes enforce heading hierarchy and inline-link styling that
 *    matches the rest of the app.
 */
export function MarkdownView({
  source,
  ariaLabel,
}: {
  source: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="article"
      aria-label={ariaLabel}
      className="prose prose-sm max-w-none text-[var(--text-primary)] [&_h1]:text-lg [&_h1]:font-medium [&_h2]:text-base [&_h2]:font-medium [&_h3]:text-sm [&_h3]:font-medium [&_a]:text-[var(--action-primary)] [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-1 [&_p]:my-2 [&_code]:rounded [&_code]:bg-[var(--bg-subtle)] [&_code]:px-1 [&_code]:py-0.5"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source ?? ""}</ReactMarkdown>
    </div>
  );
}