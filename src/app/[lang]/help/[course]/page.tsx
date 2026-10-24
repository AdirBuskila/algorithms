import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/content";
import { t } from "@/lib/i18n";
import { COURSES, PASS_PCT, getCourse } from "@/lib/help";
import { LevelList } from "@/components/help/CourseProgress";

type Params = { lang: string; course: string };

export function generateStaticParams(): Params[] {
  return LOCALES.flatMap((lang) => COURSES.map((c) => ({ lang, course: c.id })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { course } = await params;
  const c = getCourse(course);
  return { title: c ? `${c.title} — Algo 2` : "Algo 2" };
}

export default async function CoursePage({ params }: { params: Promise<Params> }) {
  const { lang, course } = await params;
  const c = getCourse(course);
  if (!LOCALES.includes(lang as Locale) || !c) notFound();
  const L = lang as Locale;
  const h = t("he").help; // the page body is Hebrew course content

  const rows = c.levels.map((lv, i) => ({
    n: i + 1,
    title: lv.title,
    icon: lv.icon,
    goal: lv.goal,
    boss: !!lv.boss,
    questions: lv.questions.length,
    href: `/${L}/help/${c.id}/${i + 1}/`,
  }));

  return (
    <main className="page" dir="rtl" lang="he">
      <p className="help-crumb">
        <Link href={`/${L}/help/`}>{h.backToHub}</Link>
      </p>
      <header className="algo-header">
        <h1>
          <span aria-hidden="true">{c.icon}</span> {c.title}
        </h1>
        <p className="help-intro">{c.intro}</p>
        <p className="help-note">
          {h.notes}:{" "}
          {c.notes.map((n, i) => (
            <span key={n.slug}>
              {i > 0 && " · "}
              <Link href={`/${L}/algorithms/${n.slug}/`}>{n.label}</Link>
            </span>
          ))}
        </p>
      </header>
      <LevelList
        courseId={c.id}
        rows={rows}
        passPct={PASS_PCT}
        labels={{
          passed: h.passed,
          next: h.next,
          boss: h.boss,
          levelWord: h.levelWord,
          questions: h.questions,
        }}
      />
    </main>
  );
}
