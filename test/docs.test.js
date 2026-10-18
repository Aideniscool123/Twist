import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { INSTRUCTIONS } from "../src/language/instructions.js";
import { renderInstructionReference } from "../src/language/docs.js";
import { renderGallery } from "../src/gallery.js";
import { EXAMPLES } from "../playground/examples.js";

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

describe("example gallery", () => {
  it("has a section for every example, with its real output", () => {
    const text = renderGallery();
    for (const { file, title } of EXAMPLES) {
      assert.ok(text.includes(`## ${title}`), `missing a section for ${file}`);
      assert.ok(text.includes(`(../examples/${file})`), `missing a link to ${file}`);
    }
    assert.match(text, /6! = 720/);
    assert.match(text, /Got it in 7 tries!/);
    assert.match(text, /tsiwT/);
  });

  it("docs/GALLERY.md is up to date (run `npm run docs` if this fails)", () => {
    const onDisk = readFileSync(new URL("../docs/GALLERY.md", import.meta.url), "utf8");
    assert.equal(onDisk.replace(/\r\n/g, "\n"), renderGallery());
  });
});
