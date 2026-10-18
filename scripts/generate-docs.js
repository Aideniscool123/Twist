// Regenerates docs/INSTRUCTIONS.md from the instruction table.
// Usage: npm run docs

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderInstructionReference } from "../src/language/docs.js";

const docsDir = fileURLToPath(new URL("../docs/", import.meta.url));
const target = fileURLToPath(new URL("../docs/INSTRUCTIONS.md", import.meta.url));

mkdirSync(docsDir, { recursive: true });
writeFileSync(target, renderInstructionReference());
console.log(`Wrote ${target}`);
