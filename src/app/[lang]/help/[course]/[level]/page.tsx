import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/content";
import { t } from "@/lib/i18n";
import { COURSES, PASS_PCT, getCourse, getLevel, shuffled } from "@/lib/help";
import { HelpInline, HelpMd } from "@/components/help/HelpMd";
import GraphFigure from "@/components/help/GraphFigure";
import Visualization from "@/components/Visualization";
import LevelPlayer, { type PlayerQuestion } from "@/components/help/LevelPlayer";

type Params = { lang: string; course: string; level: string };

export function generateStaticParams(): Params[] {
  return LOCALES.flatMap((lang) =>
    COURSES.flatMap((c) =>
      c.levels.map((_, i) => ({ lang, course: c.id, level: String(i + 1) })),
    ),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { course, level } = await params;
  const c = getCourse(course);
  const lv = c && getLevel(c, level);
  return { title: lv ? `${lv.title} — ${c.title} — Algo 2` : "Algo 2" };
}

export default async function LevelPage({ params }: { params: Promise<Params> }) {
  const { lang, course, level } = await params;
  const c = getCourse(course);
  const lv = c && getLevel(c, level);
  if (!LOCALES.includes(lang as Locale) || !c || !lv) notFound();
  const L = lang as Locale;
  const h = t("he").help; // the page body is Hebrew course content
  const n = Number(level);

  const lesson = (
    <>
      {lv.lesson.map((b, i) => {
        if ("md" in b) return <HelpMd key={i} md={b.md} />;
        if ("viz" in b)
          return (
            <Visualization
              key={i}
              file={b.viz.file}
              height={b.viz.height}
              title={b.viz.caption}
              caption={b.viz.caption}
            />
          );
        return <GraphFigure key={i} graph={b.graph} caption={b.caption} />;
      })}
    </>
  );

  const questions: PlayerQuestion[] = lv.questions.map((q) => {
    const sh = shuffled(q);
    return {
      id: q.id,
      stem: <HelpMd md={q.q} />,
      figure: q.graph ? <GraphFigure graph={q.graph} /> : null,
      options: sh.options.map((o, i) => <HelpInline key={i} md={o} />),
      answer: sh.answer,
      why: <HelpMd md={q.why} />,
    };
  });

  const next = n < c.levels.length ? `/${L}/help/${c.id}/${n + 1}/` : null;

  return (
    <main className="page" dir="rtl" lang="he">
      <p className="help-crumb">
        <Link href={`/${L}/help/${c.id}/`}>
          {c.icon} {c.title}
        </Link>
      </p>
      <header className="algo-header">
        <h1>
          <span aria-hidden="true">{lv.icon}</span>{" "}
          {lv.boss ? h.boss : `${h.levelWord} ${n}`} · {lv.title}
        </h1>
        <p className="help-intro">
          <strong>{h.goal}:</strong> {lv.goal}
        </p>
      </header>
      <LevelPlayer
        key={`${c.id}-${n}`}
        courseId={c.id}
        level={n}
        passPct={PASS_PCT}
        lesson={lesson}
        questions={questions}
        labels={{
          lessonLabel: h.lessonLabel,
          startQuiz: h.startQuiz,
          questionOf: h.questionOf,
          check: h.check,
          nextQuestion: h.nextQuestion,
          seeResult: h.seeResult,
          correct: h.correct,
          wrong: h.wrong,
          score: h.score,
          passMsg: h.passMsg,
          failMsg: h.failMsg,
          retry: h.retry,
          nextLevel: h.nextLevel,
          backToCourse: h.backToCourse,
          reportError: h.reportError,
          feedbackSubject: h.feedbackSubject,
        }}
        courseHref={`/${L}/help/${c.id}/`}
        nextHref={next}
      />
    </main>
  );
}
