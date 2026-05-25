---
slug: floyd-warshall
order: 9
group: shortest-paths
title: "Floyd–Warshall Algorithm"
summary: "All-pairs shortest paths via dynamic programming over an intermediate vertex k."
frequency: "14/19"
difficulty: hard
negativeEdges: true
visualization: floyd-warshall-visualization.html
vizHeight: 760
complexity:
  time: 'O(V^3)'
  timeNote: "three nested loops over k, i, j"
  space: 'O(V^2)'
  spaceNote: "the V × V distance matrix"
examFrequency: "Topic 6 · Shortest Paths — recurring MC part 3d"
---

**Goal:** shortest path between **all pairs** of vertices (all-pairs shortest paths) — not just from one source.

- ✅ **Handles negative edge weights.**
- ❌ **Cannot handle negative cycles.**
- **Dynamic programming** over an intermediate vertex `k`.

> [!note] Where it sits among the three
> | Algorithm | Finds | Negative edges |
> |---|---|---|
> | [[Dijkstra's Algorithm\|Dijkstra]] | one node → all nodes | ❌ |
> | [[Bellman-Ford Algorithm\|Bellman–Ford]] | one node → all nodes | ✅ |
> | **Floyd–Warshall** | **all pairs** of vertices | ✅ |

## How it works

Keep a `V × V` matrix `dist`, where `dist[i][j]` is the best known distance from `i` to `j`. Then, one intermediate vertex `k` at a time, ask: *is it shorter to go from `i` to `j` by routing through `k`?*

$$\text{dist}[i][j] = \min\big(\text{dist}[i][j],\ \text{dist}[i][k] + \text{dist}[k][j]\big)$$

After allowing every vertex `1…V` as an intermediate, `dist` holds every shortest distance.

## Pseudocode

```text
let V = number of vertices in graph
let dist = V × V array of minimum distances initialized to ∞

for each vertex v
    dist[v][v] ← 0                 // a node reaches itself at cost 0
for each edge (u, v)
    dist[u][v] ← weight(u, v)      // fill in the direct edges

for k from 1 to V                  // intermediate vertex
    for i from 1 to V              // source
        for j from 1 to V          // destination
            if dist[i][j] > dist[i][k] + dist[k][j]
                dist[i][j] ← dist[i][k] + dist[k][j]
            end if
```

The matrix is read as **rows = "from" vertex**, **columns = "to" vertex**, so `dist[i][j]` lives at row `i`, column `j`.

## Example

Graph edges: `2→1 (4)`, `1→3 (−2)`, `2→3 (3)`, `3→4 (2)`, `4→2 (−1)`. Put `0` on the diagonal, drop each edge weight into its cell, leave the rest `∞`:

| from \ to | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| **1** | 0 | ∞ | −2 | ∞ |
| **2** | 4 | 0 | 3 | ∞ |
| **3** | ∞ | ∞ | 0 | 2 |
| **4** | ∞ | −1 | ∞ | 0 |

Sweep `k = 1 → 4`; each pass reads row `k` and column `k` and improves any cell it can. A few updates (the rest follow the same `if dist[i][j] > dist[i][k] + dist[k][j]` test):

- **`k = 1`:** `dist[2][3]` → `4 + (−2)` = **2** (beats 3).
- **`k = 2`:** `dist[4][1]` → `−1 + 4` = **3** (was ∞); `dist[4][3]` → `−1 + 2` = **1**.
- **`k = 3`:** `dist[1][4]` → `−2 + 2` = **0**; `dist[2][4]` → `2 + 2` = **4**.
- **`k = 4`:** `dist[1][2]` → `0 + (−1)` = **−1**; `dist[3][2]` → `2 + (−1)` = **1**.

**Final matrix** (all-pairs shortest distances):

| from \ to | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| **1** | 0 | −1 | −2 | 0 |
| **2** | 4 | 0 | 2 | 4 |
| **3** | 5 | 1 | 0 | 2 |
| **4** | 3 | −1 | 1 | 0 |

> [!tip] Detecting a negative cycle
> After the algorithm finishes, if any diagonal entry `dist[v][v] < 0`, then `v` lies on a negative cycle — a path that leaves `v` and returns having *lost* total weight.

## On the exam

Floyd–Warshall is the **multiple-choice regular** — almost every 2024–2025 exam has a part **3d** that reads or reconstructs a Floyd–Warshall matrix (sub-topic **6c**). Every 6c question:

- **Meaning of `D⁽ᵏ⁾[i][j]`.** *(2024 Summer Mo'ed A, Q3d)* — what is `D⁽²⁾[1][4]`? *Hint:* the lightest `1→4` path using **only `1, 2`** as intermediate vertices. The superscript `k` = "intermediates allowed from `{1..k}`" answers these instantly.
- **Path reconstruction from the predecessor matrix `P`.** *(2024 Sem-B Sample, Q3d)* — reconstruct a shortest path from `P`; *Hint:* follow `P[i][j]` back from `j` to `i`. *(2024 Sem-B Mo'ed B / Special Mo'ed, Q3d; 2024 Summer Mo'ed B / C, Q3d)* — reconstruct/interpret the matrix (shortest path between two vertices). *(2025 Summer Mo'ed B, Q3d)* — reconstruct path `1→6` from a 7-vertex predecessor matrix.
- **Did `k` land on a shortest path?** *(2025 Summer Mo'ed A, Q1c)* — prove/disprove: if iteration `k` performed `D[i][j] = D[i][k] + D[k][j]`, then `k` lies on a shortest `i→j` path in `G`.

> [!tip] It also computes transitive closure
> Replace `min / +` with boolean `OR / AND` and Floyd–Warshall becomes **reachability** in `O(|V|^3)` — the boolean [[Transitive Closure|transitive closure]] `G*`, a recurring Topic-5 design question.
