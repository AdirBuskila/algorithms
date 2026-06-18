# Definitions glossary section

**Date:** 2026-06-18
**Status:** Approved (proceed to execution)

## Goal & scope

Add a dedicated, bilingual **Definitions** section: a searchable glossary of the
~45 core graph/algorithms terms that recur in the Algorithms 2 exams (graph,
connected graph, diameter, tree, SCC, flow network, matching, …), grouped by
topic. Mirrors the practice section's structure. New section in the header with a
`beta` badge. Curated core (not exhaustive); a definition links to its related
algorithm page when one exists.

## Architecture (mirrors the practice section)

- **Data:** `content/definitions/definitions.en.json` + `.he.json` — parallel
  arrays, identical `id`s in identical order. Entry shape:
  `{ id, term, category, definition, algorithm?, aka? }`.
  - `id` — stable kebab slug (`connected-graph`, `diameter`, `residual-graph`).
  - `category` and `algorithm` are **shared** across both languages (parity-checked);
    only `term`, `definition`, `aka` are localized.
  - `definition` / `aka` support `$…$` KaTeX, rendered via `NoteContent`.
  - `algorithm?` — optional slug → links to `/[lang]/algorithms/<slug>/`.
- **Loader:** `src/lib/definitions.ts` — `Definition` type, `CATEGORY_ORDER`,
  `getDefinitions(lang)`, `getDefinitionsByCategory(lang)`.
- **Page:** `src/app/[lang]/definitions/page.tsx` (server) → `<DefinitionsTable>`.
- **Component:** `src/components/DefinitionsTable.tsx` (client) — a live filter box
  (matches term + definition text, HE/EN) over topic-grouped sections; each row is
  the **term** (+ optional `aka`, + link when `algorithm` is set) and the **definition**.
- **Nav:** "Definitions" link in `src/app/[lang]/layout.tsx` beside Practice, with a
  `beta` badge.
- **i18n:** new `definitions` block (navLabel, title, intro, searchPlaceholder,
  noResults, localized `categories`) in both locales in `src/lib/i18n.ts`.
- **CSS:** `.definitions-*` styles in `src/app/globals.css`, RTL-aware via the
  existing `.locale-root[dir=rtl]` pattern.

## Categories (8, exam-oriented, in this order)

`graph-basics` · `connectivity` · `trees` · `distances` · `special-graphs` ·
`ordering` · `flow` · `matching`.

## Content (~42 curated terms, bilingual)

Authored from the standard course definitions, cross-checked against the exam
"תזכורת" reminder blocks (clique, diameter, simple cycle, directed tree, walk,
transitive closure …) so phrasing matches the tests. Cross-links: SCC→scc, MST→mst,
DFS tree→dfs, bipartite→bipartite-matching, topological sort→topological-sort,
transitive closure→transitive-closure, flow network/residual→network-flow,
maximum matching→bipartite-matching, vertex cover→vertex-cover.

## Verification & deliverables

- `scripts/validate-definitions.mjs` (wired into `npm run build` next to the
  questions validator) asserts: both files parse; EN/HE `id` sets match 1:1 and in
  order; every `category` is known and every `algorithm` is a real slug; no
  duplicate ids.
- `npm run build` confirms `/en/definitions` and `/he/definitions` prerender.
- Deliverables: the two JSON files, `definitions.ts`, `DefinitionsTable.tsx`,
  the page, i18n + layout + CSS edits, the validator + build wiring.
