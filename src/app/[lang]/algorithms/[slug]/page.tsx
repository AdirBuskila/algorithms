import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  LOCALES,
  type Locale,
  getAlgorithm,
  getAlgorithmSlugs,
  getSlugMap,
} from "@/lib/content";
import { t } from "@/lib/i18n";
import { preprocessMarkdown } from "@/lib/markdown/preprocess";
import NoteContent from "@/components/NoteContent";
import Visualization from "@/components/Visualization";
import ComplexityCard from "@/components/ComplexityCard";

type Params = { lang: string; slug: string };

export function generateStaticParams(): Params[] {
  const slugs = getAlgorithmSlugs();
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const algo = getAlgorithm(lang as Locale, slug);
  if (!algo) return {};
  return { title: `${algo.meta.title} — Algo 2`, description: algo.meta.summary };
}

export default async function AlgorithmPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, slug } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const algo = getAlgorithm(L, slug);
  if (!algo) notFound();

  const s = t(L);
  const slugMap = getSlugMap();
  const explanation = preprocessMarkdown(algo.explanation, slugMap, L);
  const onExam = preprocessMarkdown(algo.onExam, slugMap, L);

  return (
    <main className="page">
      <header className="algo-header">
        <h1>{algo.meta.title}</h1>
        <p className="freq">{algo.meta.examFrequency}</p>
      </header>

      <section className="algo-section">
        <NoteContent markdown={explanation} />
      </section>

      {algo.meta.visualization ? (
        <section className="algo-section">
          <h2 className="section-title">{s.visualization}</h2>
          <Visualization
            file={algo.meta.visualization}
            height={algo.meta.vizHeight ?? 760}
            title={`${algo.meta.title} — visualization`}
          />
        </section>
      ) : null}

      <section className="algo-section">
        <h2 className="section-title">{s.complexity}</h2>
        <ComplexityCard complexity={algo.meta.complexity} labels={s} />
      </section>

      {onExam ? (
        <section className="algo-section">
          <h2 className="section-title">{s.onExam}</h2>
          <NoteContent markdown={onExam} />
        </section>
      ) : null}
    </main>
  );
}
