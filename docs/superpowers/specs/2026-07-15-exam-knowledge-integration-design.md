# Exam-Knowledge Integration — Design

**Date:** 2026-07-15 (night before the exam)
**Direction set by user:** the app is a *knowledge reference*, not a practice tool — "no need for practice mode, we can even remove it; we just want the knowledge and important things to know." TSP is included (it appears on the גרסה 2 exam paper). User waived further review ("don't bother me, you got this").

## Source material

1. The solved **גרסה 2** Q3 exam pages (Desktop/algo-images): 7 sections × 4 statements, each with a marked verdict and reason — flow sensitivity, fragile graphs, DAG topo-order counts, transitive-closure topo sorts, matching↔cover, metric TSP, edge-addition distance monotonicity.
2. The distilled guide `אלגו2-מדריך-מלא-למבחן.md` (trap radar, flow rules, complexity table, strategy, morning checklist).
3. The 19-exam frequency scan (flow + prove/disprove dominate; FW and VC-approx rising in 2024–25; no DP/NP-reductions/amortized in scope).

## What changes

### 1. Practice quiz → browsable Claim Bank (repurpose, honoring "remove practice")
- The interactive T/F quiz (`PracticeSession.tsx`, 291 lines) is **deleted**.
- `/[lang]/practice/` becomes a **read-first reference**: every past-exam claim grouped by topic, verdict badge (✓ true / ✗ false) and the one-line key **always visible** — knowledge, not drilling. Client-side text filter + `?algorithm=` filter (keeps the per-algorithm CTA links working).
- New component `ClaimBank.tsx` (small, presentational). Nav label changes Practice → **Claim bank / בנק טענות**; beta badge dropped.
- Data stays in `content/practice/questions.{en,he}.json` (same schema, validators untouched).

### 2. Claim data: +~34 new bilingual claims
- All 24–28 statements from the גרסה 2 answer key (sections א–ז), IDs like `network-flow-2026-v2-q3a1`.
- Trap-radar claims not already in the bank (Hall exactly-k, unique-matching Hall, FW updated-via-k, saturated-edge, average-of-two-max-flows, Dijkstra reweighting, D^(k) misread).
- Deduped against the existing 51 (checked by claim content, not just id).
- Floyd–Warshall gets its first claims (currently 0 despite 14/19 frequency).

### 3. Two new content pages (content-only, no code — app generates routes)
- **`tsp-approx`** (group `approximation`): metric TSP, MST-doubling ≤ 2·OPT, Christofides ≤ 1.5·OPT, no constant-factor approx unless P=NP; "On the exam" carries the solved section ו'.
- **`bridges-fragile`** (group `connectivity`): bridge ⟺ on no cycle, fragile ("שביר") ⟺ every edge a bridge ⟺ forest, forest edge count |V|−c; "On the exam" carries the solved section ב'.

### 4. Per-algorithm "On the exam" enrichment (distributed, not dumped)
Append the new solved facts to the section each belongs to (both locales):
- **dijkstra** — reweighting w+|w_min| does NOT fix negative edges (recurring MC); adding an edge never invalidates d[] upward.
- **floyd-warshall** — D^(k) = intermediates in {1..k} (NOT "k edges"); path reconstruction from P; what the final matrix can/can't tell you; "updated via k" trap.
- **network-flow** — capacity-sensitivity rule block (±1 vs arbitrary, every/no min-cut membership) incl. solved section א'.
- **bipartite-matching** — α/η/μ notation, Gallai identity, μ≤η always / König bipartite-only, solved section ה' distinctions (maximal-matching-vertices ARE a cover, etc.).
- **topological-sort** — counting orders: 2 sources or 2 sinks ⇒ ≥2 orders; converse FALSE (diamond); u-before-v-in-every-order ⟺ path (not edge).
- **transitive-closure** — G and G* have the same topological orders (solved section ד').
- **vertex-cover** — even-size trick (can never equal odd OPT), tightness, 2-line ratio proof.

### 5. Definitions: +8 entries
α(G), η(G), μ(G) (category `matching`), Gallai identity (`matching`), bridge (`connectivity`), fragile graph (`connectivity`), forest edge count (`trees`), metric TSP (`special-graphs`).

### 6. New Exam Kit page — `/[lang]/exam/`
The battle plan as content: exam map (3 questions, points, negative marking), attack order, memorize-cold complexity table, quantifier traps, topic priority ranking (from the 19-exam scan), morning checklist. Implemented as `content/exam/exam.{en,he}.md` rendered through the existing `NoteContent` pipeline (KaTeX, tables, callouts all supported) + a thin `/[lang]/exam/page.tsx` cloned from the definitions page pattern. Nav link added.

## Explicitly out of scope
Frequency-badge changes, visualizations for new pages, route rename of `/practice`, touching the Obsidian sync script.

## Verification
`npm run build` (runs all three validators + static export) must pass clean; spot-check `/he/practice`, `/he/exam`, `/he/algorithms/tsp-approx` in the dev server; Hebrew RTL rules (math in `$…$`, no literal pipes in table math) applied to all new Hebrew content.
