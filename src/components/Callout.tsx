import type { ReactNode } from "react";

const ICONS: Record<string, string> = {
  note: "📝",
  tip: "💡",
  info: "ℹ️",
  example: "🔎",
  warning: "⚠️",
  danger: "🚫",
};

const DEFAULT_TITLES: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  info: "Info",
  example: "Example",
  warning: "Warning",
  danger: "Warning",
};

export default function Callout({
  type = "note",
  title,
  children,
}: {
  type?: string;
  title?: string;
  children?: ReactNode;
}) {
  const t = (type || "note").toLowerCase();
  return (
    <div className={`callout callout-${t}`}>
      <div className="callout-title">
        <span aria-hidden>{ICONS[t] ?? ICONS.note}</span>
        <span>{title || DEFAULT_TITLES[t] || "Note"}</span>
      </div>
      <div className="callout-body">{children}</div>
    </div>
  );
}
