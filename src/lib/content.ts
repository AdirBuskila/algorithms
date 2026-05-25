import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "algorithms");

export const LOCALES = ["en", "he"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export type Group =
  | "traversal"
  | "connectivity"
  | "shortest-paths"
  | "flow-matching"
  | "approximation"
  | "reference";

/** Display order of the topic groups on the home page. */
export const GROUP_ORDER: Group[] = [
  "traversal",
  "connectivity",
  "shortest-paths",
  "flow-matching",
  "approximation",
  "reference",
];

export interface Complexity {
  time: string;
  timeNote?: string;
  space: string;
  spaceNote?: string;
}

export interface AlgorithmMeta {
  slug: string;
  order: number;
  group: Group;
  title: string;
  summary: string;
  frequency: string;
  difficulty: "easy" | "medium" | "hard";
  complexity: Complexity;
  examFrequency: string;
  // Optional — only the shortest-path algorithms ship an interactive widget.
  visualization?: string;
  vizHeight?: number;
  negativeEdges?: boolean;
  finds?: string;
}

export interface Algorithm {
  meta: AlgorithmMeta;
  explanation: string;
  onExam: string;
}

// Divider between the explanation and the exam section, in either language.
const ON_EXAM_HEADING = /^##\s+(On the exam|איך זה מופיע במבחן)\s*$/m;
const FILE_RE = /^(.+)\.(en|he)\.md$/;

function listFiles(): { file: string; slug: string; lang: Locale }[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .map((file) => {
      const m = file.match(FILE_RE);
      if (!m) return null;
      return { file, slug: m[1], lang: m[2] as Locale };
    })
    .filter((x): x is { file: string; slug: string; lang: Locale } => x !== null);
}

function readFile(file: string): Algorithm {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const meta = data as AlgorithmMeta;

  let explanation = content;
  let onExam = "";
  const match = content.match(ON_EXAM_HEADING);
  if (match && match.index !== undefined) {
    explanation = content.slice(0, match.index);
    onExam = content.slice(match.index + match[0].length);
  }

  return { meta, explanation: explanation.trim(), onExam: onExam.trim() };
}

/** All algorithms for a locale, sorted by frontmatter `order`. */
export function getAllAlgorithms(lang: Locale): Algorithm[] {
  return listFiles()
    .filter((f) => f.lang === lang)
    .map((f) => readFile(f.file))
    .sort((a, b) => a.meta.order - b.meta.order);
}

/** Algorithms for a locale grouped by topic, in GROUP_ORDER. */
export function getAlgorithmsByGroup(
  lang: Locale,
): { group: Group; items: Algorithm[] }[] {
  const all = getAllAlgorithms(lang);
  return GROUP_ORDER.map((group) => ({
    group,
    items: all.filter((a) => a.meta.group === group),
  })).filter((g) => g.items.length > 0);
}

/** Unique slugs (language-independent). */
export function getAlgorithmSlugs(): string[] {
  return Array.from(new Set(listFiles().map((f) => f.slug)));
}

export function getAlgorithm(lang: Locale, slug: string): Algorithm | undefined {
  return getAllAlgorithms(lang).find((a) => a.meta.slug === slug);
}

/**
 * Normalized lookup key for resolving Obsidian wikilinks (`[[Note Title]]`)
 * to a slug, tolerant of apostrophes, dashes, and casing.
 */
export function normalizeLinkKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Map from normalized note title (every language) and slug -> slug, so a
 * wikilink that targets an English title still resolves inside a Hebrew page.
 */
export function getSlugMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const { file, slug } of listFiles()) {
    const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
    const title = (data as AlgorithmMeta).title;
    if (title) map[normalizeLinkKey(title)] = slug;
    map[normalizeLinkKey(slug)] = slug;
  }
  return map;
}
