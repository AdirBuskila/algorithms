import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale, getSlugMap } from "@/lib/content";
import { t } from "@/lib/i18n";
import { preprocessMarkdown } from "@/lib/markdown/preprocess";
import NoteContent from "@/components/NoteContent";

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
  return { title: `${s.exam.title} — Algo 2` };
}

export default async function ExamKitPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const s = t(L);

  const file = path.join(process.cwd(), "content", "exam", `exam.${L}.md`);
  const markdown = preprocessMarkdown(fs.readFileSync(file, "utf8"), getSlugMap(), L);

  return (
    <main className="page">
      <header className="algo-header">
        <h1>{s.exam.title}</h1>
      </header>
      <section className="algo-section">
        <NoteContent markdown={markdown} />
      </section>
    </main>
  );
}
