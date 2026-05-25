---
slug: bipartite-matching
order: 11
group: flow-matching
title: "Bipartite Matching & Hall's Theorem"
summary: "Maximum matching in a bipartite graph via reduction to max-flow, with Hall's marriage condition and König's theorem."
frequency: "13/19"
difficulty: medium
visualization: bipartite-matching-visualization.html
vizHeight: 820
complexity:
  time: 'O(|V| \cdot |E|)'
  timeNote: "max-matching via max-flow / augmenting paths; Hopcroft–Karp is O(√|V| · |E|)"
  space: 'O(|V| + |E|)'
  spaceNote: "the derived flow network / adjacency"
examFrequency: "Topic 8 · Bipartite Matching & Hall — ~13/19 exams"
---

**Goal:** in a bipartite graph $G=(L\cup R,E)$, find a **matching** $M\subseteq E$ — a set of edges no two of which share a vertex — of **maximum** size $\mu(G)$.

- **Maximal ≠ maximum.** A *maximal* matching cannot be extended by adding an edge; a *maximum* matching is the largest possible. Maximal does not imply maximum.
- **Perfect matching**: covers every vertex (requires $\lvert V\rvert$ even, and in bipartite $\lvert L\rvert=\lvert R\rvert$).
- The standard exam recipe: **reduce maximum bipartite matching to** [[Network Flow (Max-Flow / Min-Cut)|max-flow]], or reason directly with **augmenting paths**.

## How it works

1. **Build a flow network.** Add a **super-source** $s$ with an edge $s\to u$ of capacity 1 for every $u\in L$, and a **super-sink** $t$ with an edge $v\to t$ of capacity 1 for every $v\in R$.
2. **Orient the original edges** $L\to R$ as unit-capacity edges (capacity 1 each).
3. **Run Ford–Fulkerson** (see [[Network Flow (Max-Flow / Min-Cut)]]). By the integrality theorem the max-flow is integral, so every edge carries flow 0 or 1.
4. **Read off the matching**: the original edges $L\to R$ carrying flow 1 are exactly the matching edges. Then $\mu(G)=\lvert f\rvert$, and $f^*=\mu(G)\leq\min(\lvert L\rvert,\lvert R\rvert)$, so the run costs $O(E\cdot\mu)\subseteq O(\lvert V\rvert\cdot\lvert E\rvert)$.
5. **Augmenting-path view.** A matching $M$ is maximum **⇔** there is no augmenting path (an alternating $L\to R$ path between two unmatched vertices). One augmenting-path search settles maximality in $O(\lvert V\rvert+\lvert E\rvert)$.

## Example

A unit-capacity flow network for $L=\{a_1,a_2,a_3\}$, $R=\{b_1,b_2,b_3\}$:

| Layer | Edges (all capacity 1) |
|---|---|
| Source | $s\to a_1,\ s\to a_2,\ s\to a_3$ |
| Bipartite edges $L\to R$ | $a_1\to b_1,\ a_1\to b_2,\ a_2\to b_1,\ a_3\to b_3$ |
| Sink | $b_1\to t,\ b_2\to t,\ b_3\to t$ |

Max-flow $=3$ (e.g. $a_1\to b_2,\ a_2\to b_1,\ a_3\to b_3$) → a **perfect matching** of size 3.

> [!note] Hall's theorem (the marriage condition)
> A matching **saturating $L$** exists **⇔** for every $X\subseteq L$: $\lvert N(X)\rvert\geq\lvert X\rvert$, where $N(X)$ is the set of neighbours of $X$ in $R$. The marriage theorem adds: a **perfect** matching exists ⇔ Hall's condition **and** $\lvert L\rvert=\lvert R\rvert$.

> [!info] König's theorem (bipartite only)
> In a **bipartite** graph the maximum matching equals the minimum vertex cover: $\mu(G)=\eta(G)$. This is the bridge to [[Vertex Cover (2-Approximation)]] — in a general graph only $\mu(G)\leq\eta(G)$ holds. A useful corollary: an $r$-regular bipartite graph ($r>0$) always has a perfect matching (count edges: $r\lvert X\rvert$ edges leave $X$, so $\lvert N(X)\rvert\geq\lvert X\rvert$ and Hall holds).

## On the exam

Matching is the home of **Question 1c** — a prove-or-disprove part that almost always hinges on Hall, König, or an augmenting-path argument. Every **Topic 8** appearance across the 19 exams:

- **Hall / marriage condition.** *(2024 Sem-B Mo'ed A, Q1c — true)* — with $\deg(a_i)\geq i$ and $\deg(b_i)\geq i$, a perfect matching exists; *Hint:* any $X$ of size $k$ contains some $a_i$ with $i\geq k$, so $\lvert N(X)\rvert\geq k$ and Hall holds. *(2023 Summer Mo'ed A, Q4a)* — by Hall, does a matching saturating $L$ exist? saturating $R$? justify each side separately; *Hint:* exhibit a violating $X\subseteq L$ (resp. $X\subseteq R$) or argue Hall holds. *(2025 Sem-B Mo'ed A, Q1c)* — a Hall *variant*: does "$\lvert X\rvert\leq\lvert N(X)\rvert$ for every $X\subseteq A$ of size exactly $k$" force a matching of size $k$? *Hint:* Hall needs **all** subset sizes $\le k$, not only size $k$.
- **Regular & structural existence.** *(2024 Summer Mo'ed B, Q1b)* and *(2024 Summer Mo'ed C, Q1b)* — an $r$-regular **bipartite** graph ($r>0$) has a perfect matching (true); *Hint:* count edges — $r\lvert X\rvert$ leave $X$, so $\lvert N(X)\rvert\geq\lvert X\rvert$; the **non**-bipartite version is false (take an odd-vertex example). *(2024 Sem-B Mo'ed B, Q1c — false)* — "non-bipartite ⟹ no perfect matching" is wrong; *Hint:* an even cycle is non-bipartite-free but $C_4$ already has one — give any non-bipartite graph with a perfect matching. *(2024 Sem-B Special Mo'ed, Q1b-c)* — two parts: does $\operatorname{diam}(G)=2$ in a bipartite graph force it to be **complete bipartite**? and does "all cycles even" force a **perfect matching**? *Hint:* both false — find small counterexamples (the second: a path has only even... actually a tree, which is bipartite, need not be perfectly matchable).
- **Effect of edits & sub-structure.** *(2022 Sem-B Mo'ed A, Q1a)* — prove/disprove: adding **one** edge cannot increase the maximum matching by more than 1; *Hint:* a single new edge contributes at most one to any matching. *(2022 Sem-B Sample, Q1b)* — prove/disprove: a perfect matching $M$ **plus** a cycle in the graph yields another perfect matching $M'\neq M$; *Hint:* an even alternating cycle can be flipped, but the cycle's edges need not alternate w.r.t. $M$. *(2024 Summer Mo'ed A, Q1c — true)* — every matching $M$ extends to a maximum matching $M'$ covering all of $M$'s vertices; *Hint:* augmenting-path flips never un-cover an already-matched vertex.
- **Uniqueness.** *(2025 Summer Mo'ed A, Q1b)* — prove/disprove: $\lvert N(X)\rvert=\lvert X\rvert$ for **every** $X\subseteq A$ ⟹ the maximum matching is **unique**; *Hint:* equality everywhere forbids alternating cycles / two distinct saturating matchings.
- **Maximality check (algorithm design).** *(2023 Sem-B Mo'ed B, Q3c)* and *(2025 Summer Mo'ed B, Q1c)* — a **linear** algorithm deciding whether a given $M$ is maximum: build the flow network and run **one** augmenting-path search (one Ford–Fulkerson iteration) in $O(\lvert V\rvert+\lvert E\rvert)$; $M$ is maximum ⇔ no augmenting path is found.

> [!tip] The golden rule for matching
> A matching saturating $A$ exists **⇔** $\lvert N(X)\rvert\geq\lvert X\rvert$ for **every** $X\subseteq A$ (Hall). To check whether a given $M$ is maximum, search for a single **augmenting path** in $O(\lvert V\rvert+\lvert E\rvert)$ — and remember König's $\mu=\eta$ holds **only** in bipartite graphs.
