import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale, getAlgorithmsByGroup } from "@/lib/content";
import { t } from "@/lib/i18n";
import { getQuestions, type PracticeQuestion } from "@/lib/practice";
import ClaimBank, { type ClaimSection } from "@/components/ClaimBank";

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

export default async function ClaimBankPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const s = t(L);

  const questions = getQuestions(L);
  const byAlgo = new Map<string, PracticeQuestion[]>();
  for (const q of questions) {
    const list = byAlgo.get(q.algorithm) ?? [];
    list.push(q);
    byAlgo.set(q.algorithm, list);
  }

  // Group claims by topic group, in display order, keeping file order inside.
  const sections: ClaimSection[] = getAlgorithmsByGroup(L)
    .map(({ group, items }) => ({
      group,
      label: s.groups[group],
      topics: items
        .filter((a) => byAlgo.has(a.meta.slug))
        .map((a) => ({
          algorithm: a.meta.slug,
          title: a.meta.title,
          claims: byAlgo.get(a.meta.slug)!,
        })),
    }))
    .filter((sec) => sec.topics.length > 0);

  return (
    <main className="page">
      <header className="algo-header">
        <h1>{s.practice.title}</h1>
      </header>
      <ClaimBank
        sections={sections}
        lang={L}
        labels={{
          intro: s.practice.intro,
          searchPlaceholder: s.practice.searchPlaceholder,
          noResults: s.practice.noResults,
          labelTrue: s.practice.labelTrue,
          labelFalse: s.practice.labelFalse,
          why: s.practice.why,
          showAll: s.practice.showAll,
          claimsWord: s.practice.claimsWord,
          readNote: s.practice.readNote,
        }}
      />
    </main>
  );
}
