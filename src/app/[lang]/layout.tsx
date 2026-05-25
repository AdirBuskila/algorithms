import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale, getAllAlgorithms } from "@/lib/content";
import { t, dir } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import CommandPalette from "@/components/CommandPalette";

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

  const searchItems = getAllAlgorithms(L).map((a) => ({
    slug: a.meta.slug,
    title: a.meta.title,
    group: s.groups[a.meta.group],
    frequency: a.meta.frequency,
  }));

  return (
    <div className="locale-root" dir={d} lang={L}>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href={`/${L}/`} className="site-brand">
            {s.brand} <span>· {s.brandSuffix}</span>
          </Link>
          <div className="header-actions">
            <Link href={`/${L}/practice/`} className="header-practice-link">
              {s.practice.navLabel}
              <span className="beta-badge">beta</span>
            </Link>
            <CommandPalette
              items={searchItems}
              lang={L}
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
      <footer className="site-footer">{s.footer}</footer>
    </div>
  );
}
