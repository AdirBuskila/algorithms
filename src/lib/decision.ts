import fs from "node:fs";
import path from "node:path";
import { type Locale } from "@/lib/content";

const DECISION_DIR = path.join(process.cwd(), "content", "decision");

/** A terminal recommendation: the tool to reach for. */
export interface DecisionLeaf {
  tool: string;
  /** Algorithm slug to link to. */
  slug: string;
  complexity: string;
  note?: string;
}

/** A branch: a label the user can pick, leading to a sub-question or a leaf. */
export interface DecisionBranch {
  label: string;
  node: DecisionNode;
}

/** A question with branches, or a terminal leaf. */
export type DecisionNode =
  | { q: string; branches: DecisionBranch[] }
  | DecisionLeaf;

export function isLeaf(node: DecisionNode): node is DecisionLeaf {
  return (node as DecisionLeaf).slug !== undefined;
}

export interface DecisionTree {
  root: { q: string; branches: DecisionBranch[] };
}

export function getDecisionTree(lang: Locale): DecisionTree {
  const file = path.join(DECISION_DIR, `decision.${lang}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as DecisionTree;
}
