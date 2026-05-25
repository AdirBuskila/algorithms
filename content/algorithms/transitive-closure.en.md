---
slug: transitive-closure
order: 5
group: connectivity
title: "Transitive Closure"
summary: "The reachability graph G*: an edge (u,v) iff a directed path u→v exists in G."
frequency: "8/19"
difficulty: medium
complexity:
  time: 'O(|V|^3)'
  timeNote: "boolean Floyd-Warshall; or O(|V|·(|V|+|E|)) via BFS/DFS from each vertex"
  space: 'O(|V|^2)'
  spaceNote: "the V × V reachability matrix"
examFrequency: "Topic 5 · Transitive Closure — ~8/19 exams (often MC part 3e)"
---

**Goal:** build the **transitive closure** `G* = (V, E*)`, where `(u, v) ∈ E*` **iff** there is a directed path `u → v` in `G` (i.e. `v` is **reachable** from `u`).

- `G*` is exactly the **reachability** relation — it answers "can I get from `u` to `v`?" for every pair at once.
- **Every edge of `G` is preserved**: `E ⊆ E*` always (a single edge is a length-1 path). But `|E| < |E*|` is **not** always strict — if `G` is already transitive, `E = E*`.
- The closure of a **DAG stays acyclic**: a cycle in `G*` would require a cycle in `G`.

## How it works

**Method 1 — boolean Floyd-Warshall (`O(|V|³)`).** Take the [[Floyd–Warshall Algorithm]] recurrence and replace `min/+` with the boolean `OR/AND`:

1. Initialize `t[i][j] = true` if `(i, j) ∈ E` or `i = j`, else `false`.
2. For each intermediate vertex `k = 1..n`, for every pair `i, j`: set `t[i][j] = t[i][j] OR (t[i][k] AND t[k][j])`.
3. After the last `k`, `t[i][j]` tells you whether `j` is reachable from `i`.

**Method 2 — `|V|` traversals (`O(|V|·(|V|+|E|))`).** Run [[Breadth-First Search (BFS)|BFS]] or [[Depth-First Search (DFS)|DFS]] once from **each** vertex; everything visited from `u` is exactly the row of `u` in `G*`. Faster than `O(|V|³)` on **sparse** graphs.

## Pseudocode

```text
TRANSITIVE-CLOSURE(G):          # boolean Floyd-Warshall
    for all i, j:
        t[i][j] ← (i = j) OR ((i, j) ∈ E)
    for k ← 1 to n:
        for i ← 1 to n:
            for j ← 1 to n:
                t[i][j] ← t[i][j] OR (t[i][k] AND t[k][j])
    return t
```

## Example

Path graph `1 → 2 → 3`. Its closure adds the reachability edge `1 → 3`:

| reachable? | 1 | 2 | 3 |
|---|---|---|---|
| **1** | – | ✓ | ✓ |
| **2** | – | – | ✓ |
| **3** | – | – | – |

So `E = {(1,2), (2,3)}` but `E* = {(1,2), (2,3), (1,3)}` — the extra edge `(1,3)` is the new path that was implicit in `G`.

> [!note] Why `OR/AND` instead of `min/+`?
> Floyd-Warshall asks "is there a **shorter** path through `k`?" Transitive closure asks the boolean version: "is there **any** path through `k`?" Replacing addition by AND (both legs must exist) and minimum by OR (any route suffices) turns the same triple loop into a reachability solver.

## On the exam

Transitive closure almost always appears as **MC part 3e** (from 2024 onward), or as an `O(|V|³)` design question. The recurring properties are the heart of it.

- **Properties of `G*` (MC).** *(2025 Sem-B Mo'ed A, Q3e)* — the relation between `G` and `G*`: every `G` edge is in `G*`, the closure of a DAG stays acyclic, etc. *(2024 Sem-B Special / Summer Mo'ed B / Summer Mo'ed C, Q3e)* — claims such as "`|E*| ≥ |E|`" and "a closure exists for every directed graph".
- **Comparing reachability / adding edges.** *(2022 Sem-B Mo'ed A, Q1b — false)* — equal transitive closures do **not** imply `G₁ = G₂`. *(2024 Sem-B Mo'ed A, Q3e — MC)* — which single edge to add to `G₂` so that `G₂* = G₁*`. *(2025 Summer Mo'ed A, Q1a)* — a directed cycle on more than 3 vertices ⟹ `G*` contains an **additional** cycle not in `G`.
- **Design question.** *(2024 Sem-B Mo'ed B, Q2b)* — `O(|V|³)` test of whether a directed graph is "one-sided" (for all `u, v` there is a path `u → v` or `v → u`): compute the closure with boolean Floyd-Warshall, then check one direction holds per pair.

> [!info] The reusable fact
> **Boolean Floyd-Warshall computes the transitive closure in `O(|V|³)`** — it is literally the [[Floyd–Warshall Algorithm]] with `min → OR` and `+ → AND`. Remember two invariants the MC parts lean on: **every edge of `G` survives in `G*`** (`E ⊆ E*`), and **the closure of a DAG stays acyclic**. On sparse graphs, `|V|` runs of BFS/DFS beat the cubic bound.
