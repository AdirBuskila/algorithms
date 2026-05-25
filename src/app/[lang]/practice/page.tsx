import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/content";
import { t } from "@/lib/i18n";
import { getQuestions, getPracticeOverview } from "@/lib/practice";
import PracticeSession from "@/components/PracticeSession";

type Params = { lang: string };

export function generateStaticParams(): Params[] {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  const s = t(lang as Locale);
  return { title: `${s.practice.title} — Algo 2` };
}

export default async function PracticePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const s = t(L);

  const questions = getQuestions(L);
  const overview = getPracticeOverview(L);

  return (
    <main className="page">
      <header className="algo-header">
        <h1>{s.practice.title}</h1>
      </header>
      <PracticeSession
        questions={questions}
        overview={overview}
        lang={L}
        labels={{ ...s.practice, groups: s.groups }}
      />
    </main>
  );
}
