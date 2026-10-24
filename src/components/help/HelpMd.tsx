import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import NoteContent from "@/components/NoteContent";

/** A block of markdown (lesson text, question stem, explanation): paragraphs, math, tables, callouts. */
export function HelpMd({ md }: { md: string }) {
  return (
    <div className="help-md" dir="rtl" lang="he">
      <NoteContent markdown={md} />
    </div>
  );
}

const inlineComponents = {
  p({ children }: { children?: ReactNode }) {
    return <span>{children}</span>;
  },
};

/** Inline markdown (math and code only) that is safe inside a <button>. */
export function HelpInline({ md }: { md: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={inlineComponents as unknown as Components}
    >
      {md}
    </ReactMarkdown>
  );
}
