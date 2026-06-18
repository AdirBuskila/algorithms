import fs from "node:fs";
import path from "node:path";
import { type Locale } from "@/lib/content";

const DEFINITIONS_DIR = path.join(process.cwd(), "content", "definitions");

export type DefinitionCategory =
  | "graph-basics"
  | "connectivity"
  | "trees"
  | "distances"
  | "special-graphs"
  | "ordering"
  | "flow"
  | "matching";

/** Display order of the definition categories on the page. */
export const CATEGORY_ORDER: DefinitionCategory[] = [
  "graph-basics",
  "connectivity",
  "trees",
  "distances",
  "special-graphs",
  "ordering",
  "flow",
  "matching",
];

export interface Definition {
  id: string;
  category: DefinitionCategory;
  term: string;
  definition: string;
  /** Optional slug of a related algorithm page to link to. */
  algorithm?: string;
  /** Optional notation / alternate names, rendered as inline math/markdown. */
  aka?: string;
}

/** All definitions for a locale, in file order. */
export function getDefinitions(lang: Locale): Definition[] {
  const file = path.join(DEFINITIONS_DIR, `definitions.${lang}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as Definition[];
}

export interface DefinitionGroup {
  category: DefinitionCategory;
  items: Definition[];
}

/**
 * Definitions grouped by category in CATEGORY_ORDER. Categories with no entries
 * are omitted.
 */
export function getDefinitionsByCategory(lang: Locale): DefinitionGroup[] {
  const defs = getDefinitions(lang);
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: defs.filter((d) => d.category === category),
  })).filter((g) => g.items.length > 0);
}
