import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { LOCALES, type Locale, getAlgorithmsByGroup } from "@/lib/content";
import { t } from "@/lib/i18n";
import SidebarNav from "@/components/SidebarNav";
import ReadingProgress from "@/components/ReadingProgress";

export default async function AlgorithmsLayout({
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

  const navGroups = getAlgorithmsByGroup(L).map(({ group, items }) => ({
    label: s.groups[group],
    items: items.map((a) => ({ slug: a.meta.slug, title: a.meta.title })),
  }));

  return (
    <>
      <ReadingProgress />
      <div className="shell">
        <aside className="sidebar">
          <SidebarNav groups={navGroups} lang={L} heading={s.navAlgorithms} />
        </aside>
        <div className="shell-main">{children}</div>
      </div>
    </>
  );
}
