import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/content";
import { t, dir } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

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

  return (
    <div className="locale-root" dir={d} lang={L}>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href={`/${L}/`} className="site-brand">
            {s.brand} <span>· {s.brandSuffix}</span>
          </Link>
          <LanguageToggle lang={L} />
        </div>
      </header>
      {children}
      <footer className="site-footer">{s.footer}</footer>
    </div>
  );
}
