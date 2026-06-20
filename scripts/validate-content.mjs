// Validates the recognition cues, decision tree, and reduction patterns.
// Run by `npm run validate:content` and automatically before `npm run build`.
// Exits non-zero on any problem.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ALGO_DIR = path.join(ROOT, "content", "algorithms");
const LOCALES = ["en", "he"];
const PATTERN_CATEGORIES = new Set([
  "reduction",
  "scc-toolkit",
  "transform",
  "tree",
]);
const DIAGRAMS = new Set(["bipartiteFlow", "condensation", "vertexSplit", "layered"]);

const errors = [];

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function algorithmSlugs() {
  const slugs = new Set();
  for (const f of fs.readdirSync(ALGO_DIR)) {
    const m = f.match(/^(.+)\.(en|he)\.md$/);
    if (m) slugs.add(m[1]);
  }
  return slugs;
}

const slugs = algorithmSlugs();

// ---- recognition --------------------------------------------------------
const recognition = {};
for (const loc of LOCALES) {
  try {
    recognition[loc] = readJson(`content/recognition/recognition.${loc}.json`);
  } catch (e) {
    errors.push(`Cannot read recognition.${loc}.json: ${e.message}`);
  }
}
if (recognition.en && recognition.he) {
  for (const loc of LOCALES) {
    for (const r of recognition[loc]) {
      if (!slugs.has(r.slug)) errors.push(`recognition.${loc}: unknown slug "${r.slug}"`);
      if (!r.finds?.trim()) errors.push(`recognition.${loc}/${r.slug}: empty finds`);
      if (!Array.isArray(r.cues) || r.cues.length === 0)
        errors.push(`recognition.${loc}/${r.slug}: no cues`);
    }
  }
  const enSlugs = recognition.en.map((r) => r.slug).join("|");
  const heSlugs = recognition.he.map((r) => r.slug).join("|");
  if (enSlugs !== heSlugs) errors.push("recognition: en/he slugs differ or out of order");
}

// ---- decision tree ------------------------------------------------------
function checkDecision(loc, node, where) {
  if (node.slug !== undefined) {
    if (!slugs.has(node.slug)) errors.push(`decision.${loc} ${where}: unknown slug "${node.slug}"`);
    if (!node.tool?.trim()) errors.push(`decision.${loc} ${where}: empty tool`);
    if (!node.complexity?.trim()) errors.push(`decision.${loc} ${where}: empty complexity`);
    return 1;
  }
  if (!node.q?.trim()) errors.push(`decision.${loc} ${where}: empty question`);
  if (!Array.isArray(node.branches) || node.branches.length === 0) {
    errors.push(`decision.${loc} ${where}: no branches`);
    return 0;
  }
  let leaves = 0;
  node.branches.forEach((b, i) => {
    if (!b.label?.trim()) errors.push(`decision.${loc} ${where}.${i}: empty label`);
    leaves += checkDecision(loc, b.node, `${where}.${i}`);
  });
  return leaves;
}
const decisionLeaves = {};
for (const loc of LOCALES) {
  try {
    const tree = readJson(`content/decision/decision.${loc}.json`);
    decisionLeaves[loc] = checkDecision(loc, tree.root, "root");
  } catch (e) {
    errors.push(`Cannot read decision.${loc}.json: ${e.message}`);
  }
}
if (decisionLeaves.en !== decisionLeaves.he)
  errors.push(`decision: en/he have a different number of leaves (${decisionLeaves.en} vs ${decisionLeaves.he})`);

// ---- patterns -----------------------------------------------------------
const patterns = {};
for (const loc of LOCALES) {
  try {
    patterns[loc] = readJson(`content/patterns/patterns.${loc}.json`);
  } catch (e) {
    errors.push(`Cannot read patterns.${loc}.json: ${e.message}`);
  }
}
if (patterns.en && patterns.he) {
  const ids = new Set();
  for (const p of patterns.en) {
    if (ids.has(p.id)) errors.push(`patterns: duplicate id "${p.id}"`);
    ids.add(p.id);
    if (!PATTERN_CATEGORIES.has(p.category)) errors.push(`patterns/${p.id}: bad category "${p.category}"`);
    if (p.diagram && !DIAGRAMS.has(p.diagram)) errors.push(`patterns/${p.id}: unknown diagram "${p.diagram}"`);
    if (!Array.isArray(p.algorithms) || p.algorithms.length === 0)
      errors.push(`patterns/${p.id}: no algorithms`);
    for (const a of p.algorithms ?? [])
      if (!slugs.has(a)) errors.push(`patterns/${p.id}: unknown algorithm "${a}"`);
  }
  for (const loc of LOCALES) {
    for (const p of patterns[loc]) {
      if (!p.name?.trim()) errors.push(`patterns.${loc}/${p.id}: empty name`);
      if (!p.trigger?.trim()) errors.push(`patterns.${loc}/${p.id}: empty trigger`);
      if (!p.idea?.trim()) errors.push(`patterns.${loc}/${p.id}: empty idea`);
    }
  }
  const enIds = patterns.en.map((p) => p.id).join("|");
  const heIds = patterns.he.map((p) => p.id).join("|");
  if (enIds !== heIds) errors.push("patterns: en/he ids differ or out of order");
}

if (errors.length) {
  console.error(`✗ Content validation failed (${errors.length}):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(
  `✓ Content valid (recognition ${recognition.en?.length ?? 0}, decision ${decisionLeaves.en ?? 0} leaves, patterns ${patterns.en?.length ?? 0}).`,
);
