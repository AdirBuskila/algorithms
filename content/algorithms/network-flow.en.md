---
slug: network-flow
order: 10
group: flow-matching
title: "Network Flow (Max-Flow / Min-Cut)"
summary: "Push the most flow from a source to a sink through edge capacities; the bottleneck is the minimum cut."
frequency: "19/19"
difficulty: hard
visualization: network-flow-visualization.html
vizHeight: 860
complexity:
  time: 'O(|V| \cdot |E|^2)'
  timeNote: "Edmonds-Karp with BFS augmenting paths; plain Ford-Fulkerson is O(|E| · f*) for integer capacities"
  space: 'O(|V| + |E|)'
  spaceNote: "the residual graph G_f"
examFrequency: "Topic 7 · Network Flow — 19/19 exams (every exam!)"
---

**Goal:** route the **maximum** amount of flow from a source `s` to a sink `t` through a directed graph whose edges have capacities — and prove the answer via the cheapest "cut" that separates `s` from `t`.

- This is **the** central topic of the course — it appears in **every single exam** (19/19), usually as the multiple-choice Question 3.
- A flow obeys **capacity** (you can't push more than an edge allows) and **conservation** (flow in = flow out at every internal vertex).
- The maximum flow value equals the minimum cut capacity — the **Max-Flow Min-Cut theorem**, the heart of the topic.
- Many problems reduce to flow: [[Bipartite Matching & Hall's Theorem|bipartite matching]], edge/vertex-disjoint paths, and multi-source/sink routing.

## How it works

A **flow network** $N=(G,s,t,c)$ is a directed graph $G=(V,E)$ with a source `s`, a sink `t`, and a capacity $c(u,v)\geq 0$ on every edge (and $c(u,v)=0$ if $(u,v)\notin E$).

A **flow** $f$ assigns a value to each edge subject to:

1. **Capacity constraint:** $f(u,v)\leq c(u,v)$ — never exceed an edge's capacity.
2. **Skew symmetry:** $f(u,v)=-f(v,u)$.
3. **Flow conservation:** for every vertex $u\notin\{s,t\}$, $\sum_{v} f(u,v)=0$ — what flows in flows out.

The **value of the flow** is the net amount leaving `s` (equivalently, entering `t`): $\lvert f\rvert=\sum_{v} f(s,v)=\sum_{v} f(v,t)$.

**Residual graph $G_f$.** The residual capacity of an edge is $c_f(u,v)=c(u,v)-f(u,v)$. The residual graph contains every edge with $c_f(u,v)>0$. Crucially, even if $(u,v)\notin E$, if there is flow $v\to u$ (so $f(u,v)<0$) then $c_f(u,v)>0$ — this **back edge** is the option to "undo" flow you already pushed.

**Augmenting path.** A path $s\to t$ in $G_f$. Its bottleneck capacity is $c_f(P)=\min_{(u,v)\in P} c_f(u,v)$; pushing that much flow along `P` strictly increases $\lvert f\rvert$.

**Ford-Fulkerson** repeatedly finds an augmenting path and pushes flow along it until none remains:

1. Start with $f\equiv 0$.
2. While an augmenting path `P` exists in $G_f$: push $\Delta=c_f(P)$ along `P` (and decrease the reverse edges by $\Delta$).
3. When no augmenting path remains, `f` is a maximum flow.

For **integer** capacities every iteration adds at least 1 to the flow, so it runs in $O(\lvert E\rvert\cdot f^*)$ — *pseudo-polynomial* (slow if $f^*$ is huge). With **irrational** capacities it may never terminate.

**Edmonds-Karp** is Ford-Fulkerson that always picks the **shortest** augmenting path using [[Breadth-First Search (BFS)|BFS]]. This guarantees $O(\lvert V\rvert\cdot\lvert E\rvert^2)$ and always terminates (even for irrational capacities).

> [!info] Cut lemma
> A **cut** $(S,T)$ partitions $V$ with $s\in S,\ t\in T$. Its capacity is $c(S,T)=\sum_{u\in S,v\in T}c(u,v)$ (only the $S\to T$ edges count). For **any** flow `f` and **any** cut, $f(S,T)=\lvert f\rvert$. Therefore $\lvert f\rvert\leq c(S,T)$ — every cut upper-bounds the flow, so $\text{MaxFlow}\leq\text{MinCut}$.

## Max-flow = min-cut

**Theorem (Max-Flow Min-Cut).** For a flow `f` the following are equivalent:

1. `f` is a maximum flow.
2. There is no augmenting path in $G_f$.
3. There exists a cut $(S,T)$ with $c(S,T)=\lvert f\rvert$.

So the maximum flow value equals the minimum cut capacity, and once Ford-Fulkerson halts, the flow it produces is maximum.

**Finding a min-cut from the final residual graph.** After the algorithm terminates, let
$$S=\{v\in V\mid \exists\ \text{path } s\to v \text{ in } G_f\},\qquad T=V\setminus S.$$
Then `s ∈ S`, `t ∈ T` (no augmenting path left), and $(S,T)$ is a **minimum cut**. Run one [[Breadth-First Search (BFS)|BFS]] / [[Depth-First Search (DFS)|DFS]] from `s` in $G_f$ to compute `S`.

This cut has a clean characterization that exams love to test:

- Every edge $u\in S,\ v\in T$ is **saturated**: $f(u,v)=c(u,v)$.
- Every edge $u\in T,\ v\in S$ is **empty**: $f(u,v)=0$.

**Integrality theorem.** If all capacities are integers, Ford-Fulkerson returns a maximum flow that is **integral** ($f(u,v)\in\mathbb{Z}$ on every edge). Proof: $f$ starts at 0, each bottleneck $c_f(P)$ stays integer by induction. The nuance that gets tested: integer capacities guarantee an integer max-flow **exists**, but **not every** max-flow is integral (a max-flow can split into half-integer values as long as the total is right).

## Example

A tiny network: `s→a` (cap 3), `s→b` (cap 2), `a→b` (cap 2), `a→t` (cap 2), `b→t` (cap 3).

| Step | Augmenting path | Bottleneck | Flow value |
|---|---|---|---|
| 1 | `s → a → t` | 2 | 2 |
| 2 | `s → b → t` | 2 | 4 |
| 3 | `s → a → b → t` | 1 | 5 |
| 4 | _no path in $G_f$_ | — | **5 (max)** |

The min-cut is $S=\{s,a,b\}$, $T=\{t\}$ with capacity $c(a,t)+c(b,t)=2+3=5$ — matching the max-flow value.

## On the exam

Network flow is the **most predictable points in the course** — it is **Question 3** (the 50-point multiple choice) in 2024-2025, plus often a prove/disprove part in Q1. Drill these three families.

- **(a) Compute the flow + residual graph.** *(2022 Sem-B Sample, Q3a.1; 2022 Sem-B Mo'ed A, Q3a.1; 2022 Sem-B Mo'ed B, Q3a.1)* — compute the **max-flow value** of a given network (with justification). *(2023 Sem-B Mo'ed B, Q3a)* — run **Ford-Fulkerson** to the maximum: how many iterations, and what is the flow? (each iteration is one augmenting path). *(2023 Sem-B Mo'ed A, Q3a)* — draw the residual graph $G_f$ for a given flow. *(2023 Sem-B Special Mo'ed, Q3a)* — is `f` a **valid** flow? justify and draw $G_f$, otherwise draw a maximum flow. *(2023 Summer Mo'ed A, Q3a)* — run **Edmonds-Karp**, detailing the intermediate steps. *(2024 & 2025 — every Q3a, MC)* — given a network with a flow, find the **max-flow value** and the **residual capacity** $c_f(u,v)$ of a specific edge such as `(4,2)` or `(4,3)`. *Hint:* $c_f(u,v)=c(u,v)-f(u,v)$ — and a reverse edge can have positive residual capacity even when $(u,v)\notin E$.
- **(b) Min-cut & critical edges.** *(2022 Sem-B Sample, Q3a.2-3)* — find a min-cut, then prove/disprove it is **unique**. *(2022 Sem-B Mo'ed A, Q3a.2-3)* — find **all** min-cuts; is there an edge whose `+1` capacity raises the flow? *(2022 Sem-B Mo'ed B, Q3b.1-2)* — prove/disprove: there is always an edge whose `-1` capacity lowers the flow / always one that does not change it. *(2022 Sem-B Mo'ed C, Q3b.1-2)* — efficient algorithm: does edge `e` cross **every** min-cut, or **some** min-cut? *(2023 Sem-B Mo'ed B, Q3b — false)* — distinct capacities do **not** force a unique min-cut. *(2023 Summer Mo'ed A, Q3b)* — find a min-cut and explain why it is minimum. *(2024 Sem-B Sample, Q1c)* — prove/disprove: there is always an edge whose `-1` capacity lowers the flow; *(Q3b)* — number of min-cuts; *(Q3c)* — an edge whose increase raises the flow. *(2024 Mo'ed A / Special Mo'ed / Summer Mo'ed A / Summer Mo'ed B / Summer Mo'ed C, Q3a-c, MC)* — number of min-cuts + flow value + sensitivity (`+k` capacity ⟹ `+k` flow?). *(2025 Sem-B Mo'ed A, Q1b)* — prove a cut exists where every `S→T` edge is saturated and every `T→S` edge is empty (use the final $G_f$). *(2025 Summer Mo'ed A, Q3a; 2025 Summer Mo'ed B, Q3a, MC)* — flow value + which edges are **critical** (`+1` ⟹ `+1`).
- **(c) Structural proofs, integrality & multi-source.** *(2022 Sem-B Mo'ed A, Q3b.1-2)* — is the **average** of two max-flows a max-flow, and is there always a Ford-Fulkerson run yielding it? *(2022 Sem-B Mo'ed B, Q3b.3)* — capacities all multiples of `d` ⟹ max-flow a multiple of `d`. *(2022 Sem-B Mo'ed C, Q3c.1-2)* — the maximum/minimum change in the flow if we `+1` the capacity of **every** edge of a particular min-cut. *(2023 Sem-B Mo'ed A, Q3b.1-3)* — integer vs `√2` capacities: must the max-flow be non-integer? relation between a `√2`-capacity path and a cut. *Hint:* MFMC pins the value. *(2023 Sem-B Special Mo'ed, Q3b)* — two networks identical except capacities: is `f1+f2` valid in `N`? is a min-cut of `N1` still minimum in `N`? *(2023 Summer Mo'ed A, Q3c)* — **multiple sources & sinks** (with capacity bounds): add a **super-source** $s_0$ with $\infty$-capacity edges to each `s_i` and a **super-sink** $t_0$ with $\infty$-capacity edges from each `t_j`, then run Ford-Fulkerson. *(2024 Sem-B Mo'ed B, Q3a, MC)* — a multi-source network: add a super-source with $\infty$ capacity. *(2024 Summer Mo'ed B, Q1c — false)* — no flow of 20 `s→v` and none `v→t` does **not** imply no flow of 20 `s→t`. *(2024 Summer Mo'ed C, Q1c; 2025 Summer Mo'ed A, Q3b)* — increasing a cut-crossing edge's capacity / adding an edge of capacity `C`: how many augmenting paths, and when does the flow grow? *(2025 Sem-B Mo'ed A, Q3b; 2025 Sem-B Mo'ed B, Q3e, MC)* — the integrality theorem (must `f(e)` be integer?) and saturated cut edges. *(2025 Summer Mo'ed B, Q3b, MC)* — does adding an edge raise the flow? is a unique max-flow ⟺ a unique min-cut? `+d` capacity ⟹ `≤d` growth.

> [!tip] Key traps
> - **A saturated edge is NOT necessarily critical.** An edge being full only matters if it lies in a **min-cut**. A saturated edge outside every min-cut can be increased with zero effect on the flow.
> - **Increasing an edge's capacity by `k` raises the flow by at most `k` — and only if the edge is in a min-cut.** If it's in no min-cut, the flow doesn't change at all. (Algorithmically: bump the capacity, then look for one new augmenting path in $G_f$.)
> - **Integrality nuance.** Integer capacities guarantee that **a** maximum flow with all-integer values exists — but not **every** maximum flow is integral. "Every edge's flow must be an integer" is **false**.
