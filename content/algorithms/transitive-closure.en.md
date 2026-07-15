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
visualization: transitive-closure-visualization.html
vizHeight: 780
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

Transitive closure appears in **~8 of 19** exams. From 2024 on it is almost always the **MC part Q3e** (a fixed "safe deposit" slot), and once it surfaced as an `O(|V|³)` design question. Below is **every** Topic-5 question across 2022–2025.

**Prove / disprove.**

- *(2022 Sem-B Mo'ed A, Q1b — false)* — if the transitive closure of `G₁` equals that of `G₂`, then `G₁ = G₂`. *Hint:* **false** — closures lose multiplicity/redundancy, so two different graphs with the same reachability are an easy counterexample (e.g. `1→2→3` versus `1→2→3` plus the redundant edge `1→3`).
- *(2025 Summer Mo'ed A, Q1a)* — a directed cycle on **more than 3 vertices** ⟹ `G*` contains an **additional** cycle that was not in `G`. *Hint:* on a `k`-cycle (`k > 3`), reachability makes every pair mutually reachable, so shortcut edges like `(1,3)` create shorter cycles absent from the original.

**Design question (`O(|V|³)`).**

- *(2024 Sem-B Mo'ed B, Q2b)* — test whether a directed graph is **"one-sided"**: for every pair `u, v` there is a path `u → v` **or** `v → u`. *Hint:* compute the closure with boolean Floyd-Warshall (`O(|V|³)`), then scan all pairs and verify `t[u][v] OR t[v][u]` holds for each. *(Q2a — add edges to a given graph; Q2c — correctness + complexity.)*

**Multiple choice (Q3e) — the recurring property bank.**

- *(2024 Sem-B Mo'ed A, Q3e)* — which **single edge** to add to `G₂` so that its transitive closure equals `G₁`'s. *Hint:* find the one reachable pair present in `G₁*` but missing from `G₂*`.
- *(2024 Sem-B Special Mo'ed, Q3e)* — claims about the closure, e.g. "`|E*| ≥ |E|`" and "a closure exists for every directed graph". *Hint:* both true — `E ⊆ E*` always, and the closure is well-defined for any digraph.
- *(2024 Summer Mo'ed B, Q3e)* / *(2024 Summer Mo'ed C, Q3e)* — the same transitive-closure claim bank as the Special Mo'ed.
- *(2025 Sem-B Mo'ed A, Q3e)* — the relation between `G` and `G*`: every `G` edge is in `G*`, the closure of a DAG stays acyclic, etc. *Hint:* lean on the two invariants below.

- *(2026 גרסה 2, Q3 section ד)* — **`G` and `G*` have exactly the same topological orders** (same set, same count): closure edges are already implied by reachability, so adding an edge **from** `G*` to `G` never changes the number of orders. But adding an edge **not** in `G*` (even one that keeps the graph acyclic) *can* collapse the count — take an isolated `a` plus `b→c`: three orders; add `a→b` and only `abc` survives.

> [!info] The golden rule
> **Boolean Floyd-Warshall computes the transitive closure in `O(|V|³)`** — it is literally the [[Floyd–Warshall Algorithm]] with `min → OR` and `+ → AND`. Memorize the two invariants every Q3e leans on: **every edge of `G` survives in `G*`** (`E ⊆ E*`, so `|E*| ≥ |E|`), and **the closure of a DAG stays acyclic**. On sparse graphs, `|V|` runs of BFS/DFS beat the cubic bound.
