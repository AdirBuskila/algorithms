import fs from "node:fs";
import path from "node:path";
import { type Locale } from "@/lib/content";

const RECOGNITION_DIR = path.join(process.cwd(), "content", "recognition");

/** Recognition metadata for one algorithm: how to spot it in an exam question. */
export interface Recognition {
  slug: string;
  /** Short "what it finds / when to reach for it" hint, shown under the title. */
  finds: string;
  /** Phrases that, seen in a question, point to this algorithm (search match). */
  cues: string[];
}

/** Recognition entries for a locale, in file order. */
export function getRecognition(lang: Locale): Recognition[] {
  const file = path.join(RECOGNITION_DIR, `recognition.${lang}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as Recognition[];
}

/** slug -> recognition entry, for merging into search items. */
export function getRecognitionMap(lang: Locale): Record<string, Recognition> {
  const map: Record<string, Recognition> = {};
  for (const r of getRecognition(lang)) map[r.slug] = r;
  return map;
}
