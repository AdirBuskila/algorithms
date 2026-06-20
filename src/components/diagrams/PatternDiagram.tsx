import type { DiagramId } from "@/lib/patterns";

// Lightweight, theme-aware inline SVGs for the reduction patterns. They use
// currentColor for strokes and CSS vars for accents, so they track light/dark
// and RTL automatically (the parent flips with `dir`, the geometry is neutral).

const NODE = "var(--card)";
const STROKE = "var(--text-dim)";
const ACCENT = "var(--accent)";
const TEXT = "var(--text)";

function Arrow({
  x1,
  y1,
  x2,
  y2,
  label,
  accent,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  accent?: boolean;
}) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={accent ? ACCENT : STROKE}
        strokeWidth={accent ? 1.6 : 1.1}
        markerEnd="url(#pd-arrow)"
      />
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 3}
          fill={STROKE}
          fontSize="8"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function Node({
  x,
  y,
  label,
  r = 11,
  accent,
}: {
  x: number;
  y: number;
  label: string;
  r?: number;
  accent?: boolean;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={NODE}
        stroke={accent ? ACCENT : STROKE}
        strokeWidth={accent ? 1.6 : 1.1}
      />
      <text x={x} y={y + 3} fill={TEXT} fontSize="9" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <marker
        id="pd-arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L10,5 L0,10 z" fill={STROKE} />
      </marker>
    </defs>
  );
}

function BipartiteFlow() {
  const L = [40, 80, 120];
  return (
    <svg viewBox="0 0 260 160" className="pattern-svg" role="img">
      <Defs />
      <Node x={20} y={80} label="s" accent />
      {L.map((y, i) => (
        <Node key={`u${i}`} x={110} y={y} label={`u${i + 1}`} />
      ))}
      {L.map((y, i) => (
        <Node key={`v${i}`} x={185} y={y} label={`v${i + 1}`} />
      ))}
      <Node x={240} y={80} label="t" accent />
      {L.map((y, i) => (
        <Arrow key={`su${i}`} x1={31} y1={80} x2={99} y2={y} label="1" />
      ))}
      <Arrow x1={121} y1={40} x2={174} y2={40} label="1" accent />
      <Arrow x1={121} y1={40} x2={174} y2={80} label="1" accent />
      <Arrow x1={121} y1={80} x2={174} y2={80} label="1" accent />
      <Arrow x1={121} y1={120} x2={174} y2={120} label="1" accent />
      {L.map((y, i) => (
        <Arrow key={`vt${i}`} x1={196} y1={y} x2={229} y2={80} label="1" />
      ))}
    </svg>
  );
}

function Condensation() {
  return (
    <svg viewBox="0 0 260 130" className="pattern-svg" role="img">
      <Defs />
      <rect x={6} y={45} width={70} height={40} rx={8} fill={NODE} stroke={ACCENT} strokeWidth={1.6} />
      <text x={41} y={62} fill={TEXT} fontSize="9" textAnchor="middle">{"{a,b,e}"}</text>
      <text x={41} y={75} fill={STROKE} fontSize="7" textAnchor="middle">source · root</text>

      <rect x={110} y={10} width={56} height={34} rx={8} fill={NODE} stroke={STROKE} strokeWidth={1.1} />
      <text x={138} y={31} fill={TEXT} fontSize="9" textAnchor="middle">{"{c,d}"}</text>

      <rect x={186} y={75} width={66} height={40} rx={8} fill={NODE} stroke={STROKE} strokeWidth={1.1} />
      <text x={219} y={92} fill={TEXT} fontSize="9" textAnchor="middle">{"{f,g}"}</text>
      <text x={219} y={105} fill={STROKE} fontSize="7" textAnchor="middle">sink · drainage</text>

      <Arrow x1={76} y1={58} x2={108} y2={30} />
      <Arrow x1={76} y1={72} x2={184} y2={92} />
      <Arrow x1={150} y1={44} x2={200} y2={73} />
    </svg>
  );
}

function VertexSplit() {
  return (
    <svg viewBox="0 0 260 100" className="pattern-svg" role="img">
      <Defs />
      <Node x={22} y={50} label="a" />
      <Node x={22} y={20} label="b" />
      <Node x={120} y={35} label="vᵢₙ" accent />
      <Node x={185} y={35} label="vₒᵤₜ" accent />
      <Node x={238} y={35} label="c" />
      <Arrow x1={33} y1={48} x2={108} y2={37} />
      <Arrow x1={33} y1={22} x2={108} y2={33} />
      <Arrow x1={131} y1={35} x2={173} y2={35} label="cap(v)" accent />
      <Arrow x1={196} y1={35} x2={227} y2={35} />
    </svg>
  );
}

function Layered() {
  const layer = (x: number, k: number) => (
    <g key={k}>
      <rect x={x} y={18} width={56} height={84} rx={8} fill="none" stroke={STROKE} strokeDasharray="3 3" strokeWidth={1} />
      <text x={x + 28} y={14} fill={STROKE} fontSize="8" textAnchor="middle">{`layer ${k}`}</text>
      <Node x={x + 18} y={42} label="u" r={9} />
      <Node x={x + 38} y={78} label="m" r={9} accent />
    </g>
  );
  return (
    <svg viewBox="0 0 250 116" className="pattern-svg" role="img">
      <Defs />
      {layer(10, 0)}
      {layer(96, 1)}
      {layer(182, 2)}
      {/* a "jump" edge ending at a marked vertex moves up a layer */}
      <Arrow x1={48} y1={78} x2={114} y2={42} accent />
      <Arrow x1={134} y1={78} x2={200} y2={42} accent />
    </svg>
  );
}

const DIAGRAMS: Record<DiagramId, () => React.JSX.Element> = {
  bipartiteFlow: BipartiteFlow,
  condensation: Condensation,
  vertexSplit: VertexSplit,
  layered: Layered,
};

export default function PatternDiagram({ id }: { id: DiagramId }) {
  const D = DIAGRAMS[id];
  if (!D) return null;
  return (
    <figure className="pattern-diagram">
      <D />
    </figure>
  );
}
