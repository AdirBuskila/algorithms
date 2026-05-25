---
slug: bfs
order: 2
group: traversal
title: "Breadth-First Search (BFS)"
summary: "Explore a graph layer by layer to get shortest-path distances by edge count in an unweighted graph."
frequency: "6/19"
difficulty: medium
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

BFS shows up as a fill-in-the-blank pseudocode part, as a "design a linear algorithm" question on trees, and in prove/disprove claims about the BFS tree.

- **Path counting / shortest-path edges.** *(2022 Sem-B Mo'ed B, Q4a-b)* — fill in `BFS_update(G,s)` so it computes both `d[v]` and the number of shortest paths `p[v]`; *Hint:* on a next-layer neighbor, `p[v] += p[u]`. *(2023 Sem-B Mo'ed B, Q4a-b)* — draw the BFS tree and find all "redundant" edges (linear: BFS, then keep only `d[v] = d[u] + 1`).
- **Tree diameter & center.** *(2025 Sem-B Mo'ed B, Q2)* — linear algorithm for a tree **center** (vertex minimizing the maximum distance); *Hint:* find the diameter with two BFS, return its midpoint. *(Q2b — two centers can exist when the diameter is odd.)* *(2023 Sem-B Mo'ed B, Q1 — false)* — the "remove edge `(a,b)`, BFS from each, return `da+db+1`" diameter shortcut is **wrong** for a tree; find a counter-example.
- **Shortest cycle through `s`.** *(2023 Sem-B Special, Q2a-b)* — does a `BFS_update` returning the shortest cycle length through `s` work in a **directed** graph? And undirected? *Hint:* the difference is the edge back to the parent.
- **BFS tree structure (prove/disprove & MC).** *(2024 Sem-B Mo'ed B, Q1a)* — if every source `s` yields the same `π` from `BFS(G,s)`, must the number of connected components equal `|V|`? *(2025 Sem-B Mo'ed B, Q3c — MC)* — adding discovery/finish times to BFS: `b(π(v)) < b(v) < f(π(v)) < f(v)` (no full nesting like [[Depth-First Search (DFS)]]).

> [!tip] Tree diameter = two BFS
> BFS from any vertex to its farthest vertex `u`; BFS from `u` to its farthest vertex `v`. Then `dist(u,v)` is the **diameter**, and the **center** is the midpoint of the `u…v` path. This 2-BFS pattern is the answer to nearly every tree distance question.
