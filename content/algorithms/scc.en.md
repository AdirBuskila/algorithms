---
slug: scc
order: 3
group: connectivity
title: "Strongly Connected Components (SCC)"
summary: "Partition a directed graph into maximal mutually-reachable components; the condensation is always a DAG."
frequency: "13/19"
difficulty: hard
complexity:
  time: 'O(|V| + |E|)'
  timeNote: "two DFS passes — Kosaraju; or one — Tarjan"
  space: 'O(|V| + |E|)'
  spaceNote: "DFS stack + the condensation graph"
examFrequency: "Topic 3 · SCC & condensation — ~13/19 exams"
visualization: scc-visualization.html
vizHeight: 860
---

**Goal:** partition a **directed** graph into its **strongly connected components** — maximal sets of vertices where every pair `u, v` has a path `u → v` **and** a path `v → u`.

- Collapsing each SCC to a single super-vertex gives the **condensation** `Gˢᶜᶜ`, which is **always a DAG** (cycles only ever live *inside* a component).
- A **source component** has in-degree 0 in `Gˢᶜᶜ`; a **sink component** has out-degree 0. These two are the workhorses of nearly every exam design question.
- Computable in **linear time** `O(|V| + |E|)` — two passes of [[Depth-First Search (DFS)]] (Kosaraju) or a single pass (Tarjan).

## How it works

Kosaraju–Sharir (two DFS passes):

1. Run [[Depth-First Search (DFS)]] on `G` and record each vertex's **finish time** `f[v]`.
2. Build the **transpose** `Gᵀ` — reverse the direction of every edge.
3. Run DFS on `Gᵀ`, but in the **main loop** process vertices in **decreasing** order of `f[]` (the highest finish time first).
4. Each DFS tree formed in step 3 is exactly **one SCC**.
5. (Optional) Scan the edges once to build the condensation `Gˢᶜᶜ`, then find source components (in-deg 0) and sink components (out-deg 0).

## Pseudocode

```text
SCC(G):
    1. DFS(G)                       # compute f[v] for all v
    2. compute Gᵀ                   # reverse all edges
    3. DFS(Gᵀ), iterating the main loop
       over V in decreasing f[] order
       → each resulting DFS tree is one SCC
```

## Example

A graph with three components: `{A, B, C}` form a cycle, `{D, E}` form a cycle, and `{F}` is alone — with edges `C → D` and `E → F`.

| Component | Vertices | In-deg in `Gˢᶜᶜ` | Out-deg in `Gˢᶜᶜ` | Role |
|---|---|---|---|---|
| `X` | {A, B, C} | 0 | 1 | **source** |
| `Y` | {D, E} | 1 | 1 | internal |
| `Z` | {F} | 1 | 0 | **sink** |

The condensation is the chain `X → Y → Z` — a DAG. There is a single source component (`X`), so the graph **has a root** (a vertex reaching all others).

> [!note] Why does the decreasing-finish-time order work?
> The vertex with the **highest** finish time lies in a **source** component of the condensation. On `Gᵀ` the source becomes a sink, so a DFS started there cannot "leak" into other components — it captures exactly one SCC before stopping.

## On the exam

SCC is the engine behind **almost every Question 2** in 2024–2025 ("design a linear algorithm on a directed graph"), and it recurs across Question 1 (prove/disprove) and the Question 3 MC parts. The recipe barely changes: run `SCC(G)`, build the condensation, then reason about **source** and **sink** components. Every SCC exam question to date:

- **Sink / source components (design).** *(2022 Sem-B Mo'ed B, Q2a)* — find a minimal non-empty `U ⊆ V` with no edge leaving it; *Hint:* a **sink SCC** of the condensation. **(Q2b — correctness + complexity.)** *(2024 Sem-B Sample, Q2)* — same minimal-sink-SCC task. **(Q2b — correctness + complexity.)** *(2024 Summer Mo'ed C, Q2b)* — does a **root** exist, and print all roots; *Hint:* a **single source component** ⟺ a root exists. **(Q2a — identify roots; Q2c — correctness + complexity.)** *(2025 Sem-B Mo'ed A, Q2b-c)* — return all "drain" vertices (everything reachable from `u` reaches back to `u`); *Hint:* the **sink component**. **(Q2a — identify on a given graph.)**
- **Condensation engineering (design).** *(2024 Summer Mo'ed A, Q2b)* — "minimal equivalent graph": same condensation, fewest edges; *Hint:* one cycle inside each SCC (`|SCC|` edges) plus the **transitive reduction** of the condensation DAG. **(Q2a — count SCCs + draw condensation; Q2c — correctness + complexity.)** *(2025 Summer Mo'ed A, Q2b)* — is the graph "almost strongly connected" (one added edge makes it strongly connected)? *Hint:* a **single** source component **and** a **single** sink component. **(Q2a — check a given graph; Q2c — correctness + `O(|V|+|E|)`.)** *(2025 Summer Mo'ed B, Q2b)* — does adding some edge reduce the number of SCCs, and which edge? *Hint:* connect a **sink back to a source** in the condensation DAG. **(Q2a — compute; Q2c — correctness + complexity.)**
- **Cycles via SCC (design).** *(2022 Sem-B Mo'ed A, Q2a)* — detect a negative cycle in a graph with weights `{0, -1}`; *Hint:* contract the 0-edges into SCCs — a negative cycle ⟺ an SCC that contains an internal `-1` edge. **(Q2b — correctness + complexity.)** *(2023 Sem-B Special Mo'ed, Q4a)* — is there a simple cycle with 5 distinct vertices? *(Q4b)* — a closed walk with 5 vertices. *(Q4c)* — linear algorithm: is there a closed walk with `≥ k` distinct vertices; *Hint:* an **SCC of size `≥ k`**. *(2024 Summer Mo'ed B, Q2b)* — print all vertices lying on some directed cycle; *Hint:* the vertices of every **SCC of size `≥ 2`** (or DFS + a back edge). **(Q2a — list them; Q2c — correctness + complexity.)** *(2024 Sem-B Special Mo'ed, Q2b)* — is edge `(x, y)` in **every** directed cycle of `G`? *Hint:* analyse the cycle structure inside the SCC containing the edge. **(Q2a — identify the edge on a given graph; Q2c — correctness + complexity.)**
- **Structural prove/disprove & MC.** *(2024 Sem-B Mo'ed A, Q1a — true)* — every directed path between two vertices of an SCC contains only vertices of that SCC. *(2024 Summer Mo'ed B, Q1a — true)* — two vertices of one SCC land in the same DFS-forest tree; *Hint:* the **white-path theorem**. *(2025 Sem-B Mo'ed B, Q3d — MC)* — condensation properties after running SCC in lexicographic order (vertex/edge counts, topo-sort uniqueness, SCC size, roots). *(2025 Summer Mo'ed B, Q3c — MC)* — structural properties (deleting `v`'s incoming edges, a bound on the number of SCCs, the condensation's structure with `k` SCCs).

> [!tip] The golden rule — internalize this one
> **Nearly every "design a linear algorithm on a directed graph" question is solved by running `SCC(G)` and working on the condensation.** Find the **source components** (in-deg 0) and **sink components** (out-deg 0): they answer almost everything. In particular, a **root exists ⟺ there is exactly one source component**. When you see Question 2, this is your default first move — and the related order on `Gˢᶜᶜ` is exactly a [[Topological Sort]].
