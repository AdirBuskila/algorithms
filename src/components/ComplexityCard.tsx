import katex from "katex";
import type { Complexity } from "@/lib/content";

function tex(expr: string): string {
  return katex.renderToString(expr, { throwOnError: false, displayMode: false });
}

function Item({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="complexity-item">
      <div className="complexity-label">{label}</div>
      <div
        className="complexity-value"
        dangerouslySetInnerHTML={{ __html: tex(value) }}
      />
      {note ? <div className="complexity-note">{note}</div> : null}
    </div>
  );
}

export default function ComplexityCard({
  complexity,
  labels,
}: {
  complexity: Complexity;
  labels: { runningTime: string; space: string };
}) {
  return (
    <div className="complexity">
      <Item
        label={labels.runningTime}
        value={complexity.time}
        note={complexity.timeNote}
      />
      <Item
        label={labels.space}
        value={complexity.space}
        note={complexity.spaceNote}
      />
    </div>
  );
}
