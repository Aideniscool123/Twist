// The Twist parser: turns tokens into a program.
//
// A program is a list of instructions plus a map of labels. Each label points
// at the position in the instruction list of the first instruction after it,
// which is all the interpreter needs to jump there.
//
// The parser checks structure (what a line looks like, labels defined once and
// used labels that exist). Whether an instruction exists and gets the right
// operands is checked by validate.js, using the instruction table.

import { OperandKind } from "./syntax.js";
import { TokenType, tokenize, tokenizeLine } from "./lexer.js";

const OPERAND_TOKENS = new Map([
  [TokenType.CELL, OperandKind.CELL],
  [TokenType.NUMBER, OperandKind.NUMBER],
  [TokenType.STRING, OperandKind.STRING],
  [TokenType.LABEL, OperandKind.LABEL],
  [TokenType.CODE, OperandKind.CODE],
]);

const OPERAND_LOOKS = '#0, -2.5, "hi", @loop or ps1';

function invalid(message, column) {
  return { type: "invalid", message, column };
}

/**
 * Work out what one line's tokens mean.
 *
 * Returns one of:
 *   { type: "blank" }
 *   { type: "comment" }
 *   { type: "label", name }
 *   { type: "instruction", code, operands: [{ kind, text, value }] }
 *   { type: "invalid", message, column }
 */
export function parseLine(lineTokens) {
  const error = lineTokens.find((token) => token.type === TokenType.ERROR);
  const tokens = lineTokens.filter((token) => token.type !== TokenType.COMMENT && token.type !== TokenType.ERROR);

  if (tokens.length === 0) {
    if (error) return invalid(error.message, error.column);
    return { type: lineTokens.length > 0 ? "comment" : "blank" };
  }

  const [first, ...rest] = tokens;

  if (first.type === TokenType.LABEL_DEF) {
    if (rest.length > 0) return invalid("A label needs a line to itself (a comment after it is fine)", rest[0].column);
    if (error) return invalid(error.message, error.column);
    return { type: "label", name: first.value };
  }

  if (first.type === TokenType.LABEL) {
    return invalid(`Labels are defined with a colon, like ${first.text}:`, first.column);
  }

  if (first.type !== TokenType.CODE) {
    return invalid(`Expected an instruction code like ps1, but found ${first.text}`, first.column);
  }

  const operands = [];
  for (const token of rest) {
    const kind = OPERAND_TOKENS.get(token.type);
    if (!kind) return invalid(`Can't read ${token.text} as an operand. Operands look like ${OPERAND_LOOKS}`, token.column);
    operands.push({ kind, text: token.text, value: token.value });
  }
  if (error) return invalid(error.message, error.column);

  return { type: "instruction", code: first.value, operands };
}

/** Work out what kind of line this is (see parseLine for what comes back). */
export function classifyLine(text) {
  return parseLine(tokenizeLine(text));
}

/**
 * Parse a whole program.
 *
 * Returns:
 *   errors        [{ line, column?, message }] in the order they were found
 *   instructions  [{ line, code, operands }] in program order
 *   labels        Map of label name => { line, index }, where index is the
 *                 position in `instructions` that the label points at
 */
export function parse(source) {
  const tokens = tokenize(source);
  const errors = [];
  const instructions = [];
  const labels = new Map();
  const references = [];

  let lineTokens = [];
  for (const token of tokens) {
    if (token.type !== TokenType.NEWLINE && token.type !== TokenType.EOF) {
      lineTokens.push(token);
      continue;
    }

    const { line } = token;
    const result = parseLine(lineTokens);
    lineTokens = [];

    if (result.type === "invalid") {
      errors.push({ line, column: result.column, message: result.message });
    } else if (result.type === "label") {
      if (labels.has(result.name)) {
        errors.push({ line, message: `Label @${result.name} is already defined on line ${labels.get(result.name).line}` });
      } else {
        labels.set(result.name, { line, index: instructions.length });
      }
    } else if (result.type === "instruction") {
      instructions.push({ line, code: result.code, operands: result.operands });
      for (const operand of result.operands) {
        if (operand.kind === OperandKind.LABEL) references.push({ line, name: operand.value });
      }
    }
  }

  for (const reference of references) {
    if (!labels.has(reference.name)) {
      errors.push({ line: reference.line, message: `Label @${reference.name} is never defined` });
    }
  }

  return { errors, instructions, labels };
}
