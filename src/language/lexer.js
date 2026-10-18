// The Twist lexer: turns program text into a flat list of tokens.
//
// Every token knows its line and column (both start at 1). Lines are separated
// by NEWLINE tokens and the list always ends with EOF, so the parser never has
// to look at raw text. A mistake inside a line becomes an ERROR token, and the
// rest of that line is skipped.

import { COMMENT_MARKER, INSTRUCTION_CODE } from "./syntax.js";

export const TokenType = Object.freeze({
  CODE: "code", // ps1
  CELL: "cell", // #0
  NUMBER: "number", // -2.5
  STRING: "string", // "hi"
  LABEL: "label", // @loop
  LABEL_DEF: "label_def", // @loop:
  WORD: "word", // anything else (always a mistake, the parser reports it)
  COMMENT: "comment", // ; a note
  ERROR: "error", // something the lexer couldn't read
  NEWLINE: "newline",
  EOF: "eof",
});

const CELL_PATTERN = /^#(0|[1-9][0-9]*)$/;
const NUMBER_PATTERN = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;
const LABEL_PATTERN = /^@([a-z_][a-z0-9_]*)$/;
const LABEL_DEF_PATTERN = /^@([a-z_][a-z0-9_]*):$/;

const ESCAPES = { '"': '"', "\\": "\\", n: "\n", t: "\t" };

function isSpace(ch) {
  return ch === " " || ch === "\t";
}

function wordToken(text) {
  const cell = CELL_PATTERN.exec(text);
  if (cell) {
    const index = Number(cell[1]);
    if (!Number.isSafeInteger(index)) return { type: TokenType.ERROR, message: `The cell number in ${text} is too big` };
    return { type: TokenType.CELL, value: index };
  }

  if (NUMBER_PATTERN.test(text)) {
    const value = Number(text);
    if (Math.abs(value) > Number.MAX_SAFE_INTEGER) return { type: TokenType.ERROR, message: `The number ${text} is too big` };
    if (Object.is(value, -0)) return { type: TokenType.ERROR, message: `${text} is just 0 wearing a minus sign. Write 0` };
    return { type: TokenType.NUMBER, value };
  }

  const definition = LABEL_DEF_PATTERN.exec(text);
  if (definition) return { type: TokenType.LABEL_DEF, value: definition[1] };

  const label = LABEL_PATTERN.exec(text);
  if (label) return { type: TokenType.LABEL, value: label[1] };

  if (INSTRUCTION_CODE.test(text)) return { type: TokenType.CODE, value: text };

  return { type: TokenType.WORD, value: text };
}

// Read a string starting at the opening quote. Returns the token, or an error.
function readString(text, start) {
  let value = "";
  let j = start + 1;

  while (j < text.length) {
    const c = text[j];
    if (c === '"') {
      const end = j + 1;
      const after = text[end];
      if (after !== undefined && !isSpace(after) && after !== COMMENT_MARKER) {
        return { error: "Put a space after a string", errorColumn: end + 1 };
      }
      return { token: { type: TokenType.STRING, text: text.slice(start, end), value }, end };
    }
    if (c === "\\") {
      const next = text[j + 1];
      if (next === undefined) break;
      if (!Object.hasOwn(ESCAPES, next)) {
        return { error: `Unknown escape "\\${next}" in a string`, errorColumn: j + 1 };
      }
      value += ESCAPES[next];
      j += 2;
      continue;
    }
    value += c;
    j += 1;
  }

  return { error: "This string is missing its closing quote", errorColumn: start + 1 };
}

/** Turn one line of text into tokens (without a NEWLINE at the end). */
export function tokenizeLine(text, line = 1) {
  const tokens = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (isSpace(ch)) {
      i += 1;
      continue;
    }

    const column = i + 1;

    if (ch === COMMENT_MARKER) {
      tokens.push({ type: TokenType.COMMENT, text: text.slice(i), value: text.slice(i + 1), line, column });
      break;
    }

    if (ch === '"') {
      const read = readString(text, i);
      if (read.error) {
        tokens.push({ type: TokenType.ERROR, text: text.slice(i), message: read.error, line, column: read.errorColumn });
        break;
      }
      tokens.push({ ...read.token, line, column });
      i = read.end;
      continue;
    }

    let j = i;
    while (j < text.length && !isSpace(text[j]) && text[j] !== COMMENT_MARKER) j += 1;
    const word = text.slice(i, j);
    const { type, value, message } = wordToken(word);
    if (type === TokenType.ERROR) {
      tokens.push({ type, text: word, message, line, column });
      break;
    }
    tokens.push({ type, text: word, value, line, column });
    i = j;
  }

  return tokens;
}

/** Turn a whole program into tokens, with a NEWLINE after every line and EOF at the end. */
export function tokenize(source) {
  if (typeof source !== "string") {
    throw new TypeError("tokenize expects the program text as a string");
  }

  const tokens = [];
  // Some editors (Notepad, for one) start a file with an invisible byte-order mark.
  const lines = source.replace(/^﻿/, "").split(/\r?\n/);
  lines.forEach((text, offset) => {
    const line = offset + 1;
    tokens.push(...tokenizeLine(text, line));
    tokens.push({ type: TokenType.NEWLINE, text: "\n", line, column: text.length + 1 });
  });
  const last = lines.length;
  tokens.push({ type: TokenType.EOF, text: "", line: last, column: lines[last - 1].length + 1 });
  return tokens;
}
