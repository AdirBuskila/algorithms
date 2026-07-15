---
slug: tsp-approx
order: 13
group: approximation
title: "Metric TSP Approximation"
summary: "Travelling salesman on a metric graph: MST-doubling gives a 2-approximation, Christofides 1.5; general TSP has no constant-factor approximation unless P=NP."
frequency: "2/19"
difficulty: medium
complexity:
  time: 'O(V^2)'
  timeNote: "dominated by building the MST on a complete graph (Prim)"
  space: 'O(V)'
  spaceNote: "the tour + MST bookkeeping"
examFrequency: "Topic 9 · Approximation — Q3 MC on the 2026 גרסה 2 paper and the Mo'ed A review"
---

**Goal:** find a **Hamiltonian cycle** — a tour visiting every vertex exactly once and returning to the start — of **minimum total weight**, on a complete weighted graph.

- General TSP is **NP-hard**, and worse: it has **no constant-factor approximation unless $P=NP$**.
- **Metric TSP** assumes the triangle inequality $w(u,v) \le w(u,x) + w(x,v)$ — and then approximation *is* possible.
- The three numbers to memorize: **2** (MST-doubling), **1.5** (Christofides), **none** (general TSP).

## MST-doubling — the 2-approximation

1. Build a [[Minimum Spanning Tree (Kruskal / Prim)|minimum spanning tree]] $T$ of the complete graph.
2. Double every edge of $T$ and take an Euler tour of the doubled tree.
3. **Shortcut** repeated vertices: skip any vertex already visited, jumping straight to the next new one (legal because the graph is complete; no more expensive because of the triangle inequality).

**Why ratio 2:** removing one edge from the optimal tour leaves a spanning path, so $w(\text{MST}) \le OPT$. The Euler tour costs $2\cdot w(\text{MST})$, and shortcuts only shorten it:
$$\text{SOL} \le 2\cdot w(\text{MST}) \le 2\cdot OPT$$

## Christofides — the 1.5-approximation

Same skeleton, but instead of doubling the whole tree, add a **minimum perfect matching on the odd-degree vertices of the MST** to make the graph Eulerian. The matching costs at most $OPT/2$, giving $\text{SOL} \le 1.5\cdot OPT$. On this course's exams only the **ratio** is tested, not the construction details.

> [!note] Why "metric" matters
> Both proofs use the triangle inequality exactly once — in the shortcut step. Without it, shortcuts can *increase* the cost, the argument collapses, and indeed no constant ratio is achievable unless $P=NP$.

## On the exam

The solved **2026 גרסה 2** paper (Q3 section ו', complete graph with a metric) rules on these:

- ❌ **"Removing the heaviest edge of an optimal TSP tour always yields an MST."** The remaining path spans $V$ but need not be minimum — the solved paper's counter-example has the path at weight 7 while the MST weighs 6.
- ✅ **"The two approximation algorithms (MST-doubling, Christofides) can return exactly the same tour."** Nothing forces them apart.
- ✅ **"If all weights are equal, every Hamiltonian cycle is an optimal TSP solution."** Every tour costs $n\cdot w$.
- ❌ **"If all edge weights are distinct, the optimal TSP solution is unique."** Two different tours can still reach the same total — distinct edges do not mean distinct sums (same diamond logic as shortest paths).

The Mo'ed A review (Q3.6) tested the same three memorized facts: 2, 1.5, and none-unless-$P=NP$.

> [!tip] The reflex
> A TSP claim on this exam is answered by one of exactly three facts: the **ratio table** (2 / 1.5 / none), the **equal-weights ⇒ all tours optimal** observation, or the **distinct-weights ≠ unique-optimum** trap. Match the claim to its fact and you're done.
