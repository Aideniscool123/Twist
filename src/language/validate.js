import { OPERAND_DESCRIPTIONS, OPERAND_EXAMPLES, OperandKind, operandFits } from "./syntax.js";
import { parse } from "./parser.js";
import { getInstruction } from "./instructions.js";

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function fitsSpecs(specs, operands) {
  return specs.length === operands.length && specs.every((spec, index) => operandFits(spec.kind, operands[index].kind));
}

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

export function validateProgram(source) {
  if (typeof source !== "string") {
    throw new TypeError("validateProgram expects the program text as a string");
  }

  const parsed = parse(source);
  const { instructions, labels } = parsed;
  const errors = parsed.errors.map(({ line, column, message }) => ({
    line,
    message: column === undefined ? message : `${message} (column ${column})`,
  }));

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

  errors.sort((a, b) => a.line - b.line);

  return { ok: errors.length === 0, errors, instructions, labels };
}
