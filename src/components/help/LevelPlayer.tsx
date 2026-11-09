"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import FeedbackLink from "@/components/FeedbackLink";
import { saveScore } from "@/lib/helpProgress";

export interface PlayerQuestion {
  id: string;
  stem: ReactNode;
  figure: ReactNode;
  options: ReactNode[];
  answer: number;
  why: ReactNode;
}

export interface PlayerLabels {
  lessonLabel: string;
  startQuiz: string;
  questionOf: string;
  check: string;
  nextQuestion: string;
  seeResult: string;
  correct: string;
  wrong: string;
  score: string;
  passMsg: string;
  failMsg: string;
  retry: string;
  nextLevel: string;
  backToCourse: string;
  reportError: string;
  feedbackSubject: string;
}

export default function LevelPlayer({
  courseId,
  level,
  passPct,
  lesson,
  questions,
  labels,
  courseHref,
  nextHref,
}: {
  courseId: string;
  level: number;
  passPct: number;
  lesson: ReactNode;
  questions: PlayerQuestion[];
  labels: PlayerLabels;
  courseHref: string;
  nextHref: string | null;
}) {
  const [phase, setPhase] = useState<"lesson" | "quiz" | "done">("lesson");
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);

  const q = questions[idx];
  const total = questions.length;
  const pct = Math.round((right / total) * 100);
  const passed = pct >= passPct;

  function top() {
    window.scrollTo({ top: 0 });
  }

  // the quiz has its own URL (?play=1): a refresh lands back in it and the back button returns to the lesson
  const playing = () => new URLSearchParams(window.location.search).has("play");
  function setPlayUrl(on: boolean) {
    if (playing() === on) return;
    window.history.pushState(null, "", window.location.pathname + (on ? "?play=1" : "") + window.location.hash);
  }
  function reset() {
    setIdx(0);
    setPicked(null);
    setRight(0);
  }
  useEffect(() => {
    if (playing()) setPhase("quiz");
    const onPop = () => {
      if (!playing()) { reset(); setPhase("lesson"); }
      else setPhase((ph) => (ph === "lesson" ? "quiz" : ph));   // the lesson always holds a fresh score
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setRight((r) => r + 1);
  }

  function advance() {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      saveScore(courseId, level, pct);
      setPhase("done");
    }
    top();
  }

  function restart() {
    setIdx(0);
    setPicked(null);
    setRight(0);
    setPhase("quiz");
    top();
  }

  if (phase === "lesson") {
    return (
      <div>
        <div className="help-lesson">{lesson}</div>
        <button
          type="button"
          className="help-btn help-btn-primary"
          onClick={() => {
            setPlayUrl(true);
            setPhase("quiz");
            top();
          }}
        >
          {labels.startQuiz} ›
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="help-result" role="status">
        <div className={`help-score ${passed ? "help-score-pass" : "help-score-fail"}`}>
          {labels.score}: {right}/{total} · {pct}%
        </div>
        <p>{passed ? labels.passMsg : labels.failMsg}</p>
        <div className="help-actions">
          {passed && nextHref && (
            <Link href={nextHref} className="help-btn help-btn-primary">
              {labels.nextLevel} ›
            </Link>
          )}
          <button type="button" className="help-btn" onClick={restart}>
            {labels.retry}
          </button>
          <button
            type="button"
            className="help-btn"
            onClick={() => {
              setPlayUrl(false);
              setPhase("lesson");
              setIdx(0);
              setPicked(null);
              setRight(0);
              top();
            }}
          >
            {labels.lessonLabel}
          </button>
          <Link href={courseHref} className="help-btn">
            {labels.backToCourse}
          </Link>
        </div>
      </div>
    );
  }

  const answered = picked !== null;
  const ok = picked === q.answer;
  return (
    <div className="help-quiz">
      <div className="help-qmeta">
        {labels.questionOf} {idx + 1} / {total}
      </div>
      <div className="help-progressbar" aria-hidden="true">
        <span style={{ width: `${((idx + (answered ? 1 : 0)) / total) * 100}%` }} />
      </div>
      <div className="help-stem">{q.stem}</div>
      {q.figure}
      <div className="help-options" role="group">
        {q.options.map((o, i) => {
          let cls = "help-option";
          if (answered && i === q.answer) cls += " help-option-right";
          else if (answered && i === picked) cls += " help-option-wrong";
          return (
            <button
              key={i}
              type="button"
              className={cls}
              dir="auto"
              disabled={answered}
              aria-pressed={picked === i}
              onClick={() => choose(i)}
            >
              {o}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`help-feedback ${ok ? "help-feedback-ok" : "help-feedback-bad"}`} role="status">
          <strong>{ok ? `✓ ${labels.correct}` : `✗ ${labels.wrong}`}</strong>
          <div className="help-why">{q.why}</div>
          <p className="help-report">
            <FeedbackLink subject={`${labels.feedbackSubject} — ${q.id}`}>
              {labels.reportError}
            </FeedbackLink>
          </p>
          <button type="button" className="help-btn help-btn-primary" onClick={advance}>
            {idx + 1 < total ? labels.nextQuestion : labels.seeResult} ›
          </button>
        </div>
      )}
    </div>
  );
}
