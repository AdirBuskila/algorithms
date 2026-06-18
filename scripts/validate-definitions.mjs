// Validates the definitions glossary. Run by `npm run validate:definitions`
// and automatically before `npm run build`. Exits non-zero on any problem.
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "content", "definitions");
const ALGO_DIR = path.join(process.cwd(), "content", "algorithms");
const LOCALES = ["en", "he"];
const CATEGORIES = new Set([
  "graph-basics",
  "connectivity",
  "trees",
  "distances",
  "special-graphs",
  "ordering",
  "flow",
  "matching",
]);

function read(locale) {
  const p = path.join(DIR, `definitions.${locale}.json`);
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
    errors.push(`Cannot read definitions.${loc}.json: ${e.message}`);
  }
}

if (data.en && data.he) {
  const slugs = algorithmSlugs();
  const ids = new Set();
  for (const d of data.en) {
    if (ids.has(d.id)) errors.push(`Duplicate id: ${d.id}`);
    ids.add(d.id);
    if (!CATEGORIES.has(d.category)) errors.push(`${d.id}: bad category "${d.category}"`);
    if (d.algorithm && !slugs.has(d.algorithm))
      errors.push(`${d.id}: unknown algorithm "${d.algorithm}"`);
    if (!d.term?.trim()) errors.push(`${d.id}: empty term`);
    if (!d.definition?.trim()) errors.push(`${d.id}: empty definition`);
  }

  const heById = new Map(data.he.map((d) => [d.id, d]));
  for (const id of ids) {
    if (!heById.has(id)) errors.push(`Missing Hebrew entry for id: ${id}`);
  }
  for (const d of data.he) {
    if (!ids.has(d.id)) errors.push(`Hebrew has an extra id not in English: ${d.id}`);
    if (!d.term?.trim()) errors.push(`${d.id} (he): empty term`);
    if (!d.definition?.trim()) errors.push(`${d.id} (he): empty definition`);
    const en = data.en.find((e) => e.id === d.id);
    if (en && en.category !== d.category) errors.push(`${d.id}: category differs en/he`);
    if (en && (en.algorithm ?? null) !== (d.algorithm ?? null))
      errors.push(`${d.id}: algorithm differs en/he`);
  }

  // ids must appear in the same order in both files
  const enIds = data.en.map((d) => d.id);
  const heIds = data.he.map((d) => d.id);
  if (enIds.length === heIds.length && enIds.join("|") !== heIds.join("|"))
    errors.push("EN/HE definitions share ids but in a different order");
}

if (errors.length) {
  console.error(`✗ Definitions validation failed (${errors.length}):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✓ Definitions valid (${data.en?.length ?? 0} per locale).`);
