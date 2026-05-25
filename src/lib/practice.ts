import fs from "node:fs";
import path from "node:path";
import { type Locale, type Group, GROUP_ORDER, getAllAlgorithms } from "@/lib/content";

const PRACTICE_DIR = path.join(process.cwd(), "content", "practice");

export interface PracticeQuestion {
  id: string;
  algorithm: string;
  source: string;
  claim: string;
  answer: boolean;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

/** All practice questions for a locale, in file order. */
export function getQuestions(lang: Locale): PracticeQuestion[] {
  const file = path.join(PRACTICE_DIR, `questions.${lang}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as PracticeQuestion[];
}

export interface PracticeOverviewGroup {
  group: Group;
  items: { algorithm: string; title: string; count: number }[];
}

/**
 * Questions grouped by the algorithm's topic group (in GROUP_ORDER), with the
 * localized algorithm title and a per-algorithm count. Algorithms with no
 * questions are omitted; groups with no questions are omitted.
 */
export function getPracticeOverview(lang: Locale): PracticeOverviewGroup[] {
  const questions = getQuestions(lang);
  const algos = getAllAlgorithms(lang);

  const countBySlug = new Map<string, number>();
  for (const q of questions) {
    countBySlug.set(q.algorithm, (countBySlug.get(q.algorithm) ?? 0) + 1);
  }

  return GROUP_ORDER.map((group) => {
    const items = algos
      .filter((a) => a.meta.group === group && countBySlug.has(a.meta.slug))
      .map((a) => ({
        algorithm: a.meta.slug,
        title: a.meta.title,
        count: countBySlug.get(a.meta.slug) ?? 0,
      }));
    return { group, items };
  }).filter((g) => g.items.length > 0);
}
