import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { validateProgram } from "../src/language/validate.js";
import { runProgram } from "../src/runtime/machine.js";
import { EXAMPLES } from "../playground/examples.js";

const examplesDir = new URL("../examples/", import.meta.url);
const files = readdirSync(examplesDir)
  .filter((name) => name.endsWith(".twist"))
  .sort();

describe("example programs", () => {
  it("includes the starter examples", () => {
    for (const name of ["hello.twist", "countdown.twist", "echo.twist", "swap.twist"]) {
      assert.ok(files.includes(name), `missing examples/${name}`);
    }
  });

  for (const name of files) {
    it(`${name} has no mistakes`, () => {
      const source = readFileSync(new URL(name, examplesDir), "utf8");
      const result = validateProgram(source);
      assert.deepEqual(result.errors, []);
      assert.ok(result.instructions.length > 0, `${name} should contain instructions`);
    });
  }

  for (const { file, input } of EXAMPLES) {
    it(`${file} runs to the end with --calm`, () => {
      const source = readFileSync(new URL(file, examplesDir), "utf8");
      assert.doesNotThrow(() => runProgram(source, { calm: true, input: input ?? [] }));
    });
  }

  it("prints what the website says a few of them print", () => {
    const output = (file) => {
      const { input } = EXAMPLES.find((example) => example.file === file);
      return runProgram(readFileSync(new URL(file, examplesDir), "utf8"), { calm: true, input: input ?? [] }).output;
    };
    assert.match(output("factorial.twist"), /6! = 720/);
    assert.match(output("guess.twist"), /Got it in 7 tries!/);
    assert.match(output("reverse.twist"), /tsiwT/);
    assert.match(output("sort.twist"), /\[1, 2, 3, 5, 8, 9\]/);
  });

  it("countdown.twist uses everything a loop needs", () => {
    const source = readFileSync(new URL("countdown.twist", examplesDir), "utf8");
    const codes = validateProgram(source).instructions.map((instruction) => instruction.code);
    for (const code of ["ps3", "jz1", "ad1", "ad3", "ps2", "hl1"]) {
      assert.ok(codes.includes(code), `countdown.twist should use ${code}`);
    }
  });
});
