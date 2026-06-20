"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import NoteContent from "@/components/NoteContent";
import PatternDiagram from "@/components/diagrams/PatternDiagram";
import type { DiagramId } from "@/lib/patterns";

export interface PatternItem {
  id: string;
  name: string;
  trigger: string;
  idea: string;
  complexity?: string;
  algorithms: { slug: string; title: string }[];
  diagram?: DiagramId;
  source?: string;
}

export interface PatternGroupView {
  category: string;
  label: string;
  items: PatternItem[];
}

export interface PatternsLabels {
  searchPlaceholder: string;
  noResults: string;
  trigger: string;
  uses: string;
}

export default function PatternsView({
  groups,
  lang,
  labels,
}: {
  groups: PatternGroupView[];
  lang: string;
  labels: PatternsLabels;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            it.trigger.toLowerCase().includes(q) ||
            it.idea.toLowerCase().includes(q) ||
            it.algorithms.some((a) => a.title.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  return (
    <div className="patterns">
      <input
        type="search"
        className="definitions-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchPlaceholder}
      />

      {filtered.length === 0 ? (
        <p className="definitions-empty">{labels.noResults}</p>
      ) : (
        filtered.map((g) => (
          <section key={g.category} className="patterns-group">
            <h2 className="group-title">{g.label}</h2>
            <div className="patterns-grid">
              {g.items.map((it) => (
                <article key={it.id} id={it.id} className="pattern-card">
                  <header className="pattern-card-head">
                    <h3 className="pattern-name">{it.name}</h3>
                    {it.complexity && (
                      <code className="pattern-complexity">{it.complexity}</code>
                    )}
                  </header>

                  <p className="pattern-trigger">
                    <span className="pattern-trigger-label">{labels.trigger}</span>
                    <NoteContent markdown={it.trigger} />
                  </p>

                  <div className="pattern-idea">
                    <NoteContent markdown={it.idea} />
                  </div>

                  {it.diagram && <PatternDiagram id={it.diagram} />}

                  <footer className="pattern-card-foot">
                    <span className="pattern-uses-label">{labels.uses}</span>
                    {it.algorithms.map((a) => (
                      <Link
                        key={a.slug}
                        href={`/${lang}/algorithms/${a.slug}/`}
                        className="pattern-chip"
                      >
                        {a.title}
                      </Link>
                    ))}
                    {it.source && (
                      <span className="pattern-source">{it.source}</span>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
