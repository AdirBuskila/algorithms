# Algorithms 2 — Interactive Notes

Bilingual (English + עברית), exam-focused course notes for **Algorithms 2 (HIT 73106)**,
covering every topic that appears in the past exams. Each algorithm gets a page with:

1. **Explanation** — plain-language walkthrough, pseudocode, worked example.
2. **Visualization** — a live, step-through widget (every algorithm has one).
3. **Complexity** — running time and space.
4. **On the exam** — every past-exam appearance of the algorithm, from the question bank.

It also has a grouped sidebar, a ⌘K command-palette search, prev/next paging, and a
reading-progress bar.

Built with Next.js (static export), so it deploys anywhere and there's nothing to run for
people you share it with.

## Languages

The site is fully bilingual with a Hebrew/English toggle (top-right of the header) and
right-to-left layout for Hebrew. Pages live under a locale segment:

- `/en` · `/en/algorithms/<slug>`
- `/he` · `/he/algorithms/<slug>`

`/` redirects to the visitor's saved choice (or browser language, default English).

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build (static site)

```bash
npm run build    # outputs a fully static site to ./out
npx serve out    # preview the production build locally
```

## Deploy

- **Vercel (recommended):** push to GitHub and "Import Project" on Vercel — auto-detects
  Next.js, gives you a public URL to share, no config.
- **GitHub Pages:** set `basePath: "/<repo-name>"` in `next.config.ts`, publish `out/`, and
  prefix the iframe `src` in `src/components/Visualization.tsx` with the same basePath.

## Add a new algorithm

No code changes needed — the home grid, groups, and routes are generated from content.

1. Create **two** files, `content/algorithms/<slug>.en.md` and `<slug>.he.md` (copy an
   existing pair such as `dijkstra.en.md` / `dijkstra.he.md` as a template). Keep
   `slug, order, group, frequency, difficulty` and the `complexity` LaTeX identical across
   the two; translate only the human-readable fields and the body.

   Frontmatter:

   ```yaml
   slug: <slug>          # must match the filename
   order: <n>            # global sort order
   group: traversal      # traversal | connectivity | shortest-paths | flow-matching | approximation | reference
   title: "…"
   summary: "…"          # one line, shown on the card
   frequency: "13/19"    # exam appearances, shown as a badge
   difficulty: medium    # easy | medium | hard
   complexity:
     time: 'O(…)'        # LaTeX (KaTeX). Single-quote it so backslashes stay literal.
     timeNote: "…"       # plain text — use Unicode (·, √, Θ), NOT \cdot/\sqrt
     space: 'O(…)'
     spaceNote: "…"
   examFrequency: "…"    # page subtitle
   # Optional, shortest-path widgets only:
   # visualization: <file>.html
   # vizHeight: 880
   ```

   Put the explanation prose above a divider heading and the exam material below it:
   `## On the exam` in the English file, `## איך זה מופיע במבחן` in the Hebrew file.

2. *(Only if it has a widget)* drop the interactive HTML at
   `public/visualizations/<file>.html` and set `visualization` / `vizHeight` in frontmatter.
3. `npm run dev` (or rebuild). Done.

### Supported note syntax

The Markdown pipeline understands the Obsidian flavor used in the source notes: `$…$` /
`$$…$$` math (KaTeX), GitHub tables, `> [!note] / [!tip] / [!info] / [!example]` callouts,
`[[Wikilinks]]` (target the related algorithm's **English title**; resolved to the current
locale's page), and `==highlights==`. Diagrams (` ```mermaid `) and ` ```html-embed ` blocks
are stripped — the widget comes from frontmatter, and worked examples use tables.

## Sync from the Obsidian vault

`npm run sync` copies the latest `*-visualization.html` widgets into `public/visualizations/`
and the raw notes into `content/_vault/` (reference only). It never overwrites the curated
notes in `content/algorithms/`. Override the vault location with `VAULT=...`.

## Project layout

```
content/algorithms/    # curated bilingual notes <slug>.en.md / <slug>.he.md (source of truth)
public/visualizations/ # the interactive HTML widgets (shortest-path algorithms)
src/app/               # root redirect + /[lang] home + /[lang]/algorithms/[slug] + layouts
src/components/         # NoteContent, Callout, Visualization, ComplexityCard, AlgorithmCard, LanguageToggle
src/lib/               # content loading, i18n strings, Obsidian-markdown transforms
scripts/sync-notes.mjs # vault → repo convenience copier
```
