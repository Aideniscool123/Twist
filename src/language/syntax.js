// Twist syntax rules: the shared constants for what a line of Twist looks like.
//
// The lexer (lexer.js) and parser (parser.js) do the actual reading. This file
// holds the pieces they, the checker and the docs all agree on.

/** Everything after this character (outside a string) is a comment. */
export const COMMENT_MARKER = ";";

/**
 * The kinds of operand an instruction can take.
 *
 * CELL, NUMBER, STRING, LABEL and CODE are what an operand looks like on the
 * page. VALUE is only used in the instruction table: it means "a cell, a
 * number or a string", so a line never contains a VALUE operand itself.
 */
export const OperandKind = Object.freeze({
  CELL: "cell",
  NUMBER: "number",
  STRING: "string",
  LABEL: "label",
  CODE: "code",
  VALUE: "value",
});

/** One example of each operand kind, used in error messages and docs. */
export const OPERAND_EXAMPLES = Object.freeze({
  [OperandKind.CELL]: "#0",
  [OperandKind.NUMBER]: "-2.5",
  [OperandKind.STRING]: '"hi"',
  [OperandKind.LABEL]: "@loop",
  [OperandKind.CODE]: "ps1",
  [OperandKind.VALUE]: '#0, 7 or "hi"',
});

/** A friendly name for each operand kind, used in error messages. */
export const OPERAND_DESCRIPTIONS = Object.freeze({
  [OperandKind.CELL]: "a cell",
  [OperandKind.NUMBER]: "a number",
  [OperandKind.STRING]: "a string in quotes",
  [OperandKind.LABEL]: "a label",
  [OperandKind.CODE]: "an instruction code",
  [OperandKind.VALUE]: "a cell, a number or a string",
});

/** Does an operand of kind `actual` fit a slot in the instruction table that wants `wanted`? */
export function operandFits(wanted, actual) {
  if (wanted === OperandKind.VALUE) {
    return actual === OperandKind.CELL || actual === OperandKind.NUMBER || actual === OperandKind.STRING;
  }
  return wanted === actual;
}

/** An instruction code: two lowercase letters, then a number with no leading zeros (ps1, ad12). */
export const INSTRUCTION_CODE = /^[a-z]{2}[1-9][0-9]*$/;

/** A label name: lowercase letters, digits and underscores, not starting with a digit. */
export const LABEL_NAME = /^[a-z_][a-z0-9_]*$/;
