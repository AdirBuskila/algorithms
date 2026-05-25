---
slug: dag-shortest-path
order: 8
group: shortest-paths
title: "DAG Shortest Path"
summary: "Linear-time single-source shortest paths on a DAG — relax edges in topological order."
frequency: "14/19"
difficulty: hard
negativeEdges: true
visualization: dag-visualization.html
vizHeight: 880
complexity:
  time: 'O(|V| + |E|)'
  timeNote: "topological sort + one relaxation per edge"
  space: 'O(|V| + |E|)'
  spaceNote: "distance array + the topological order / adjacency list"
examFrequency: "Topic 6 · Shortest Paths — ~14/19 exams"
---

**Goal:** shortest path from **one** source node to **every** other node in a **Directed Acyclic Graph** (single-source shortest paths on a DAG).

- **Linear time** — visits each vertex and each edge exactly once. Faster than both Dijkstra and Bellman-Ford.
- ✅ **Handles negative edge weights** — unlike [[Dijkstra's Algorithm]].
- ⚠️ Requires the graph to be **acyclic** (no cycles). If a cycle exists, fall back to [[Bellman-Ford Algorithm]].

## How it works

1. **Topologically sort** the vertices (see [[Topological Sort]]).
2. Set `dist[source] = 0` and `dist[v] = ∞` for every other node.
3. For each vertex `u` **in topological order**, **relax** every outgoing edge `(u → v)` with weight `w`: if `dist[u] + w < dist[v]`, update `dist[v]`.
4. Done — a single pass through the topological order is enough.

> [!note] Why one pass is enough
> When you process `u` in topological order, every vertex that could possibly reach `u` has already been processed. So `dist[u]` is final — no later relaxation can improve it, since no edge in a DAG goes "backward" in the order.

## Example

Source = **A** with topological order **A → C → B → D → E**. Distances after processing each node:

| Processed | A | B | C | D | E |
|---|---|---|---|---|---|
| _init_    | 0 | ∞ | ∞ | ∞ | ∞ |
| **A** | 0 | 6 | 1 | ∞ | ∞ |
| **C** | 0 | 3 | 1 | 6 | ∞ |
| **B** | 0 | 3 | 1 | 6 | 6 |
| **D** | 0 | 3 | 1 | 6 | 4 |
| **E** | 0 | 3 | 1 | 6 | 4 |

**Final shortest distances from A:** A = 0, B = 3, C = 1, D = 6, E = 4.

> [!example] Negative edge in action
> A negative edge (e.g. `D → E` with weight **−2**) is fine here — we process `D` before `E` and never revisit a finalized node, so the negative weight just improves `E` once. The same edge would break [[Dijkstra's Algorithm|Dijkstra]].

## On the exam

The DAG one-pass method is the **efficiency answer** — reach for it whenever the graph is acyclic, *especially* with negative weights where Dijkstra is disqualified.

- **Negative weights on a DAG.** *(2024 Sem-B Mo'ed B, Q3b)* — shortest paths to `v` in a **DAG with negative weights**: running DAG-shortest-path (here on `Gᵀ`) is the **efficient, correct** choice; Dijkstra is wrong (negatives) and `|V|`× Bellman-Ford is wasteful.
- **Bounded / unit weights via BFS.** *(2023 Summer Mo'ed A, Q2a; 2024 Summer Mo'ed A, Q3e)* — with `w : E → {1..k}`, constant `k`, split edges into unit edges and run BFS for `Θ(|V| + |E|)` — the same linear spirit as the DAG pass.
- **Constrained / via-set walks.** *(2022 Sem-B Mo'ed C, Q4a)* — `O(|V|²)` lightest walk `v₁→vₙ` passing through **at least one** vertex of a set `S`: combine a `v₁→S` path with an `S→vₙ` path.

> [!info] Pick the lightest tool
> - **DAG + any weights** → DAG-shortest-path, `O(|V|+|E|)`.
> - **Non-negative weights, general graph** → [[Dijkstra's Algorithm|Dijkstra]], `O((|V|+|E|)\log|V|)`.
> - **Negative weights or cycle detection** → [[Bellman-Ford Algorithm|Bellman-Ford]], `O(|V| \cdot |E|)`.
