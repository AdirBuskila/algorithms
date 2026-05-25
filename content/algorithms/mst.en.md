---
slug: mst
order: 14
group: reference
title: "Minimum Spanning Tree (Kruskal / Prim)"
summary: "A minimum-weight tree connecting all vertices, built greedily via the cut property — Kruskal or Prim."
frequency: "0/19"
difficulty: medium
visualization: mst-visualization.html
vizHeight: 820
complexity:
  time: 'O(|E| \log |V|)'
  timeNote: "Kruskal (sort + Union-Find); Prim is O(|E| + |V| log |V|) with a heap"
  space: 'O(|V| + |E|)'
  spaceNote: "Union-Find structure / priority queue"
examFrequency: "Black-box list — never asked directly (0/19)"
---

**Goal:** in a connected, weighted, **undirected** graph $G=(V,E)$, find a **minimum spanning tree** — a subset of edges that connects all vertices with **minimum total weight** (a tree, so exactly $|V|-1$ edges, no cycles).

- Both classic algorithms are **greedy** and both rest on the **cut property**.
- **Kruskal** grows a forest by adding the globally lightest safe edge.
- **Prim** grows one tree outward from a start vertex — its frontier expansion resembles [[Dijkstra's Algorithm|Dijkstra]]'s.

## How it works

1. **The cut property (why greedy works).** For any cut $(S, V\setminus S)$ of the vertices, the **lightest edge crossing the cut** is safe — it belongs to some MST. Both algorithms repeatedly add a lightest crossing edge for a carefully chosen cut.
2. **Kruskal — sort edges, add if no cycle.** Sort all edges by increasing weight. Scan them; add edge $(u,v)$ to the tree **iff** `u` and `v` are not already connected (checked with **Union-Find**). Stop after $|V|-1$ edges.
3. **Prim — grow one tree.** Start from any vertex. Repeatedly add the **lightest edge crossing** from the tree to a vertex outside it, using a **priority queue** keyed by the cheapest connecting edge. Stop when all vertices are in the tree.

## Pseudocode

```text
KRUSKAL(G, w):
    A ← ∅
    for each v in V: MAKE-SET(v)
    sort E by increasing w
    for each edge (u, v) in E (in sorted order):
        if FIND(u) ≠ FIND(v):        // adding it forms no cycle
            A ← A ∪ {(u, v)}
            UNION(u, v)
    return A

PRIM(G, w, r):
    for each v in V: key[v] ← ∞;  π[v] ← NIL
    key[r] ← 0;  Q ← V              // min-priority queue on key
    while Q ≠ ∅:
        u ← EXTRACT-MIN(Q)
        for each v in Adj[u]:
            if v ∈ Q and w(u, v) < key[v]:
                π[v] ← u;  key[v] ← w(u, v)
    return {(v, π[v]) : v ∈ V \ {r}}
```

## Example

Kruskal on edges sorted by weight; "added?" is no iff both endpoints are already connected:

| Edge | Weight | Connects | Added? |
|---|---|---|---|
| (A,B) | 1 | A, B | yes |
| (B,C) | 2 | C to {A,B} | yes |
| (A,C) | 3 | A–C already linked | no (cycle) |
| (C,D) | 4 | D to {A,B,C} | yes |

Result: $\{(A,B),(B,C),(C,D)\}$ — $|V|-1 = 3$ edges, total weight $1+2+4 = 7$.

> [!note] Kruskal vs. Prim
> They differ only in which cut they exploit. **Kruskal** always takes the globally lightest unused edge (cut = the two components it would join). **Prim** always takes the lightest edge leaving the single tree it has grown so far (cut = tree vs. rest). Both yield a valid MST.

## On the exam

> [!warning] Do not over-invest in MST
> Across all **19** exams, **MST was never asked directly**. Kruskal and Prim appear only on the **"black-box" list** at the end of the exam (with their complexities), in case a question references them as a black box. Per the strategic-summary note, just **know that they exist** and what their complexities are — don't spend study time drilling MST.

If MST ever surfaces, it would be as a **black-box building block** (e.g. "run Kruskal, then…"), not as a stand-alone prove/design question. The transferable idea is the **cut property** and Prim's Dijkstra-like frontier expansion via a priority queue.
