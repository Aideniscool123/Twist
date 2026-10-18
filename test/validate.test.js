import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateProgram } from "../src/language/validate.js";

describe("valid programs", () => {
  it("accepts an empty program", () => {
    const result = validateProgram("");
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.instructions, []);
  });

  it("accepts comments and blank lines", () => {
    assert.equal(validateProgram("; just a note\n\n   \n; another\n").ok, true);
  });

  it("lists the instructions with their line numbers", () => {
    const result = validateProgram('; hi\nps1 "hello"\n\nhl1\n');
    assert.equal(result.ok, true);
    assert.deepEqual(
      result.instructions.map(({ line, code }) => ({ line, code })),
      [
        { line: 2, code: "ps1" },
        { line: 4, code: "hl1" },
      ],
    );
  });

  it("records where each label points", () => {
    const result = validateProgram("ps3 #0 1\n@again:\nad1 #0 1\nps2 @again\n@end:\n");
    assert.equal(result.ok, true);
    assert.deepEqual(result.labels.get("again"), { line: 2, index: 1 });
    assert.deepEqual(result.labels.get("end"), { line: 5, index: 3 });
  });

  it("allows jumping forward to a label defined later", () => {
    assert.equal(validateProgram("jz1 #0 @done\nps1 \"nope\"\n@done:\nhl1\n").ok, true);
  });

  it("handles Windows line endings", () => {
    const result = validateProgram('ps1 "hi"\r\nhl1\r\n');
    assert.equal(result.ok, true);
    assert.equal(result.instructions.length, 2);
  });
});

describe("mistakes", () => {
  it("reports an unknown instruction", () => {
    const result = validateProgram("zz9");
    assert.equal(result.ok, false);
    assert.deepEqual(result.errors, [{ line: 1, message: "Unknown instruction zz9" }]);
  });

  it("reports the wrong number of operands", () => {
    const tooFew = validateProgram("ps1");
    assert.equal(tooFew.ok, false);
    assert.match(tooFew.errors[0].message, /takes 1 operand, but this line has 0/);

    const tooMany = validateProgram('ps1 "a" "b"');
    assert.equal(tooMany.ok, false);
    assert.match(tooMany.errors[0].message, /takes 1 operand, but this line has 2/);

    const several = validateProgram("hl1 #0");
    assert.match(several.errors[0].message, /takes 0 operands, but this line has 1/);
  });

  it("reports an operand of the wrong kind", () => {
    const result = validateProgram("ps3 5 5");
    assert.equal(result.ok, false);
    assert.match(result.errors[0].message, /operand 1 \(cell\) should be a cell like #0, but got 5/);

    const second = validateProgram("ps3 #0 @x\n@x:\n");
    assert.match(second.errors[0].message, /operand 2 \(value\) should be a cell, a number or a string/);
  });

  it("lets a value slot take a cell, a number or a string", () => {
    assert.equal(validateProgram('ps3 #0 "x"\nps3 #1 #0\nps3 #2 1.5\n').ok, true);
  });

  it("allows a line to use the operands of an instruction it may be swapped with", () => {
    assert.equal(validateProgram("sw1 ps1 ad3\nps1 #0\nad3 \"hi\"\n").ok, true);
  });

  it("follows chains of swaps", () => {
    assert.equal(validateProgram("sw1 ps1 ad3\nsw1 ad3 ps2\nps1 @x\n@x:\n").ok, true);
  });

  it("still rejects operands that fit none of the swapped jobs", () => {
    const result = validateProgram("sw1 ps1 ad3\nps1 5\n");
    assert.equal(result.ok, false);
    assert.equal(result.errors[0].line, 2);
  });

  it("reports a swap with a code that isn't an instruction", () => {
    const result = validateProgram("sw1 ps1 zz9");
    assert.equal(result.ok, false);
    assert.match(result.errors[0].message, /zz9 isn't an instruction/);
  });

  it("passes syntax errors through with their line number", () => {
    const result = validateProgram('hl1\nps1 "oops\n');
    assert.equal(result.ok, false);
    assert.equal(result.errors[0].line, 2);
    assert.match(result.errors[0].message, /closing quote/);
  });

  it("reports a label that is defined twice", () => {
    const result = validateProgram("@a:\nhl1\n@a:\n");
    assert.equal(result.ok, false);
    assert.deepEqual(result.errors, [{ line: 3, message: "Label @a is already defined on line 1" }]);
  });

  it("reports a label that is never defined", () => {
    const result = validateProgram("ps2 @nowhere\n");
    assert.equal(result.ok, false);
    assert.deepEqual(result.errors, [{ line: 1, message: "Label @nowhere is never defined" }]);
  });

  it("reports every problem, sorted by line", () => {
    const result = validateProgram("ps2 @missing\nzz9\nps1\n");
    assert.deepEqual(
      result.errors.map((error) => error.line),
      [1, 2, 3],
    );
  });
});

describe("bad input", () => {
  it("refuses to check something that isn't text", () => {
    assert.throws(() => validateProgram(undefined), TypeError);
    assert.throws(() => validateProgram(42), TypeError);
  });
});
