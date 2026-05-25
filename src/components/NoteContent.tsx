import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import rehypeKatex from "rehype-katex";
import { remarkObsidian } from "@/lib/markdown/remark-obsidian";
import Callout from "./Callout";

const components = {
  a({ href, children }: { href?: string; children?: ReactNode }) {
    if (href && href.startsWith("/")) {
      return <Link href={href}>{children}</Link>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },

  // Custom element emitted by the remark-obsidian directive plugin.
  callout({
    type,
    title,
    children,
  }: {
    type?: string;
    title?: string;
    children?: ReactNode;
  }) {
    return (
      <Callout type={type} title={title}>
        {children}
      </Callout>
    );
  },
};

export default function NoteContent({ markdown }: { markdown: string }) {
  return (
    <div className="note">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkDirective, remarkObsidian]}
        rehypePlugins={[rehypeKatex]}
        components={components as unknown as Components}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
