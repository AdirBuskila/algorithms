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
visualization: topological-sort-visualization.html
vizHeight: 820
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

Topological sort shows up both as a **prove/disprove** claim (Question 1) and as an **MC** part (Question 3) — usually about existence, uniqueness, or comparing the lexicographic ascending vs descending sorts. Every topological-sort exam question to date:

- **Existence & method.** *(2023 Sem-B Mo'ed B, Q2)* — given pseudocode (= **Kahn**, with in-degrees and a queue): *(Q2a)* run it and record the print order + TRUE/FALSE; *(Q2b)* give a graph that returns FALSE (= has a cycle); *(Q2c)* identify what it computes (= a topological sort). *(2024 Sem-B Special Mo'ed, Q1a)* — a **root** in a directed graph ⟹ a topological sort exists. *Hint:* a root forces a vertex reaching all others, hence an acyclic order. **(Q3e — MC claims about a topological sort existing for every directed graph — false: only DAGs.)**
- **Reachability & uniqueness.** *(2022 Sem-B Mo'ed B, Q1a)* — prove/disprove: in a DAG **every** valid topological order is obtainable from `TOPOLOGICAL_SORT(G)`. *(2024 Sem-B Sample, Q1a — true)* — same claim: every topological order is obtainable from `TOPOLOGICAL_SORT`. *(2025 Summer Mo'ed A, Q3c — MC)* — on a DAG: existence of a sort, "two vertices with no path between them ⟺ two distinct sorts", and "a path through all vertices ⟹ a unique sort". *(2025 Summer Mo'ed B, Q1a)* — prove/disprove: if `u` precedes `v` in some topological order, does a path `u → v` necessarily exist? *Hint:* no — order is not a direct edge; find a counterexample.
- **Lexicographic variants & condensation.** *(2025 Sem-B Mo'ed A, Q3d — MC)* — two sorts (ascending vs descending lexicographic) of a task DAG: which task positions are shared. *(2024 Sem-B Mo'ed A, Q1b — false)* — `|E(G)| = |E(Gˢᶜᶜ)|` does **not** imply the condensation has a unique topological sort. *Hint:* equal edge counts say nothing about a Hamiltonian chain in `Gˢᶜᶜ`.

- **Counting orders from degrees.** *(2026 גרסה 2, Q3 section ג)* — two vertices of **in-degree 0** guarantee $\ge 2$ topological orders (either can open), and two vertices of **out-degree 0** guarantee $\ge 2$ as well (either can close). The **converse is false**: the diamond $a\to b$, $a\to c$, $b\to d$, $c\to d$ has a *single* source and a *single* sink yet two orders ($abcd$, $acbd$). Also: "$u$ before $v$ in **every** order" is equivalent to a **path** $u \rightsquigarrow v$ — not to a direct edge.

> [!tip] The uniqueness rule worth memorizing
> A DAG has a **unique** topological order **⟺ a directed path passes through all `|V|` vertices in sort order** (a Hamiltonian chain). To run the sort, build the [[Depth-First Search (DFS)|DFS]] finish times and reverse them; for cycle questions, remember that the order is defined **only** on a DAG — the condensation produced by [[Strongly Connected Components (SCC)]] is the canonical place a topological sort applies.
