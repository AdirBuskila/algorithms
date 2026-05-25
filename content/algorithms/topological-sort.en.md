---
slug: topological-sort
order: 4
group: connectivity
title: "Topological Sort"
summary: "Linear ordering of a DAG's vertices so every edge points forward; exists iff the graph is acyclic."
frequency: "8/19"
difficulty: easy
complexity:
  time: 'O(|V| + |E|)'
  timeNote: "DFS by finish times, or Kahn by in-degrees"
  space: 'O(|V|)'
  spaceNote: "the order array + in-degree counts / queue"
examFrequency: "Topic 4 · Topological Sort — ~8/19 exams"
---

**Goal:** order the vertices of a directed graph in a line so that **every edge `(u → v)` points forward** (`u` appears before `v`).

- Exists **iff the graph is a DAG** — a directed graph is topologically sortable ⟺ it has no directed cycle.
- A by-product of the search is **cycle detection**: if no valid order exists, the graph contains a cycle (a back edge under DFS, or leftover vertices under Kahn).
- The order is usually **not unique** — there can be many valid topological orders for the same DAG.

## How it works

**Method 1 — DFS by finish times.**

1. Run [[Depth-First Search (DFS)|DFS]] on the graph.
2. Whenever a vertex `u` **finishes** (turns black), prepend it to a list `L`.
3. At the end, `L` is a topological order (vertices in **decreasing** finish time `f[]`).

**Method 2 — Kahn's algorithm (by in-degrees).**

1. Compute the **in-degree** of every vertex; enqueue all vertices with in-degree 0.
2. Repeatedly dequeue a vertex `u`, append it to the output, and **decrement** the in-degree of each neighbor `v`; if `v` reaches 0, enqueue it.
3. If all `|V|` vertices were output → valid order. If some never reached in-degree 0 → the graph has a **cycle**.

## Pseudocode

```text
TOPOLOGICAL-SORT-DFS(G):
    DFS(G)
    when a vertex u finishes (turns black):
        prepend u to list L
    return L                         # decreasing finish time f[]

TOPOLOGICAL-SORT-KAHN(G):
    compute in-degree[v] for all v
    Q ← all v with in-degree[v] = 0
    while Q ≠ ∅:
        u ← DEQUEUE(Q); append u to output
        for each (u, v) ∈ E:
            in-degree[v] -= 1
            if in-degree[v] = 0: ENQUEUE(Q, v)
    if output has < |V| vertices: return "CYCLE"   # not a DAG
```

## Example

DAG with edges `A → B`, `A → C`, `B → D`, `C → D`. Running Kahn:

| Step | in-deg 0 queue | Dequeued | Output so far |
|---|---|---|---|
| init | {A} | — | () |
| 1 | {B, C} | A | (A) |
| 2 | {C} | B | (A, B) |
| 3 | {D} | C | (A, B, C) |
| 4 | {} | D | (A, B, C, D) |

Valid order: `A, B, C, D`. (`A, C, B, D` is also valid — the sort is **not unique** here, since `B` and `C` have no path between them.)

> [!info] When is the order unique?
> A **unique** topological order ⟺ a directed **(Hamiltonian) path visits all vertices in that order** — i.e. there is an edge between every two consecutive vertices in the sort. If any two vertices have no path between them, you can swap them and get a second valid order.

## On the exam

Topological sort shows up both as a **prove/disprove** claim (Question 1) and as an **MC** part — usually about existence, uniqueness, or comparing the lexicographic ascending vs descending sorts.

- **Existence & method.** *(2023 Sem-B Mo'ed B, Q2)* — given Kahn's pseudocode: run it, give a graph that returns FALSE (= has a cycle), and identify that it computes a topological sort. *(2024 Sem-B Special Mo'ed, Q1a)* — a root in a directed graph ⟹ a topological sort exists.
- **Reachability & uniqueness.** *(2022 Sem-B Mo'ed B, Q1a / 2024 Sem-B Sample, Q1a — true)* — every valid topological order is obtainable from `TOPOLOGICAL_SORT`. *(2025 Summer Mo'ed A, Q3c — MC)* — "two vertices with no path between them ⟺ two distinct sorts" and "a path through all vertices ⟹ a unique sort". *(2025 Summer Mo'ed B, Q1a)* — if `u` precedes `v` in some order, does a path `u → v` necessarily exist? *(no — order ≠ direct edge.)*
- **Lexicographic variants & condensation.** *(2025 Sem-B Mo'ed A, Q3d — MC)* — ascending vs descending lexicographic sorts of a task DAG: which positions are shared. *(2024 Sem-B Mo'ed A, Q1b — false)* — `|E(G)| = |E(Gˢᶜᶜ)|` does **not** imply the condensation has a unique topological sort.

> [!tip] The uniqueness rule worth memorizing
> A DAG has a **unique** topological order **⟺ a directed path passes through all `|V|` vertices in sort order** (a Hamiltonian chain). To run the sort, build the [[Depth-First Search (DFS)|DFS]] finish times and reverse them; for cycle questions, remember that the order is defined **only** on a DAG — the condensation produced by [[Strongly Connected Components (SCC)]] is the canonical place a topological sort applies.
