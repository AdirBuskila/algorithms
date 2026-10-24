import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/content";
import { t } from "@/lib/i18n";
import { COURSES, PASS_PCT } from "@/lib/help";
import { CourseBar } from "@/components/help/CourseProgress";

type Params = { lang: string };

export function generateStaticParams(): Params[] {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: `${t(lang as Locale).help.title} — Algo 2` };
}

export default async function HelpHub({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const h = t(L).help;
  const hh = t("he").help; // the cards are Hebrew content, so their small labels are Hebrew too

  return (
    <main className="page">
      <header className="algo-header">
        <h1>{h.title}</h1>
        <p className="help-intro">{h.intro}</p>
        {L === "en" && <p className="help-note">{h.hebrewOnly}</p>}
      </header>

      <div className="help-grid">
        {COURSES.map((c) => {
          const nq = c.levels.reduce((n, lv) => n + lv.questions.length, 0);
          return (
            <Link key={c.id} href={`/${L}/help/${c.id}/`} className="algo-card help-card" dir="rtl" lang="he">
              <div className="help-card-icon" aria-hidden="true">
                {c.icon}
              </div>
              <h3>{c.title}</h3>
              <p>{c.tagline}</p>
              <div className="algo-badges">
                <span className="badge badge-freq">{c.examNote}</span>
                <span className="badge">
                  {c.levels.length} {hh.levels}
                </span>
                <span className="badge">
                  {nq} {hh.questions}
                </span>
              </div>
              <CourseBar courseId={c.id} total={c.levels.length} passPct={PASS_PCT} label={hh.passedOf} />
            </Link>
          );
        })}
      </div>
      <p className="help-note">{h.verified}</p>
    </main>
  );
}
