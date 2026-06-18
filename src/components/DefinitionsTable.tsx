"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import NoteContent from "@/components/NoteContent";

export interface DefinitionItem {
  id: string;
  term: string;
  definition: string;
  algorithm?: string;
  aka?: string;
}

export interface DefinitionGroupView {
  category: string;
  label: string;
  items: DefinitionItem[];
}

export interface DefinitionsLabels {
  searchPlaceholder: string;
  noResults: string;
  linkTitle: string;
}

export default function DefinitionsTable({
  groups,
  lang,
  labels,
}: {
  groups: DefinitionGroupView[];
  lang: string;
  labels: DefinitionsLabels;
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
            it.term.toLowerCase().includes(q) ||
            it.definition.toLowerCase().includes(q) ||
            (it.aka ?? "").toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  return (
    <div className="definitions">
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
          <section key={g.category} className="definitions-group">
            <h2 className="group-title">{g.label}</h2>
            <dl className="definitions-list">
              {g.items.map((it) => (
                <div key={it.id} id={it.id} className="definitions-row">
                  <dt className="definitions-term">
                    <span className="definitions-term-main">
                      <NoteContent markdown={it.term} />
                      {it.algorithm && (
                        <Link
                          href={`/${lang}/algorithms/${it.algorithm}/`}
                          className="definitions-term-link"
                          title={labels.linkTitle}
                          aria-label={labels.linkTitle}
                        >
                          ↗
                        </Link>
                      )}
                    </span>
                    {it.aka && (
                      <span className="definitions-aka">
                        <NoteContent markdown={it.aka} />
                      </span>
                    )}
                  </dt>
                  <dd className="definitions-def">
                    <NoteContent markdown={it.definition} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))
      )}
    </div>
  );
}
