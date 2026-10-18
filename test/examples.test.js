import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { validateProgram } from "../src/language/validate.js";

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

  it("countdown.twist uses everything a loop needs", () => {
    const source = readFileSync(new URL("countdown.twist", examplesDir), "utf8");
    const codes = validateProgram(source).instructions.map((instruction) => instruction.code);
    for (const code of ["ps3", "jz1", "ad1", "ad3", "ps2", "hl1"]) {
      assert.ok(codes.includes(code), `countdown.twist should use ${code}`);
    }
  });
});
