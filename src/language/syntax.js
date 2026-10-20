export const COMMENT_MARKER = ";";

export const OperandKind = Object.freeze({
  CELL: "cell",
  NUMBER: "number",
  STRING: "string",
  LABEL: "label",
  CODE: "code",
  VALUE: "value",
});

export const OPERAND_EXAMPLES = Object.freeze({
  [OperandKind.CELL]: "#0",
  [OperandKind.NUMBER]: "-2.5",
  [OperandKind.STRING]: '"hi"',
  [OperandKind.LABEL]: "@loop",
  [OperandKind.CODE]: "ps1",
  [OperandKind.VALUE]: '#0, 7 or "hi"',
});

export const OPERAND_DESCRIPTIONS = Object.freeze({
  [OperandKind.CELL]: "a cell",
  [OperandKind.NUMBER]: "a number",
  [OperandKind.STRING]: "a string in quotes",
  [OperandKind.LABEL]: "a label",
  [OperandKind.CODE]: "an instruction code",
  [OperandKind.VALUE]: "a cell, a number or a string",
});

export function operandFits(wanted, actual) {
  if (wanted === OperandKind.VALUE) {
    return actual === OperandKind.CELL || actual === OperandKind.NUMBER || actual === OperandKind.STRING;
  }
  return wanted === actual;
}

export const INSTRUCTION_CODE = /^[a-z]{2}[1-9][0-9]*$/;

export const LABEL_NAME = /^[a-z_][a-z0-9_]*$/;
