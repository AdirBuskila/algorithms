# Expand the practice bank from past-exam claims

**Date:** 2026-06-17
**Status:** Approved (proceed to execution)

## Goal & scope

Mine every **prove-or-disprove** claim (the Q1 a/b/c blocks) and every explicit
**true/false** statement from the 2022–2025 past-exam PDFs, and add each as a
boolean-claim practice item — bilingual (EN + HE), matching the existing schema
exactly. The 5 current questions stay untouched and are de-duplicated against.

- **Sources:** year-folder past exams only (`2022/`, `2023/`, `2024/`, `2025/`)
  under `…\אלגוריתמים 2\מבחנים`. Excluded: the scanned `מבחנים אלגוריתמים 2.pdf`
  (0 extractable text, no OCR), the `אלגוריתמים 2 חזרה למבחן.pdf` formula sheet,
  and the Bar-Ilan / marathon docs (per scope decision).
- **Answer sourcing:** official solution PDF's verdict when one exists; otherwise
  a verdict I am confident in, with an explanation I write.
- **No app/UI code changes.** Pure content: `content/practice/questions.en.json`
  and `content/practice/questions.he.json`.
- Estimated ~50–75 new questions.

## Data model & conventions (unchanged schema)

Fields per item: `id`, `algorithm` (one of the 14 existing slugs), `source`,
`claim`, `answer` (bool), `explanation`, `difficulty` (`easy|medium|hard`).
EN and HE files hold the **same `id`s in the same order** (strict 1:1 parity).

- **Modeling:** prove → `answer: true`; disprove → `answer: false`. Same for T/F.
- **`id`:** `{algo}-{year}-{moed}-{q}` reusing the existing scheme —
  `sembA/sembB/sembC`, `sembSpecial`, `sembSample`, `summerA/summerB/summerC`;
  sub-parts `q1a/q1b/…` or `q3` when a question has no sub-parts.
- **`source`:** EN `2024 Sem-B Mo'ed A · Q1a` / HE `2024 סמסטר ב מועד א · שאלה 1א`.
- **`claim` / `explanation`:** clean prose with `$…$` KaTeX (full LaTeX is fine —
  these render through `NoteContent`, unlike the complexity `timeNote`/`spaceNote`
  fields). Explanation states the verdict + key reason/counterexample, in the
  terse style of the current 5 items.
- **`difficulty`:** easy (definitional), medium (needs a counterexample/insight),
  hard (subtle/multi-step).

## Curation methodology

- Work from the already-extracted text dumps in `scripts/.pdfcache/`, **solution
  files first** (they carry verdict + reasoning). Where an exam has no solution
  PDF, supply a confident verdict and write the explanation.
- **Reconstruct** Hebrew OCR artifacts (final-letter `ן→ð`, reordered symbols)
  into clean text; re-typeset math.
- **Map** each claim to the correct algorithm slug (e.g. a BFS-π claim → `bfs`,
  a Topological-Sort claim → `topological-sort`).
- **De-duplicate:** identical claims recurring across mo'eds collapse to one item
  (earliest occurrence as `source`); skip anything already in the current 5.
- **Skip** claims that can't be made a clean, unambiguous boolean (or rephrase to
  the interpretation the official solution scores). List anything skipped.

## Verification & deliverables

- A validator asserts: both JSON files parse; every `algorithm` is a real slug;
  EN/HE `id` sets match exactly and 1:1; no duplicate ids. Then `npm run build`
  (or lint) to confirm the site still compiles.
- Deliverables: the two updated JSON files; a short coverage report (added per
  year/topic + any skipped claims); cleanup of `scripts/.pdfcache/` and the probe
  scripts.

## Valid algorithm slugs

`bellman-ford`, `bfs`, `bipartite-matching`, `dag-shortest-path`, `dfs`,
`dijkstra`, `dp-on-graphs`, `floyd-warshall`, `mst`, `network-flow`, `scc`,
`topological-sort`, `transitive-closure`, `vertex-cover`.
