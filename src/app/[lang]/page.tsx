import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LOCALES,
  type Locale,
  getAlgorithmsByGroup,
  getAllAlgorithms,
} from "@/lib/content";
import { t } from "@/lib/i18n";
import AlgorithmCard from "@/components/AlgorithmCard";
import HeroGraph from "@/components/HeroGraph";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

function freqValue(f: string): number {
  const n = parseInt(f.split("/")[0], 10);
  return Number.isNaN(n) ? -1 : n;
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const s = t(L);

  const groups = getAlgorithmsByGroup(L);
  const byFrequency = getAllAlgorithms(L).sort(
    (a, b) =>
      freqValue(b.meta.frequency) - freqValue(a.meta.frequency) ||
      a.meta.order - b.meta.order,
  );

  return (
    <main className="page">
      <section className="hero">
        <h1>{s.heroTitle}</h1>
        <p>{s.heroSubtitle}</p>
        <HeroGraph />
      </section>

      <div className="section-label">{s.algorithmsLabel}</div>
      {groups.map(({ group, items }) => (
        <section key={group} className="group">
          <h2 className="group-title">{s.groups[group]}</h2>
          <div className="algo-grid">
            {items.map((a) => (
              <AlgorithmCard key={a.meta.slug} meta={a.meta} lang={L} />
            ))}
          </div>
        </section>
      ))}

      <div className="section-label">{s.frequencyLabel}</div>
      <p style={{ color: "var(--text-dim)", fontSize: "13.5px", margin: "0 0 14px" }}>
        {s.frequencyIntro}
      </p>
      <div className="compare">
        <table>
          <thead>
            <tr>
              <th>{s.tableAlgorithm}</th>
              <th>{s.tableAppears}</th>
              <th>{s.tableDifficulty}</th>
            </tr>
          </thead>
          <tbody>
            {byFrequency.map((a) => (
              <tr key={a.meta.slug}>
                <td>
                  <Link href={`/${L}/algorithms/${a.meta.slug}/`}>
                    {a.meta.title}
                  </Link>
                </td>
                <td>
                  {a.meta.frequency} {s.exams}
                </td>
                <td>{s.difficulty[a.meta.difficulty]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
