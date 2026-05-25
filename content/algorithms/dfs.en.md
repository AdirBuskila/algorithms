---
slug: dfs
order: 1
group: traversal
title: "Depth-First Search (DFS)"
summary: "Explore a graph as deeply as possible before backtracking — the engine behind times, edge classification, and orientation."
frequency: "9/19"
difficulty: medium
complexity:
  time: 'O(|V| + |E|)'
  timeNote: "one discovery + one finish per vertex, one scan per edge"
  space: 'O(|V|)'
  spaceNote: "recursion stack + color / d[] / f[] arrays"
examFrequency: "Topic 1 · DFS — ~9/19 exams"
---

**Goal:** visit every vertex by going **as deep as possible** before backtracking, recording a **discovery time** `d[v]` and a **finish time** `f[v]` for each vertex.

- Builds a **DFS tree** (or a **DFS forest** if the graph is disconnected): `π[v]` is the parent of `v`.
- The two timestamps `d[v] < f[v]` and the resulting parenthesis structure are the real exam payload — most questions reason about times, not about the traversal itself.
- ⚠️ In a **directed** graph DFS produces four edge types; in an **undirected** graph it produces only **tree** and **back** edges.

## How it works

1. Color every vertex **white**, set `π[v] = NIL`, and reset a global `time = 0`.
2. Run the main loop over all vertices (in some order); for each still-white vertex `v`, call `DFS-Visit(v)` — each such call starts a new tree in the forest.
3. On entering `DFS-Visit(u)`: color `u` **gray** and set `d[u] = ++time`.
4. For each neighbor `v` in `Adj[u]`: if `v` is white, set `π[v] = u` and recurse into `DFS-Visit(v)`.
5. When all of `u`'s neighbors are processed: color `u` **black** and set `f[u] = ++time`.

## Pseudocode

```text
DFS(G):
    for each v in V:
        color[v] <- WHITE;  π[v] <- NIL
    time <- 0
    for each v in V (in some order):
        if color[v] = WHITE:
            DFS-Visit(v)

DFS-Visit(u):
    color[u] <- GRAY
    time <- time + 1;  d[u] <- time
    for each v in Adj[u]:
        if color[v] = WHITE:
            π[v] <- u
            DFS-Visit(v)
    color[u] <- BLACK
    time <- time + 1;  f[u] <- time
```

**Edge classification (directed graph)** — read off from the timestamps:

| Type | Condition on $d, f$ | Meaning |
|---|---|---|
| **Tree** | $\pi[v]=u$ | edge of the DFS tree |
| **Back** | $d[v]<d[u]\leq f[u]<f[v]$ | back to an ancestor; **a cycle exists ⇔ a back edge exists** |
| **Forward** | $d[u]<d[v]<f[v]<f[u]$ | shortcut down to a descendant |
| **Cross** | $f[v]<d[u]$ | between two disjoint subtrees |

> [!note] The parenthesis theorem
> For every pair $u,v$, the intervals $[d[u],f[u]]$ and $[d[v],f[v]]$ are either **disjoint** (no ancestor–descendant relation) or **nested** (one contains the other). They never partially overlap.

> [!info] The white-path theorem
> $v$ is a descendant of $u$ in the DFS tree **⇔** at time $d[u]$ there is a path from $u$ to $v$ consisting entirely of **white** vertices. This is the standard proof tool for "same tree / same component" claims.

## Applications

- **Cycle detection / DAG test.** A directed graph has a cycle **⇔** DFS finds at least one back edge — equivalently, $G$ is a DAG ⇔ no back edge — and processing vertices by decreasing finish time gives a [[Topological Sort]].
- **Articulation points (cut vertices).** Removing a vertex whose subtree has no back edge "above" it disconnects the graph. Watch the trap: a vertex with several children can still be safe if a child reconnects upward via a back edge.
- **Orienting an undirected graph into a DAG.** Direct each edge from the **earlier-discovered** endpoint to the later-discovered one. Since undirected DFS yields only tree/back edges, every edge points "forward" in discovery order, so no directed cycle can form.

## On the exam

DFS is the prove-or-disprove engine of **Question 1a** — claims about the DFS tree, timestamps, edge classification, and articulation points, plus a complexity-by-structure multiple-choice part.

- **Prove/disprove on the DFS tree & times.** *(2025 Sem-B Mo'ed A, Q1a)* — if a path `x→y` exists in a **directed** graph, must `f(x)>f(y)` in *every* DFS run? *(False — a cycle gives a path `y→x` too, so starting at `y` yields `f(y)>f(x)`.)* *(2022 Sem-B Mo'ed C, Q1a)* — in an undirected graph with a clique, do all clique vertices lie consecutively on one DFS-tree path? *(2023 Sem-B Special, Q1)* — relate `Gᵀ` discovery order to the topological order.
- **Articulation points.** *(2023 Summer Mo'ed A, Q1a-b)* — removing all vertices on the tree path `s…a` disconnects an undirected connected graph; does removing only `a` disconnect it? *(2024 Summer Mo'ed A, Q1a — false)* — a vertex `a≠s` with more than one child need **not** be a cut vertex; *Hint:* a child can reconnect via a back edge.
- **Orientation to a DAG.** *(2022 Sem-B Mo'ed C, Q1b; 2023 Summer Mo'ed A, Q4b)* — orient each edge from earlier- to later-discovered vertex and prove the result is acyclic. *Hint:* undirected DFS yields only tree/back edges, so the orientation never closes a cycle.
- **Complexity by structure (MC).** *(2024 Sem-B Mo'ed A, Q3d)* — DFS/BFS cost as a function of out-degree: degree $\Theta(n)$ (e.g. $\lceil n/4\rceil$) gives $|E|=\Theta(n^2)$ so $\Theta(n^2)$; **constant** degree gives $\Theta(n)$; "**at most** $\lceil n/4\rceil$" → cannot be determined.

> [!tip] The golden rule for DFS proofs
> In an **undirected** graph, DFS yields only **tree and back** edges (never forward/cross). The **parenthesis theorem** on the intervals $[d[v], f[v]]$ and the **white-path theorem** are your two proof tools — reach for them before trying a counter-example.
