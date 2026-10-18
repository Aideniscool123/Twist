import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TokenType, tokenize, tokenizeLine } from "../src/language/lexer.js";

const types = (tokens) => tokens.map((token) => token.type);

describe("tokenizeLine", () => {
  it("reads every kind of token", () => {
    const tokens = tokenizeLine('je1 #3 -2.5 "hi there" @loop ps1 ; note');
    assert.deepEqual(types(tokens), [
      TokenType.CODE,
      TokenType.CELL,
      TokenType.NUMBER,
      TokenType.STRING,
      TokenType.LABEL,
      TokenType.CODE,
      TokenType.COMMENT,
    ]);
    assert.deepEqual(
      tokens.map((token) => token.value),
      ["je1", 3, -2.5, "hi there", "loop", "ps1", " note"],
    );
  });

  it("records the column of every token", () => {
    const tokens = tokenizeLine('  ps1 "x"  ;c');
    assert.deepEqual(
      tokens.map((token) => token.column),
      [3, 7, 12],
    );
  });

  it("reads a label definition", () => {
    const [token] = tokenizeLine("@top:");
    assert.equal(token.type, TokenType.LABEL_DEF);
    assert.equal(token.value, "top");
  });

  it("turns anything unrecognised into a WORD for the parser to complain about", () => {
    const tokens = tokenizeLine("PS1 #01 .5");
    assert.deepEqual(types(tokens), [TokenType.WORD, TokenType.WORD, TokenType.WORD]);
  });

  it("stops at the first error on a line", () => {
    const tokens = tokenizeLine('ps1 "oops ps2');
    assert.deepEqual(types(tokens), [TokenType.CODE, TokenType.ERROR]);
    assert.match(tokens[1].message, /closing quote/);
    assert.equal(tokens[1].column, 5);
  });

  it("refuses numbers that are too big or negative zero", () => {
    assert.equal(tokenizeLine("99999999999999999999")[0].type, TokenType.ERROR);
    assert.equal(tokenizeLine("-0")[0].type, TokenType.ERROR);
    assert.equal(tokenizeLine("#99999999999999999999")[0].type, TokenType.ERROR);
  });

  it("stamps tokens with the line number it is given", () => {
    assert.equal(tokenizeLine("hl1", 7)[0].line, 7);
  });
});

describe("tokenize", () => {
  it("puts a NEWLINE after every line and EOF at the end", () => {
    const tokens = tokenize("ps1 \"a\"\n\nhl1");
    assert.deepEqual(types(tokens), [
      TokenType.CODE,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.NEWLINE,
      TokenType.CODE,
      TokenType.NEWLINE,
      TokenType.EOF,
    ]);
    assert.deepEqual(
      tokens.map((token) => token.line),
      [1, 1, 1, 2, 3, 3, 3],
    );
  });

  it("handles Windows line endings", () => {
    const tokens = tokenize("hl2\r\nhl1\r\n");
    assert.deepEqual(
      tokens.filter((token) => token.type === TokenType.CODE).map((token) => token.value),
      ["hl2", "hl1"],
    );
  });

  it("gives an empty program just a NEWLINE and EOF", () => {
    assert.deepEqual(types(tokenize("")), [TokenType.NEWLINE, TokenType.EOF]);
  });

  it("refuses something that isn't text", () => {
    assert.throws(() => tokenize(null), TypeError);
  });
});

describe("byte-order marks", () => {
  it("ignores the invisible mark some editors put at the start of a file", () => {
    const tokens = tokenize("\uFEFFps1 \"hi\"");
    assert.equal(tokens[0].type, TokenType.CODE);
    assert.equal(tokens[0].value, "ps1");
  });
});
