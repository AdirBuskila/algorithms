# True/False Practice Mode — Design

- **Date:** 2026-05-25
- **Status:** Proposed (awaiting review)
- **Project:** Algorithms 2 interactive notes (`algorithms/`)

## Goal

Add an **active-recall practice mode** to the site. Today the app is entirely
passive (read notes, watch a visualization). Active recall — self-testing — is
the strongest lever on exam performance, so closing the passive→active gap is
the highest-value addition.

v1 is **True/False prove-disprove practice**: show a real past-exam claim, the
student answers True or False, and the app immediately reveals the answer with
the counterexample/proof explanation. This trains the instinct the exam
rewards ("a large share of prove/disprove claims are false — hunt a
counterexample first").

## Framing: practice, not a graded test

This is explicitly a **low-stakes practice tool, not a scored quiz.**

- No score, no percentage, no pass/fail, no streaks, no leaderboards.
- Per-question correct/incorrect feedback stays — that is immediate learning,
  not a grade — and the **explanation reveal is the point** of each card.
- The end of a set is a *review prompt* ("claims worth another look"), never a
  grade.
- It should feel like flashcards, not an exam.

## Non-goals (YAGNI for v1)

- Flashcard self-rated recall and figure-based exam MC (Floyd-Warshall path
  reconstruction, max-flow values) — out of scope (the latter needs graph
  figures). **Which-technique multiple-choice IS agreed as Phase 2**, right
  after the T/F v1 ships; it needs no figures. This plan delivers Phase 1
  (T/F); the data model is a discriminated union so MC slots in without rework
  (a question with no `type` field defaults to `"tf"`).
- Scoring / grades / stats dashboards / spaced-repetition scheduling.
- Timed full-exam ("mock paper") mode.
- Accounts, cloud sync, any backend. Everything is static-export + client-side.
- Auto-extracting questions from prose at build time (too fragile — see
  Approach).

## Approach

A **curated bilingual question dataset** committed to the repo, seeded by hand
from `practice-by-topic-en.md` and its Hebrew mirror, rendered through the
existing markdown/KaTeX pipeline, and driven by one client-side component.

Rejected alternatives:

- **Questions in each algorithm's `.md` frontmatter** — clunky for structured
  Q&A, hard to query across topics, bloats the content files.
- **Parse `practice-by-topic.md` at build time** — the prose isn't strict
  enough to reliably extract the boolean answer + explanation.

## Data model

Two parallel files, one per locale, keyed by a shared stable `id`:

- `content/practice/questions.en.json`
- `content/practice/questions.he.json`

```ts
interface PracticeQuestion {
  id: string;            // stable, e.g. "scc-2024-summerA-q1a"
  algorithm: string;     // existing content slug, e.g. "scc" — links back to the note
  source: string;        // human citation, e.g. "2024 Summer Mo'ed A · Q1a"
  claim: string;         // the prove/disprove statement (markdown + KaTeX)
  answer: boolean;       // true = the claim is provable/true
  explanation: string;   // why: counterexample or proof sketch (markdown + KaTeX)
  difficulty: "easy" | "medium" | "hard";
}
```

- `claim` and `explanation` are markdown strings so `≥k`, `|V|`, and KaTeX
  render through the same `NoteContent` / `preprocessMarkdown` path the notes
  use. They are preprocessed at build time (server component) and the processed
  form is passed to the client component.
- `algorithm` is the **only** taxonomy field — the topic grouping is derived
  from that algorithm's existing `group` (traversal / connectivity /
  shortest-paths / flow-matching / approximation / reference) in
  `content.ts`. No new topic enum.
- The `en` and `he` files hold the same `id`s in the same order; only
  `source`, `claim`, and `explanation` differ by language (`answer`,
  `difficulty`, `algorithm` are identical).

## Content seeding

Seed v1 from the prove/disprove items in `practice-by-topic-en.md` (+ Hebrew
mirror) that have a **definite** answer — those marked `(true)`/`(false)` or
where the stated hint fixes the answer. Estimated ~30–40 questions spanning all
topics. Ambiguous items are cross-checked against the solution PDFs in
`…\אלגוריתמים 2\מבחנים\<year>\` where needed; anything still uncertain is
omitted from v1 rather than guessed.

Each question maps to one algorithm slug (the bank's shortest-paths section is
already split 6a–6d by algorithm, so the mapping is 1:1). The dataset is
structured so more questions can be appended later (by hand or via the sync
script).

## Architecture / components

- `src/lib/practice.ts` — load + type the JSON, expose `getQuestions(locale)`,
  `getQuestionsForAlgorithm(locale, slug)`, and counts grouped by `group`.
- `src/app/[lang]/practice/page.tsx` — server component (build-time): loads the
  locale's questions, preprocesses claim/explanation markdown, renders the hub,
  and mounts `<PracticeSession>` with the processed data + i18n labels.
- `src/components/PracticeSession.tsx` — `"use client"`. The interactive loop
  (hub → in-set → review). Reads the optional `?algorithm=<slug>` filter from
  `window.location.search` (avoids the `useSearchParams` Suspense requirement
  and stays static-export-safe). Manages the localStorage review list.
- `src/lib/i18n.ts` — add a `practice` strings block (en + he): "Practice",
  "True", "False", "Correct", "Not quite", "Why", "Next", "Read the note",
  "Practice all", "Worth another look", "Practice these again", "New set",
  "Back to notes", intro copy, etc.
- Navigation — a "Practice" link in the header/sidebar, and a "Practice this
  topic →" button on each algorithm page (`[slug]/page.tsx`) linking to
  `/{lang}/practice/?algorithm={slug}`.

## UX / session flow

**Hub** (`/{lang}/practice/`): a short intro line, then sections matching the
home-page groups; each lists its algorithms with a count of available claims,
plus a "Practice all (N)" action. If the review list is non-empty, a "Review
flagged claims (m)" entry appears at the top.

**A set** (client): the selected questions, shuffled.

```
 ┌──────────────────────────────────────────────┐
 │  2024 Summer Mo'ed A · Q1a        (3 / 10)     │
 │                                                │
 │  If U is an SCC, every directed path between   │
 │  two vertices of U contains only U-vertices.   │
 │                                                │
 │            [  True  ]   [  False  ]            │
 └──────────────────────────────────────────────┘
```

After answering, the chosen button marks ✓ or ✗, the **explanation** appears
(rendered markdown/KaTeX) with a "Read the note →" link to the algorithm page,
and a "Next →" advances. Keyboard: `T`/`F` to answer, `→` for next. The header
shows position ("3 / 10") only — never a running score.

**End of set:** a calm review screen — "You went through N claims." If any were
missed: "Worth another look:" a collapsible list of those claims with their
explanations, plus "Practice these again." Always: "New set" and "Back to
notes." No percentage, no grade.

## Persistence

A single localStorage key, `algo2-practice-review`: an array of question `id`s
the student missed (flagged for review). Missed → added; later answered
correctly → removed. This powers "Review flagged claims" and "Practice these
again" across sessions. No scores, no history, nothing evaluative is stored.

## Bilingual / RTL

The Hebrew dataset + the `practice` i18n block cover all visible text. RTL
layout is inherited from the existing `[lang]` locale layout (`dir(lang)`), so
no per-component RTL work beyond using the existing layout.

## Static-export / trailingSlash notes

The site uses `output: "export"` + `trailingSlash: true`. Therefore:

- All internal links to the practice route use the trailing-slash form
  (`/{lang}/practice/`), consistent with existing page links.
- The topic filter is a query param (`?algorithm=scc`) read client-side, not a
  dynamic route segment — no extra prerendered routes, and query params work on
  static hosts.
- No new `public/` HTML assets (the earlier visualization 404 came from `.html`
  files in `public/` under `trailingSlash`; this feature adds none).

## Verification

No test runner exists in the repo today, so v1 verification is:

- `scripts/validate-questions.mjs` — asserts: every `id` is unique; every `id`
  exists in both `en` and `he`; `answer` is a boolean; `difficulty` is one of
  the allowed values; `algorithm` is a real content slug; `claim` and
  `explanation` are non-empty. Wired into `npm run build` (or run manually) and
  fails loudly on a bad dataset.
- `npm run build` succeeds and the practice route is emitted as
  `out/{en,he}/practice/index.html`.
- Manual run-through in `next dev`: a full set from the hub, a per-algorithm
  entry via the "Practice this topic" button, the review flow, and the Hebrew
  RTL rendering of a claim with KaTeX.

## Future layers (out of scope, noted for direction)

1. **Which-technique multiple-choice (Phase 2 — agreed next)** — trains the Q2
   design instinct (e.g. "linear algorithm on a digraph → SCC + condensation").
   No figures needed. Slots into the same `PracticeQuestion` union (`type:
   "mc"` with `prompt` / `options` / `answerIndex`) and the same session UI.
2. Real MC items (Floyd-Warshall reconstruction, transitive-closure claims)
   with the needed graph figures.
3. Optional spaced-repetition ordering of the review list.
