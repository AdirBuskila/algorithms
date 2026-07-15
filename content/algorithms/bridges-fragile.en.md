---
slug: bridges-fragile
order: 15
group: connectivity
title: "Bridges & Fragile Graphs"
summary: "An edge is a bridge exactly when it lies on no cycle; a graph where every edge is a bridge is a forest."
frequency: "2/19"
difficulty: easy
complexity:
  time: 'O(|V| + |E|)'
  timeNote: "one DFS finds all bridges (low-link values)"
  space: 'O(|V|)'
  spaceNote: "discovery / low-link arrays"
examFrequency: "Undirected connectivity — Q3 MC on the 2026 גרסה 2 paper and the Mo'ed A review"
---

**Goal:** understand which single edges hold an undirected graph together — and the exam's favorite characterization of graphs where *every* edge does.

- A **bridge** is an edge whose removal increases the number of connected components.
- ⭐ **Bridge ⟺ the edge lies on no cycle.** An edge on a cycle always has an alternate route around it, so removing it never disconnects anything.
- A graph is called **fragile** (שביר) when removing *any* single edge increases the number of components.

## The chain of equivalences

The whole topic compresses into one line — memorize it:

$$\text{fragile} \iff \text{every edge is a bridge} \iff \text{no edge lies on a cycle} \iff \text{the graph is a forest}$$

Consequences the exam tests:

| Fact | Why |
|---|---|
| Every **tree** is fragile | in a tree every edge is a bridge |
| A fragile graph is **not necessarily a tree** | a forest with $\ge 2$ components is fragile but disconnected |
| A fragile graph **can never contain a cycle** | a cycle edge is not a bridge |
| A forest with $c$ components has $\lvert V\rvert - c$ edges | each tree component with $n_i$ vertices has $n_i - 1$ edges |

> [!note] Edge counting
> The claim "a fragile graph has $\lvert V\rvert - 1$ edges" is **false** in general — that's only the connected case (a tree). The correct count is $\lvert V\rvert - c$ where $c$ is the number of components.

## Finding bridges

One [[Depth-First Search (DFS)|DFS]] finds all bridges in $O(V+E)$: a tree edge $(u,v)$ is a bridge exactly when no back edge from $v$'s subtree climbs above $u$ (low-link test). On this course's exams you rarely implement it — the *characterization* (no cycle through the edge) is what the questions probe.

## On the exam

The solved **2026 גרסה 2** paper (Q3 section ב') asks exactly the equivalence chain, with these verdicts:

- ✅ **Every tree is a fragile graph.** *(every tree edge is a bridge)*
- ❌ **Every fragile graph is a tree.** *Counter-example:* a forest of two disjoint edges — fragile, not connected, so not a tree.
- ❌ **A fragile graph with cycles can exist.** *A cycle edge is never a bridge — its removal leaves the cycle's detour intact.*
- ❌ **A fragile graph has $\lvert V\rvert-1$ edges.** *Same counter-example: 4 vertices, 2 disjoint edges — fragile with $\lvert V\rvert-2$ edges.*

The Mo'ed A review also leaned on **bridge ⟺ not on any cycle** as the key step in a prove/disprove part.

> [!tip] The reflex
> The moment a claim says "removing any edge disconnects…", translate it to **forest** and check the claim against a *disconnected* forest first — that's where the false options break.
