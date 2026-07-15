"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NoteContent from "@/components/NoteContent";
import type { PracticeQuestion } from "@/lib/practice";

export interface ClaimBankLabels {
  intro: string;
  searchPlaceholder: string;
  noResults: string;
  labelTrue: string;
  labelFalse: string;
  why: string;
  showAll: string;
  claimsWord: string;
  readNote: string;
}

export interface ClaimTopic {
  algorithm: string;
  title: string;
  claims: PracticeQuestion[];
}

export interface ClaimSection {
  group: string;
  label: string;
  topics: ClaimTopic[];
}

/**
 * Read-first reference of every past-exam claim: verdict and reasoning always
 * visible, filterable by text or by ?algorithm=<slug> (the per-note CTA link).
 */
export default function ClaimBank({
  sections,
  lang,
  labels,
}: {
  sections: ClaimSection[];
  lang: string;
  labels: ClaimBankLabels;
}) {
  const [query, setQuery] = useState("");
  const [algo, setAlgo] = useState<string | null>(null);

  // Honor ?algorithm=<slug> links from the algorithm pages (static export —
  // read it on mount like the rest of the app does).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("algorithm");
    if (fromUrl) setAlgo(fromUrl);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        topics: s.topics
          .filter((t) => !algo || t.algorithm === algo)
          .map((t) => ({
            ...t,
            claims: q
              ? t.claims.filter(
                  (c) =>
                    c.claim.toLowerCase().includes(q) ||
                    c.explanation.toLowerCase().includes(q) ||
                    c.source.toLowerCase().includes(q),
                )
              : t.claims,
          }))
          .filter((t) => t.claims.length > 0),
      }))
      .filter((s) => s.topics.length > 0);
  }, [sections, query, algo]);

  const total = visible.reduce(
    (n, s) => n + s.topics.reduce((m, t) => m + t.claims.length, 0),
    0,
  );

  return (
    <div className="claim-bank">
      <p className="practice-intro">{labels.intro}</p>
      <div className="claim-filterbar">
        <input
          type="search"
          className="definitions-search"
          placeholder={labels.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="claim-count">
          {total} {labels.claimsWord}
        </span>
        {algo && (
          <button className="claim-showall" onClick={() => setAlgo(null)}>
            {labels.showAll}
          </button>
        )}
      </div>

      {visible.length === 0 && <p className="practice-empty">{labels.noResults}</p>}

      {visible.map((s) => (
        <section key={s.group} className="claim-section">
          <h2 className="group-title">{s.label}</h2>
          {s.topics.map((t) => (
            <div key={t.algorithm} className="claim-topic">
              <h3 className="claim-topic-title">
                <Link href={`/${lang}/algorithms/${t.algorithm}/`} title={labels.readNote}>
                  {t.title}
                </Link>
              </h3>
              <ul className="claim-list">
                {t.claims.map((c) => (
                  <li key={c.id} className="claim-item practice-card">
                    <div className="claim-head">
                      <span className="practice-source">{c.source}</span>
                      <span
                        className={`claim-verdict ${c.answer ? "is-true" : "is-false"}`}
                      >
                        {c.answer ? `✓ ${labels.labelTrue}` : `✗ ${labels.labelFalse}`}
                      </span>
                    </div>
                    <div className="claim-text">
                      <NoteContent markdown={c.claim} />
                    </div>
                    <div className="practice-why">
                      <span className="practice-why-label">{labels.why}</span>
                      <NoteContent markdown={c.explanation} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
