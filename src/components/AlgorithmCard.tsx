import Link from "next/link";
import type { AlgorithmMeta, Locale } from "@/lib/content";
import { t } from "@/lib/i18n";

export default function AlgorithmCard({
  meta,
  lang,
}: {
  meta: AlgorithmMeta;
  lang: Locale;
}) {
  const s = t(lang);
  return (
    <Link href={`/${lang}/algorithms/${meta.slug}/`} className="algo-card">
      <h3>{meta.title}</h3>
      <p>{meta.summary}</p>
      <div className="algo-badges">
        <span className="badge badge-freq">
          {meta.frequency} {s.exams}
        </span>
        <span className={`badge badge-${meta.difficulty}`}>
          {s.difficulty[meta.difficulty]}
        </span>
      </div>
    </Link>
  );
}
