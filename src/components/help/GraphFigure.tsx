import { useId } from "react";
import type { HelpEdge, HelpGraph } from "@/lib/helpTypes";
import { HelpInline } from "@/components/help/HelpMd";

const R = 17; // node radius

function label(g: HelpGraph, e: HelpEdge): string {
  if (e.inf) return "∞";
  if (e.f !== undefined) return `${e.f}/${e.w}`;
  return g.labels ? String(e.w) : "";
}

function geometry(g: HelpGraph, e: HelpEdge) {
  const [x1, y1] = g.nodes[e.from];
  const [x2, y2] = g.nodes[e.to];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const tipGap = g.directed ? R + 4 : R;
  const sx = x1 + ux * R;
  const sy = y1 + uy * R;
  const ex = x2 - ux * tipGap;
  const ey = y2 - uy * tipGap;
  if (e.curve) {
    const bow = 34 * e.curve;
    const cx = (x1 + x2) / 2 + px * bow;
    const cy = (y1 + y2) / 2 + py * bow;
    return {
      d: `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`,
      lx: 0.25 * sx + 0.5 * cx + 0.25 * ex,
      ly: 0.25 * sy + 0.5 * cy + 0.25 * ey + (e.curve > 0 ? 4 : 4),
    };
  }
  return {
    d: `M${sx},${sy} L${ex},${ey}`,
    lx: (x1 + x2) / 2 + px * 12,
    ly: (y1 + y2) / 2 + py * 12 + 4,
  };
}

/** Draws a question/lesson graph as inline SVG. Always left-to-right, whatever the page direction. */
export default function GraphFigure({ graph, caption }: { graph: HelpGraph; caption?: string }) {
  const uid = useId().replace(/:/g, "");
  const [w, h] = graph.size ?? [400, 220];
  const hl = new Set(graph.hlNodes ?? []);
  return (
    <figure className="gfig" dir="ltr">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={caption ?? "graph"}
        style={{ maxWidth: Math.max(w, 340) }}
      >
        <defs>
          <marker
            id={`${uid}-arr`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" className="gfig-arrow" />
          </marker>
          <marker
            id={`${uid}-arr-hl`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" className="gfig-arrow-hl" />
          </marker>
        </defs>
        {graph.edges.map((e, i) => {
          const geo = geometry(graph, e);
          const text = label(graph, e);
          return (
            <g key={i}>
              <path
                d={geo.d}
                fill="none"
                className={e.hl ? "gfig-edge gfig-edge-hl" : "gfig-edge"}
                markerEnd={graph.directed ? `url(#${uid}-arr${e.hl ? "-hl" : ""})` : undefined}
              />
              {text && (
                <text x={geo.lx} y={geo.ly} textAnchor="middle" className="gfig-label">
                  {text}
                </text>
              )}
            </g>
          );
        })}
        {Object.entries(graph.nodes).map(([name, [x, y]]) => {
          const special = name === graph.s || name === graph.t;
          return (
            <g key={name}>
              <circle
                cx={x}
                cy={y}
                r={R}
                className={`gfig-node${hl.has(name) ? " gfig-node-hl" : ""}${special ? " gfig-node-st" : ""}`}
              />
              <text x={x} y={y + 5} textAnchor="middle" className="gfig-node-text">
                {name}
              </text>
              {graph.nodeNotes?.[name] && (
                <text x={x} y={y + R + 14} textAnchor="middle" className="gfig-note">
                  {graph.nodeNotes[name]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {caption && (
        <figcaption className="gfig-cap" dir="rtl" lang="he">
          <HelpInline md={caption} />
        </figcaption>
      )}
    </figure>
  );
}
