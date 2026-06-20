# Exam-Recognition & Reduction-Patterns Layer — Design

**Date:** 2026-06-20
**Status:** Awaiting review

## Context

A classmate shared a comprehensive exam-strategy guide (`summary.pdf`, 30 pages, Hebrew)
and a companion `ACE-THE-TEST.md` (in the Obsidian vault). The ask: infuse their
knowledge into the app *smartly* — not a copy-paste, not a single "summary" page.

What the summary actually is: a **meta/strategy layer** over the course.
- Part A — a *concept → algorithm* recognition map.
- Part B — per-algorithm cheat sheets (already heavily covered by our notes' frontmatter
  + "On the exam" sections; this is **not** the gap).
- Part C — *question-type* strategy + a **fast decision table**.
- Part D — 2022–2025 exam deltas, incl. cross-algorithm **reduction patterns**.

The app today is **reference-first, organized by algorithm** — it answers *"tell me about X."*
The summary answers *"I'm staring at an exam question — which of the 13 tools do I pick,
and what's the trap?"* That **recognition / decision spine** (Parts A, C) and the
**cross-algorithm reductions** (Part D §5) are the genuinely additive pieces, and they
map cleanly onto metadata we already store (`group`, `frequency`, `complexity`,
`negativeEdges`).

`ACE-THE-TEST.md` §2 holds a wide Mermaid decision flowchart ("the fire diagram"); §5
holds reduction diagrams (condensation DAG, bipartite→flow, layered graph, vertex-split,
min-cut S/T).

**Outcome:** the app gains the exam-recognition layer it lacks, woven into existing
surfaces (search, home, notes) — no PDF dump, everything bilingual (en/he, RTL-aware) and
cross-linked.

## Decisions locked with the user

- **Diagram tech: hybrid.** Bespoke responsive component for the centerpiece decision
  diagram (clickable, reflows so "wide" is solved); lightweight inline SVG for the small
  static pattern diagrams. No heavy new dependency (no Mermaid).
- **Placement: home panel + ⌘K.** A focused "Start here: which algorithm?" panel near the
  top of the home page, plus a command-palette path in.
- **Scope: two pillars** — (1) recognition layer, (2) reduction & technique patterns.

---

## Pillar 1 — The recognition layer

### 1a. Concept-aware command palette (Part A map)

Fold the concept→algorithm map into the **existing** `CommandPalette` so typing a *concept*
("negative cycle", "bottleneck", "2-coloring", "all pairs", "prerequisites") surfaces the
right algorithm with a one-line *why*.

- **Data:** add to each algorithm's frontmatter (both `*.en.md` and `*.he.md`):
  - `cues: string[]` — recognition phrases to match on (language-specific).
  - reuse the existing latent `finds?: string` field as the short "what it finds / when to
    reach for it" hint shown under the title.
- **Types:** extend `AlgorithmMeta` (`src/lib/content.ts`) with `cues?: string[]`
  (`finds?` already exists).
- **Wiring:** in `src/app/[lang]/layout.tsx`, include `cues` + `finds` in the `searchItems`
  map. In `CommandPalette.tsx`, extend `SearchItem`, broaden the filter to match
  `cues`, and render `finds` as the result subtitle. When a cue matched the query, show the
  matched cue (so the user sees *why* this surfaced).
- No new page; search just gets smarter.

### 1b. The decision diagram (Part C / ACE §2)

Build the §2 "which algorithm does this question want?" flowchart as a **native React client
component** (`src/components/DecisionDiagram.tsx`) — *not* an iframe widget. The
`public/visualizations/*` iframes are stateful vault-synced animations; this is navigation
UI, so a native component gets `lang`/RTL and Next `<Link>` click-through directly, and
reflows for the "wide" problem.

- **Data:** `content/decision/decision.{en,he}.json`, a small typed decision tree mirroring
  the repo's per-lang JSON convention (like definitions). Shape:
  ```ts
  // src/lib/decision.ts
  type Leaf = { tool: string; slug: string; complexity: string; note?: string };
  type Branch = { label: string; node: DecisionNode };
  type DecisionNode = { q: string; branches: Branch[] } | Leaf;
  ```
  Encodes: one-source shortest path → {≥0 → Dijkstra, neg+DAG → DAG-Shortest-Path,
  neg+cycles → Bellman-Ford, weights 1..k → split-edges+BFS}; all-pairs → Floyd-Warshall
  (path-exists → Transitive Closure); reachability/mutual/drainage/roots → SCC+condensation;
  throughput/disjoint-paths/matching → reduce to flow; ordering → Topological Sort;
  tree diameter/center → double-BFS. Leaves link to algorithm slugs.
- **Rendering:** desktop = horizontal decision tree; narrow/mobile = collapsible vertical
  accordion (no horizontal scroll). Leaf nodes are `<Link>`s to `/{lang}/algorithms/{slug}/`,
  showing tool + complexity. Theme-aware via existing CSS vars in `globals.css`.
- **Placement:** a "Start here — which algorithm?" panel on `src/app/[lang]/page.tsx`,
  inserted after `HeroGraph`, before the "The algorithms" grid. Plus a command-palette
  affordance ("Not sure? Open the decision map") that scrolls/links to the panel.
- **i18n:** new strings in `src/lib/i18n.ts` (`decision.title`, `decision.intro`,
  `decision.startHere`, accordion a11y labels).

---

## Pillar 2 — Reduction & technique patterns (ACE §5 + summary Part D)

Cross-algorithm tricks that belong to *no single algorithm* become a small **patterns
content type**, mirroring the definitions feature exactly.

- **Content:** `content/patterns/patterns.{en,he}.json`. Each entry:
  ```ts
  // src/lib/patterns.ts
  interface Pattern {
    id: string;
    category: "reduction" | "scc-toolkit" | "transform" | "tree";
    name: string;
    trigger: string;        // "when you see…"
    idea: string;           // the trick (markdown + KaTeX)
    complexity?: string;
    algorithms: string[];   // slugs it uses → drives cross-links both ways
    diagram?: DiagramId;    // optional inline-SVG key
    source?: string;        // optional exam ref
  }
  ```
- **Lib:** `src/lib/patterns.ts` mirroring `definitions.ts` (`getPatterns`,
  `getPatternsByCategory`, `getPatternsForAlgorithm(slug)`).
- **Page:** `/{lang}/patterns/` mirroring the definitions page; a client
  `PatternsView.tsx` (searchable cards) mirroring `DefinitionsTable`. Nav link in
  `[lang]/layout.tsx` next to Definitions/Practice. i18n strings + a `patterns` group of
  labels in `i18n.ts`.
- **Cross-links (both ways):**
  - Pattern card → its `algorithms` as `<Link>`s to the notes.
  - Each algorithm page (`src/app/[lang]/algorithms/[slug]/page.tsx`) renders an "Appears in
    patterns" list from `getPatternsForAlgorithm(slug)` — data-driven, so **no change to the
    wikilink resolver** (`remark-obsidian` / `getSlugMap`).
  - Patterns also added to the command palette as searchable items (type → pattern).
- **Diagrams (inline SVG, hybrid choice):** a small set of theme-aware React SVG components
  keyed by `DiagramId` — `BipartiteFlow`, `Condensation`, `LayeredGraph`, `VertexSplit`,
  `MinCut`. Simple, hand-drawn look matching the app; `currentColor` / CSS vars; responsive
  `viewBox`. Rendered inside the pattern card when `diagram` is set.
- **Initial pattern set (~10):** bipartite→flow; super-source/super-sink (multi
  source/sink); vertex-capacity split; SCC condensation (source/sink/drainage/roots);
  almost-strongly-connected (one edge ⇒ SC); layered/copies graph (parity / "≥k red
  edges"); edge-splitting for bounded integer weights {1..k}; longest-path-in-DAG
  (negate + DAG-SP); acyclic orientation (DFS low→high, Robbins/bridgeless); transitive
  reduction / minimum equivalent graph.

---

## What we deliberately do NOT do

- No "Summary" page or PDF reproduction.
- No re-importing Part B per-algorithm cheat content — the notes already carry complexity,
  frequency, and "On the exam" pitfalls. (A later, optional pass could mine any *missing*
  MC traps into the practice bank, but it's out of scope here.)
- No Mermaid dependency.
- No change to `scripts/sync-notes.mjs` or the vault pipeline — all new content
  (`content/decision/`, `content/patterns/`, `cues` frontmatter, React components) is
  authored directly in the repo and is outside the paths sync writes to.

## File-change summary

New:
- `content/decision/decision.{en,he}.json`, `src/lib/decision.ts`,
  `src/components/DecisionDiagram.tsx`
- `content/patterns/patterns.{en,he}.json`, `src/lib/patterns.ts`,
  `src/components/PatternsView.tsx`, `src/components/diagrams/*.tsx`,
  `src/app/[lang]/patterns/page.tsx`

Edited:
- `src/lib/content.ts` (add `cues?` to `AlgorithmMeta`)
- `content/algorithms/*.{en,he}.md` (add `cues:` + `finds:` frontmatter, 13×2 files)
- `src/app/[lang]/layout.tsx` (palette items incl. cues/finds + patterns; Patterns nav link)
- `src/components/CommandPalette.tsx` (concept matching + subtitle + decision-map entry)
- `src/app/[lang]/page.tsx` (decision panel)
- `src/app/[lang]/algorithms/[slug]/page.tsx` ("Appears in patterns")
- `src/lib/i18n.ts` (decision + patterns strings, both locales)
- `src/app/globals.css` (decision panel + pattern card + SVG styles)

## Phasing (each independently shippable)

1. **Pillar 1** — concept-aware ⌘K (cues/finds data + palette) → decision diagram component
   + home panel + i18n.
2. **Pillar 2** — patterns content type → page + nav + ⌘K → cross-links on notes → inline
   SVG diagrams.

## Verification

- `npm run validate:questions` / `validate:definitions` stay green; add an analogous
  lightweight validation for `patterns`/`decision` JSON (referenced slugs exist, required
  fields present) wired into `npm run build`.
- `npm run build` (runs validators + `next build`, static export) succeeds; `out/` includes
  `/{en,he}/patterns/`.
- `npm run dev`: home shows the decision panel; clicking a leaf lands on the right note;
  ⌘K "negative cycle" → Bellman-Ford with a why; `/he/` mirrors everything RTL; a pattern
  card cross-links to its algorithms and each of those notes shows "Appears in patterns".

## Open questions for review

1. **Patterns as its own nav page** (mirroring Definitions/Practice) vs. patterns living
   *only* as cross-links on notes + ⌘K with no standalone page. The spec assumes a page
   (genuinely useful for browsing all tricks, and consistent with the app's content-type
   pattern) — but flagging it since you were wary of "a section."
2. **Naming:** "Patterns" vs "Techniques" vs "Reductions" for the nav label.
3. **Decision-panel default state:** expanded, or collapsed-by-default with a "Start here"
   toggle to keep the home hero uncluttered.
