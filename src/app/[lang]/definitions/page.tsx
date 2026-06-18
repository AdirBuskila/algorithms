import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/content";
import { t } from "@/lib/i18n";
import { getDefinitionsByCategory } from "@/lib/definitions";
import DefinitionsTable from "@/components/DefinitionsTable";

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
  return { title: `${s.definitions.title} — Algo 2` };
}

export default async function DefinitionsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const s = t(L);

  const groups = getDefinitionsByCategory(L).map((g) => ({
    category: g.category,
    label: s.definitions.categories[g.category],
    items: g.items.map((d) => ({
      id: d.id,
      term: d.term,
      definition: d.definition,
      algorithm: d.algorithm,
      aka: d.aka,
    })),
  }));

  return (
    <main className="page">
      <header className="algo-header">
        <h1>{s.definitions.title}</h1>
        <p className="practice-intro">{s.definitions.intro}</p>
      </header>
      <DefinitionsTable
        groups={groups}
        lang={L}
        labels={{
          searchPlaceholder: s.definitions.searchPlaceholder,
          noResults: s.definitions.noResults,
          linkTitle: s.definitions.linkTitle,
        }}
      />
    </main>
  );
}
