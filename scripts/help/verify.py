#!/usr/bin/env python3
"""Machine-check every answer of the "צריך עזרה?" courses.

Pipeline (see `npm run help:verify`):
  1. scripts/help/dump.mts loads src/data/help/*.ts and writes scripts/help/dump.json
  2. this script recomputes, for each question, the truth from the question's own graph
     (networkx plus small reference implementations for the step-by-step quantities),
     then asserts that

        * options[0] (the authored correct option) satisfies the claim, and
        * no other option satisfies it  (exactly one defensible answer).

Every question carries `check: {kind, ...}`. Kinds are registered in KINDS below.
Exit code is non-zero on any failure.
"""
import itertools
import json
import math
import re
import sys
from collections import deque
from pathlib import Path

import networkx as nx

HERE = Path(__file__).parent
INF = math.inf


# ---------------------------------------------------------------- option parsing
def clean(t):
    t = re.sub(r"[`$]", "", t)
    t = t.replace("\\to", "→").replace("\\rightarrow", "→").replace("\\infty", "∞")
    t = t.replace("\\{", "{").replace("\\}", "}").replace("\\,", ",")
    return t.strip()


def num(t):
    t = clean(t)
    if "∞" in t and not re.search(r"\d", t):
        return INF
    m = re.search(r"-?\d+(?:\.\d+)?", t.replace("−", "-"))
    return float(m.group()) if m else None


def braces(t):
    m = re.search(r"\{([^}]*)\}", clean(t))
    if not m:
        return None
    return {x.strip() for x in m.group(1).split(",") if x.strip()}


def path_of(t):
    parts = [p.strip() for p in re.split(r"→|->", clean(t))]
    return parts if len(parts) > 1 else None


def seq_of(t):
    return [x.strip() for x in re.split(r"[,،]", clean(t)) if x.strip()]


def node_of(t):
    m = re.match(r"\s*([A-Za-z0-9]+)\b", clean(t))
    return m.group(1) if m else None


def pair_of(t):
    p = path_of(t)
    return tuple(p) if p and len(p) == 2 else None


def num_pred(truth):
    def pred(opt):
        v = num(opt)
        if v is None:
            return False
        if math.isinf(truth) or math.isinf(v):
            return v == truth
        return abs(v - truth) < 1e-9

    pred.truth = truth
    return pred


def tf_pred(truth):
    def pred(opt):
        o = clean(opt)
        if o.startswith("לא נכון"):
            return truth is False
        if o.startswith("נכון"):
            return truth is True
        raise AssertionError(f"claim options must start with נכון / לא נכון, got {o!r}")

    pred.truth = truth
    return pred


# ---------------------------------------------------------------- graph helpers
def cap_flow(g):
    """capacities c[u][v] and skew-symmetric flow f[u][v] from the question graph"""
    c, f = {}, {}
    for n in g["nodes"]:
        c[n] = {m: 0 for m in g["nodes"]}
        f[n] = {m: 0 for m in g["nodes"]}
    for e in g["edges"]:
        c[e["from"]][e["to"]] += e["w"]
        if not g["directed"]:
            c[e["to"]][e["from"]] += e["w"]
        if "f" in e:
            f[e["from"]][e["to"]] += e["f"]
            f[e["to"]][e["from"]] -= e["f"]
    return c, f


def res(c, f, u, v):
    return c[u][v] - f[u][v]


def bfs_aug(c, f, s, t):
    """shortest augmenting path, neighbours in alphabetical order (the course convention)"""
    prev = {s: None}
    dq = deque([s])
    while dq:
        u = dq.popleft()
        for v in sorted(c):
            if v not in prev and res(c, f, u, v) > 0:
                prev[v] = u
                dq.append(v)
    if t not in prev:
        return None
    p, x = [], t
    while x is not None:
        p.append(x)
        x = prev[x]
    return p[::-1]


def push(c, f, p):
    b = min(res(c, f, p[i], p[i + 1]) for i in range(len(p) - 1))
    for i in range(len(p) - 1):
        f[p[i]][p[i + 1]] += b
        f[p[i + 1]][p[i]] -= b
    return b


def net_out(f, s):
    return sum(f[s].values())


def check_flow_legal(g, c, f):
    s, t = g["s"], g["t"]
    for u in c:
        for v in c:
            if f[u][v] > c[u][v]:
                return f"capacity violated on {u}->{v}"
    for u in c:
        if u not in (s, t) and sum(f[u].values()) != 0:
            return f"conservation violated at {u}"
    return None


def nxdi(g, extra=None):
    D = nx.DiGraph()
    D.add_nodes_from(g["nodes"])
    c, _ = cap_flow(g)
    for u in c:
        for v in c:
            if c[u][v] > 0:
                D.add_edge(u, v, capacity=c[u][v])
    return D


def maxflow_value(g):
    D = nxdi(g)
    v = nx.maximum_flow_value(D, g["s"], g["t"])
    # independent cross-check with Edmonds-Karp implemented above
    c, f = cap_flow(g)
    for u in f:
        for w in f[u]:
            f[u][w] = 0
    while True:
        p = bfs_aug(c, f, g["s"], g["t"])
        if not p:
            break
        push(c, f, p)
    assert net_out(f, g["s"]) == v, "EK and networkx disagree"
    return v


def all_cuts(g):
    nodes = [n for n in g["nodes"] if n not in (g["s"], g["t"])]
    c, _ = cap_flow(g)
    for r in range(len(nodes) + 1):
        for comb in itertools.combinations(nodes, r):
            S = {g["s"], *comb}
            cap = sum(c[u][v] for u in S for v in g["nodes"] if v not in S)
            yield S, cap


def min_cuts(g):
    cuts = list(all_cuts(g))
    m = min(cap for _, cap in cuts)
    return m, [S for S, cap in cuts if cap == m]


def with_mods(g, mods):
    g2 = json.loads(json.dumps(g))
    for u, v, d in mods:
        hit = False
        for e in g2["edges"]:
            if e["from"] == u and e["to"] == v:
                e["w"] += d
                hit = True
                break
        assert hit, f"no edge {u}->{v} to modify"
    for e in g2["edges"]:
        e.pop("f", None)
    return g2


def strip_flow(g):
    g2 = json.loads(json.dumps(g))
    for e in g2["edges"]:
        e.pop("f", None)
    return g2


# ---------------------------------------------------------------- shortest paths
def wdigraph(g):
    D = nx.DiGraph()
    D.add_nodes_from(g["nodes"])
    for e in g["edges"]:
        D.add_edge(e["from"], e["to"], weight=e["w"])
        if not g["directed"]:
            D.add_edge(e["to"], e["from"], weight=e["w"])
    return D


def true_dist(g, src):
    D = wdigraph(g)
    assert not nx.negative_edge_cycle(D), "negative cycle in a graph used for distances"
    d = {n: INF for n in g["nodes"]}
    for n, v in nx.single_source_bellman_ford_path_length(D, src).items():
        d[n] = v
    return d


def dijkstra_trace(g, src):
    D = wdigraph(g)
    dist = {n: INF for n in g["nodes"]}
    dist[src] = 0
    done, order, snaps = set(), [], []
    while len(done) < len(dist):
        cand = [n for n in dist if n not in done and dist[n] < INF]
        if not cand:
            break
        u = min(cand, key=lambda n: (dist[n], n))
        done.add(u)
        order.append(u)
        for v in D[u]:
            if v not in done and dist[u] + D[u][v]["weight"] < dist[v]:
                dist[v] = dist[u] + D[u][v]["weight"]
        snaps.append(dict(dist))
    return order, snaps, dist


def bf_passes(g, src, limit=None):
    """edges relaxed in the order they are listed; returns (list of dist per pass, final)"""
    dist = {n: INF for n in g["nodes"]}
    dist[src] = 0
    edges = []
    for e in g["edges"]:
        edges.append((e["from"], e["to"], e["w"]))
        if not g["directed"]:
            edges.append((e["to"], e["from"], e["w"]))
    snaps = []
    for _ in range(limit or len(g["nodes"]) - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        snaps.append((dict(dist), changed))
    return snaps


# ---------------------------------------------------------------- matching
def bip(g, check):
    L, R = check["L"], check["R"]
    B = nx.Graph()
    B.add_nodes_from(L, bipartite=0)
    B.add_nodes_from(R, bipartite=1)
    for e in g["edges"]:
        B.add_edge(e["from"], e["to"])
    return B, L, R


def matching_size(B, L):
    m = nx.bipartite.hopcroft_karp_matching(B, top_nodes=L)
    return len(m) // 2


# ---------------------------------------------------------------- kinds
KINDS = {}


def kind(fn):
    KINDS[fn.__name__] = fn
    return fn


@kind
def flow_value(g, ck):
    c, f = cap_flow(g)
    bad = check_flow_legal(g, c, f)
    assert ck.get("allow_illegal") or not bad, f"graph flow is illegal: {bad}"
    return num_pred(net_out(f, g["s"]))


@kind
def flow_violation(g, ck):
    c, f = cap_flow(g)
    bad = {u for u in c if u not in (g["s"], g["t"]) and sum(f[u].values()) != 0}

    def pred(opt):
        if clean(opt).startswith("אף"):
            return not bad
        return bad == {node_of(opt)}

    return pred


@kind
def maxflow(g, ck):
    return num_pred(maxflow_value(g))


@kind
def cut_capacity(g, ck):
    c, _ = cap_flow(g)
    S = set(ck["S"])
    return num_pred(sum(c[u][v] for u in S for v in g["nodes"] if v not in S))


@kind
def mincut_S(g, ck):
    m, _ = min_cuts(g)
    c, _ = cap_flow(g)

    def pred(opt):
        S = braces(opt)
        if S is None or g["s"] not in S or g["t"] in S:
            return False
        return sum(c[u][v] for u in S for v in g["nodes"] if v not in S) == m

    return pred


@kind
def residual_cap(g, ck):
    c, f = cap_flow(g)
    assert not check_flow_legal(g, c, f), check_flow_legal(g, c, f)
    return num_pred(res(c, f, ck["u"], ck["v"]))


@kind
def aug_path(g, ck):
    c, f = cap_flow(g)
    assert not check_flow_legal(g, c, f)
    sp = bfs_aug(c, f, g["s"], g["t"])

    def pred(opt):
        p = path_of(opt)
        if not p or p[0] != g["s"] or p[-1] != g["t"] or len(set(p)) != len(p):
            return False
        if not all(x in c for x in p):
            return False
        if not all(res(c, f, p[i], p[i + 1]) > 0 for i in range(len(p) - 1)):
            return False
        if ck.get("shortest") and len(p) != len(sp):
            return False
        if ck.get("needs_back"):
            if not any(c[p[i]][p[i + 1]] == 0 or f[p[i]][p[i + 1]] < 0 for i in range(len(p) - 1)):
                return False
        return True

    return pred


@kind
def bottleneck(g, ck):
    c, f = cap_flow(g)
    p = ck["path"]
    return num_pred(min(res(c, f, p[i], p[i + 1]) for i in range(len(p) - 1)))


@kind
def value_after_path(g, ck):
    c, f = cap_flow(g)
    assert not check_flow_legal(g, c, f)
    p = ck["path"]
    assert all(res(c, f, p[i], p[i + 1]) > 0 for i in range(len(p) - 1)), "path not augmenting"
    push(c, f, p)
    return num_pred(net_out(f, g["s"]))


@kind
def ek_count(g, ck):
    c, f = cap_flow(g)
    assert not check_flow_legal(g, c, f)
    n = 0
    while True:
        p = bfs_aug(c, f, g["s"], g["t"])
        if not p:
            break
        push(c, f, p)
        n += 1
    assert net_out(f, g["s"]) == maxflow_value(strip_flow(g))
    return num_pred(n)


@kind
def ff_worst(g, ck):
    """adversarial Ford-Fulkerson: always take the augmenting path with the smallest bottleneck"""
    c, f = cap_flow(g)
    n = 0
    s, t = g["s"], g["t"]
    nodes = list(c)

    def simple_paths():
        out = []

        def dfs(u, path):
            if u == t:
                out.append(list(path))
                return
            for v in nodes:
                if v not in path and res(c, f, u, v) > 0:
                    path.append(v)
                    dfs(v, path)
                    path.pop()

        dfs(s, [s])
        return out

    while True:
        ps = simple_paths()
        if not ps:
            break
        p = min(ps, key=lambda q: min(res(c, f, q[i], q[i + 1]) for i in range(len(q) - 1)))
        push(c, f, p)
        n += 1
    assert net_out(f, s) == maxflow_value(strip_flow(g))
    return num_pred(n)


@kind
def has_aug_path(g, ck):
    c, f = cap_flow(g)
    assert not check_flow_legal(g, c, f)
    return tf_pred(bfs_aug(c, f, g["s"], g["t"]) is not None)


@kind
def cut_flow(g, ck):
    c, f = cap_flow(g)
    assert not check_flow_legal(g, c, f)
    S = set(ck["S"])
    return num_pred(sum(f[u][v] for u in S for v in g["nodes"] if v not in S))


def reach_from_s(g):
    c, f = cap_flow(g)
    assert not check_flow_legal(g, c, f)
    R, st = {g["s"]}, [g["s"]]
    while st:
        u = st.pop()
        for v in c:
            if v not in R and res(c, f, u, v) > 0:
                R.add(v)
                st.append(v)
    return R, c, f


@kind
def reach_set(g, ck):
    R, c, f = reach_from_s(g)
    assert g["t"] not in R, "flow is not maximum"

    def pred(opt):
        return braces(opt) == R

    return pred


@kind
def reach_cut_capacity(g, ck):
    R, c, f = reach_from_s(g)
    return num_pred(sum(c[u][v] for u in R for v in g["nodes"] if v not in R))


@kind
def cut_edge(g, ck):
    R, c, f = reach_from_s(g)

    def pred(opt):
        p = pair_of(opt)
        return bool(p) and p[0] in R and p[1] not in R and c[p[0]][p[1]] > 0

    return pred


@kind
def is_max_flow(g, ck):
    c, f = cap_flow(g)
    assert not check_flow_legal(g, c, f)
    return tf_pred(bfs_aug(c, f, g["s"], g["t"]) is None)


@kind
def flow_legal(g, ck):
    c, f = cap_flow(g)
    return tf_pred(check_flow_legal(g, c, f) is None)


@kind
def n_mincuts(g, ck):
    return num_pred(len(min_cuts(strip_flow(g))[1]))


@kind
def claim(g, ck):
    name = ck["name"]
    if name == "mincut_unique":
        return tf_pred(len(min_cuts(strip_flow(g))[1]) == 1)
    if name in ("edge_in_all", "edge_in_some"):
        _, cuts = min_cuts(strip_flow(g))
        u, v = ck["u"], ck["v"]
        crossing = [(u in S and v not in S) for S in cuts]
        return tf_pred(all(crossing) if name == "edge_in_all" else any(crossing))
    if name in ("inc_helps", "dec_hurts"):
        base = maxflow_value(strip_flow(g))
        d = ck.get("d", 1) if name == "inc_helps" else -ck.get("d", 1)
        new = maxflow_value(with_mods(g, [(ck["u"], ck["v"], d)]))
        return tf_pred(new > base if name == "inc_helps" else new < base)
    if name == "some_edge_in_all":
        _, cuts = min_cuts(strip_flow(g))
        return tf_pred(any(all((e["from"] in S and e["to"] not in S) for S in cuts) for e in g["edges"]))
    if name == "neg_cycle":
        return tf_pred(nx.negative_edge_cycle(wdigraph(g)))
    if name == "dijkstra_correct":
        _, _, dist = dijkstra_trace(g, ck["src"])
        td = {n: INF for n in g["nodes"]}
        D = wdigraph(g)
        if nx.negative_edge_cycle(D):
            return tf_pred(False)
        td.update(nx.single_source_bellman_ford_path_length(D, ck["src"]))
        return tf_pred(dist == td)
    if name == "shift_changes_path":
        D = wdigraph(g)
        src, dst, add = ck["src"], ck["dst"], ck["c"]
        p1 = nx.bellman_ford_path(D, src, dst)
        D2 = wdigraph(g)
        for u, v in D2.edges:
            D2[u][v]["weight"] += add
        p2 = nx.bellman_ford_path(D2, src, dst)
        # all shortest paths before and after
        a = {tuple(p) for p in nx.all_shortest_paths(D, src, dst, weight="weight", method="bellman-ford")}
        b = {tuple(p) for p in nx.all_shortest_paths(D2, src, dst, weight="weight", method="bellman-ford")}
        return tf_pred(a != b)
    if name == "perfect_matching":
        B, L, R = bip(g, ck)
        return tf_pred(len(L) == len(R) and matching_size(B, L) == len(L))
    if name == "hall_holds":
        B, L, R = bip(g, ck)
        ok = all(len(set().union(*[set(B[x]) for x in S])) >= len(S)
                 for r in range(1, len(L) + 1) for S in itertools.combinations(L, r))
        return tf_pred(ok)
    if name == "m_not_max":
        B, L, R = bip(g, ck)
        return tf_pred(len(ck["M"]) < matching_size(B, L))
    if name == "matching_valid":
        M = ck["M"]
        ends = [x for p in M for x in p]
        edges = {(e["from"], e["to"]) for e in g["edges"]} | {(e["to"], e["from"]) for e in g["edges"]}
        return tf_pred(len(ends) == len(set(ends)) and all(tuple(p) in edges for p in M))
    if name == "is_dag":
        return tf_pred(nx.is_directed_acyclic_graph(wdigraph(g)))
    if name == "has_neg_edge":
        return tf_pred(any(e["w"] < 0 for e in g["edges"]))
    raise AssertionError(f"unknown claim {name}")


@kind
def sens(g, ck):
    return num_pred(maxflow_value(with_mods(g, [tuple(m) for m in ck["mods"]])))


@kind
def critical_edge(g, ck):
    g0 = strip_flow(g)
    base = maxflow_value(g0)

    def pred(opt):
        p = pair_of(opt)
        if not p:
            return False
        return maxflow_value(with_mods(g0, [(p[0], p[1], 1)])) > base

    return pred


@kind
def critical_count(g, ck):
    g0 = strip_flow(g)
    base = maxflow_value(g0)
    n = sum(1 for e in g0["edges"]
            if maxflow_value(with_mods(g0, [(e["from"], e["to"], 1)])) > base)
    return num_pred(n)


def build_flow(g, ck):
    """the flow network a reduction produces"""
    D = nx.DiGraph()
    kindname = ck["reduce"]
    if kindname == "edge_disjoint":
        for e in g["edges"]:
            D.add_edge(e["from"], e["to"], capacity=1)
            if not g["directed"]:
                D.add_edge(e["to"], e["from"], capacity=1)
        return D, g["s"], g["t"]
    if kindname == "vertex_disjoint":
        for n in g["nodes"]:
            cap = 10**6 if n in (g["s"], g["t"]) else 1
            D.add_edge(n + "_in", n + "_out", capacity=cap)
        for e in g["edges"]:
            D.add_edge(e["from"] + "_out", e["to"] + "_in", capacity=10**6)
            if not g["directed"]:
                D.add_edge(e["to"] + "_out", e["from"] + "_in", capacity=10**6)
        return D, g["s"] + "_out", g["t"] + "_in"
    if kindname == "vertex_cap":
        caps = ck["caps"]
        for n in g["nodes"]:
            D.add_edge(n + "_in", n + "_out", capacity=caps.get(n, 10**6))
        for e in g["edges"]:
            D.add_edge(e["from"] + "_out", e["to"] + "_in", capacity=e["w"])
        return D, g["s"] + "_out", g["t"] + "_in"
    if kindname == "multi":
        for e in g["edges"]:
            D.add_edge(e["from"], e["to"], capacity=e["w"])
        for s in ck["sources"]:
            D.add_edge("S*", s, capacity=10**6)
        for t in ck["sinks"]:
            D.add_edge(t, "T*", capacity=10**6)
        return D, "S*", "T*"
    raise AssertionError(kindname)


@kind
def reduce_flow(g, ck):
    D, s, t = build_flow(g, ck)
    return num_pred(nx.maximum_flow_value(D, s, t))


@kind
def sp_dist(g, ck):
    d = true_dist(g, ck["src"])
    return num_pred(d[ck["dst"]])


@kind
def sp_path(g, ck):
    D = wdigraph(g)
    allp = {tuple(p) for p in nx.all_shortest_paths(D, ck["src"], ck["dst"], weight="weight", method="bellman-ford")}
    assert len(allp) == 1, "shortest path not unique"

    def pred(opt):
        p = path_of(opt)
        return p is not None and tuple(p) in allp

    return pred


@kind
def sp_order(g, ck):
    order, _, _ = dijkstra_trace(g, ck["src"])

    def pred(opt):
        return seq_of(opt) == order

    return pred


@kind
def dist_after(g, ck):
    _, snaps, _ = dijkstra_trace(g, ck["src"])
    return num_pred(snaps[ck["k"] - 1][ck["node"]])


@kind
def dijkstra_wrong_node(g, ck):
    _, _, dist = dijkstra_trace(g, ck["src"])
    td = true_dist(g, ck["src"])

    def pred(opt):
        n = node_of(opt)
        return n in dist and dist[n] != td[n]

    return pred


@kind
def bf_rounds(g, ck):
    snaps = bf_passes(g, ck["src"], limit=len(g["nodes"]) + 1)
    changed = [ch for _, ch in snaps]
    n = 0
    for ch in changed:
        if ch:
            n += 1
        else:
            break
    return num_pred(n)


@kind
def bf_dist_after(g, ck):
    snaps = bf_passes(g, ck["src"], limit=ck["passes"])
    return num_pred(snaps[ck["passes"] - 1][0][ck["node"]])


def fw_matrix(g, k):
    nodes = sorted(g["nodes"], key=lambda x: int(x))
    D = {a: {b: (0 if a == b else INF) for b in nodes} for a in nodes}
    for e in g["edges"]:
        D[e["from"]][e["to"]] = min(D[e["from"]][e["to"]], e["w"])
    for kk in nodes[:k]:
        for i in nodes:
            for j in nodes:
                if D[i][kk] + D[kk][j] < D[i][j]:
                    D[i][j] = D[i][kk] + D[kk][j]
    return D


@kind
def fw_entry(g, ck):
    D = fw_matrix(g, ck["k"])
    if ck["k"] == len(g["nodes"]):
        t = true_dist(g, ck["i"])
        assert t[ck["j"]] == D[ck["i"]][ck["j"]]
    return num_pred(D[ck["i"]][ck["j"]])


@kind
def fw_changed(g, ck):
    a, b = fw_matrix(g, ck["k"] - 1), fw_matrix(g, ck["k"])
    return num_pred(sum(1 for i in a for j in a if a[i][j] != b[i][j]))


@kind
def matching_size_k(g, ck):
    B, L, R = bip(g, ck)
    return num_pred(matching_size(B, L))


@kind
def hall_violator(g, ck):
    B, L, R = bip(g, ck)

    def pred(opt):
        S = braces(opt)
        if not S or not S <= set(L):
            return False
        N = set().union(*[set(B[x]) for x in S])
        return len(N) < len(S)

    return pred


@kind
def min_cover(g, ck):
    B, L, R = bip(g, ck)
    mu = matching_size(B, L)

    def pred(opt):
        C = braces(opt)
        if C is None:
            return False
        return len(C) == mu and all(a in C or b in C for a, b in B.edges)

    return pred


@kind
def cover_size(g, ck):
    B, L, R = bip(g, ck)
    return num_pred(matching_size(B, L))


@kind
def indep_size(g, ck):
    B, L, R = bip(g, ck)
    return num_pred(len(L) + len(R) - matching_size(B, L))


@kind
def aug_path_M(g, ck):
    B, L, R = bip(g, ck)
    M = {frozenset(p) for p in ck["M"]}
    matched = {x for p in ck["M"] for x in p}

    def pred(opt):
        p = path_of(opt)
        if not p or len(p) % 2 != 0 or len(set(p)) != len(p):
            return False
        if p[0] in matched or p[-1] in matched:
            return False
        for i in range(len(p) - 1):
            if not B.has_edge(p[i], p[i + 1]):
                return False
            if (frozenset((p[i], p[i + 1])) in M) != (i % 2 == 1):
                return False
        return True

    return pred


def truth_of(g, spec):
    t = KINDS[spec["kind"]](g, spec)("נכון")
    return (not t) if spec.get("neg") else t


@kind
def eq(g, ck):
    sub = KINDS[ck["of"]["kind"]](g, ck["of"])
    return tf_pred(bool(sub(str(ck["val"]))))


@kind
def stmts(g, ck):
    return None  # handled by the driver: one sub-check per option


# ---------------------------------------------------------------- driver
def main():
    data = json.loads((HERE / "dump.json").read_text(encoding="utf-8"))
    fails, total, unchecked = [], 0, []
    stats = {}
    for course in data:
        cid = course["id"]
        nl = len(course["levels"])
        if not 6 <= nl <= 8:
            fails.append(f"{cid}: {nl} levels (need 6-8)")
        if not course["levels"][-1].get("boss"):
            fails.append(f"{cid}: last level is not a boss")
        ids = set()
        pos = [0, 0, 0, 0, 0, 0]
        nq = 0
        for li, lv in enumerate(course["levels"], 1):
            if lv.get("boss") and li != nl:
                fails.append(f"{cid}-{li}: boss level not last")
            n = len(lv["questions"])
            if not 4 <= n <= 6:
                fails.append(f"{cid}-{li}: {n} questions (need 4-6)")
            if not any("md" in b for b in lv["lesson"]):
                fails.append(f"{cid}-{li}: no lesson text")
            for q in lv["questions"]:
                total += 1
                nq += 1
                qid = q["id"]
                if qid in ids:
                    fails.append(f"{qid}: duplicate id")
                ids.add(qid)
                opts = q["options"]
                if len(opts) not in (2, 4) or len({clean(o) for o in opts}) != len(opts):
                    fails.append(f"{qid}: options must be 2 or 4 and distinct")
                    continue
                ck = q["check"]
                k = ck["kind"]
                if k not in KINDS:
                    unchecked.append(qid)
                    continue
                g = q.get("graph")
                try:
                    if k == "stmts":
                        assert len(ck["stmts"]) == len(opts), "stmts must match options"
                        verdict = [bool(truth_of(g, sp)) for sp in ck["stmts"]]
                        pred = None
                    else:
                        pred = KINDS[k](g, ck)
                        verdict = [bool(pred(o)) for o in opts]
                except Exception as ex:  # noqa: BLE001
                    fails.append(f"{qid} [{k}]: verifier error: {ex!r}")
                    continue
                if verdict != [True] + [False] * (len(opts) - 1):
                    hint = getattr(pred, "truth", None)
                    fails.append(f"{qid} [{k}]: verdicts {verdict} for {opts}" + (f"  (truth={hint})" if hint is not None else ""))
                stats[k] = stats.get(k, 0) + 1
        print(f"{cid}: {nl} levels, {nq} questions")
    print(f"\nchecked {total - len(unchecked)}/{total} questions by machine")
    print("kinds:", ", ".join(f"{k}={v}" for k, v in sorted(stats.items())))
    if unchecked:
        print("UNCHECKED (kind not machine-verifiable):", ", ".join(unchecked))
    if fails:
        print(f"\n{len(fails)} FAILURE(S):")
        for f in fails:
            print(" -", f)
        sys.exit(1)
    print("ALL ANSWERS VERIFIED")


if __name__ == "__main__":
    main()
