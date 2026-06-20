import fs from "node:fs";
import path from "node:path";
import { type Locale } from "@/lib/content";

const PATTERNS_DIR = path.join(process.cwd(), "content", "patterns");

export type PatternCategory =
  | "reduction"
  | "scc-toolkit"
  | "transform"
  | "tree";

/** Display order of the pattern categories on the page. */
export const PATTERN_CATEGORY_ORDER: PatternCategory[] = [
  "reduction",
  "scc-toolkit",
  "transform",
  "tree",
];

/** Keys of the inline-SVG diagrams a pattern can show. */
export type DiagramId =
  | "bipartiteFlow"
  | "condensation"
  | "vertexSplit"
  | "layered";

export interface Pattern {
  id: string;
  category: PatternCategory;
  /** Short name of the technique. */
  name: string;
  /** "When you see…" — the trigger that should make you reach for it. */
  trigger: string;
  /** The trick itself (markdown + KaTeX). */
  idea: string;
  complexity?: string;
  /** Algorithm slugs this pattern uses — drives the two-way cross-links. */
  algorithms: string[];
  /** Optional inline-SVG diagram key. */
  diagram?: DiagramId;
  /** Optional exam / source reference. */
  source?: string;
}

/** All patterns for a locale, in file order. */
export function getPatterns(lang: Locale): Pattern[] {
  const file = path.join(PATTERNS_DIR, `patterns.${lang}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as Pattern[];
}

export interface PatternGroup {
  category: PatternCategory;
  items: Pattern[];
}

/** Patterns grouped by category in PATTERN_CATEGORY_ORDER (empties omitted). */
export function getPatternsByCategory(lang: Locale): PatternGroup[] {
  const patterns = getPatterns(lang);
  return PATTERN_CATEGORY_ORDER.map((category) => ({
    category,
    items: patterns.filter((p) => p.category === category),
  })).filter((g) => g.items.length > 0);
}

/** Patterns that use a given algorithm — powers "Appears in patterns" on notes. */
export function getPatternsForAlgorithm(lang: Locale, slug: string): Pattern[] {
  return getPatterns(lang).filter((p) => p.algorithms.includes(slug));
}
