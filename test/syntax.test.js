import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  INSTRUCTION_CODE,
  LABEL_NAME,
  OperandKind,
  OPERAND_EXAMPLES,
  OPERAND_DESCRIPTIONS,
  operandFits,
} from "../src/language/syntax.js";
import { classifyLine } from "../src/language/parser.js";

describe("blank lines and comments", () => {
  it("treats empty and whitespace-only lines as blank", () => {
    assert.deepEqual(classifyLine(""), { type: "blank" });
    assert.deepEqual(classifyLine("   \t "), { type: "blank" });
  });

  it("treats lines that start with ; as comments", () => {
    assert.deepEqual(classifyLine("; hello"), { type: "comment" });
    assert.deepEqual(classifyLine("    ; indented"), { type: "comment" });
  });
});

describe("labels", () => {
  it("reads a label definition", () => {
    assert.deepEqual(classifyLine("@loop:"), { type: "label", name: "loop" });
    assert.deepEqual(classifyLine("  @loop_2:  ; the top"), { type: "label", name: "loop_2" });
  });

  it("rejects anything else on a label line", () => {
    const result = classifyLine("@loop: ps1");
    assert.equal(result.type, "invalid");
    assert.equal(result.column, 8);
  });

  it("explains that labels are defined with a colon", () => {
    const result = classifyLine("@loop");
    assert.equal(result.type, "invalid");
    assert.match(result.message, /colon/);
  });
});

describe("instructions", () => {
  it("reads an instruction with no operands", () => {
    assert.deepEqual(classifyLine("hl1"), { type: "instruction", code: "hl1", operands: [] });
  });

  it("reads cell and number operands", () => {
    assert.deepEqual(classifyLine("ps3 #0 -5"), {
      type: "instruction",
      code: "ps3",
      operands: [
        { kind: OperandKind.CELL, text: "#0", value: 0 },
        { kind: OperandKind.NUMBER, text: "-5", value: -5 },
      ],
    });
  });

  it("reads decimal numbers", () => {
    const result = classifyLine("mu1 #0 -2.5");
    assert.deepEqual(result.operands[1], { kind: OperandKind.NUMBER, text: "-2.5", value: -2.5 });
    assert.equal(classifyLine("ad1 #0 0.125").operands[1].value, 0.125);
  });

  it("reads an instruction code as an operand", () => {
    assert.deepEqual(classifyLine("sw1 ps1 ad3").operands, [
      { kind: OperandKind.CODE, text: "ps1", value: "ps1" },
      { kind: OperandKind.CODE, text: "ad3", value: "ad3" },
    ]);
  });

  it("reads a label operand", () => {
    assert.deepEqual(classifyLine("ps2 @again"), {
      type: "instruction",
      code: "ps2",
      operands: [{ kind: OperandKind.LABEL, text: "@again", value: "again" }],
    });
  });

  it("reads strings with spaces, semicolons and escapes", () => {
    const result = classifyLine('ps1 "a ; b \\"q\\" \\\\ \\n\\t"');
    assert.equal(result.type, "instruction");
    assert.equal(result.operands.length, 1);
    assert.equal(result.operands[0].kind, OperandKind.STRING);
    assert.equal(result.operands[0].value, 'a ; b "q" \\ \n\t');
  });

  it("ignores a comment after the operands", () => {
    const result = classifyLine("ad1 #0 1 ; bump it");
    assert.equal(result.type, "instruction");
    assert.equal(result.operands.length, 2);
  });

  it("allows a comment right after a string", () => {
    const result = classifyLine('ps1 "hi";note');
    assert.equal(result.type, "instruction");
    assert.equal(result.operands[0].value, "hi");
  });

  it("allows an empty string", () => {
    const result = classifyLine('ps1 ""');
    assert.equal(result.operands[0].value, "");
  });
});

describe("instruction codes", () => {
  const good = ["ps1", "hl2", "ab10", "zz999"];
  const bad = ["PS1", "p1", "ps0", "ps01", "psx", "ps", "ps1a", "abc1", "1ps", "p-1"];

  for (const code of good) {
    it(`accepts ${code}`, () => {
      assert.match(code, INSTRUCTION_CODE);
      assert.equal(classifyLine(code).type, "instruction");
    });
  }

  for (const code of bad) {
    it(`rejects ${code}`, () => {
      assert.doesNotMatch(code, INSTRUCTION_CODE);
      assert.equal(classifyLine(code).type, "invalid");
    });
  }

  it("rejects a string where the code should be", () => {
    assert.equal(classifyLine('"hi"').type, "invalid");
  });
});

describe("operand mistakes", () => {
  const cases = {
    "ps3 #01 5": "leading zero in a cell",
    "ps3 #-1 5": "negative cell",
    "ps3 #x 5": "cell that isn't a number",
    "ad1 #0 -0": "negative zero",
    "ad1 #0 -0.0": "negative zero with a decimal",
    "ad1 #0 1.": "decimal point with nothing after it",
    "ad1 #0 .5": "decimal point with nothing before it",
    "ad1 #0 01.5": "leading zero before a decimal",
    "ad1 #0 1.2.3": "two decimal points",
    "ad1 #0 007": "leading zeros",
    "ps2 @Loop": "uppercase label",
    "ps2 loop": "label without @",
    "ps3 #0 99999999999999999999": "number that is too big",
  };

  for (const [line, why] of Object.entries(cases)) {
    it(`rejects ${line} (${why})`, () => {
      assert.equal(classifyLine(line).type, "invalid");
    });
  }

  it("reports the column of the bad operand", () => {
    const result = classifyLine("ps3 #01 5");
    assert.equal(result.type, "invalid");
    assert.equal(result.column, 5);
  });
});

describe("string mistakes", () => {
  it("rejects a string with no closing quote", () => {
    const result = classifyLine('ps1 "oops');
    assert.equal(result.type, "invalid");
    assert.equal(result.column, 5);
    assert.match(result.message, /closing quote/);
  });

  it("rejects a dangling backslash at the end of a line", () => {
    assert.equal(classifyLine('ps1 "oops\\').type, "invalid");
  });

  it("rejects an unknown escape", () => {
    const result = classifyLine('ps1 "a\\qb"');
    assert.equal(result.type, "invalid");
    assert.match(result.message, /Unknown escape/);
  });

  it("rejects text stuck to the end of a string", () => {
    assert.equal(classifyLine('ps1 "a"b').type, "invalid");
    assert.equal(classifyLine('ps1 "a""b"').type, "invalid");
  });
});

describe("shared tables", () => {
  it("has an example and a description for every operand kind", () => {
    for (const kind of Object.values(OperandKind)) {
      assert.ok(OPERAND_EXAMPLES[kind], `missing example for ${kind}`);
      assert.ok(OPERAND_DESCRIPTIONS[kind], `missing description for ${kind}`);
    }
  });

  it("lets a value slot take a cell, a number or a string, and nothing else", () => {
    const { VALUE, CELL, NUMBER, STRING, LABEL, CODE } = OperandKind;
    for (const kind of [CELL, NUMBER, STRING]) assert.ok(operandFits(VALUE, kind), kind);
    for (const kind of [LABEL, CODE]) assert.ok(!operandFits(VALUE, kind), kind);
    assert.ok(operandFits(CELL, CELL));
    assert.ok(!operandFits(CELL, NUMBER));
  });

  it("accepts good label names and rejects bad ones", () => {
    for (const name of ["a", "_x", "loop_2", "done"]) assert.match(name, LABEL_NAME);
    for (const name of ["2a", "A", "a-b", ""]) assert.doesNotMatch(name, LABEL_NAME);
  });
});
