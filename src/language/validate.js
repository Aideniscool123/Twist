// A design-time checker for Twist programs.
//
// It reads a program and reports mistakes: syntax errors, unknown instructions,
// wrong operands, and labels that are missing or defined twice. It does not run
// anything. The real parser (Phase 3) and interpreter (Phase 4) come later.

import { OPERAND_DESCRIPTIONS, OPERAND_EXAMPLES, OperandKind, classifyLine, operandFits } from "./syntax.js";
import { getInstruction } from "./instructions.js";

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function fitsSpecs(specs, operands) {
  return specs.length === operands.length && specs.every((spec, index) => operandFits(spec.kind, operands[index].kind));
}

// sw1 can swap what two instructions do, so a line like `ps1 #0` is fine in a
// program that swaps ps1 with ad3. Work out, for each code, every instruction
// whose job it might be doing: everything connected to it by an sw1 line.
function swapPartners(lines) {
  const partners = new Map();
  const groupOf = (code) => {
    if (!partners.has(code)) partners.set(code, new Set([code]));
    return partners.get(code);
  };

  for (const line of lines) {
    if (line.code !== "sw1" || line.operands.length !== 2) continue;
    const [first, second] = line.operands.map((operand) => operand.value);
    if (!getInstruction(first) || !getInstruction(second)) continue;
    const merged = new Set([...groupOf(first), ...groupOf(second)]);
    for (const code of merged) partners.set(code, merged);
  }
  return partners;
}

function checkOperands(instruction, operands, partners) {
  const problems = [];
  const expected = instruction.operands;

  const others = [...(partners.get(instruction.code) ?? [])].filter((code) => code !== instruction.code);
  if (others.some((code) => fitsSpecs(getInstruction(code).operands, operands))) {
    return problems;
  }

  if (operands.length !== expected.length) {
    problems.push(
      `${instruction.code} (${instruction.name}) takes ${plural(expected.length, "operand")}, ` +
        `but this line has ${operands.length}`,
    );
    return problems;
  }

  expected.forEach((spec, index) => {
    const actual = operands[index];
    if (!operandFits(spec.kind, actual.kind)) {
      problems.push(
        `${instruction.code} operand ${index + 1} (${spec.name}) should be ` +
          `${OPERAND_DESCRIPTIONS[spec.kind]} like ${OPERAND_EXAMPLES[spec.kind]}, but got ${actual.text}`,
      );
    } else if (actual.kind === OperandKind.CODE && !getInstruction(actual.value)) {
      problems.push(`${instruction.code} operand ${index + 1} (${spec.name}): ${actual.value} isn't an instruction`);
    }
  });

  return problems;
}

/**
 * Check a whole program.
 *
 * Returns:
 *   ok            true if there are no errors
 *   errors        [{ line, message }] sorted by line number (lines start at 1)
 *   instructions  every instruction line in order: [{ line, code, operands }]
 *   labels        Map of label name => { line, index }, where index is the
 *                 position in `instructions` that the label points at
 */
export function validateProgram(source) {
  if (typeof source !== "string") {
    throw new TypeError("validateProgram expects the program text as a string");
  }

  const errors = [];
  const instructions = [];
  const labels = new Map();
  const references = [];

  source.split(/\r?\n/).forEach((text, offset) => {
    const line = offset + 1;
    const result = classifyLine(text);

    switch (result.type) {
      case "invalid":
        errors.push({ line, message: `${result.message} (column ${result.column})` });
        break;

      case "label":
        if (labels.has(result.name)) {
          errors.push({
            line,
            message: `Label @${result.name} is already defined on line ${labels.get(result.name).line}`,
          });
        } else {
          labels.set(result.name, { line, index: instructions.length });
        }
        break;

      case "instruction":
        instructions.push({ line, code: result.code, operands: result.operands });
        for (const operand of result.operands) {
          if (operand.kind === OperandKind.LABEL) references.push({ line, name: operand.value });
        }
        break;

      default:
        // blank lines and comments need no checking
        break;
    }
  });

  const partners = swapPartners(instructions);
  for (const { line, code, operands } of instructions) {
    const instruction = getInstruction(code);
    if (!instruction) {
      errors.push({ line, message: `Unknown instruction ${code}` });
      continue;
    }
    for (const message of checkOperands(instruction, operands, partners)) {
      errors.push({ line, message });
    }
  }

  for (const reference of references) {
    if (!labels.has(reference.name)) {
      errors.push({ line: reference.line, message: `Label @${reference.name} is never defined` });
    }
  }

  errors.sort((a, b) => a.line - b.line);

  return { ok: errors.length === 0, errors, instructions, labels };
}
