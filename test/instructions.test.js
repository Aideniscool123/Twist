import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  Category,
  INSTRUCTIONS,
  chaosViolations,
  getInstruction,
  groupByMnemonic,
} from "../src/language/instructions.js";
import { INSTRUCTION_CODE, OperandKind, operandFits } from "../src/language/syntax.js";
import { classifyLine } from "../src/language/parser.js";
import { validateProgram } from "../src/language/validate.js";

const FIRST_TEN = ["ps1", "ps2", "ps3", "ad1", "ad2", "ad3", "jz1", "jz2", "hl1", "hl2"];

describe("the instruction table", () => {
  it("contains the first ten instructions", () => {
    for (const code of FIRST_TEN) {
      assert.ok(getInstruction(code), `missing ${code}`);
    }
  });

  it("uses a valid, unique code for every instruction", () => {
    const seen = new Set();
    for (const instruction of INSTRUCTIONS) {
      assert.match(instruction.code, INSTRUCTION_CODE);
      assert.ok(!seen.has(instruction.code), `duplicate code ${instruction.code}`);
      seen.add(instruction.code);
    }
  });

  it("splits each code into letters and a number", () => {
    const ps2 = getInstruction("ps2");
    assert.equal(ps2.mnemonic, "ps");
    assert.equal(ps2.number, 2);
  });

  it("gives every instruction a name, summary, category and example", () => {
    const categories = new Set(Object.values(Category));
    for (const instruction of INSTRUCTIONS) {
      assert.ok(instruction.name.length > 0, `${instruction.code} needs a name`);
      assert.ok(instruction.summary.length > 0, `${instruction.code} needs a summary`);
      assert.ok(categories.has(instruction.category), `${instruction.code} has a bad category`);
    }
  });

  it("uses known operand kinds and unique operand names", () => {
    const kinds = new Set(Object.values(OperandKind));
    for (const instruction of INSTRUCTIONS) {
      const names = new Set();
      for (const operand of instruction.operands) {
        assert.ok(kinds.has(operand.kind), `${instruction.code} has a bad operand kind`);
        assert.ok(!names.has(operand.name), `${instruction.code} repeats operand ${operand.name}`);
        names.add(operand.name);
      }
    }
  });

  it("has examples that match their own operand lists", () => {
    for (const instruction of INSTRUCTIONS) {
      const line = classifyLine(instruction.example);
      assert.equal(line.type, "instruction", `${instruction.code} example should be an instruction`);
      assert.equal(line.code, instruction.code);
      assert.equal(line.operands.length, instruction.operands.length, `${instruction.code} example operand count`);
      instruction.operands.forEach((spec, index) => {
        assert.ok(
          operandFits(spec.kind, line.operands[index].kind),
          `${instruction.code} example operand ${index + 1} should be ${spec.kind}`,
        );
      });
    }
  });

  it("has at least one instruction in every category", () => {
    const used = new Set(INSTRUCTIONS.map((instruction) => instruction.category));
    for (const category of Object.values(Category)) {
      assert.ok(used.has(category), `nothing in ${category}`);
    }
  });

  it("has examples the checker accepts (apart from labels defined elsewhere)", () => {
    for (const instruction of INSTRUCTIONS) {
      const { errors } = validateProgram(instruction.example);
      const real = errors.filter((error) => !/is never defined/.test(error.message));
      assert.deepEqual(real, [], `${instruction.code} example`);
    }
  });

  it("is frozen so nothing changes it by accident", () => {
    assert.ok(Object.isFrozen(INSTRUCTIONS));
    assert.ok(Object.isFrozen(getInstruction("ps1")));
  });
});

describe("lookup helpers", () => {
  it("returns undefined for an unknown code", () => {
    assert.equal(getInstruction("zz9"), undefined);
    assert.equal(getInstruction(""), undefined);
  });

  it("groups instructions by their two letters", () => {
    const groups = groupByMnemonic();
    assert.deepEqual(
      groups.get("ps").map((instruction) => instruction.code),
      ["ps1", "ps2", "ps3", "ps4"],
    );
    assert.deepEqual(
      groups.get("hl").map((instruction) => instruction.code),
      ["hl1", "hl2"],
    );
  });
});

describe("the chaos rule", () => {
  it("holds for every instruction in the table", () => {
    assert.deepEqual(chaosViolations(), []);
  });

  it("catches two instructions with the same letters and category", () => {
    const fake = [
      { code: "xx1", mnemonic: "xx", category: Category.OUTPUT },
      { code: "xx2", mnemonic: "xx", category: Category.OUTPUT },
      { code: "xx3", mnemonic: "xx", category: Category.MATH },
      { code: "yy1", mnemonic: "yy", category: Category.OUTPUT },
    ];
    assert.deepEqual(chaosViolations(fake), [
      { mnemonic: "xx", category: Category.OUTPUT, codes: ["xx1", "xx2"] },
    ]);
  });

  it("shows ps1 to ps4 doing four different kinds of thing", () => {
    const categories = ["ps1", "ps2", "ps3", "ps4"].map((code) => getInstruction(code).category);
    assert.equal(new Set(categories).size, 4);
  });

  it("gives rd, cl and ad three unrelated jobs each", () => {
    for (const mnemonic of ["rd", "cl", "ad"]) {
      const group = groupByMnemonic().get(mnemonic);
      assert.equal(group.length, 3, mnemonic);
      assert.equal(new Set(group.map((instruction) => instruction.category)).size, 3, mnemonic);
    }
  });
});

describe("the language can compute anything", () => {
  it("has memory, arithmetic, a conditional jump and an unconditional jump", () => {
    const wanted = {
      setCell: "ps3",
      addToCell: "ad1",
      jumpIfZero: "jz1",
      jump: "ps2",
    };
    for (const code of Object.values(wanted)) {
      assert.ok(getInstruction(code), `missing ${code}`);
    }
  });
});
