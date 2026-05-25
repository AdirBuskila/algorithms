# True/False Practice Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a low-stakes True/False prove-disprove practice mode driven by a curated bilingual question bank, with no scoring — the learning happens in the explanation reveal.

**Architecture:** A curated `content/practice/questions.{en,he}.json` dataset is loaded at build time by a server route (`/[lang]/practice/`), which mounts one `"use client"` component (`PracticeSession`) that owns the whole experience (hub → session → review). Claims/explanations render through the existing `NoteContent` (react-markdown + KaTeX). Persistence is a single localStorage "review" list. Everything is static-export-safe.

**Tech Stack:** Next.js 16 (App Router, `output: "export"`, `trailingSlash: true`), React 19, TypeScript, react-markdown + KaTeX (already in the repo). No new dependencies.

**Verification note:** This repo has **no test runner**, and adding one is out of scope (YAGNI) for v1. The automated gates are: `node scripts/validate-questions.mjs` (dataset integrity), `npx tsc --noEmit` (type/interface integrity — the strict `Dict` enforces bilingual completeness), and `npm run build` (build + static export). Interactive behavior is verified by explicit manual steps in `next dev`. These are real, runnable checks — not placeholders.

**Branch:** Work happens on the `practice-mode` branch (already created; the design spec is committed there).

---

## File Structure

**Create:**
- `content/practice/questions.en.json` — English question bank
- `content/practice/questions.he.json` — Hebrew question bank (same `id`s/order)
- `scripts/validate-questions.mjs` — dataset validator (the data gate)
- `src/lib/practice.ts` — typed loaders + grouping (server-only; uses `node:fs`)
- `src/components/PracticeSession.tsx` — `"use client"` interactive component
- `src/app/[lang]/practice/page.tsx` — server route (loads data, mounts the component)

**Modify:**
- `package.json` — add `validate:questions` script; run it before `build`
- `src/lib/i18n.ts` — add a `practice` block to `Dict`, `en`, and `he`
- `src/app/[lang]/layout.tsx` — add a "Practice" link to the header
- `src/app/[lang]/algorithms/[slug]/page.tsx` — add a "Practice this topic" button
- `src/app/globals.css` — append practice-mode styles

---

## Task 1: Question dataset + validator

**Files:**
- Create: `content/practice/questions.en.json`
- Create: `content/practice/questions.he.json`
- Create: `scripts/validate-questions.mjs`
- Modify: `package.json`

This task seeds a small representative set (5 questions across 3 groups) so the rest of the pipeline is buildable and testable early. Task 8 expands it to full v1 coverage.

- [ ] **Step 1: Create the English seed dataset**

Create `content/practice/questions.en.json`:

```json
[
  {
    "id": "scc-2024-sembA-q1a",
    "algorithm": "scc",
    "source": "2024 Sem-B Mo'ed A · Q1a",
    "claim": "If $U$ is a strongly connected component, every directed path between two vertices of $U$ contains only vertices of $U$.",
    "answer": true,
    "explanation": "True — any two vertices of $U$ are mutually reachable, so every vertex on a directed path between them lies on a directed cycle with them and therefore belongs to the same component $U$.",
    "difficulty": "medium"
  },
  {
    "id": "bipartite-matching-2024-sembB-q1c",
    "algorithm": "bipartite-matching",
    "source": "2024 Sem-B Mo'ed B · Q1c",
    "claim": "If a graph is not bipartite, then it has no perfect matching.",
    "answer": false,
    "explanation": "False — counterexample: $K_4$ is not bipartite yet has a perfect matching. Being bipartite is not a requirement for a perfect matching.",
    "difficulty": "medium"
  },
  {
    "id": "dfs-2024-summerA-q1a",
    "algorithm": "dfs",
    "source": "2024 Summer Mo'ed A · Q1a",
    "claim": "If a vertex $a \\neq s$ has more than one child in the DFS tree, then deleting $a$ necessarily disconnects the graph.",
    "answer": false,
    "explanation": "False — a child subtree can reconnect to the rest through a back edge, so the graph can stay connected after removing $a$. A small counterexample (a cycle plus a chord) suffices.",
    "difficulty": "medium"
  },
  {
    "id": "bfs-2023-sembB-q1",
    "algorithm": "bfs",
    "source": "2023 Sem-B Mo'ed B · Q1",
    "claim": "This algorithm correctly computes the diameter of a tree: remove edge $(a,b)$, run BFS from $a$ and from $b$, and return $d_a + d_b + 1$.",
    "answer": false,
    "explanation": "False — the diameter need not pass through the removed edge $(a,b)$, so $d_a + d_b + 1$ undercounts it. A small tree where the longest path avoids $(a,b)$ is a counterexample.",
    "difficulty": "medium"
  },
  {
    "id": "transitive-closure-2022-sembA-q1b",
    "algorithm": "transitive-closure",
    "source": "2022 Sem-B Mo'ed A · Q1b",
    "claim": "If the transitive closure of $G_1$ equals the transitive closure of $G_2$, then $G_1 = G_2$.",
    "answer": false,
    "explanation": "False — different graphs can share the same transitive closure. Adding a single edge that is already implied by reachability (a transitive edge) changes the graph but not its closure.",
    "difficulty": "easy"
  }
]
```

- [ ] **Step 2: Create the Hebrew seed dataset**

Create `content/practice/questions.he.json` (same `id`s, order, `answer`, `algorithm`, `difficulty`; only `source`/`claim`/`explanation` are translated):

```json
[
  {
    "id": "scc-2024-sembA-q1a",
    "algorithm": "scc",
    "source": "2024 סמסטר ב מועד א · שאלה 1א",
    "claim": "אם $U$ היא רכיב קשירוּת חזקה, אז כל מסלול מכוון בין שני צמתים של $U$ מכיל רק צמתים של $U$.",
    "answer": true,
    "explanation": "נכון — שני צמתים ב-$U$ נגישים הדדית, ולכן כל צומת על מסלול מכוון ביניהם נמצא במעגל מכוון יחד איתם, ומכאן שהוא שייך לאותו רכיב $U$.",
    "difficulty": "medium"
  },
  {
    "id": "bipartite-matching-2024-sembB-q1c",
    "algorithm": "bipartite-matching",
    "source": "2024 סמסטר ב מועד ב · שאלה 1ג",
    "claim": "אם גרף אינו דו-צדדי, אז אין בו זיווג מושלם.",
    "answer": false,
    "explanation": "לא נכון — דוגמה נגדית: $K_4$ אינו דו-צדדי ובכל זאת יש בו זיווג מושלם. דו-צדדיוּת אינה תנאי לקיום זיווג מושלם.",
    "difficulty": "medium"
  },
  {
    "id": "dfs-2024-summerA-q1a",
    "algorithm": "dfs",
    "source": "2024 סמסטר קיץ מועד א · שאלה 1א",
    "claim": "אם לצומת $a \\neq s$ יש יותר מילד אחד בעץ ה-DFS, אז מחיקת $a$ בהכרח מנתקת את הגרף.",
    "answer": false,
    "explanation": "לא נכון — תת-עץ של ילד יכול להתחבר מחדש לשאר הגרף דרך קשת אחורית, כך שהגרף נשאר קשיר גם אחרי מחיקת $a$. מספיקה דוגמה נגדית קטנה (מעגל עם מיתר).",
    "difficulty": "medium"
  },
  {
    "id": "bfs-2023-sembB-q1",
    "algorithm": "bfs",
    "source": "2023 סמסטר ב מועד ב · שאלה 1",
    "claim": "האלגוריתם הבא מחשב נכון את הקוטר של עץ: הסר את הקשת $(a,b)$, הרץ BFS מ-$a$ ומ-$b$, והחזר $d_a + d_b + 1$.",
    "answer": false,
    "explanation": "לא נכון — הקוטר אינו חייב לעבור דרך הקשת שהוסרה $(a,b)$, ולכן $d_a + d_b + 1$ עלול להחזיר ערך קטן מדי. עץ שבו המסלול הארוך ביותר אינו עובר ב-$(a,b)$ הוא דוגמה נגדית.",
    "difficulty": "medium"
  },
  {
    "id": "transitive-closure-2022-sembA-q1b",
    "algorithm": "transitive-closure",
    "source": "2022 סמסטר ב מועד א · שאלה 1ב",
    "claim": "אם הסגור הטרנזיטיבי של $G_1$ שווה לסגור הטרנזיטיבי של $G_2$, אז $G_1 = G_2$.",
    "answer": false,
    "explanation": "לא נכון — גרפים שונים יכולים לחלוק אותו סגור טרנזיטיבי. הוספת קשת שכבר נובעת מהנגישוּת (קשת טרנזיטיבית) משנה את הגרף אך לא את הסגור שלו.",
    "difficulty": "easy"
  }
]
```

- [ ] **Step 3: Create the validator script**

Create `scripts/validate-questions.mjs`:

```js
// Validates the practice question bank. Run by `npm run validate:questions`
// and automatically before `npm run build`. Exits non-zero on any problem.
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "content", "practice");
const ALGO_DIR = path.join(process.cwd(), "content", "algorithms");
const LOCALES = ["en", "he"];
const DIFFS = new Set(["easy", "medium", "hard"]);

function read(locale) {
  const p = path.join(DIR, `questions.${locale}.json`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function algorithmSlugs() {
  const slugs = new Set();
  for (const f of fs.readdirSync(ALGO_DIR)) {
    const m = f.match(/^(.+)\.(en|he)\.md$/);
    if (m) slugs.add(m[1]);
  }
  return slugs;
}

const errors = [];
const data = {};
for (const loc of LOCALES) {
  try {
    data[loc] = read(loc);
  } catch (e) {
    errors.push(`Cannot read questions.${loc}.json: ${e.message}`);
  }
}

if (data.en && data.he) {
  const slugs = algorithmSlugs();
  const ids = new Set();
  for (const q of data.en) {
    if (ids.has(q.id)) errors.push(`Duplicate id: ${q.id}`);
    ids.add(q.id);
    if (typeof q.answer !== "boolean") errors.push(`${q.id}: answer must be boolean`);
    if (!DIFFS.has(q.difficulty)) errors.push(`${q.id}: bad difficulty "${q.difficulty}"`);
    if (!slugs.has(q.algorithm)) errors.push(`${q.id}: unknown algorithm "${q.algorithm}"`);
    if (!q.claim?.trim()) errors.push(`${q.id}: empty claim`);
    if (!q.explanation?.trim()) errors.push(`${q.id}: empty explanation`);
  }
  const heById = new Map(data.he.map((q) => [q.id, q]));
  for (const id of ids) {
    if (!heById.has(id)) errors.push(`Missing Hebrew entry for id: ${id}`);
  }
  for (const q of data.he) {
    if (!ids.has(q.id)) errors.push(`Hebrew has an extra id not in English: ${q.id}`);
    if (!q.claim?.trim()) errors.push(`${q.id} (he): empty claim`);
    if (!q.explanation?.trim()) errors.push(`${q.id} (he): empty explanation`);
    const en = data.en.find((e) => e.id === q.id);
    if (en && en.answer !== q.answer) errors.push(`${q.id}: answer differs en/he`);
    if (en && en.algorithm !== q.algorithm) errors.push(`${q.id}: algorithm differs en/he`);
  }
}

if (errors.length) {
  console.error(`✗ Practice question validation failed (${errors.length}):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✓ Practice questions valid (${data.en?.length ?? 0} per locale).`);
```

- [ ] **Step 4: Wire the validator into package.json**

In `package.json`, change the `scripts` block so `build` runs the validator first and a standalone script exists:

```json
  "scripts": {
    "dev": "next dev",
    "build": "node scripts/validate-questions.mjs && next build",
    "start": "next start",
    "sync": "node scripts/sync-notes.mjs",
    "validate:questions": "node scripts/validate-questions.mjs"
  },
```

- [ ] **Step 5: Run the validator — expect PASS**

Run: `node scripts/validate-questions.mjs`
Expected: `✓ Practice questions valid (5 per locale).`

- [ ] **Step 6: Prove the gate works — expect FAIL, then revert**

Temporarily set the `answer` of `transitive-closure-2022-sembA-q1b` in `questions.he.json` to `true` (mismatching English), then run:

Run: `node scripts/validate-questions.mjs`
Expected: exit code 1 with `- transitive-closure-2022-sembA-q1b: answer differs en/he`

Revert the change (set it back to `false`), re-run, expect the PASS line again.

- [ ] **Step 7: Commit**

```bash
git add content/practice scripts/validate-questions.mjs package.json
git commit -m "Add practice question bank seed + validator"
```

---

## Task 2: practice.ts loader + grouping

**Files:**
- Create: `src/lib/practice.ts`

This is server-only (it reads files with `node:fs`). It must never be imported for its *values* by a client component — only its `PracticeQuestion` type may be imported there.

- [ ] **Step 1: Create the loader**

Create `src/lib/practice.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { type Locale, type Group, GROUP_ORDER, getAllAlgorithms } from "@/lib/content";

const PRACTICE_DIR = path.join(process.cwd(), "content", "practice");

export interface PracticeQuestion {
  id: string;
  algorithm: string;
  source: string;
  claim: string;
  answer: boolean;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

/** All practice questions for a locale, in file order. */
export function getQuestions(lang: Locale): PracticeQuestion[] {
  const file = path.join(PRACTICE_DIR, `questions.${lang}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as PracticeQuestion[];
}

export interface PracticeOverviewGroup {
  group: Group;
  items: { algorithm: string; title: string; count: number }[];
}

/**
 * Questions grouped by the algorithm's topic group (in GROUP_ORDER), with the
 * localized algorithm title and a per-algorithm count. Algorithms with no
 * questions are omitted; groups with no questions are omitted.
 */
export function getPracticeOverview(lang: Locale): PracticeOverviewGroup[] {
  const questions = getQuestions(lang);
  const algos = getAllAlgorithms(lang);
  const metaBySlug = new Map(algos.map((a) => [a.meta.slug, a.meta]));

  const countBySlug = new Map<string, number>();
  for (const q of questions) {
    countBySlug.set(q.algorithm, (countBySlug.get(q.algorithm) ?? 0) + 1);
  }

  return GROUP_ORDER.map((group) => {
    const items = algos
      .filter((a) => a.meta.group === group && countBySlug.has(a.meta.slug))
      .map((a) => ({
        algorithm: a.meta.slug,
        title: a.meta.title,
        count: countBySlug.get(a.meta.slug) ?? 0,
      }));
    return { group, items };
  }).filter((g) => g.items.length > 0);
}
```

(`metaBySlug` is intentionally available for future use; if your linter flags it as unused, inline-remove it — it is not referenced by callers.)

Note: remove the `metaBySlug` line if the build's lint step errors on unused vars. To be safe, the version above should **not** include it. Use this exact body instead (no unused variable):

```ts
export function getPracticeOverview(lang: Locale): PracticeOverviewGroup[] {
  const questions = getQuestions(lang);
  const algos = getAllAlgorithms(lang);

  const countBySlug = new Map<string, number>();
  for (const q of questions) {
    countBySlug.set(q.algorithm, (countBySlug.get(q.algorithm) ?? 0) + 1);
  }

  return GROUP_ORDER.map((group) => {
    const items = algos
      .filter((a) => a.meta.group === group && countBySlug.has(a.meta.slug))
      .map((a) => ({
        algorithm: a.meta.slug,
        title: a.meta.title,
        count: countBySlug.get(a.meta.slug) ?? 0,
      }));
    return { group, items };
  }).filter((g) => g.items.length > 0);
}
```

- [ ] **Step 2: Type-check — expect PASS**

Run: `npx tsc --noEmit`
Expected: no output (exit 0). If `tsc` reports errors unrelated to this file that already existed, note them; this file must add none.

- [ ] **Step 3: Commit**

```bash
git add src/lib/practice.ts
git commit -m "Add practice question loader and topic grouping"
```

---

## Task 3: i18n strings

**Files:**
- Modify: `src/lib/i18n.ts`

The `Dict` interface is strict, so TypeScript will force both `en` and `he` to define the new block — that is the bilingual-completeness gate.

- [ ] **Step 1: Add the `practice` field to the `Dict` interface**

In `src/lib/i18n.ts`, inside `interface Dict { ... }`, add this field (place it right after `groups: Record<Group, string>;`):

```ts
  practice: {
    navLabel: string;
    title: string;
    intro: string;
    practiceThisTopic: string;
    practiceAll: string;
    reviewFlagged: string;
    questionsWord: string;
    labelTrue: string;
    labelFalse: string;
    correct: string;
    incorrect: string;
    why: string;
    next: string;
    readNote: string;
    wentThrough: string;
    worthReview: string;
    practiceThese: string;
    newSet: string;
    backToNotes: string;
    allClear: string;
    noQuestions: string;
  };
```

- [ ] **Step 2: Add the English strings**

In the `en` object of `STRINGS`, after its `groups: { ... },` block, add:

```ts
    practice: {
      navLabel: "Practice",
      title: "Practice",
      intro:
        "Quick True/False drills on real past-exam claims. Answer, then read why — this is practice, not a graded test.",
      practiceThisTopic: "Practice this topic",
      practiceAll: "Practice all",
      reviewFlagged: "Review flagged claims",
      questionsWord: "claims",
      labelTrue: "True",
      labelFalse: "False",
      correct: "Correct",
      incorrect: "Not quite",
      why: "Why",
      next: "Next",
      readNote: "Read the note",
      wentThrough: "You went through",
      worthReview: "Worth another look",
      practiceThese: "Practice these again",
      newSet: "New set",
      backToNotes: "Back to notes",
      allClear: "Nice — nothing flagged for review.",
      noQuestions: "No practice questions yet.",
    },
```

- [ ] **Step 3: Add the Hebrew strings**

In the `he` object of `STRINGS`, after its `groups: { ... },` block, add:

```ts
    practice: {
      navLabel: "תרגול",
      title: "תרגול",
      intro:
        "תרגול נכון/לא-נכון מהיר על טענות אמיתיות ממבחנים. ענו, ואז קראו למה — זהו תרגול, לא מבחן עם ציון.",
      practiceThisTopic: "תרגול הנושא הזה",
      practiceAll: "תרגול הכול",
      reviewFlagged: "חזרה על טענות מסומנות",
      questionsWord: "טענות",
      labelTrue: "נכון",
      labelFalse: "לא נכון",
      correct: "נכון!",
      incorrect: "לא בדיוק",
      why: "למה",
      next: "הבא",
      readNote: "למעבר לדף",
      wentThrough: "עברת על",
      worthReview: "שווה מבט נוסף",
      practiceThese: "תרגול שוב",
      newSet: "סבב חדש",
      backToNotes: "חזרה לסיכומים",
      allClear: "יפה — אין טענות מסומנות לחזרה.",
      noQuestions: "אין עדיין שאלות תרגול.",
    },
```

- [ ] **Step 4: Type-check — expect PASS**

Run: `npx tsc --noEmit`
Expected: exit 0. (If you forgot the block in one locale, `tsc` errors that the object is missing `practice` — that is the gate working.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "Add practice-mode i18n strings (en + he)"
```

---

## Task 4: PracticeSession client component

**Files:**
- Create: `src/components/PracticeSession.tsx`

CRITICAL: import only the **type** from `practice.ts` (`import type { PracticeQuestion }`). Importing a value would pull `node:fs` into the client bundle and break the build.

- [ ] **Step 1: Create the component**

Create `src/components/PracticeSession.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NoteContent from "@/components/NoteContent";
import type { PracticeQuestion } from "@/lib/practice";

const REVIEW_KEY = "algo2-practice-review";

export interface PracticeLabels {
  intro: string;
  practiceAll: string;
  reviewFlagged: string;
  questionsWord: string;
  labelTrue: string;
  labelFalse: string;
  correct: string;
  incorrect: string;
  why: string;
  next: string;
  readNote: string;
  wentThrough: string;
  worthReview: string;
  practiceThese: string;
  newSet: string;
  backToNotes: string;
  allClear: string;
  noQuestions: string;
  groups: Record<string, string>;
}

export interface OverviewGroup {
  group: string;
  items: { algorithm: string; title: string; count: number }[];
}

type View = "hub" | "session" | "review";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadReview(): string[] {
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveReview(ids: string[]) {
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export default function PracticeSession({
  questions,
  overview,
  lang,
  labels,
}: {
  questions: PracticeQuestion[];
  overview: OverviewGroup[];
  lang: string;
  labels: PracticeLabels;
}) {
  const [view, setView] = useState<View>("hub");
  const [queue, setQueue] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [missed, setMissed] = useState<PracticeQuestion[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);

  useEffect(() => {
    setReviewIds(loadReview());
  }, []);

  const startSession = useCallback((items: PracticeQuestion[]) => {
    if (items.length === 0) return;
    setQueue(shuffle(items));
    setIndex(0);
    setRevealed(false);
    setPicked(null);
    setMissed([]);
    setView("session");
  }, []);

  // Auto-start a filtered session from ?algorithm=<slug> on first mount.
  useEffect(() => {
    const algo = new URLSearchParams(window.location.search).get("algorithm");
    if (algo) {
      const items = questions.filter((q) => q.algorithm === algo);
      if (items.length) startSession(items);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = queue[index];

  const answer = useCallback(
    (value: boolean) => {
      if (!current || revealed) return;
      setPicked(value);
      setRevealed(true);
      const isCorrect = value === current.answer;
      setReviewIds((prev) => {
        const nextIds = isCorrect
          ? prev.filter((id) => id !== current.id)
          : prev.includes(current.id)
            ? prev
            : [...prev, current.id];
        saveReview(nextIds);
        return nextIds;
      });
      if (!isCorrect) setMissed((m) => [...m, current]);
    },
    [current, revealed],
  );

  const goNext = useCallback(() => {
    if (index + 1 >= queue.length) {
      setView("review");
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
      setPicked(null);
    }
  }, [index, queue.length]);

  // Keyboard: T / F to answer, ArrowRight / Enter to advance after reveal.
  useEffect(() => {
    if (view !== "session") return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!revealed && k === "t") answer(true);
      else if (!revealed && k === "f") answer(false);
      else if (revealed && (e.key === "ArrowRight" || e.key === "Enter")) goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, revealed, answer, goNext]);

  const flagged = useMemo(
    () => questions.filter((q) => reviewIds.includes(q.id)),
    [questions, reviewIds],
  );

  // ---------- HUB ----------
  if (view === "hub") {
    if (questions.length === 0) {
      return <p className="practice-empty">{labels.noQuestions}</p>;
    }
    return (
      <div className="practice-hub">
        <p className="practice-intro">{labels.intro}</p>
        <div className="practice-actions">
          <button className="practice-start" onClick={() => startSession(questions)}>
            {labels.practiceAll} ({questions.length})
          </button>
          {flagged.length > 0 && (
            <button className="practice-start is-review" onClick={() => startSession(flagged)}>
              {labels.reviewFlagged} ({flagged.length})
            </button>
          )}
        </div>
        {overview.map((g) => (
          <section key={g.group} className="practice-group">
            <h2 className="group-title">{labels.groups[g.group] ?? g.group}</h2>
            <ul className="practice-topic-list">
              {g.items.map((it) => (
                <li key={it.algorithm}>
                  <button
                    className="practice-topic"
                    onClick={() =>
                      startSession(questions.filter((q) => q.algorithm === it.algorithm))
                    }
                  >
                    <span>{it.title}</span>
                    <span className="practice-topic-count">
                      {it.count} {labels.questionsWord}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  // ---------- SESSION ----------
  if (view === "session" && current) {
    const isCorrect = picked === current.answer;
    return (
      <div className="practice-session">
        <div className="practice-progress">
          {index + 1} / {queue.length}
        </div>
        <figure className="practice-card">
          <figcaption className="practice-source">{current.source}</figcaption>
          <div className="practice-claim">
            <NoteContent markdown={current.claim} />
          </div>

          {!revealed ? (
            <div className="practice-choices">
              <button className="practice-choice" onClick={() => answer(true)}>
                {labels.labelTrue} <kbd>T</kbd>
              </button>
              <button className="practice-choice" onClick={() => answer(false)}>
                {labels.labelFalse} <kbd>F</kbd>
              </button>
            </div>
          ) : (
            <div className={`practice-result ${isCorrect ? "is-correct" : "is-wrong"}`}>
              <div className="practice-verdict">
                {isCorrect ? labels.correct : labels.incorrect} —{" "}
                {current.answer ? labels.labelTrue : labels.labelFalse}
              </div>
              <div className="practice-why">
                <span className="practice-why-label">{labels.why}</span>
                <NoteContent markdown={current.explanation} />
              </div>
              <div className="practice-after">
                <Link
                  className="practice-note-link"
                  href={`/${lang}/algorithms/${current.algorithm}/`}
                >
                  {labels.readNote} →
                </Link>
                <button className="practice-next" onClick={goNext}>
                  {labels.next} →
                </button>
              </div>
            </div>
          )}
        </figure>
      </div>
    );
  }

  // ---------- REVIEW ----------
  return (
    <div className="practice-review">
      <p className="practice-done">
        {labels.wentThrough} {queue.length} {labels.questionsWord}.
      </p>
      {missed.length > 0 ? (
        <>
          <h2 className="group-title">{labels.worthReview}</h2>
          <ul className="practice-missed">
            {missed.map((q) => (
              <li key={q.id} className="practice-missed-item">
                <div className="practice-source">{q.source}</div>
                <NoteContent markdown={q.claim} />
                <div className="practice-why">
                  <NoteContent markdown={q.explanation} />
                </div>
              </li>
            ))}
          </ul>
          <button className="practice-start" onClick={() => startSession(missed)}>
            {labels.practiceThese}
          </button>
        </>
      ) : (
        <p className="practice-allclear">{labels.allClear}</p>
      )}
      <div className="practice-actions">
        <button className="practice-start" onClick={() => startSession(questions)}>
          {labels.newSet}
        </button>
        <Link className="practice-note-link" href={`/${lang}/`}>
          {labels.backToNotes}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check — expect PASS**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/PracticeSession.tsx
git commit -m "Add PracticeSession interactive component"
```

---

## Task 5: Practice route page

**Files:**
- Create: `src/app/[lang]/practice/page.tsx`

- [ ] **Step 1: Create the route**

Create `src/app/[lang]/practice/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/content";
import { t } from "@/lib/i18n";
import { getQuestions, getPracticeOverview } from "@/lib/practice";
import PracticeSession from "@/components/PracticeSession";

type Params = { lang: string };

export function generateStaticParams(): Params[] {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  const s = t(lang as Locale);
  return { title: `${s.practice.title} — Algo 2` };
}

export default async function PracticePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!LOCALES.includes(lang as Locale)) notFound();
  const L = lang as Locale;
  const s = t(L);

  const questions = getQuestions(L);
  const overview = getPracticeOverview(L);

  return (
    <main className="page">
      <header className="algo-header">
        <h1>{s.practice.title}</h1>
      </header>
      <PracticeSession
        questions={questions}
        overview={overview}
        lang={L}
        labels={{ ...s.practice, groups: s.groups }}
      />
    </main>
  );
}
```

- [ ] **Step 2: Build — expect the route to be exported**

Run: `npm run build`
Expected: build succeeds; the route list includes `/[lang]/practice` and the validator prints its PASS line first. Confirm the files exist:

Run: `ls out/en/practice/index.html out/he/practice/index.html`
Expected: both paths exist.

- [ ] **Step 3: Manual check in dev**

Start dev if not running (`npm run dev`), then open `http://localhost:3000/en/practice/`:
- The hub shows the intro line, "Practice all (5)", and topic buttons grouped under their group headings.
- Click a topic → a card appears with the source tag and the claim (math rendered).
- Press `T` or `F` (or click) → verdict + explanation + "Read the note →" + "Next →".
- `→` advances; after the last card the review screen shows missed claims (if any) and "New set".
- Open `http://localhost:3000/he/practice/` → Hebrew text, RTL layout, KaTeX renders.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[lang]/practice/page.tsx"
git commit -m "Add /[lang]/practice route"
```

---

## Task 6: Entry points (header link + per-topic button)

**Files:**
- Modify: `src/app/[lang]/layout.tsx`
- Modify: `src/app/[lang]/algorithms/[slug]/page.tsx`

- [ ] **Step 1: Add the header "Practice" link**

In `src/app/[lang]/layout.tsx`, the header currently renders `<CommandPalette ... />` then `<LanguageToggle ... />` inside `<div className="header-actions">`. Add a Practice link before the `CommandPalette`. First ensure `Link` is imported (it already is). Change the `header-actions` block to:

```tsx
          <div className="header-actions">
            <Link href={`/${L}/practice/`} className="header-practice-link">
              {s.practice.navLabel}
            </Link>
            <CommandPalette
              items={searchItems}
              lang={L}
              labels={{
                search: s.searchHint,
                searchPlaceholder: s.searchPlaceholder,
                noResults: s.noResults,
              }}
            />
            <LanguageToggle lang={L} />
          </div>
```

- [ ] **Step 2: Add the "Practice this topic" button on algorithm pages**

In `src/app/[lang]/algorithms/[slug]/page.tsx`, `Link` is already imported. Add a practice button at the end of the page, just before the closing `</main>` and after the `<nav className="pager">...</nav>` block:

```tsx
      <div className="practice-cta">
        <Link
          className="practice-cta-link"
          href={`/${L}/practice/?algorithm=${slug}`}
        >
          {s.practice.practiceThisTopic} →
        </Link>
      </div>
```

- [ ] **Step 3: Build — expect success**

Run: `npm run build`
Expected: build succeeds, route list unchanged from Task 5.

- [ ] **Step 4: Manual check in dev**

- On `http://localhost:3000/en/`, the header shows a "Practice" link → clicking goes to `/en/practice/`.
- On `http://localhost:3000/en/algorithms/scc/`, a "Practice this topic →" link appears at the bottom → clicking goes to `/en/practice/?algorithm=scc` and the session **auto-starts** with only the SCC claim.
- Repeat on `/he/...` to confirm Hebrew labels.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[lang]/layout.tsx" "src/app/[lang]/algorithms/[slug]/page.tsx"
git commit -m "Link practice mode from the header and algorithm pages"
```

---

## Task 7: Styles

**Files:**
- Modify: `src/app/globals.css`

Match the existing visual language (the site uses CSS variables like `--text-dim` and classes like `.algo-section`, `.group-title`, `.viz-frame`). Reuse the same tokens.

- [ ] **Step 1: Append the practice styles**

Append to the end of `src/app/globals.css`:

```css
/* ---------- Practice mode ---------- */
.practice-intro {
  color: var(--text-dim);
  margin: 0 0 18px;
  max-width: 60ch;
}
.practice-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}
.practice-start {
  font: inherit;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--border, #2a2a2a);
  background: var(--card, #161616);
  color: inherit;
}
.practice-start:hover { border-color: var(--accent, #6ea8fe); }
.practice-start.is-review { border-style: dashed; }

.practice-group { margin: 0 0 22px; }
.practice-topic-list { list-style: none; padding: 0; margin: 10px 0 0; display: grid; gap: 8px; }
.practice-topic {
  width: 100%;
  font: inherit;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border, #2a2a2a);
  background: var(--card, #161616);
  color: inherit;
  text-align: start;
}
.practice-topic:hover { border-color: var(--accent, #6ea8fe); }
.practice-topic-count { color: var(--text-dim); font-size: 13px; white-space: nowrap; }

.practice-progress { color: var(--text-dim); font-size: 13px; margin-bottom: 10px; }
.practice-card {
  margin: 0;
  padding: 22px;
  border-radius: 14px;
  border: 1px solid var(--border, #2a2a2a);
  background: var(--card, #161616);
}
.practice-source { color: var(--text-dim); font-size: 12.5px; margin-bottom: 12px; }
.practice-claim { font-size: 17px; line-height: 1.5; }

.practice-choices { display: flex; gap: 12px; margin-top: 22px; }
.practice-choice {
  flex: 1;
  font: inherit;
  cursor: pointer;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--border, #2a2a2a);
  background: transparent;
  color: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.practice-choice:hover { border-color: var(--accent, #6ea8fe); }
.practice-choice kbd {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid var(--border, #2a2a2a);
  color: var(--text-dim);
}

.practice-result { margin-top: 20px; }
.practice-verdict { font-weight: 600; margin-bottom: 12px; }
.practice-result.is-correct .practice-verdict { color: #4ade80; }
.practice-result.is-wrong .practice-verdict { color: #f87171; }
.practice-why { color: var(--text); }
.practice-why-label {
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 4px;
}
.practice-after {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
}
.practice-note-link { color: var(--accent, #6ea8fe); text-decoration: none; }
.practice-note-link:hover { text-decoration: underline; }
.practice-next {
  font: inherit;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--accent, #6ea8fe);
  background: transparent;
  color: inherit;
}

.practice-missed { list-style: none; padding: 0; margin: 10px 0 18px; display: grid; gap: 14px; }
.practice-missed-item {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border, #2a2a2a);
  background: var(--card, #161616);
}
.practice-done { font-size: 17px; }
.practice-allclear { color: #4ade80; }

.header-practice-link { color: inherit; text-decoration: none; opacity: 0.85; }
.header-practice-link:hover { opacity: 1; }
.practice-cta { margin-top: 28px; }
.practice-cta-link {
  display: inline-block;
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--accent, #6ea8fe);
  color: var(--accent, #6ea8fe);
  text-decoration: none;
}
.practice-cta-link:hover { background: rgba(110, 168, 254, 0.08); }
```

(If `globals.css` defines different variable names for card/border/accent colors, substitute them. The `var(--x, fallback)` form already degrades gracefully.)

- [ ] **Step 2: Manual visual check**

In `next dev`, reload `/en/practice/` and an algorithm page. Confirm the hub, the card, the True/False buttons, the correct/wrong verdict colors, the per-topic button, and the header link all look consistent with the rest of the site, in both `/en/` (LTR) and `/he/` (RTL).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "Style practice mode"
```

---

## Task 8: Expand the question bank to full v1 coverage

**Files:**
- Modify: `content/practice/questions.en.json`
- Modify: `content/practice/questions.he.json`

Source of truth: `C:\Users\Adir\Desktop\Adir\busi-notes\Algo-2\practice-by-topic-en.md` (English) and `practice-by-topic.md` (Hebrew). For any answer not stated in those docs, confirm against the solution PDF in `C:\Users\Adir\Desktop\BSC\שנה ב\סמסטר ב\אלגוריתמים 2\מבחנים\<year>\` (a file containing `פתרון` is the solution).

- [ ] **Step 1: Add every definite-answer prove/disprove item**

For each bullet in `practice-by-topic-en.md` that is a prove/disprove claim with a **determinable** answer — i.e. it is marked `(true)`/`(false)`, or its `Hint:` makes the truth value unambiguous — append one object to **both** JSON files following the exact shape from Task 1. Rules:

- `id`: `<algorithm-slug>-<year><sitting>-<qref>`, lowercase, unique. Sitting codes: `sembA`/`sembB`/`sembC`/`sembSpecial`/`summerA`/`summerB`/`summerC`/`sample`.
- `algorithm`: the matching content slug. Map the bank's topics to slugs: DFS→`dfs`, BFS→`bfs`, SCC→`scc`, Topological Sort→`topological-sort`, Transitive Closure→`transitive-closure`, Shortest Paths 6a→`dijkstra`, 6b→`bellman-ford`, 6c→`floyd-warshall`, 6d→`dag-shortest-path` (or the specific algorithm named), Network Flow→`network-flow`, Bipartite Matching→`bipartite-matching`, Approximation/VC→`vertex-cover`, DP on graphs→`dp-on-graphs`.
- `claim`: restate the bullet as a single declarative statement (not "prove/disprove…"). Use `$…$` for math so KaTeX renders.
- `answer`: `true` if the claim is provable, `false` if it is refutable.
- `explanation`: one or two sentences — the counterexample or the proof idea, taken from the bullet's hint. Use `$…$` for math.
- `difficulty`: `easy`/`medium`/`hard` — use the topic's difficulty from the Strategic Summary table as a default.
- Hebrew object: same `id`/`answer`/`algorithm`/`difficulty`; `claim`/`explanation`/`source` from `practice-by-topic.md`. Keep the two files in the same order.

Skip (do not invent answers for): open-ended "design an algorithm" / "compute" / "draw" bullets, and any prove/disprove whose answer you cannot determine from the docs or a solution PDF. Aim for ~30–40 questions total spanning all groups; do not pad.

- [ ] **Step 2: Validate — expect PASS**

Run: `node scripts/validate-questions.mjs`
Expected: `✓ Practice questions valid (N per locale).` with `N` = your final count. Fix any reported error (unknown slug, missing Hebrew entry, en/he mismatch) before continuing.

- [ ] **Step 3: Build — expect success**

Run: `npm run build`
Expected: build succeeds; `/en/practice/` and `/he/practice/` hubs now list every group that has questions.

- [ ] **Step 4: Manual spot-check in dev**

Open `/en/practice/`, run a full "Practice all" set to the review screen, miss one on purpose, confirm it appears under "Worth another look" and that "Review flagged claims (1)" shows on the hub afterward (reload the hub). Confirm a few claims render their math correctly in both locales.

- [ ] **Step 5: Commit**

```bash
git add content/practice
git commit -m "Expand practice question bank to full v1 coverage"
```

---

## Self-Review (completed while writing)

- **Spec coverage:** data model → Task 1/2; practice/not-graded framing → no score anywhere, review-only persistence (Tasks 4, 8 step 4); seeding from the bank → Tasks 1 & 8; routes/entry points → Tasks 5 & 6; session flow → Task 4; localStorage review list → Task 4; bilingual/RTL → Tasks 1, 3, plus manual RTL checks; static-export/trailingSlash → trailing-slash links + `?algorithm=` query param read client-side (Tasks 4–6); verification (validator + tsc + build + manual) → every task. No spec requirement is left without a task.
- **Type consistency:** `PracticeQuestion` (Task 2) is the single source for the question shape and is imported as a type into Task 4; `PracticeLabels`/`OverviewGroup` (Task 4) match what the page passes (`{ ...s.practice, groups: s.groups }` and `getPracticeOverview`'s return) in Task 5; the `practice` i18n keys (Task 3) are a superset of `PracticeLabels` minus `groups`, which the page supplies separately. Function names used across tasks (`getQuestions`, `getPracticeOverview`, `startSession`, `goNext`, `answer`) are consistent.
- **Placeholder scan:** no TBD/TODO; the only "author content" task (8) gives explicit rules, the source files, the slug mapping, and the validator as the gate — not a vague placeholder.
```
