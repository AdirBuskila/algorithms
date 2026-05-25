// Convenience script: pull the latest interactive visualizations (and a
// read-only copy of the raw Obsidian notes) out of the vault into this repo.
//
// Usage:
//   node scripts/sync-notes.mjs
//   VAULT="C:/path/to/Algo-2" node scripts/sync-notes.mjs
//
// It only ever WRITES to:
//   - public/visualizations/   (the *-visualization.html widgets, verbatim)
//   - content/_vault/          (raw notes, for reference — NOT rendered)
//
// It never touches content/algorithms/*.md — those are the curated, site-ready
// notes (frontmatter + "On the exam" section). To add an algorithm, author a
// new file there. See README.md.

import fs from "node:fs";
import path from "node:path";

const VAULT =
  process.env.VAULT ||
  "C:/Users/Adir/Desktop/Adir/busi-notes/Algo-2";

const ROOT = path.resolve(import.meta.dirname, "..");
const VIZ_DEST = path.join(ROOT, "public", "visualizations");
const VAULT_DEST = path.join(ROOT, "content", "_vault");

if (!fs.existsSync(VAULT)) {
  console.error(`✗ Vault not found: ${VAULT}\n  Set VAULT=... to override.`);
  process.exit(1);
}

fs.mkdirSync(VIZ_DEST, { recursive: true });
fs.mkdirSync(VAULT_DEST, { recursive: true });

let viz = 0;
let notes = 0;
for (const entry of fs.readdirSync(VAULT)) {
  const src = path.join(VAULT, entry);
  if (!fs.statSync(src).isFile()) continue;

  if (entry.endsWith("-visualization.html")) {
    fs.copyFileSync(src, path.join(VIZ_DEST, entry));
    viz++;
  } else if (entry.endsWith(".md")) {
    fs.copyFileSync(src, path.join(VAULT_DEST, entry));
    notes++;
  }
}

console.log(`✓ Synced ${viz} visualization(s) → public/visualizations/`);
console.log(`✓ Copied ${notes} raw note(s) → content/_vault/ (reference only)`);
console.log(
  "→ Curated, site-ready notes live in content/algorithms/ — edit those.",
);
