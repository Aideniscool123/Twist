// Copies the playground, plus the Twist source it imports and the example
// programs, into static/play/ so the site serves it at /Twist/play/playground/.
// Runs automatically before `npm start` and `npm run build`.

import { cpSync, rmSync } from "node:fs";

const from = (path) => new URL(`../../${path}`, import.meta.url);
const to = (path) => new URL(`../static/play/${path}`, import.meta.url);

for (const dir of ["playground", "src", "examples"]) {
  rmSync(to(dir), { recursive: true, force: true });
  cpSync(from(dir), to(dir), { recursive: true });
}
console.log("Copied the playground into static/play/");
