import fs from "node:fs";
import path from "node:path";
import { type Locale } from "@/lib/content";

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

/** All past-exam claims for a locale, in file order. */
export function getQuestions(lang: Locale): PracticeQuestion[] {
  const file = path.join(PRACTICE_DIR, `questions.${lang}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as PracticeQuestion[];
}
