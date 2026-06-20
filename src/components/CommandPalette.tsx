"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export interface SearchItem {
  title: string;
  /** Shown under the title — the group · frequency, the "finds" hint, etc. */
  subtitle: string;
  href: string;
  /** Extra match terms (recognition cues, pattern triggers) — not displayed. */
  keywords?: string[];
}

export default function CommandPalette({
  items,
  labels,
}: {
  items: SearchItem[];
  labels: { search: string; searchPlaceholder: string; noResults: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.subtitle.toLowerCase().includes(q) ||
        (it.keywords ?? []).some((k) => k.toLowerCase().includes(q)),
    );
  }, [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].href);
    }
  };

  return (
    <>
      <button
        type="button"
        className="search-trigger"
        onClick={() => setOpen(true)}
        aria-label={labels.search}
      >
        <span className="search-trigger-icon" aria-hidden>
          ⌕
        </span>
        <span className="search-trigger-label">{labels.search}</span>
        <kbd className="search-trigger-kbd">⌘K</kbd>
      </button>

      {open && (
        <div
          className="palette-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="palette" role="dialog" aria-modal="true">
            <input
              ref={inputRef}
              className="palette-input"
              placeholder={labels.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onListKey}
            />
            <ul className="palette-list">
              {results.length === 0 && (
                <li className="palette-empty">{labels.noResults}</li>
              )}
              {results.map((it, i) => (
                <li key={it.href}>
                  <button
                    type="button"
                    className={`palette-item${i === active ? " is-active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(it.href)}
                  >
                    <span className="palette-item-title">{it.title}</span>
                    <span className="palette-item-meta">{it.subtitle}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
