---
slug: dfs
order: 1
group: traversal
title: "Depth-First Search (DFS)"
summary: "Explore a graph as deeply as possible before backtracking — the engine behind times, edge classification, and orientation."
frequency: "9/19"
difficulty: medium
visualization: dfs-visualization.html
vizHeight: 860
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

## Edge classification (directed graph)

Every edge is classified **relative to the DFS tree** — the tree built from the edges DFS actually used to discover new vertices. Each remaining edge is named by where it "jumps" relative to that tree. The fastest way to classify an edge `u→v` *while the run is happening* is by the **color of `v`** the moment you scan the edge; the timestamps then confirm it.

| Type | Color of `v` when `u→v` is scanned | Timestamps ($d$ = discovery, $f$ = finish) | Meaning |
|---|---|---|---|
| **Tree** | white (undiscovered) | $d[u]<d[v]<f[v]<f[u]$ | the edge DFS walked through to discover `v` |
| **Back** | gray (still on the stack — an ancestor) | $d[v]<d[u]\leq f[u]<f[v]$ | back up to an ancestor; **a cycle exists ⇔ a back edge exists** |
| **Forward** | black, with $d[u]<d[v]$ (inside `u`'s subtree) | $d[u]<d[v]<f[v]<f[u]$ | shortcut down to a descendant |
| **Cross** | black, with $d[u]>d[v]$ (finished earlier) | $f[v]<d[u]$ | between two disjoint subtrees |

The **gray test** is the one that comes up constantly: in a directed graph a **cycle exists ⇔ DFS finds a back edge**. Notice tree and forward edges share the *same* nesting $d[u]<d[v]<f[v]<f[u]$ — it's the color of `v` (white vs black) that separates them.

![DFS edge classification: tree edges A→B→C→D and A→E→F, with D→B back, A→C forward, F→C cross](/images/dfs-edge-classification.svg)

In the picture the solid gray edges are the DFS tree (DFS went A→B→C→D, backtracked, then A→E→F). **D→B** points back to an ancestor (*back*), **A→C** shortcuts down to a descendant already reached the long way (*forward*), and **F→C** jumps between two different subtrees (*cross*).

> [!tip] Self-check
> Suppose the same DFS instead explored E's subtree **before** B's. What does edge **F→C** become? *Answer:* a **tree** edge — C is still white when F scans it, so DFS discovers C through F.

> [!note] The parenthesis theorem
> For every pair $u,v$, the intervals $[d[u],f[u]]$ and $[d[v],f[v]]$ are either **disjoint** (no ancestor–descendant relation) or **nested** (one contains the other). They never partially overlap.

> [!info] The white-path theorem
> $v$ is a descendant of $u$ in the DFS tree **⇔** at time $d[u]$ there is a path from $u$ to $v$ consisting entirely of **white** vertices. This is the standard proof tool for "same tree / same component" claims.

## Applications

- **Cycle detection / DAG test.** A directed graph has a cycle **⇔** DFS finds at least one back edge — equivalently, $G$ is a DAG ⇔ no back edge — and processing vertices by decreasing finish time gives a [[Topological Sort]].
- **Articulation points (cut vertices).** Removing a vertex whose subtree has no back edge "above" it disconnects the graph. Watch the trap: a vertex with several children can still be safe if a child reconnects upward via a back edge.
- **Orienting an undirected graph into a DAG.** Direct each edge from the **earlier-discovered** endpoint to the later-discovered one. Since undirected DFS yields only tree/back edges, every edge points "forward" in discovery order, so no directed cycle can form.

## On the exam

DFS is the prove-or-disprove engine of **Question 1a** and the workhorse of the linear-algorithm **Question 2** — claims about the DFS tree/forest, timestamps, edge classification, articulation points, and orientation, plus a complexity-by-structure multiple-choice part. Across the 2022–2025 exams (~9/19), every DFS appearance is one of the following.

- **Prove/disprove on the DFS tree, forest & times.**
  - *(2025 Sem-B Mo'ed A, Q1a)* — if a path `x→y` exists in a **directed** graph, must `f(x)>f(y)` in *every* DFS run? *Hint:* **false** — a back edge / cycle gives a path `y→x` too, so starting at `y` yields `f(y)>f(x)`.
  - *(2022 Sem-B Mo'ed C, Q1a)* — in an undirected graph with a clique, do all clique vertices appear **consecutively** on one path of the DFS tree? *Hint:* white-path theorem.
  - *(2023 Sem-B Mo'ed A, Q1)* — for every undirected graph with `n>5`, is there a DFS run where #back-edges = #simple-cycles? *Hint:* compare how many independent cycles back edges can certify.
  - *(2023 Sem-B Mo'ed A, Q2a)* — does DFS on a "directed tree" (single root, all others in-degree 1) produce only **tree** edges? *Hint:* no back/forward/cross can form.
  - *(2023 Sem-B Special Mo'ed, Q1)* — in a DAG with `Gᵀ`, if DFS on `Gᵀ` discovers `x` before `y`, is there no edge `x→y` in `G`? *Hint:* relate `Gᵀ` discovery order to the topological order.
- **Articulation points (cut vertices).**
  - *(2023 Summer Mo'ed A, Q1a)* — prove that removing **all** vertices on the tree path `s…a` (with their edges) disconnects an undirected connected graph. *(Q1b)* — does removing only `a` disconnect it? prove/disprove (articulation point).
  - *(2024 Summer Mo'ed A, Q1a)* — **false:** a vertex `a≠s` with more than one child need **not** be a cut vertex; *Hint:* a child can reconnect upward via a back edge.
- **Orientation of an undirected graph to a DAG.**
  - *(2022 Sem-B Mo'ed C, Q1b; 2023 Summer Mo'ed A, Q4b)* — orient each edge from the earlier- to the later-discovered vertex and prove the result is acyclic, with correctness and complexity. *Hint:* undirected DFS yields only tree/back edges, so the "forward in discovery order" orientation never closes a cycle.
- **Design a linear `O(|V|+|E|)` algorithm (DFS-based).**
  - *(2022 Sem-B Sample, Q4a)* — does a DFS run exist whose DFS forest has `≥k` trees (YES/NO), with correctness and complexity? *Hint:* the minimum tree count relates to the number of source components in the condensation. *(Q4b)* — demonstrate the run for `k=3`.
  - *(2022 Sem-B Mo'ed C, Q2a)* — produce a vertex-deletion order for an undirected connected graph so it stays connected after each deletion. *Hint:* delete in reverse order of DFS finish (leaves first). *(Q2b)* — correctness + complexity.
  - *(2023 Sem-B Mo'ed A, Q2b)* — decide whether a directed graph is a directed tree (single root + acyclic + in-degrees), with idea and correctness.
  - *(2024 Sem-B Mo'ed A, Q2)* — minimum #edges to add to connect all vertices of a set `S`: count components containing an `S`-vertex, return `count−1`. *(Q2c)* — correctness + complexity.
- **Reading a DFS run (MC).**
  - *(2024 Sem-B Sample, Q3e)* — given a parent array `π` from DFS on a 10-vertex undirected graph, identify the 3 connected components.
- **Complexity by structure (MC).**
  - *(2024 Sem-B Mo'ed A, Q3d)* — DFS/BFS cost as a function of out-degree: degree $\Theta(n)$ (e.g. $\lceil n/4\rceil$) gives $|E|=\Theta(n^2)$ so $\Theta(n^2)$; **constant** degree gives $\Theta(n)$; "**at most** $\lceil n/4\rceil$" → cannot be determined.

> [!tip] The golden rule for DFS proofs
> In an **undirected** graph, DFS yields only **tree and back** edges (never forward/cross). The **parenthesis theorem** on the intervals $[d[v], f[v]]$ and the **white-path theorem** are your two proof tools — reach for them before trying a counter-example.
