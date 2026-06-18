# Hero graph animation (`HeroGraph`)

**Date:** 2026-06-18
**Status:** Approved (proceed to execution)

## Goal

A "cool" animated graph in the home-page hero band (between the subtitle and the
first section label): a gently drifting **living network** of nodes/edges that
periodically runs a **BFS traversal ripple** — a glowing wave that spreads
outward from a random node along the edges, then fades. On-theme for a
graph-algorithms site, never distracting, no layout shift.

## Component

`src/components/HeroGraph.tsx` — self-contained client component, rendered inside
`.hero` in `src/app/[lang]/page.tsx` after the subtitle `<p>`.

- **Canvas + `requestAnimationFrame`.** Fills a fixed-height wrapper (~150px, less
  on mobile). Retina-crisp via `devicePixelRatio` (capped at 2). `ResizeObserver`
  re-fits + re-lays-out on width change. `pointer-events: none`, `aria-hidden`.
- **Network:** `N = clamp(round(width/46), 12, 26)` nodes with slow drift velocity
  and soft bounce off the bounds. Edges drawn between nodes closer than a distance
  threshold, opacity fading with distance.
- **BFS ripple:** on a timer, pick a random source, BFS over the current proximity
  graph, assign each node a discovery time `layer * layerDelay`. Each node's
  intensity rises (~220ms) then decays (~1100ms) after its discovery time;
  discovered nodes brighten base→accent (source tinted toward amber) with a soft
  halo, and edges between two active nodes light up. When the wave finishes, idle
  briefly then ripple again from a new source.

## Behavior & polish

- **Theme-aware:** colors read from `--text-dim`, `--accent`, `--accent-amber` on
  `document.documentElement`; re-read on `prefers-color-scheme` change.
- **`prefers-reduced-motion: reduce`** → draw a single static frame (nodes + faint
  edges), no loop, no ripples.
- **Pause** the rAF loop when the canvas is off-screen (`IntersectionObserver`) and
  when the tab is hidden (`visibilitychange`).
- **No layout shift:** fixed-height wrapper; graceful empty space if canvas/JS is
  unavailable. All listeners/observers cleaned up on unmount.

## Integration & verification

- `page.tsx`: `<HeroGraph />` inside `.hero`. `globals.css`: `.hero-graph` wrapper.
- `npm run build` compiles; `/en` + `/he` prerender (canvas mounts client-side).
- Run the dev server and screenshot the hero in light & dark to confirm.
