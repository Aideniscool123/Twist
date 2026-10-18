import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateProgram } from "../src/language/validate.js";
import { runProgram } from "../src/runtime/machine.js";

// Find every ```twist block in the tutorial, plus the input typed in and the
// ```text output shown after it (if any).
function snippets(markdown) {
  const found = [];
  const pattern = /```twist\n([\s\S]*?)```\n(?:\nTyped in: (.*)\n)?(?:\n```text\n([\s\S]*?)```)?/g;
  for (const match of markdown.matchAll(pattern)) {
    const [, source, typed, output] = match;
    const input = typed ? [...typed.matchAll(/`([^`]*)`/g)].map((m) => m[1]) : [];
    found.push({ source, input, output });
  }
  return found;
}

const tutorial = readFileSync(new URL("../docs/TUTORIAL.md", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const all = snippets(tutorial);

describe("the tutorial", () => {
  it("has plenty of examples", () => {
    assert.ok(all.length >= 10, `only found ${all.length}`);
    assert.ok(all.filter((snippet) => snippet.output !== undefined).length >= 10);
  });

  all.forEach(({ source, input, output }, index) => {
    const name = `example ${index + 1}: ${source.split("\n")[0]}`;

    it(`${name} passes the checker`, () => {
      assert.deepEqual(validateProgram(source).errors, []);
    });

    if (output !== undefined) {
      it(`${name} prints what the tutorial says`, () => {
        assert.equal(runProgram(source, { calm: true, input, maxSteps: 10_000 }).output, output);
      });
    }
  });
});
