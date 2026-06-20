"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  DecisionBranch,
  DecisionLeaf,
  DecisionNode,
  DecisionTree,
} from "@/lib/decision";

// Local type guard so this client component never imports the fs-backed loader.
function isLeaf(node: DecisionNode): node is DecisionLeaf {
  return (node as DecisionLeaf).slug !== undefined;
}

export interface DecisionLabels {
  back: string;
  reset: string;
}

export default function DecisionDiagram({
  tree,
  lang,
  labels,
}: {
  tree: DecisionTree;
  lang: string;
  labels: DecisionLabels;
}) {
  // The branches the user has chosen, from the root down.
  const [trail, setTrail] = useState<DecisionBranch[]>([]);

  const current: DecisionNode =
    trail.length === 0 ? tree.root : trail[trail.length - 1].node;

  const choose = (b: DecisionBranch) => setTrail((t) => [...t, b]);
  const back = () => setTrail((t) => t.slice(0, -1));
  const reset = () => setTrail([]);
  const jumpTo = (i: number) => setTrail((t) => t.slice(0, i + 1));

  return (
    <div className="decision">
      {trail.length > 0 && (
        <div className="decision-trail">
          <button type="button" className="decision-crumb" onClick={reset}>
            ↺ {labels.reset}
          </button>
          {trail.map((b, i) => (
            <button
              key={i}
              type="button"
              className="decision-crumb is-step"
              onClick={() => jumpTo(i)}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      {isLeaf(current) ? (
        <div className="decision-leaf">
          <span className="decision-leaf-label">→</span>
          <Link
            href={`/${lang}/algorithms/${current.slug}/`}
            className="decision-leaf-tool"
          >
            {current.tool}
            <span className="decision-leaf-go" aria-hidden>
              ↗
            </span>
          </Link>
          <code className="decision-leaf-complexity">{current.complexity}</code>
          {current.note && (
            <p className="decision-leaf-note">{current.note}</p>
          )}
          <div className="decision-actions">
            <button type="button" className="decision-back" onClick={back}>
              ← {labels.back}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="decision-q">{current.q}</p>
          <div className="decision-branches">
            {current.branches.map((b, i) => (
              <button
                key={i}
                type="button"
                className="decision-branch"
                onClick={() => choose(b)}
              >
                {b.label}
              </button>
            ))}
          </div>
          {trail.length > 0 && (
            <div className="decision-actions">
              <button type="button" className="decision-back" onClick={back}>
                ← {labels.back}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
