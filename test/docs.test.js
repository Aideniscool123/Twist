import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { INSTRUCTIONS } from "../src/language/instructions.js";
import { renderInstructionReference } from "../src/language/docs.js";

describe("instruction reference", () => {
  it("has a table row for every instruction", () => {
    const text = renderInstructionReference();
    for (const instruction of INSTRUCTIONS) {
      assert.ok(text.includes(`| \`${instruction.code}\` |`), `missing a row for ${instruction.code}`);
    }
  });

  it("shows the instructions that share letters", () => {
    const text = renderInstructionReference();
    assert.match(text, /\*\*ps\*\*: `ps1` Print String, `ps2` Pounce Somewhere, `ps3` Plant Seed/);
  });

  it("ends with a single newline", () => {
    const text = renderInstructionReference();
    assert.ok(text.endsWith("\n"));
    assert.ok(!text.endsWith("\n\n"));
  });

  it("docs/INSTRUCTIONS.md is up to date (run `npm run docs` if this fails)", () => {
    const onDisk = readFileSync(new URL("../docs/INSTRUCTIONS.md", import.meta.url), "utf8");
    assert.equal(onDisk.replace(/\r\n/g, "\n"), renderInstructionReference());
  });
});
