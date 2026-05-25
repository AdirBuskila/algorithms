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
