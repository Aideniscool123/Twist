// Twist syntax rules.
//
// Phase 1 (Design) decides what a line of Twist looks like. The real lexer
// and parser (Phase 3) will build on these rules. `classifyLine` is the small
// reference implementation that the tests and the validator use today.

/** Everything after this character (outside a string) is a comment. */
export const COMMENT_MARKER = ";";

/** The four kinds of operand an instruction can take. */
export const OperandKind = Object.freeze({
  CELL: "cell",
  INT: "int",
  STRING: "string",
  LABEL: "label",
});

/** One example of each operand kind, used in error messages and docs. */
export const OPERAND_EXAMPLES = Object.freeze({
  [OperandKind.CELL]: "#0",
  [OperandKind.INT]: "-5",
  [OperandKind.STRING]: '"hi"',
  [OperandKind.LABEL]: "@loop",
});

/** A friendly name for each operand kind, used in error messages. */
export const OPERAND_DESCRIPTIONS = Object.freeze({
  [OperandKind.CELL]: "a cell",
  [OperandKind.INT]: "a whole number",
  [OperandKind.STRING]: "a string in quotes",
  [OperandKind.LABEL]: "a label",
});

/** An instruction code: two lowercase letters, then a number with no leading zeros (ps1, ad12). */
export const INSTRUCTION_CODE = /^[a-z]{2}[1-9][0-9]*$/;

/** A label name: lowercase letters, digits and underscores, not starting with a digit. */
export const LABEL_NAME = /^[a-z_][a-z0-9_]*$/;

const CELL_PATTERN = /^#(0|[1-9][0-9]*)$/;
const INT_PATTERN = /^(0|-?[1-9][0-9]*)$/;
const LABEL_REFERENCE = /^@([a-z_][a-z0-9_]*)$/;
const LABEL_DEFINITION = /^@([a-z_][a-z0-9_]*):$/;

const ESCAPES = { '"': '"', "\\": "\\", n: "\n", t: "\t" };

function isSpace(ch) {
  return ch === " " || ch === "\t";
}

function invalid(message, column) {
  return { type: "invalid", message, column };
}

// Split a line into tokens. Words end at whitespace or at a comment marker.
// Strings start and end with a double quote and may contain spaces and ';'.
function scanLine(line) {
  const tokens = [];
  let hasComment = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (isSpace(ch)) {
      i += 1;
      continue;
    }

    if (ch === COMMENT_MARKER) {
      hasComment = true;
      break;
    }

    const column = i + 1;

    if (ch === '"') {
      let value = "";
      let j = i + 1;
      let closed = false;

      while (j < line.length) {
        const c = line[j];
        if (c === '"') {
          closed = true;
          break;
        }
        if (c === "\\") {
          const next = line[j + 1];
          if (next === undefined) break;
          if (!Object.hasOwn(ESCAPES, next)) {
            return { error: { message: `Unknown escape "\\${next}" in a string`, column: j + 1 } };
          }
          value += ESCAPES[next];
          j += 2;
          continue;
        }
        value += c;
        j += 1;
      }

      if (!closed) {
        return { error: { message: "This string is missing its closing quote", column } };
      }

      const end = j + 1;
      const after = line[end];
      if (after !== undefined && !isSpace(after) && after !== COMMENT_MARKER) {
        return { error: { message: "Put a space after a string", column: end + 1 } };
      }

      tokens.push({ text: line.slice(i, end), column, isString: true, value });
      i = end;
      continue;
    }

    let j = i;
    while (j < line.length && !isSpace(line[j]) && line[j] !== COMMENT_MARKER) {
      j += 1;
    }
    tokens.push({ text: line.slice(i, j), column, isString: false });
    i = j;
  }

  return { tokens, hasComment };
}

function numberOperand(kind, text, value) {
  if (!Number.isSafeInteger(value)) {
    return { error: `The number in ${text} is too big` };
  }
  return { operand: { kind, text, value } };
}

function parseOperand(token) {
  if (token.isString) {
    return { operand: { kind: OperandKind.STRING, text: token.text, value: token.value } };
  }

  const { text } = token;

  const cell = CELL_PATTERN.exec(text);
  if (cell) return numberOperand(OperandKind.CELL, text, Number(cell[1]));

  if (INT_PATTERN.test(text)) return numberOperand(OperandKind.INT, text, Number(text));

  const label = LABEL_REFERENCE.exec(text);
  if (label) return { operand: { kind: OperandKind.LABEL, text, value: label[1] } };

  const examples = Object.values(OPERAND_EXAMPLES);
  const list = `${examples.slice(0, -1).join(", ")} or ${examples[examples.length - 1]}`;
  return { error: `Can't read ${text} as an operand. Operands look like ${list}` };
}

/**
 * Work out what kind of line this is.
 *
 * Returns one of:
 *   { type: "blank" }
 *   { type: "comment" }
 *   { type: "label", name }
 *   { type: "instruction", code, operands: [{ kind, text, value }] }
 *   { type: "invalid", message, column }
 */
export function classifyLine(line) {
  const scanned = scanLine(line);
  if (scanned.error) return invalid(scanned.error.message, scanned.error.column);

  const { tokens, hasComment } = scanned;
  if (tokens.length === 0) return { type: hasComment ? "comment" : "blank" };

  const [first, ...rest] = tokens;

  if (!first.isString) {
    const definition = LABEL_DEFINITION.exec(first.text);
    if (definition) {
      if (rest.length > 0) {
        return invalid("A label needs a line to itself (a comment after it is fine)", rest[0].column);
      }
      return { type: "label", name: definition[1] };
    }

    if (LABEL_REFERENCE.test(first.text)) {
      return invalid(`Labels are defined with a colon, like ${first.text}:`, first.column);
    }
  }

  if (first.isString || !INSTRUCTION_CODE.test(first.text)) {
    return invalid(`Expected an instruction code like ps1, but found ${first.text}`, first.column);
  }

  const operands = [];
  for (const token of rest) {
    const parsed = parseOperand(token);
    if (parsed.error) return invalid(parsed.error, token.column);
    operands.push(parsed.operand);
  }

  return { type: "instruction", code: first.text, operands };
}
