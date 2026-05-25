---
slug: dijkstra
order: 6
group: shortest-paths
title: "Dijkstra's Algorithm"
summary: "Greedy single-source shortest paths on graphs with non-negative weights."
frequency: "14/19"
difficulty: hard
negativeEdges: false
visualization: dijkstra-visualization.html
vizHeight: 880
complexity:
  time: 'O(|E| + |V| \log |V|)'
  timeNote: "with a binary / Fibonacci-heap priority queue"
  space: 'O(|V|)'
  spaceNote: "distance array + priority queue (the graph itself adds O(|V| + |E|))"
examFrequency: "Topic 6 · Shortest Paths — ~14/19 exams"
---

**Goal:** shortest path from **one** source node to **every** other node (single-source shortest paths).

- **Greedy** algorithm — it always expands the closest unvisited node.
- ⚠️ **Edge weights must be non-negative** (≥ 0). Negative edges can break it → use [[Bellman-Ford Algorithm]] instead.

## How it works

1. Set `dist[source] = 0` and `dist[v] = ∞` for every other node. Mark all nodes **unvisited**.
2. Pick the **unvisited node with the smallest distance** and mark it **visited**.
3. **Relax** each outgoing edge `(u → v)` with weight `w`: if `dist[u] + w < dist[v]`, update `dist[v]`.
4. Repeat steps 2–3 until all nodes are visited.

## Example

Source = **A**. Distances after each node is finalized:

| Picked (dist) | A | B | C | D | E | Unvisited |
|---|---|---|---|---|---|---|
| _init_     | 0 | ∞ | ∞ | ∞ | ∞ | {A, B, C, D, E} |
| **A** (0)  | 0 | 4 | 2 | ∞ | ∞ | {B, C, D, E} |
| **C** (2)  | 0 | 3 | 2 | 6 | 7 | {B, D, E} |
| **B** (3)  | 0 | 3 | 2 | 5 | 6 | {D, E} |
| **D** (5)  | 0 | 3 | 2 | 5 | 6 | {E} |
| **E** (6)  | 0 | 3 | 2 | 5 | 6 | {} |

**Final shortest distances from A:** A = 0, B = 3, C = 2, D = 5, E = 6.

> [!note] Why is C finalized before B?
> After visiting A, C has distance 2 < B's 4, so the greedy choice picks C first. Relaxing `C → B` (weight 1) then improves B from 4 down to 3.

## On the exam

Dijkstra is almost never a bare "run Dijkstra" question — it's used as a **black box** *after* you reshape the graph so that a shortest path encodes some extra constraint.

- **Layered / vertex-copy gadgets.** *(2022 Sem-B Sample, Q2a)* — shortest `s→t` path passing through **at most 2 "traffic-light" vertices**: build a **3-copy layered graph** (one layer per traffic light used) and run Dijkstra. *(2022 Sem-B Mo'ed A, Q4a)* — a path where every two **consecutive edges differ in colour** (red/blue): **double each vertex** by incoming-edge colour, then run Dijkstra.
- **Property prove/disprove.** *(2025 Summer Mo'ed B, Q1b)* — after Dijkstra from `s`, does adding a positive-weight edge `(u,v)` necessarily change some `d[]`? *(2025 Sem-B Mo'ed B, Q3b — MC)* — a "longest-path" Dijkstra variant (`d = −∞`, max-heap, reversed relax): what can you infer? *(Answer: none of the options — greedy fails for longest paths.)*

> [!tip] The single most common shortest-path question
> When weights are **bounded integers** `w : E → {1..k}` with **constant `k`**, don't reach for Dijkstra — **split each edge into `k` unit edges and run BFS** for `Θ(|V| + |E|)`, beating Dijkstra's `O(|E| + |V|\log|V|)`. *(2023 Summer Mo'ed A, Q2a; 2024 Summer Mo'ed A, Q3e.)*
