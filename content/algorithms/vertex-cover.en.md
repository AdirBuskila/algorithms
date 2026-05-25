---
slug: vertex-cover
order: 12
group: approximation
title: "Vertex Cover (2-Approximation)"
summary: "A linear-time 2-approximation for minimum vertex cover: repeatedly pick an uncovered edge and add both its endpoints."
frequency: "11/19"
difficulty: medium
complexity:
  time: 'O(|V| + |E|)'
  timeNote: "VC_improved / VC_greedy run linearly; the result is an approximation, ratio = 2"
  space: 'O(|V| + |E|)'
  spaceNote: "the cover set + edge/vertex bookkeeping"
examFrequency: "Topic 9 · Approximation & Vertex Cover — 11/19 exams (2024 onward)"
---

**Goal:** find a small **vertex cover** — a set $U\subseteq V$ such that every edge $(x,y)\in E$ has at least one endpoint in $U$ — for a problem whose **exact** minimum ($\eta(G)$) is **NP-hard**.

- Since minimum vertex cover is NP-hard, we settle for an **$\alpha$-approximation**: a polynomial algorithm returning a cover of size $\leq\alpha\cdot\lvert\text{OPT}\rvert$.
- `VC_improved` is a **2-approximation** ($\alpha=2$): it never returns more than twice the optimum.
- ⚠️ `VC_greedy` (always grab the highest-degree vertex) is **not** a 2-approximation — it can be a $\Theta(\log n)$ factor off.

## How it works

1. Start with an empty cover $C=\varnothing$ and the full edge set as "uncovered".
2. While an uncovered edge remains, **pick an arbitrary uncovered edge** $(u,v)$.
3. Add **both endpoints** $u$ and $v$ to $C$.
4. Remove every edge incident to $u$ or $v$ (they are now covered), and repeat from step 2.
5. Return $C$. The picked edges form a **matching** $M$ (after $(u,v)$ is chosen, all its incident edges vanish), and each iteration adds exactly two vertices, so $\lvert C\rvert=2\lvert M\rvert$.

## Pseudocode

```text
VC_improved(G):
    C <- empty;  E_uncov <- E
    while E_uncov != empty:
        select an arbitrary edge (u, v) in E_uncov
        C <- C union {u, v}
        remove all edges incident to u or v from E_uncov
    return C
```

## Example

Take a path $a - b - c - d$ (3 edges).

| Step | Picked edge | Added to $C$ | Remaining uncovered |
|---|---|---|---|
| 1 | $(a,b)$ | $\{a,b\}$ | $\{(c,d)\}$ |
| 2 | $(c,d)$ | $\{a,b,c,d\}$ | $\varnothing$ |

`VC_improved` returns $\{a,b,c,d\}$ of size 4, while $\lvert\text{OPT}\rvert=2$ (e.g. $\{b,c\}$). Here the ratio is exactly 2.

> [!tip] Why the ratio is 2 (the proof you must reproduce)
> The picked edges form a **matching** $M$, so $\lvert\text{SOL}\rvert=2\lvert M\rvert$. Any vertex cover must cover **each** edge of $M$ separately — and matching edges are vertex-disjoint — so $\lvert\text{OPT}\rvert\geq\lvert M\rvert$. Combining: $\lvert\text{SOL}\rvert=2\lvert M\rvert\leq 2\lvert\text{OPT}\rvert$. The full relation is $\lvert M\rvert\leq\lvert\text{OPT}\rvert\leq 2\lvert M\rvert$. The bound is **tight**: $n$ disjoint edges give $\lvert\text{OPT}\rvert=n$ but $\lvert\text{SOL}\rvert=2n$.

> [!info] It always returns an even number of vertices
> Each iteration adds a **pair** of endpoints, so $\lvert\text{SOL}\rvert$ is always **even**. Therefore `VC_improved` can **never** return an **odd** OPT — even though it is a valid 2-approximation, it cannot hit a minimum cover of, say, size 13.

## On the exam

Vertex Cover appears **from 2024 onward** — as a 5-point bonus, and from 2025 as a full 30-point question. From **Topic 9**:

- **"Can it return OPT?" (parity).** *(2024 Sem-B Mo'ed A, Bonus)* — can a `VC_improved` run return a minimum cover with $\lvert\text{OPT}\rvert=13$? *(No — it always returns an even count.)* *(2025 Sem-B Mo'ed B, Q1b)* — yes for a general graph (even OPT), no for an odd cycle $C_n$.
- **The $\lvert M\rvert$ vs $\lvert\text{OPT}\rvert$ relation.** *(2025 Sem-B Mo'ed A, Q3c — MC)* — which of $\lvert M\rvert\leq\lvert\text{OPT}\rvert\leq 2\lvert M\rvert$ necessarily holds for a maximal matching $M$ and a minimum cover. *(2025 Sem-B Mo'ed B, Q1c)* — prove the approximation ratio is **2** ($\lvert\text{SOL}\rvert=2\lvert M\rvert\leq 2\lvert\text{OPT}\rvert$); part 1a asks $\text{OPT}$ of a cycle $C_n$ ($n/2$ even, $(n+1)/2$ odd).
- **Pick-order multiple choice.** *(2025 Summer Mo'ed A, Q3d; 2024 Sem-B Sample, Bonus)* — mark every possible order in which `VC_improved` / `VC_greedy` selects vertices. *(2025 Summer Mo'ed B, Q3e)* — the `VC_greedy` variant, which is **not** a 2-approximation.

> [!tip] The golden rule for the approximation bonus
> `VC_improved` is a 2-approximation because the picked edges form a matching $M$: $\lvert\text{SOL}\rvert=2\lvert M\rvert$, and since any cover must cover each edge of $M$ separately, $\lvert\text{OPT}\rvert\geq\lvert M\rvert$, hence $\lvert\text{SOL}\rvert\leq 2\lvert\text{OPT}\rvert$. The lower bound $\lvert M\rvert\leq\lvert\text{OPT}\rvert$ is exactly the [[Bipartite Matching & Hall's Theorem|matching]] connection — and watch the **parity** trap: an even-sized output can never equal an odd OPT.
