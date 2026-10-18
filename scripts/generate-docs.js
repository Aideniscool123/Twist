// Regenerates the generated docs: docs/INSTRUCTIONS.md and docs/GALLERY.md.
// Usage: npm run docs

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderInstructionReference } from "../src/language/docs.js";
import { renderGallery } from "../src/gallery.js";

const docsDir = fileURLToPath(new URL("../docs/", import.meta.url));
mkdirSync(docsDir, { recursive: true });

for (const [name, render] of [
  ["INSTRUCTIONS.md", renderInstructionReference],
  ["GALLERY.md", renderGallery],
]) {
  const target = fileURLToPath(new URL(`../docs/${name}`, import.meta.url));
  writeFileSync(target, render());
  console.log(`Wrote ${target}`);
}
