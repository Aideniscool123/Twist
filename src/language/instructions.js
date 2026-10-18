// The Twist instruction table.
//
// Every instruction is a two-letter code with a number stuck to it. The number
// is NOT a variant: ps1, ps2 and ps3 are three unrelated instructions.
//
// The chaos rule keeps it that way: instructions that share the same two
// letters must all belong to different categories. `chaosViolations` checks
// it, and the tests fail if the rule is broken.

import { INSTRUCTION_CODE, OperandKind } from "./syntax.js";

export const Category = Object.freeze({
  OUTPUT: "output",
  INPUT: "input",
  MEMORY: "memory",
  MATH: "math",
  CONTROL: "control",
  MISC: "misc",
});

const { CELL, INT, STRING, LABEL } = OperandKind;

function define({ code, name, category, operands, summary, example }) {
  if (!INSTRUCTION_CODE.test(code)) {
    throw new Error(`Bad instruction code: ${code}`);
  }
  return Object.freeze({
    code,
    mnemonic: code.slice(0, 2),
    number: Number(code.slice(2)),
    name,
    category,
    operands: Object.freeze(operands.map(([operandName, kind]) => Object.freeze({ name: operandName, kind }))),
    summary,
    example,
  });
}

/** The first ten instructions. Phase 2 will add the rest. */
export const INSTRUCTIONS = Object.freeze(
  [
    {
      code: "ps1",
      name: "Print String",
      category: Category.OUTPUT,
      operands: [["text", STRING]],
      summary: "Print the text, then a newline.",
      example: 'ps1 "Hello, reef!"',
    },
    {
      code: "ps2",
      name: "Pounce Somewhere",
      category: Category.CONTROL,
      operands: [["target", LABEL]],
      summary: "Jump to the label.",
      example: "ps2 @again",
    },
    {
      code: "ps3",
      name: "Plant Seed",
      category: Category.MEMORY,
      operands: [
        ["cell", CELL],
        ["value", INT],
      ],
      summary: "Put the number into the cell.",
      example: "ps3 #0 10",
    },
    {
      code: "ad1",
      name: "Add Digits",
      category: Category.MATH,
      operands: [
        ["cell", CELL],
        ["amount", INT],
      ],
      summary: "Add the amount (it can be negative) to the cell.",
      example: "ad1 #0 -1",
    },
    {
      code: "ad2",
      name: "Ask Directly",
      category: Category.INPUT,
      operands: [["cell", CELL]],
      summary: "Read a whole number from the user and store it in the cell.",
      example: "ad2 #1",
    },
    {
      code: "ad3",
      name: "Announce Digit",
      category: Category.OUTPUT,
      operands: [["cell", CELL]],
      summary: "Print the number in the cell, then a newline.",
      example: "ad3 #0",
    },
    {
      code: "jz1",
      name: "Jump if Zero",
      category: Category.CONTROL,
      operands: [
        ["cell", CELL],
        ["target", LABEL],
      ],
      summary: "Jump to the label if the cell holds 0.",
      example: "jz1 #0 @done",
    },
    {
      code: "jz2",
      name: "Juggle Zones",
      category: Category.MEMORY,
      operands: [
        ["first", CELL],
        ["second", CELL],
      ],
      summary: "Swap the numbers in two cells.",
      example: "jz2 #0 #1",
    },
    {
      code: "hl1",
      name: "Halt Lightly",
      category: Category.CONTROL,
      operands: [],
      summary: "Stop the program.",
      example: "hl1",
    },
    {
      code: "hl2",
      name: "Hang Loose",
      category: Category.MISC,
      operands: [],
      summary: "Do nothing at all.",
      example: "hl2",
    },
  ].map(define),
);

const BY_CODE = new Map(INSTRUCTIONS.map((instruction) => [instruction.code, instruction]));

/** Look up an instruction by its code, like "ps1". Returns undefined if there isn't one. */
export function getInstruction(code) {
  return BY_CODE.get(code);
}

/** Group instructions by their two letters: Map { "ps" => [ps1, ps2, ps3], ... } */
export function groupByMnemonic(list = INSTRUCTIONS) {
  const groups = new Map();
  for (const instruction of list) {
    if (!groups.has(instruction.mnemonic)) groups.set(instruction.mnemonic, []);
    groups.get(instruction.mnemonic).push(instruction);
  }
  return groups;
}

/**
 * Find places where the chaos rule is broken: two instructions with the same
 * two letters and the same category. An empty array means the rule holds.
 */
export function chaosViolations(list = INSTRUCTIONS) {
  const violations = [];
  for (const [mnemonic, group] of groupByMnemonic(list)) {
    const byCategory = new Map();
    for (const instruction of group) {
      if (!byCategory.has(instruction.category)) byCategory.set(instruction.category, []);
      byCategory.get(instruction.category).push(instruction.code);
    }
    for (const [category, codes] of byCategory) {
      if (codes.length > 1) violations.push({ mnemonic, category, codes });
    }
  }
  return violations;
}
