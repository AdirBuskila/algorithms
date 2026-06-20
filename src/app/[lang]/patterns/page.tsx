import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale, getAllAlgorithms } from "@/lib/content";
import { t } from "@/lib/i18n";
import { getPatternsByCategory } from "@/lib/patterns";
import PatternsView from "@/components/PatternsView";

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
  return { title: `${s.patterns.title} — Algo 2`, description: s.patterns.intro };
}

export default async function PatternsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const s = t(L);

  const titleBySlug = new Map(
    getAllAlgorithms(L).map((a) => [a.meta.slug, a.meta.title]),
  );

  const groups = getPatternsByCategory(L).map((g) => ({
    category: g.category,
    label: s.patterns.categories[g.category],
    items: g.items.map((p) => ({
      id: p.id,
      name: p.name,
      trigger: p.trigger,
      idea: p.idea,
      complexity: p.complexity,
      diagram: p.diagram,
      source: p.source,
      algorithms: p.algorithms.map((slug) => ({
        slug,
        title: titleBySlug.get(slug) ?? slug,
      })),
    })),
  }));

  return (
    <main className="page">
      <header className="algo-header">
        <h1>{s.patterns.title}</h1>
        <p className="practice-intro">{s.patterns.intro}</p>
      </header>
      <PatternsView
        groups={groups}
        lang={L}
        labels={{
          searchPlaceholder: s.patterns.searchPlaceholder,
          noResults: s.patterns.noResults,
          trigger: s.patterns.trigger,
          uses: s.patterns.uses,
        }}
      />
    </main>
  );
}
