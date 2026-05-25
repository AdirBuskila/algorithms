"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NoteContent from "@/components/NoteContent";
import type { PracticeQuestion } from "@/lib/practice";

const REVIEW_KEY = "algo2-practice-review";

export interface PracticeLabels {
  intro: string;
  practiceAll: string;
  reviewFlagged: string;
  questionsWord: string;
  labelTrue: string;
  labelFalse: string;
  correct: string;
  incorrect: string;
  why: string;
  next: string;
  readNote: string;
  wentThrough: string;
  worthReview: string;
  practiceThese: string;
  newSet: string;
  backToNotes: string;
  allClear: string;
  noQuestions: string;
  groups: Record<string, string>;
}

export interface OverviewGroup {
  group: string;
  items: { algorithm: string; title: string; count: number }[];
}

type View = "hub" | "session" | "review";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadReview(): string[] {
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveReview(ids: string[]) {
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export default function PracticeSession({
  questions,
  overview,
  lang,
  labels,
}: {
  questions: PracticeQuestion[];
  overview: OverviewGroup[];
  lang: string;
  labels: PracticeLabels;
}) {
  const [view, setView] = useState<View>("hub");
  const [queue, setQueue] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [missed, setMissed] = useState<PracticeQuestion[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);

  useEffect(() => {
    setReviewIds(loadReview());
  }, []);

  const startSession = useCallback((items: PracticeQuestion[]) => {
    if (items.length === 0) return;
    setQueue(shuffle(items));
    setIndex(0);
    setRevealed(false);
    setPicked(null);
    setMissed([]);
    setView("session");
  }, []);

  // Auto-start a filtered session from ?algorithm=<slug> on first mount.
  useEffect(() => {
    const algo = new URLSearchParams(window.location.search).get("algorithm");
    if (algo) {
      const items = questions.filter((q) => q.algorithm === algo);
      if (items.length) startSession(items);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = queue[index];

  const answer = useCallback(
    (value: boolean) => {
      if (!current || revealed) return;
      setPicked(value);
      setRevealed(true);
      const isCorrect = value === current.answer;
      setReviewIds((prev) => {
        const nextIds = isCorrect
          ? prev.filter((id) => id !== current.id)
          : prev.includes(current.id)
            ? prev
            : [...prev, current.id];
        saveReview(nextIds);
        return nextIds;
      });
      if (!isCorrect) setMissed((m) => [...m, current]);
    },
    [current, revealed],
  );

  const goNext = useCallback(() => {
    if (index + 1 >= queue.length) {
      setView("review");
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
      setPicked(null);
    }
  }, [index, queue.length]);

  // Keyboard: T / F to answer, ArrowRight / Enter to advance after reveal.
  useEffect(() => {
    if (view !== "session") return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!revealed && k === "t") answer(true);
      else if (!revealed && k === "f") answer(false);
      else if (revealed && (e.key === "ArrowRight" || e.key === "Enter")) goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, revealed, answer, goNext]);

  const flagged = useMemo(
    () => questions.filter((q) => reviewIds.includes(q.id)),
    [questions, reviewIds],
  );

  // ---------- HUB ----------
  if (view === "hub") {
    if (questions.length === 0) {
      return <p className="practice-empty">{labels.noQuestions}</p>;
    }
    return (
      <div className="practice-hub">
        <p className="practice-intro">{labels.intro}</p>
        <div className="practice-actions">
          <button className="practice-start" onClick={() => startSession(questions)}>
            {labels.practiceAll} ({questions.length})
          </button>
          {flagged.length > 0 && (
            <button className="practice-start is-review" onClick={() => startSession(flagged)}>
              {labels.reviewFlagged} ({flagged.length})
            </button>
          )}
        </div>
        {overview.map((g) => (
          <section key={g.group} className="practice-group">
            <h2 className="group-title">{labels.groups[g.group] ?? g.group}</h2>
            <ul className="practice-topic-list">
              {g.items.map((it) => (
                <li key={it.algorithm}>
                  <button
                    className="practice-topic"
                    onClick={() =>
                      startSession(questions.filter((q) => q.algorithm === it.algorithm))
                    }
                  >
                    <span>{it.title}</span>
                    <span className="practice-topic-count">
                      {it.count} {labels.questionsWord}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  // ---------- SESSION ----------
  if (view === "session" && current) {
    const isCorrect = picked === current.answer;
    return (
      <div className="practice-session">
        <div className="practice-progress">
          {index + 1} / {queue.length}
        </div>
        <figure className="practice-card">
          <figcaption className="practice-source">{current.source}</figcaption>
          <div className="practice-claim">
            <NoteContent markdown={current.claim} />
          </div>

          {!revealed ? (
            <div className="practice-choices">
              <button className="practice-choice" onClick={() => answer(true)}>
                {labels.labelTrue} <kbd>T</kbd>
              </button>
              <button className="practice-choice" onClick={() => answer(false)}>
                {labels.labelFalse} <kbd>F</kbd>
              </button>
            </div>
          ) : (
            <div className={`practice-result ${isCorrect ? "is-correct" : "is-wrong"}`}>
              <div className="practice-verdict">
                {isCorrect ? labels.correct : labels.incorrect} —{" "}
                {current.answer ? labels.labelTrue : labels.labelFalse}
              </div>
              <div className="practice-why">
                <span className="practice-why-label">{labels.why}</span>
                <NoteContent markdown={current.explanation} />
              </div>
              <div className="practice-after">
                <Link
                  className="practice-note-link"
                  href={`/${lang}/algorithms/${current.algorithm}/`}
                >
                  {labels.readNote} →
                </Link>
                <button className="practice-next" onClick={goNext}>
                  {labels.next} →
                </button>
              </div>
            </div>
          )}
        </figure>
      </div>
    );
  }

  // ---------- REVIEW ----------
  return (
    <div className="practice-review">
      <p className="practice-done">
        {labels.wentThrough} {queue.length} {labels.questionsWord}.
      </p>
      {missed.length > 0 ? (
        <>
          <h2 className="group-title">{labels.worthReview}</h2>
          <ul className="practice-missed">
            {missed.map((q) => (
              <li key={q.id} className="practice-missed-item">
                <div className="practice-source">{q.source}</div>
                <NoteContent markdown={q.claim} />
                <div className="practice-why">
                  <NoteContent markdown={q.explanation} />
                </div>
              </li>
            ))}
          </ul>
          <button className="practice-start" onClick={() => startSession(missed)}>
            {labels.practiceThese}
          </button>
        </>
      ) : (
        <p className="practice-allclear">{labels.allClear}</p>
      )}
      <div className="practice-actions">
        <button className="practice-start" onClick={() => startSession(questions)}>
          {labels.newSet}
        </button>
        <Link className="practice-note-link" href={`/${lang}/`}>
          {labels.backToNotes}
        </Link>
      </div>
    </div>
  );
}
