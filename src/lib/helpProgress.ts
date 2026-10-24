"use client";

import { useSyncExternalStore } from "react";

// Progress lives in localStorage only: { [courseId]: { [levelNumber]: bestPercent } }.
const KEY = "algo2_help_v1";
const EVENT = "algo2-help-progress";

export type Progress = Record<string, Record<string, number>>;

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(cb: () => void): () => void {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function parse(raw: string): Progress {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Progress;
  } catch {
    return {};
  }
}

/** Live progress; empty on the server and during hydration. */
export function useProgress(): Progress {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  return parse(raw);
}

/** Keeps the best score per level. */
export function saveScore(courseId: string, level: number, pct: number): void {
  try {
    const p = parse(read());
    const prev = p[courseId]?.[level] ?? 0;
    p[courseId] = { ...p[courseId], [level]: Math.max(prev, pct) };
    localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* private mode: progress simply is not saved */
  }
}
