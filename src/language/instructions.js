// The Twist instruction table.
//
// Every instruction is a two-letter code with a number stuck to it. The number
// is NOT a variant: ps1, ps2 and ps3 are three unrelated instructions.
//
// The chaos rule keeps it that way: instructions that share the same two
// letters must all belong to different categories. `chaosViolations` checks
// it, and the tests fail if the rule is broken.
//
// This table only describes instructions (for the checker, the docs and the
// CLI). What each one actually does lives in src/runtime/behaviors.js.

import { INSTRUCTION_CODE, OperandKind } from "./syntax.js";

export const Category = Object.freeze({
  OUTPUT: "output",
  INPUT: "input",
  MEMORY: "memory",
  MATH: "math",
  CONTROL: "control",
  TEXT: "text",
  LIST: "list",
  CHAOS: "chaos",
  MISC: "misc",
});

const { CELL, NUMBER, STRING, LABEL, CODE, VALUE } = OperandKind;

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

/** Every Twist instruction, grouped by category. */
export const INSTRUCTIONS = Object.freeze(
  [
    // output
    {
      code: "ps1",
      name: "Print String",
      category: Category.OUTPUT,
      operands: [["text", STRING]],
      summary: "Print the text, then a newline.",
      example: 'ps1 "Hello, reef!"',
    },
    {
      code: "ad3",
      name: "Announce Digit",
      category: Category.OUTPUT,
      operands: [["cell", CELL]],
      summary: "Print whatever is in the cell (a number, text or a list), then a newline.",
      example: "ad3 #0",
    },
    {
      code: "sy1",
      name: "Say Yonder",
      category: Category.OUTPUT,
      operands: [["value", VALUE]],
      summary: "Print the value with no newline after it.",
      example: 'sy1 "Loading... "',
    },
    {
      code: "mo1",
      name: "Mood Out",
      category: Category.OUTPUT,
      operands: [],
      summary: "Print how Twist is feeling right now.",
      example: "mo1",
    },

    // input
    {
      code: "ad2",
      name: "Ask Directly",
      category: Category.INPUT,
      operands: [["cell", CELL]],
      summary: "Read a number from the user and store it in the cell.",
      example: "ad2 #1",
    },
    {
      code: "rd3",
      name: "Read Dialogue",
      category: Category.INPUT,
      operands: [["cell", CELL]],
      summary: "Read a line of text from the user and store it in the cell.",
      example: "rd3 #2",
    },

    // memory
    {
      code: "ps3",
      name: "Plant Seed",
      category: Category.MEMORY,
      operands: [
        ["cell", CELL],
        ["value", VALUE],
      ],
      summary: "Put the value into the cell. Copying a list makes a separate copy.",
      example: "ps3 #0 10",
    },
    {
      code: "jz2",
      name: "Juggle Zones",
      category: Category.MEMORY,
      operands: [
        ["first", CELL],
        ["second", CELL],
      ],
      summary: "Swap what is in two cells.",
      example: "jz2 #0 #1",
    },
    {
      code: "cl3",
      name: "Clean Locker",
      category: Category.MEMORY,
      operands: [["cell", CELL]],
      summary: "Reset the cell to 0.",
      example: "cl3 #4",
    },
    {
      code: "mo2",
      name: "Mood Observe",
      category: Category.MEMORY,
      operands: [["cell", CELL]],
      summary: "Store Twist's current mood (a word like \"grumpy\") in the cell.",
      example: "mo2 #9",
    },

    // math
    {
      code: "ad1",
      name: "Add Digits",
      category: Category.MATH,
      operands: [
        ["cell", CELL],
        ["amount", VALUE],
      ],
      summary: "Add the amount (it can be negative) to the number in the cell.",
      example: "ad1 #0 -1",
    },
    {
      code: "sb1",
      name: "Subtract Boldly",
      category: Category.MATH,
      operands: [
        ["cell", CELL],
        ["amount", VALUE],
      ],
      summary: "Subtract the amount from the number in the cell.",
      example: "sb1 #0 #1",
    },
    {
      code: "mu1",
      name: "Multiply Up",
      category: Category.MATH,
      operands: [
        ["cell", CELL],
        ["factor", VALUE],
      ],
      summary: "Multiply the number in the cell by the factor.",
      example: "mu1 #0 2.5",
    },
    {
      code: "dv1",
      name: "Divide Vigorously",
      category: Category.MATH,
      operands: [
        ["cell", CELL],
        ["divisor", VALUE],
      ],
      summary: "Divide the number in the cell by the divisor. Dividing by zero gives 0 and upsets Twist.",
      example: "dv1 #0 4",
    },
    {
      code: "md1",
      name: "Modulo Dance",
      category: Category.MATH,
      operands: [
        ["cell", CELL],
        ["divisor", VALUE],
      ],
      summary: "Replace the number in the cell with the remainder after dividing. Zero upsets Twist here too.",
      example: "md1 #0 2",
    },
    {
      code: "rd1",
      name: "Round Down",
      category: Category.MATH,
      operands: [["cell", CELL]],
      summary: "Round the number in the cell down to a whole number.",
      example: "rd1 #0",
    },
    {
      code: "eq1",
      name: "Equal Question",
      category: Category.MATH,
      operands: [
        ["cell", CELL],
        ["other", VALUE],
      ],
      summary: "Set the cell to 1 if it equals the other value, or 0 if it doesn't.",
      example: 'eq1 #0 "yes"',
    },
    {
      code: "gt1",
      name: "Greater Than",
      category: Category.MATH,
      operands: [
        ["cell", CELL],
        ["other", VALUE],
      ],
      summary: "Set the cell to 1 if its number is bigger than the other value, or 0 if not.",
      example: "gt1 #0 100",
    },

    // control
    {
      code: "ps2",
      name: "Pounce Somewhere",
      category: Category.CONTROL,
      operands: [["target", LABEL]],
      summary: "Jump to the label.",
      example: "ps2 @again",
    },
    {
      code: "jz1",
      name: "Jump if Zero",
      category: Category.CONTROL,
      operands: [
        ["cell", CELL],
        ["target", LABEL],
      ],
      summary: "Jump to the label if the cell is empty: 0, empty text or an empty list.",
      example: "jz1 #0 @done",
    },
    {
      code: "jn1",
      name: "Jump if Negative",
      category: Category.CONTROL,
      operands: [
        ["cell", CELL],
        ["target", LABEL],
      ],
      summary: "Jump to the label if the cell holds a number below 0.",
      example: "jn1 #0 @oops",
    },
    {
      code: "je1",
      name: "Jump if Equal",
      category: Category.CONTROL,
      operands: [
        ["cell", CELL],
        ["other", VALUE],
        ["target", LABEL],
      ],
      summary: "Jump to the label if the cell equals the other value.",
      example: 'je1 #0 "quit" @bye',
    },
    {
      code: "cl1",
      name: "Call Label",
      category: Category.CONTROL,
      operands: [["target", LABEL]],
      summary: "Jump to the label, and remember where to come back to when rt1 runs.",
      example: "cl1 @greet",
    },
    {
      code: "rt1",
      name: "Return Trip",
      category: Category.CONTROL,
      operands: [],
      summary: "Go back to just after the most recent cl1.",
      example: "rt1",
    },
    {
      code: "hl1",
      name: "Halt Lightly",
      category: Category.CONTROL,
      operands: [],
      summary: "Stop the program.",
      example: "hl1",
    },

    // text
    {
      code: "jn2",
      name: "Join Neatly",
      category: Category.TEXT,
      operands: [
        ["cell", CELL],
        ["value", VALUE],
      ],
      summary: "Turn the cell into text and stick the value on the end.",
      example: 'jn2 #0 "!"',
    },
    {
      code: "up1",
      name: "Uppercase Please",
      category: Category.TEXT,
      operands: [["cell", CELL]],
      summary: "Make the text in the cell UPPERCASE.",
      example: "up1 #0",
    },
    {
      code: "sp1",
      name: "Split Pieces",
      category: Category.TEXT,
      operands: [
        ["cell", CELL],
        ["separator", VALUE],
      ],
      summary: "Split the text in the cell into a list, cutting at the separator (\"\" cuts every letter).",
      example: 'sp1 #0 " "',
    },
    {
      code: "nm1",
      name: "Number Me",
      category: Category.TEXT,
      operands: [["cell", CELL]],
      summary: "Turn the text in the cell into a number, like \"42\" into 42.",
      example: "nm1 #0",
    },

    // list
    {
      code: "mk1",
      name: "Make Kit",
      category: Category.LIST,
      operands: [["cell", CELL]],
      summary: "Put a new empty list in the cell.",
      example: "mk1 #5",
    },
    {
      code: "ps4",
      name: "Pile Stuff",
      category: Category.LIST,
      operands: [
        ["list", CELL],
        ["value", VALUE],
      ],
      summary: "Add the value to the end of the list.",
      example: 'ps4 #5 "apple"',
    },
    {
      code: "pp1",
      name: "Pop Pop",
      category: Category.LIST,
      operands: [
        ["list", CELL],
        ["into", CELL],
      ],
      summary: "Take the last item off the list and put it in another cell.",
      example: "pp1 #5 #0",
    },
    {
      code: "gt2",
      name: "Grab Thing",
      category: Category.LIST,
      operands: [
        ["into", CELL],
        ["from", CELL],
        ["index", VALUE],
      ],
      summary: "Copy item number `index` (counting from 0) of a list or text into a cell.",
      example: "gt2 #0 #5 2",
    },
    {
      code: "st1",
      name: "Stash Thing",
      category: Category.LIST,
      operands: [
        ["list", CELL],
        ["index", VALUE],
        ["value", VALUE],
      ],
      summary: "Replace item number `index` (counting from 0) of the list with the value.",
      example: "st1 #5 0 99",
    },
    {
      code: "ln1",
      name: "Length Now",
      category: Category.LIST,
      operands: [
        ["into", CELL],
        ["of", VALUE],
      ],
      summary: "Store how many items a list has (or how many letters text has) in the cell.",
      example: "ln1 #0 #5",
    },

    // chaos
    {
      code: "rd2",
      name: "Roll Dice",
      category: Category.CHAOS,
      operands: [
        ["cell", CELL],
        ["sides", VALUE],
      ],
      summary: "Roll a dice with this many sides and store the result (1 to sides) in the cell.",
      example: "rd2 #0 6",
    },
    {
      code: "cl2",
      name: "Coin Leap",
      category: Category.CHAOS,
      operands: [["target", LABEL]],
      summary: "Flip a coin. Heads: jump to the label. Tails: carry on.",
      example: "cl2 @lucky",
    },
    {
      code: "sh1",
      name: "Shuffle Heap",
      category: Category.CHAOS,
      operands: [["list", CELL]],
      summary: "Shuffle the list into a random order.",
      example: "sh1 #5",
    },
    {
      code: "sw1",
      name: "Swap Words",
      category: Category.CHAOS,
      operands: [
        ["first", CODE],
        ["second", CODE],
      ],
      summary: "Swap what two instructions do, for the rest of the run. Swap them again to undo it.",
      example: "sw1 ps1 ad3",
    },
    {
      code: "rv1",
      name: "Reverse Vibes",
      category: Category.CHAOS,
      operands: [],
      summary: "Flip direction: the program starts running upward, until the next rv1.",
      example: "rv1",
    },
    {
      code: "ty1",
      name: "Thank You",
      category: Category.CHAOS,
      operands: [],
      summary: "Compliment Twist. It cheers up a little. Twist never refuses a ty1.",
      example: "ty1",
    },

    // misc
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
  for (const group of groups.values()) group.sort((a, b) => a.number - b.number);
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
