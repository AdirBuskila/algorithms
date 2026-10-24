// Types for the "צריך עזרה?" guided courses. Type-only: the data files import this with
// `import type`, so the Node dump script can load them without resolving the "@/" alias.

export interface HelpEdge {
  from: string;
  to: string;
  /** capacity (flow networks) or weight (shortest paths); 1 for unlabeled graphs */
  w: number;
  /** current flow on the edge, drawn as "f/c" */
  f?: number;
  /** bow the edge sideways (use +1 / -1 for an antiparallel pair) */
  curve?: number;
  /** draw the edge emphasised (path, matched edge, cut edge) */
  hl?: boolean;
  /** show "∞" instead of the number */
  inf?: boolean;
}

export interface HelpGraph {
  directed: boolean;
  nodes: Record<string, [number, number]>;
  edges: HelpEdge[];
  s?: string;
  t?: string;
  /** viewBox size, default [400, 220] */
  size?: [number, number];
  /** false for unweighted graphs (matching) */
  labels: boolean;
  /** nodes drawn with the accent fill (a cut side, a visited set) */
  hlNodes?: string[];
  /** optional extra text drawn under a node, e.g. a distance */
  nodeNotes?: Record<string, string>;
}

export type HelpBlock =
  | { md: string }
  | { viz: { file: string; height: number; caption: string } }
  | { graph: HelpGraph; caption?: string };

export interface HelpCheck {
  kind: string;
  [param: string]: unknown;
}

export interface HelpQuestion {
  id: string;
  /** markdown, may contain $math$ and a table */
  q: string;
  graph?: HelpGraph;
  /** the CORRECT option is always options[0]; the page shuffles per question id */
  options: string[];
  /** explanation shown after answering (markdown) */
  why: string;
  /** machine check recipe, consumed by scripts/help/verify.py */
  check: HelpCheck;
}

export interface HelpLevel {
  title: string;
  icon: string;
  goal: string;
  boss?: boolean;
  lesson: HelpBlock[];
  questions: HelpQuestion[];
}

export interface HelpCourse {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  intro: string;
  /** the existing algorithm notes that cover this topic */
  notes: { slug: string; label: string }[];
  /** share of past exams touching the topic, for the hub card */
  examNote: string;
  levels: HelpLevel[];
}
