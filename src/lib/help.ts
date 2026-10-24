import type { HelpCourse, HelpLevel, HelpQuestion } from "./helpTypes";
import flow from "@/data/help/flow";
import cuts from "@/data/help/cuts";
import paths from "@/data/help/paths";
import matching from "@/data/help/matching";

export const PASS_PCT = 80;

/** Courses in hub order: hardest, most frequent exam area first. */
export const COURSES: HelpCourse[] = [flow, cuts, paths, matching];

export function getCourse(id: string): HelpCourse | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getLevel(course: HelpCourse, n: string): HelpLevel | undefined {
  const i = Number(n);
  return Number.isInteger(i) ? course.levels[i - 1] : undefined;
}

export function questionId(courseId: string, level: number, q: number): string {
  return `${courseId}-${level}.${q}`;
}

/** Deterministic hash so the shuffled order is identical on every build. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * The data files list the correct option first. This puts the options in a
 * stable pseudo-random order and returns where the correct one ended up.
 */
export function shuffled(q: HelpQuestion): { options: string[]; answer: number } {
  const idx = q.options.map((_, i) => i);
  let seed = hash(q.id);
  for (let i = idx.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return { options: idx.map((i) => q.options[i]), answer: idx.indexOf(0) };
}
