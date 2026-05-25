---
slug: bellman-ford
order: 7
group: shortest-paths
title: "Bellman-Ford Algorithm"
summary: "Single-source shortest paths that tolerate negative weights and detect negative cycles."
frequency: "14/19"
difficulty: hard
negativeEdges: true
visualization: bellman-ford-visualization.html
vizHeight: 880
complexity:
  time: 'O(|V| \cdot |E|)'
  timeNote: "|V| − 1 passes, each relaxing all |E| edges"
  space: 'O(|V|)'
  spaceNote: "distance array (the graph itself adds O(|V| + |E|))"
examFrequency: "Topic 6 · Shortest Paths — ~14/19 exams"
---

**Goal:** shortest path from **one** source node to **all** other nodes (single-source shortest paths) — same goal as [[Dijkstra's Algorithm|Dijkstra]].

- ✅ **Handles negative edge weights.**
- ❌ **Cannot handle negative cycles** (but it can *detect* them).
- **Not greedy** (unlike Dijkstra). It repeatedly relaxes *all* edges — a dynamic-programming approach.

## How it works

Relax **every edge** in the graph, repeated **|V| − 1** times.

> [!info] Why |V| − 1 iterations?
> A shortest path in a graph with no cycles visits at most all |V| vertices, i.e. **|V| − 1 edges**. After |V| − 1 full passes over the edges, every shortest path is guaranteed to be found.

1. `dist[source] = 0`, `dist[v] = ∞` for all other nodes.
2. Repeat **|V| − 1** times: for every edge `(u → v)` with weight `w`, if `dist[u] + w < dist[v]`, update `dist[v] = dist[u] + w`.
3. **Negative-cycle check:** run one more pass — if any edge can *still* be relaxed, the graph contains a negative cycle.

## Example

A line graph `S → A → B → C → D` with weights `3, 5, −2, 1` and **5 vertices** needs **|V| − 1 = 4** iterations.

Shortest distances from **S**: S = 0, A = 3, B = 8, C = 6, D = 7.

## Bellman-Ford vs. Dijkstra

| | [[Dijkstra's Algorithm\|Dijkstra]] | Bellman-Ford |
|---|---|---|
| Approach | Greedy | Dynamic programming (relax all edges) |
| Negative weights | ❌ | ✅ |
| Negative cycles | ❌ | Detects them |
| Time complexity | $O(\vert E\vert + \vert V\vert \log \vert V\vert)$ | $O(\vert V\vert \cdot \vert E\vert)$ |

## On the exam

Bellman-Ford shows up wherever **negative weights** or **negative-cycle detection** are in play, and in head-to-head comparisons against Dijkstra.

- **Negative-cycle traps.** *(2024 Summer Mo'ed C, Q1a — false)* — "a negative cycle ⟹ Bellman-Ford from **any** source detects it." The catch: the cycle may be **unreachable** from `s`, so its edges never relax. Detection only covers cycles reachable from the source.
- **Complexity comparisons.** *(2022 Sem-B Sample, Q1a)* — in a **strongly connected** graph with **positive** weights, is Bellman-Ford's complexity equal to Dijkstra's? *(2025 Summer Mo'ed A, Q3e — MC)* — when are Dijkstra and Bellman-Ford equivalent, and when is Dijkstra strictly faster?
- **Pick-the-right-tool MC.** *(2024 Sem-B Mo'ed B, Q3b)* — shortest paths in a **DAG with negative weights**: which of `|V|×Bellman-Ford` / Floyd-Warshall / `Gᵀ` + DAG-shortest-path / `Gᵀ` + Dijkstra is **correct**, and which is **efficient**? (DAG-shortest-path wins; Dijkstra is out because of the negative weights.)

> [!info] The detection trick
> Run one **extra** relaxation pass after the `|V| − 1` passes. If any edge still relaxes, a negative cycle is **reachable from the source**. This `O(|V| \cdot |E|)` check is the part exams test most.
