import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale, getAllAlgorithms } from "@/lib/content";
import { getRecognitionMap } from "@/lib/recognition";
import { getPatterns } from "@/lib/patterns";
import { t, dir } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import CommandPalette, { type SearchItem } from "@/components/CommandPalette";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const s = t(L);
  const d = dir(L);

  const recognition = getRecognitionMap(L);
  const algoItems: SearchItem[] = getAllAlgorithms(L).map((a) => {
    const r = recognition[a.meta.slug];
    return {
      title: a.meta.title,
      subtitle: r?.finds ?? `${s.groups[a.meta.group]} · ${a.meta.frequency}`,
      href: `/${L}/algorithms/${a.meta.slug}/`,
      keywords: [
        s.groups[a.meta.group],
        a.meta.frequency,
        ...(r?.cues ?? []),
      ],
    };
  });
  const patternItems: SearchItem[] = getPatterns(L).map((p) => ({
    title: p.name,
    subtitle: s.patterns.navLabel,
    href: `/${L}/patterns/#${p.id}`,
    keywords: [p.trigger, ...p.algorithms],
  }));
  const decisionItem: SearchItem = {
    title: s.decision.searchLabel,
    subtitle: s.decision.startHere,
    href: `/${L}/#start-here`,
    keywords: ["decision", "which algorithm", "help me pick", "מפת החלטה"],
  };
  const searchItems: SearchItem[] = [
    decisionItem,
    ...algoItems,
    ...patternItems,
  ];

  return (
    <div className="locale-root" dir={d} lang={L}>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href={`/${L}/`} className="site-brand">
            {s.brand} <span>· {s.brandSuffix}</span>
          </Link>
          <div className="header-actions">
            <Link href={`/${L}/patterns/`} className="header-practice-link">
              {s.patterns.navLabel}
            </Link>
            <Link href={`/${L}/definitions/`} className="header-practice-link">
              {s.definitions.navLabel}
            </Link>
            <Link href={`/${L}/practice/`} className="header-practice-link">
              {s.practice.navLabel}
            </Link>
            <Link href={`/${L}/exam/`} className="header-practice-link">
              {s.exam.navLabel}
            </Link>
            <CommandPalette
              items={searchItems}
              labels={{
                search: s.searchHint,
                searchPlaceholder: s.searchPlaceholder,
                noResults: s.noResults,
              }}
            />
            <LanguageToggle lang={L} />
          </div>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <p>{s.footer}</p>
        <a className="deck-link" href="https://adirbuskila.github.io/">
          <span className="deck-arrow" aria-hidden="true">↗</span>
          {s.deckLink}
        </a>
      </footer>
    </div>
  );
}
