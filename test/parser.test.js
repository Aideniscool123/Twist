import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/language/parser.js";

describe("parse", () => {
  it("builds a list of instructions with line numbers", () => {
    const { errors, instructions } = parse('; hi\nps1 "a"\n\nad1 #0 2.5\n');
    assert.deepEqual(errors, []);
    assert.deepEqual(instructions, [
      { line: 2, code: "ps1", operands: [{ kind: "string", text: '"a"', value: "a" }] },
      {
        line: 4,
        code: "ad1",
        operands: [
          { kind: "cell", text: "#0", value: 0 },
          { kind: "number", text: "2.5", value: 2.5 },
        ],
      },
    ]);
  });

  it("points each label at the next instruction", () => {
    const { labels } = parse("@start:\nhl2\n@middle:\n; comment\n@also_middle:\nhl2\n@end:\n");
    assert.deepEqual(labels.get("start"), { line: 1, index: 0 });
    assert.deepEqual(labels.get("middle"), { line: 3, index: 1 });
    assert.deepEqual(labels.get("also_middle"), { line: 5, index: 1 });
    assert.deepEqual(labels.get("end"), { line: 7, index: 2 });
  });

  it("does not care whether an instruction exists (the checker does)", () => {
    const { errors, instructions } = parse("zz9 #0");
    assert.deepEqual(errors, []);
    assert.equal(instructions[0].code, "zz9");
  });

  it("reports syntax errors with a line and column", () => {
    const { errors } = parse('hl1\nps1 "oops\n');
    assert.deepEqual(errors, [{ line: 2, column: 5, message: "This string is missing its closing quote" }]);
  });

  it("keeps going after a bad line", () => {
    const { errors, instructions } = parse("PS1\nhl1\n@x\nhl2\n");
    assert.equal(errors.length, 2);
    assert.deepEqual(
      instructions.map((instruction) => instruction.code),
      ["hl1", "hl2"],
    );
  });

  it("reports labels defined twice and labels never defined", () => {
    const { errors } = parse("@a:\n@a:\nps2 @b\n");
    assert.deepEqual(
      errors.map((error) => error.message),
      ["Label @a is already defined on line 1", "Label @b is never defined"],
    );
  });

  it("reports a code where an operand should be, if it can't be read", () => {
    const { errors } = parse("ps3 #0 banana");
    assert.match(errors[0].message, /Can't read banana as an operand/);
    assert.equal(errors[0].column, 8);
  });
});
