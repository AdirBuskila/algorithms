---
slug: dp-on-graphs
order: 14
group: approximation
title: "Dynamic Programming on Graphs"
summary: "Write an explicit DP recurrence for a path/walk problem with an edge-count constraint — a layered Bellman-Ford."
frequency: "1/19"
difficulty: hard
complexity:
  time: 'O(k \cdot |E|)'
  timeNote: "a table over (vertex, #edges-used); k = the edge-count bound"
  space: 'O(|V| \cdot k)'
  spaceNote: "the DP table — O(|V|) with rolling rows"
examFrequency: "Topic 10 · DP on graphs — 1/19 exams (rare)"
visualization: dp-on-graphs-visualization.html
vizHeight: 820
---

**Goal:** state an **explicit DP recurrence** for a path/walk problem with an **edge-count constraint**, then prove it correct and analyze its table.

- The canonical instance: the **lightest walk** (repeats allowed) `s→t` using **exactly `k` edges**.
- The recurrence indexes by **(vertex, number of edges used)** — this is just a **layered** [[Bellman-Ford Algorithm|Bellman-Ford]].
- This is one of the few topics where the exam wants the DP written out by hand, not invoked as a black box.

## How it works

1. **Define the table.** Let $d(v, j)$ = weight of the lightest walk from `s` to `v` using **exactly `j` edges** (walks may repeat vertices and edges).
2. **Base case.** $d(s, 0) = 0$, and $d(v, 0) = \infty$ for every $v \neq s$ (with 0 edges you can only sit at the source).
3. **Recurrence.** A `j`-edge walk to `v` is a `(j-1)`-edge walk to some predecessor `u` followed by the edge $(u, v)$:
   $$d(v, j) = \min_{(u,v)\in E}\big\{\, d(u, j-1) + w(u, v) \,\big\}$$
4. **Fill in layers.** Compute layer `j = 1, 2, …, k` in order; each layer scans every edge once.
5. **Read the answer.** $d(t, k)$ is the lightest `s→t` walk with exactly `k` edges (∞ if none exists).

> [!note] Why "exactly `k`" needs *walks*, not simple paths
> A simple path has at most $|V|-1$ edges, so "exactly `k` edges" with large `k` would be impossible for paths. Allowing **walks** (repeats) makes the recurrence clean: layer `j` only ever looks one edge back into layer `j-1`, with no "have I visited this vertex?" bookkeeping.

## Pseudocode

```text
LIGHTEST-WALK(G, w, s, t, k):
    for each v in V:
        d[v][0] ← ∞
    d[s][0] ← 0
    for j ← 1 to k:
        for each v in V:
            d[v][j] ← ∞
        for each edge (u, v) in E:
            if d[u][j-1] + w(u, v) < d[v][j]:
                d[v][j] ← d[u][j-1] + w(u, v)
    return d[t][k]
```

## Example

Lightest walk `s→t` for small `k` (edges shown as $u\to v\,(w)$): $s\to a\,(2),\ a\to t\,(3),\ s\to t\,(10),\ t\to t$ is absent so a 1-edge walk to `t` costs 10.

| `j` (edges) | $d(s,j)$ | $d(a,j)$ | $d(t,j)$ |
|---|---|---|---|
| 0 | 0 | ∞ | ∞ |
| 1 | ∞ | 2 | 10 |
| 2 | ∞ | ∞ | 5 |

With exactly 2 edges the cheapest `s→t` walk is $s\to a\to t = 2+3 = 5$, beating the direct 1-edge walk of weight 10.

## On the exam

This is a **rare but distinctive** topic — it appeared in only **1 of 19** exams, yet it stands out because it asks for an **explicit DP**, not a black box. There is essentially **one** cited question (with two parts), but it is worth knowing cold because its character is unlike anything else on the exam. From **Topic 10**:

- *(2023 Sem-B Mo'ed A, Q4a)* — write the recurrence for the lightest **walk** (repeats allowed) `s→t` with **exactly `k` edges**. *Hint:* index by (vertex, #edges) and relax layer by layer — $d(v,j) = \min_{u}\{\,d(u,j-1) + w(u,v)\,\}$ with base $d(s,0)=0$, $d(v,0)=\infty$; this is a layered [[Bellman-Ford Algorithm|Bellman-Ford]].
- *(2023 Sem-B Mo'ed A, Q4a — correctness)* — prove the recurrence. *Hint:* **cut-and-paste** — any optimal `j`-edge walk's `(j-1)`-edge prefix must itself be optimal, otherwise swapping in a lighter prefix yields a lighter `j`-edge walk, a contradiction.
- *(2023 Sem-B Mo'ed A, Q4b)* — analyze the table. *Hint:* there are `k` layers, each scanning all $|E|$ edges once → $O(k\cdot|E|)$ time; the table is $O(|V|\cdot k)$, reducible to $O(|V|)$ by keeping only the previous row.

> [!tip] The golden rule
> The phrase **"exactly `k` edges"** (or "at most `k` edges") on a weighted-path problem is the tell: don't reach for [[Dijkstra's Algorithm|Dijkstra]] or plain [[Bellman-Ford Algorithm|Bellman-Ford]] — index the DP by **number of edges used** and relax layer by layer. The recurrence *is* Bellman-Ford's DP formulation made explicit. **Rare topic** (1/19) — learn the recurrence, its cut-and-paste proof, and the $O(k\cdot|E|)$ analysis, and you have covered everything ever asked.
