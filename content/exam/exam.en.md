Built from **19 real past exams (2022–2025)** plus the solved **2026 גרסה 2** paper. Read this the morning of the exam, and again in the first two minutes after it starts.

## The exam shape (2024–2025 format)

Three questions, 110 points capped at 100, closed book, ~2.5 hours. **A black-box algorithm + complexity sheet is attached** — use the boxes, never re-implement them.

| Q | Format | Pts | Time | The stable pattern |
|---|--------|-----|------|--------------------|
| **Q1** | Prove or disprove ×3 | 30 | 40 min | One from DFS/SCC/topological, one from matching/Hall, one from flow/Floyd/Dijkstra. **About half are FALSE** |
| **Q2** | Algorithm design (apply · design · correctness + complexity) | 30 | 40 min | A new graph is defined — almost always **SCC + condensation**, or double-BFS on a tree |
| **Q3** | "Mark all correct" ×5 of 7 sections | 50 | 30 min | 10 pts each. **Wrong marks earn negative points** |

**Attack order: Q3 → Q2 → Q1.** Bank the 50 fast points first, keep 10 minutes to re-check Q3 at the end. Writing "didn't answer" earns 20%; a partial idea + pseudocode earns ~50% — **never leave Q2 blank.**

## Memorize cold — the complexity table

Write this on scratch paper the moment you sit down.

| Algorithm | Complexity | Condition |
|-----------|------------|-----------|
| [[Breadth-First Search (BFS)\|BFS]] / [[Depth-First Search (DFS)\|DFS]] / [[Strongly Connected Components (SCC)\|SCC]] / [[Topological Sort\|Topo-Sort]] | $O(V+E)$ | — |
| [[DAG Shortest Path\|DAG-SP]] | $O(V+E)$ | DAG only; negative weights fine |
| [[Dijkstra's Algorithm\|Dijkstra]] | $O(V^2)$ or $O(E\log V)$ | $w \ge 0$ |
| [[Bellman-Ford Algorithm\|Bellman-Ford]] | $O(V\cdot E)$ | negatives allowed; detects negative cycles |
| [[Floyd–Warshall Algorithm\|Floyd-Warshall]] / [[Transitive Closure\|closure]] | $O(V^3)$ | no negative cycle |
| [[Minimum Spanning Tree (Kruskal / Prim)\|Kruskal / Prim]] | $O(E\log V)$ / $O(V^2)$ | MST |
| [[Network Flow (Max-Flow / Min-Cut)\|Ford-Fulkerson]] | $O(E\cdot f^{*})$ | integer capacities (pseudo-poly) |
| Edmonds-Karp | $O(V\cdot E^2)$ | always halts |
| [[Bipartite Matching & Hall's Theorem\|Bipartite matching]] | $O(V\cdot E)$ | reduction to flow |

> [!warning] The #1 grader trap
> A black box **inside a loop over $V$** costs $V\cdot(V+E)$, not $V+E$. Always write complexity as "the loop runs $V$ times × $O(E)$ = …".

## Topic priority (from the 19-exam scan)

1. **Network flow: max-flow, min-cut, sensitivity** — on nearly every exam, always in Q3.
2. **Prove-or-disprove technique** — every exam; decide TRUE/FALSE *before* writing (proving a false claim = 0).
3. **DFS properties · matching/König · Dijkstra** — the Q1 regulars.
4. **Floyd-Warshall matrix reading · Vertex-Cover approximation** — rising hard since 2024; don't skip.
5. **Metric TSP · bridges/fragile graphs** — new on the 2026 גרסה 2 paper.

Not in scope (don't study): dedicated dynamic programming, NP-completeness reductions, amortized analysis.

## Quantifier traps — the words that flip answers

| When you see… | Watch out |
|---------------|-----------|
| "in **every** run" vs "there **exists** a run" | order-dependent claims are usually FALSE for "every" |
| "there is a **path**" | ≠ "there is an **edge**" |
| **directed** vs undirected | DFS edge-classification theorems differ |
| "**some** maximum flow has X" | ≠ "**every** maximum flow has X" |
| "at most $n/4$" (out-degree) | complexity **cannot be determined** |

## Morning checklist

1. Complexity table (above) — write it on scratch paper immediately.
2. Max-flow = min-cut; capacity-change rules (see [[Network Flow (Max-Flow / Min-Cut)]]).
3. $\mu \le \eta$ always; equality **only** bipartite (König); Hall needs **all** subset sizes; Gallai $\alpha + \eta = \lvert V\rvert$.
4. $f[u] > f[v]$ only in a DAG; back edge ⟺ cycle; topo order = decreasing finish times.
5. Dijkstra needs $w \ge 0$ — and **reweighting does not fix negatives; Bellman-Ford does**.
6. $D^{(k)}$ = intermediates from $\{1..k\}$, **not** "$k$ edges".
7. VC 2-approx: `SOL = 2|M| ≤ 2·OPT`, output always **even**; metric TSP: 2 / 1.5 / none-unless-$P=NP$.
8. Fragile = forest = every edge a bridge; edges $= \lvert V\rvert - c$.
9. Q2 opener: run SCC, build the condensation (always a DAG), read sources and sinks.
10. Read the FALSE claims in the [claim bank](/en/practice/) one last time — they are the traps.

Good luck — you know this. Read the quantifiers slowly, circle the keywords, trust the table. 💪
