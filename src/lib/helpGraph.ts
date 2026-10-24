import type {
  HelpCourse,
  HelpEdge,
  HelpGraph,
  HelpLevel,
  HelpQuestion,
} from "./helpTypes.ts";

// Compact builder for the course data, so a graph is one readable block.
//   nodes: "s:30,110 a:140,40 t:350,110"
//   edges: "s>a:4/3  a>b:2~1  *a>t:3  x-y:5  p-q"
//     a>b   directed edge (a-b undirected)
//     :4    capacity / weight (negative allowed, "inf" for infinity)
//     /3    flow on the edge (draws "3/4")
//     ~1    bow the edge (use ~1 and ~1 on an antiparallel pair)
//     *     emphasise the edge
//     no ":" means an unlabeled edge (matching graphs)
export function G(opts: {
  nodes: string;
  edges: string;
  directed?: boolean;
  s?: string;
  t?: string;
  size?: [number, number];
  hlNodes?: string;
  notes?: Record<string, string>;
}): HelpGraph {
  const nodes: Record<string, [number, number]> = {};
  for (const tok of opts.nodes.trim().split(/\s+/)) {
    const m = tok.match(/^([^:]+):(-?\d+),(-?\d+)$/);
    if (!m) throw new Error(`bad node token "${tok}"`);
    nodes[m[1]] = [Number(m[2]), Number(m[3])];
  }
  const edges: HelpEdge[] = [];
  let labels = false;
  let directed = opts.directed ?? true;
  for (const tok of opts.edges.trim().split(/\s+/)) {
    const m = tok.match(
      /^(\*)?([A-Za-z0-9]+)([>-])([A-Za-z0-9]+)(?::(-?\d+(?:\.\d+)?|inf)(?:\/(-?\d+))?)?(?:~(-?\d+))?$/,
    );
    if (!m) throw new Error(`bad edge token "${tok}"`);
    const [, star, a, sep, b, w, f, curve] = m;
    if (sep === "-") directed = false;
    if (!nodes[a] || !nodes[b]) throw new Error(`edge "${tok}" uses an unknown node`);
    const e: HelpEdge = { from: a, to: b, w: w === undefined ? 1 : w === "inf" ? 1e9 : Number(w) };
    if (w !== undefined) labels = true;
    if (w === "inf") e.inf = true;
    if (f !== undefined) e.f = Number(f);
    if (curve !== undefined) e.curve = Number(curve);
    if (star) e.hl = true;
    edges.push(e);
  }
  const g: HelpGraph = { directed, nodes, edges, labels };
  if (opts.s) g.s = opts.s;
  if (opts.t) g.t = opts.t;
  if (opts.size) g.size = opts.size;
  if (opts.hlNodes) g.hlNodes = opts.hlNodes.trim().split(/\s+/);
  if (opts.notes) g.nodeNotes = opts.notes;
  return g;
}

type AuthoredQuestion = Omit<HelpQuestion, "id">;
type AuthoredLevel = Omit<HelpLevel, "questions"> & { questions: AuthoredQuestion[] };

/** Assigns stable question ids ("flow-3.2" = course flow, level 3, question 2). */
export function defineCourse(
  c: Omit<HelpCourse, "levels"> & { levels: AuthoredLevel[] },
): HelpCourse {
  return {
    ...c,
    levels: c.levels.map((lv, li) => ({
      ...lv,
      questions: lv.questions.map((q, qi) => ({ ...q, id: `${c.id}-${li + 1}.${qi + 1}` })),
    })),
  };
}
