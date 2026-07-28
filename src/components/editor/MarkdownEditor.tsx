"use client";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Textarea } from "@/components/ui/input";

export function MarkdownEditor({
  value,
  onChange,
  minHeight = 320,
}: {
  value: string;
  onChange: (next: string) => void;
  minHeight?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-[13px]"
        style={{ minHeight }}
        spellCheck={false}
      />
      <div
        className="overflow-auto rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-sm"
        style={{ minHeight }}
      >
        <MarkdownPreview source={value} />
      </div>
    </div>
  );
}

export function MarkdownPreview({ source }: { source: string }) {
  const sanitized = useMemo(() => source ?? "", [source]);
  return (
    <div className="prose prose-sm max-w-none text-[var(--text-primary)] [&_h1]:text-lg [&_h1]:font-medium [&_h2]:text-base [&_h2]:font-medium [&_h3]:text-sm [&_h3]:font-medium [&_a]:text-[var(--action-primary)] [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-1 [&_p]:my-2 [&_code]:rounded [&_code]:bg-[var(--bg-subtle)] [&_code]:px-1 [&_code]:py-0.5">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{sanitized}</ReactMarkdown>
    </div>
  );
}