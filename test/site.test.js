import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { validateProgram } from "../src/language/validate.js";
import { sass } from "../src/language/sass.js";
import { runProgram } from "../src/runtime/machine.js";
import { TwistRuntimeError } from "../src/runtime/errors.js";

const docsDir = fileURLToPath(new URL("../website/docs/", import.meta.url));
const GENERATED = ["reference/instructions", "reference/categories", "examples"];

function markdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    const rel = relative(docsDir, path).replace(/\\/g, "/");
    if (entry.isDirectory()) return GENERATED.includes(rel) ? [] : markdownFiles(path);
    return /\.mdx?$/.test(entry.name) ? [path] : [];
  });
}

function snippets(markdown) {
  const pattern = /```twist\n([\s\S]*?)```\n(?:\nTyped in: (.*)\n)?(?:\n```text\n([\s\S]*?)```)?/g;
  return [...markdown.matchAll(pattern)].map(([, source, typed, output]) => ({
    source,
    input: typed ? [...typed.matchAll(/`([^`]*)`/g)].map((m) => m[1]) : [],
    output,
  }));
}

function show(source, input) {
  try {
    return runProgram(source, { calm: true, input, maxSteps: 10_000 }).output;
  } catch (error) {
    if (!(error instanceof TwistRuntimeError)) throw error;
    return `${error.output}line ${error.line}: ${sass(error.reason)}\n`;
  }
}

const files = existsSync(docsDir) ? markdownFiles(docsDir) : [];

describe("website docs", () => {
  it("has hand-written pages to check", () => {
    assert.ok(files.length >= 50, `only found ${files.length}`);
  });

  for (const file of files) {
    const name = relative(docsDir, file).replace(/\\/g, "/");
    const found = snippets(readFileSync(file, "utf8").replace(/\r\n/g, "\n"));
    found.forEach(({ source, input, output }, index) => {
      const label = `${name} #${index + 1}`;

      it(`${label} passes the checker`, () => {
        assert.deepEqual(validateProgram(source).errors, [], source);
      });

      if (output !== undefined) {
        it(`${label} prints what the page says`, () => {
          assert.equal(show(source, input), output);
        });
      }
    });
  }
});
