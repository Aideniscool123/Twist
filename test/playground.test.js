import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { escapeHtml, highlightLine, highlightProgram } from "../playground/highlight.js";
import { EXAMPLES } from "../playground/examples.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const stripTags = (html) =>
  html.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

describe("playground highlighting", () => {
  it("wraps tokens in spans by kind, coloring codes by category", () => {
    const html = highlightLine('ps1 "hi" ; note');
    assert.match(html, /<span class="tok-code cat-output">ps1<\/span>/);
    assert.match(html, /<span class="tok-string">&quot;hi&quot;<\/span>/);
    assert.match(html, /<span class="tok-comment">; note<\/span>/);
  });

  it("marks codes used as operands differently from the instruction itself", () => {
    const html = highlightLine("sw1 ps1 ad3");
    assert.match(html, /tok-code cat-chaos">sw1/);
    assert.match(html, /tok-code-operand">ps1/);
  });

  it("flags unknown instructions and broken strings", () => {
    assert.match(highlightLine("zz9 #0"), /tok-unknown">zz9/);
    assert.match(highlightLine('ps1 "oops'), /tok-error">&quot;oops/);
  });

  it("never loses or reorders any text", () => {
    const lines = ['  ps1 "a <b> & c" ; <i>', "@top:", "ad1 #0 -2.5", "PS1 junk", 'ps1 "a\\qb" x', "", "   ", 'je1 #0 "x" @y ; z'];
    for (const line of lines) assert.equal(stripTags(highlightLine(line)), line, line);
  });

  it("escapes HTML", () => {
    assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  });

  it("gives every line its own div", () => {
    const html = highlightProgram("hl1\n\nhl2");
    assert.equal(html.match(/<div class="line">/g).length, 3);
  });
});

describe("playground examples", () => {
  it("offers every program in examples/, and nothing else", () => {
    const onDisk = readdirSync(join(root, "examples")).filter((name) => name.endsWith(".twist")).sort();
    assert.deepEqual(EXAMPLES.map((example) => example.file).sort(), onDisk);
  });
});

describe("playground code", () => {
  it("only loads code that can run in a browser", () => {
    const seen = new Set();
    const visit = (file) => {
      if (seen.has(file)) return;
      seen.add(file);
      const text = readFileSync(file, "utf8");
      for (const [, specifier] of text.matchAll(/^\s*(?:import|export)\s[^;]*?from\s+"([^"]+)"/gm)) {
        assert.ok(!specifier.startsWith("node:"), `${file} imports ${specifier}`);
        assert.ok(specifier.startsWith("."), `${file} imports a package: ${specifier}`);
        visit(resolve(dirname(file), specifier));
      }
    };
    visit(join(root, "playground", "app.js"));
    assert.ok(seen.size > 5);
  });

  it("has an index.html that loads app.js as a module", () => {
    const html = readFileSync(join(root, "playground", "index.html"), "utf8");
    assert.match(html, /<script type="module" src="app.js"><\/script>/);
  });
});
