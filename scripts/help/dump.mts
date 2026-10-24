// Loads the typed course data (src/data/help/*.ts) and writes it as JSON for verify.py.
// Run through `npm run help:verify` (node --experimental-strip-types).
import { existsSync, writeFileSync } from "node:fs";

const names = ["flow", "cuts", "paths", "matching"];
const courses = [];
for (const n of names) {
  const url = new URL(`../../src/data/help/${n}.ts`, import.meta.url);
  if (existsSync(url)) courses.push((await import(url.href)).default);
}
const out = new URL("./dump.json", import.meta.url);
writeFileSync(out, JSON.stringify(courses, null, 1));
console.log("wrote", courses.length, "courses");
