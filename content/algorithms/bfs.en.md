---
slug: bfs
order: 2
group: traversal
title: "Breadth-First Search (BFS)"
summary: "Explore a graph layer by layer to get shortest-path distances by edge count in an unweighted graph."
frequency: "6/19"
difficulty: medium
visualization: bfs-visualization.html
vizHeight: 800
complexity:
  time: 'O(|V| + |E|)'
  timeNote: "each vertex enqueued once, each edge scanned once"
  space: 'O(|V|)'
  spaceNote: "the queue + dist[] / π[] arrays"
examFrequency: "Topic 2 · BFS — ~6/19 exams"
---

**Goal:** from a source `s`, compute the **layer distance** `d[v] = δ(s,v)` — the fewest **edges** on any `s→v` path in an **unweighted** graph — and build the BFS tree via `π`.

- Visits vertices in order of increasing distance, so the queue is always **layered**: values differ by at most 1.
- For weighted shortest paths use [[Dijkstra's Algorithm]] instead; BFS is the unweighted special case (every edge has weight 1).
- Compare with [[Depth-First Search (DFS)]]: BFS uses a **queue** and explores by distance, DFS uses recursion and explores by depth.

## How it works

1. Color every vertex **white**, set `d[v] = ∞` and `π[v] = NIL`.
2. Set `d[s] = 0`, color `s` **gray**, and enqueue `s`.
3. While the queue is non-empty, dequeue `u`. For each neighbor `v` in `Adj[u]` that is still white: color it gray, set `d[v] = d[u] + 1`, set `π[v] = u`, and enqueue `v`.
4. Color `u` **black** once all its neighbors are processed. The first time `u` is enqueued, `d[u]` already equals `δ(s,u)`.

## Pseudocode

```text
BFS(G, s):
    for each v in V:
        d[v] <- ∞;  π[v] <- NIL;  color[v] <- WHITE
    d[s] <- 0;  color[s] <- GRAY
    Q <- {s}
    while Q ≠ ∅:
        u <- DEQUEUE(Q)
        for each v in Adj[u]:
            if color[v] = WHITE:
                color[v] <- GRAY
                d[v] <- d[u] + 1
                π[v] <- u
                ENQUEUE(Q, v)
        color[u] <- BLACK
```

## Applications

- **Shortest-path edges.** An edge `(u,v)` lies on **some** shortest path from `s` **⇔** `d[v] = d[u] + 1`. Any edge that fails this test is "redundant" (on no shortest path).
- **Counting shortest paths.** Keep an extra array `p[v]` with `p[s] = 1`. When you reach a next-layer neighbor `v` from `u` (i.e. `d[v] = d[u] + 1`), accumulate `p[v] += p[u]`. At the end `p[v]` is the number of shortest `s→v` paths.
- **Tree diameter & center (2-BFS).** BFS from any vertex to find the farthest vertex `u`; BFS again from `u` to find the farthest vertex `v`. The path `u…v` is a **diameter**, `dist(u,v)` is its length, and its **midpoint** is a center.

## Example

Unweighted graph, source = **A**, layers by distance:

| Layer `d` | Vertices | Notes |
|---|---|---|
| 0 | A | the source |
| 1 | B, C | direct neighbors of A |
| 2 | D, E | reached from B or C |
| 3 | F | reached from D |

If both B **and** C connect to D, then `p[D] = p[B] + p[C] = 1 + 1 = 2`: there are **two** shortest paths from A to D.

> [!note] Why the queue stays layered
> A vertex is enqueued exactly when it is first discovered, so its distance is fixed at that moment. Since we always dequeue the oldest (smallest-distance) vertex first, distances in the queue never differ by more than 1.

## On the exam

BFS shows up as a fill-in-the-blank pseudocode part, as a "design a linear algorithm" question on trees, and in prove/disprove + multiple-choice claims about the BFS tree. Across the 2022–2025 exams (~6/19), every BFS appearance is one of the following.

- **Path counting & shortest-path / redundant edges.**
  - *(2022 Sem-B Mo'ed B, Q4a)* — fill in the blanks of `BFS_update(G,s)` so it computes both `d[v]` and the number of shortest paths `p[v]` from `s`; *Hint:* when relaxing a next-layer neighbor, `p[v] += p[u]`. *(Q4b)* — complexity.
  - *(2023 Sem-B Mo'ed B, Q4a)* — draw the BFS tree from `s` and identify all "redundant" edges (on no shortest path). *(Q4b)* — a linear algorithm finding them all: run BFS, then keep only edges with `d[v] = d[u] + 1`.
- **Tree diameter & center (2-BFS).**
  - *(2025 Sem-B Mo'ed B, Q2)* — linear algorithm for a tree **center** (vertex minimizing the maximum distance); *Hint:* find the diameter with two BFS, return its midpoint. *(Q2b)* — can there be two centers? **yes**, when the diameter is odd.
  - *(2023 Sem-B Mo'ed B, Q1)* — **false:** the "remove edge `(a,b)`, BFS from `a` and from `b`, return `da+db+1`" diameter shortcut is **wrong** for a tree; find a counter-example.
- **Shortest cycle through `s`.**
  - *(2023 Sem-B Special Mo'ed, Q2a)* — does a `BFS_update` returning the shortest-cycle length through `s` work in a **directed** graph? proof + complexity or counter-example. *(Q2b)* — same for an **undirected** graph; *Hint:* the difference is the edge back to the parent.
- **BFS tree structure (prove/disprove & MC).**
  - *(2024 Sem-B Mo'ed B, Q1a)* — if every source `s` yields the same `π` from `BFS(G,s)`, must the number of connected components equal `|V|`?
  - *(2025 Sem-B Mo'ed B, Q3c — MC)* — adding discovery/finish times `b(v)/f(v)` to BFS: how do they relate to the parent's? *Hint:* `b(π(v)) < b(v) < f(π(v)) < f(v)` (no full nesting like in [[Depth-First Search (DFS)]]).

> [!tip] Tree diameter = two BFS
> BFS from any vertex to its farthest vertex `u`; BFS from `u` to its farthest vertex `v`. Then `dist(u,v)` is the **diameter**, and the **center** is the midpoint of the `u…v` path. This 2-BFS pattern is the answer to nearly every tree distance question.
