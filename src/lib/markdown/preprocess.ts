import { normalizeLinkKey } from "@/lib/content";

/**
 * Rewrites the Obsidian-flavored Markdown in the notes into constructs the
 * react-markdown pipeline understands:
 *
 *  - ```html-embed fences            -> removed (the widget is rendered from frontmatter)
 *  - > [!type] Title callouts        -> :::callout{type="..." title="..."} container directives
 *  - [[Note|Label]] wikilinks        -> [Label](/algorithms/<slug>/) internal links
 *  - ==highlight==                   -> :mark[highlight] text directives
 *
 * Callouts are converted first (they are line-based and strip the `>` prefix),
 * so wikilinks/highlights inside a callout body are picked up afterwards.
 */
export function preprocessMarkdown(
  markdown: string,
  slugMap: Record<string, string>,
  lang: string,
): string {
  let md = stripFences(markdown);
  md = convertCallouts(md);
  md = convertWikilinks(md, slugMap, lang);
  md = convertHighlights(md);
  return md;
}

// Remove ```html-embed blocks (the widget comes from frontmatter) and any
// ```mermaid blocks (diagrams were dropped — the interactive widget / tables
// carry the example instead).
function stripFences(md: string): string {
  return md
    .replace(/```html-embed[\s\S]*?```\s*/g, "")
    .replace(/```mermaid[\s\S]*?```\s*/g, "");
}

const CALLOUT_START = /^>\s*\[!(\w+)\]\s*(.*)$/;

function convertCallouts(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const start = lines[i].match(CALLOUT_START);
    if (!start) {
      out.push(lines[i]);
      i++;
      continue;
    }

    const type = start[1].toLowerCase();
    const title = start[2].trim();

    // Collect following blockquote lines as the callout body.
    const body: string[] = [];
    i++;
    while (i < lines.length && /^>/.test(lines[i])) {
      body.push(lines[i].replace(/^>\s?/, ""));
      i++;
    }

    const attrs = title
      ? `{type="${type}" title="${escapeAttr(title)}"}`
      : `{type="${type}"}`;
    out.push("");
    out.push(`:::callout${attrs}`);
    out.push(""); // blank line so block content (tables) inside parses cleanly
    out.push(...body);
    out.push("");
    out.push(":::");
    out.push("");
  }

  return out.join("\n");
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}

const WIKILINK = /\[\[([^\]]+?)\]\]/g;

function convertWikilinks(
  md: string,
  slugMap: Record<string, string>,
  lang: string,
): string {
  return md.replace(WIKILINK, (_, inner: string) => {
    // Split on a pipe that may be escaped as `\|` inside table cells.
    const parts = inner.split(/\\?\|/);
    const target = parts[0].trim();
    const label = (parts[1] ?? parts[0]).trim();
    const key = normalizeLinkKey(target);
    const slug = slugMap[key] ?? key;
    return `[${label}](/${lang}/algorithms/${slug}/)`;
  });
}

const HIGHLIGHT = /==([^=]+?)==/g;

function convertHighlights(md: string): string {
  // Skip lines inside fenced code blocks so pseudocode is untouched.
  const lines = md.split("\n");
  let inFence = false;
  return lines
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line.replace(HIGHLIGHT, ":mark[$1]");
    })
    .join("\n");
}
