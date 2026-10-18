// Syntax highlighting for the playground editor, built on the real lexer, so
// the colours always agree with what Twist actually reads.

import { TokenType, tokenizeLine } from "../src/language/lexer.js";
import { getInstruction } from "../src/language/instructions.js";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

function classFor(token, isFirst) {
  switch (token.type) {
    case TokenType.CODE: {
      if (!isFirst) return "tok-code-operand";
      const instruction = getInstruction(token.value);
      return instruction ? `tok-code cat-${instruction.category}` : "tok-unknown";
    }
    case TokenType.LABEL_DEF:
      return "tok-labeldef";
    case TokenType.WORD:
      return "tok-unknown";
    default:
      return `tok-${token.type}`;
  }
}

/** Turn one line of Twist into HTML with a <span> around every token. Spacing is kept exactly. */
export function highlightLine(text) {
  const tokens = tokenizeLine(text);
  let html = "";
  let at = 0;
  let first = true;

  for (const token of tokens) {
    const start = (token.start ?? token.column) - 1;
    const tokenText = token.type === TokenType.ERROR ? text.slice(start) : token.text;
    if (start < at) continue;
    html += escapeHtml(text.slice(at, start));
    html += `<span class="${classFor(token, first)}">${escapeHtml(tokenText)}</span>`;
    at = start + tokenText.length;
    if (token.type !== TokenType.COMMENT) first = false;
  }

  return html + escapeHtml(text.slice(at));
}

/** Highlight a whole program. Every line becomes its own <div>, so lines can be marked. */
export function highlightProgram(source) {
  return source
    .split("\n")
    .map((line) => highlightLine(line.replace(/\r$/, "")))
    .map((html) => `<div class="line">${html || " "}</div>`)
    .join("");
}
