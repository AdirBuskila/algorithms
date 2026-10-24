"use client";

import Link from "next/link";
import { useProgress } from "@/lib/helpProgress";

/** Hub card footer: "3/7 levels passed" with a bar. */
export function CourseBar({
  courseId,
  total,
  passPct,
  label,
}: {
  courseId: string;
  total: number;
  passPct: number;
  label: string;
}) {
  const prog = useProgress()[courseId] ?? {};
  const done = Object.values(prog).filter((v) => v >= passPct).length;
  return (
    <div className="help-bar">
      <div className="help-progressbar" aria-hidden="true">
        <span style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <span className="help-bar-label">
        {done}/{total} {label}
      </span>
    </div>
  );
}

export interface LevelRow {
  n: number;
  title: string;
  icon: string;
  goal: string;
  boss: boolean;
  questions: number;
  href: string;
}

/** The level list of a course; the first unpassed level is highlighted (soft unlock: all are open). */
export function LevelList({
  courseId,
  rows,
  passPct,
  labels,
}: {
  courseId: string;
  rows: LevelRow[];
  passPct: number;
  labels: { passed: string; next: string; boss: string; levelWord: string; questions: string };
}) {
  const prog = useProgress()[courseId] ?? {};
  const firstOpen = rows.find((r) => (prog[r.n] ?? 0) < passPct)?.n;
  return (
    <ol className="help-levels">
      {rows.map((r) => {
        const best = prog[r.n];
        const ok = best !== undefined && best >= passPct;
        const cls = `help-level${ok ? " help-level-ok" : ""}${r.n === firstOpen ? " help-level-next" : ""}`;
        return (
          <li key={r.n}>
            <Link href={r.href} className={cls}>
              <span className="help-level-icon" aria-hidden="true">
                {r.icon}
              </span>
              <span className="help-level-body">
                <span className="help-level-title">
                  {r.boss ? labels.boss : `${labels.levelWord} ${r.n}`} · {r.title}
                </span>
                <span className="help-level-goal">{r.goal}</span>
                <span className="help-level-meta">
                  {r.questions} {labels.questions}
                  {best !== undefined && ` · ${best}%`}
                  {ok && ` · ✓ ${labels.passed}`}
                  {!ok && r.n === firstOpen && ` · ${labels.next}`}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
