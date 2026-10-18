import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Machine, TwistCheckError, TwistRuntimeError, loadProgram, runProgram } from "../src/runtime/index.js";

const example = (name) => readFileSync(new URL(`../examples/${name}`, import.meta.url), "utf8");
const out = (source, options) => runProgram(source, options).output;

describe("hello world", () => {
  it("runs examples/hello.twist", () => {
    assert.equal(out(example("hello.twist")), "Hello, reef!\n");
  });

  it("runs examples/swap.twist", () => {
    assert.equal(out(example("swap.twist")), "2\n1\n");
  });

  it("runs examples/echo.twist with input", () => {
    assert.equal(out(example("echo.twist"), { input: ["42"] }), "Give me a number:\nYou said:\n42\n");
  });

  it("does nothing for an empty program", () => {
    assert.equal(out(""), "");
    assert.equal(out("; nothing here\n"), "");
  });
});

describe("output", () => {
  it("prints text, cells and values", () => {
    assert.equal(out('ps1 "a"\nps3 #0 "b"\nad3 #0\nsy1 1\nsy1 " and "\nsy1 2.5\n'), "a\nb\n1 and 2.5");
  });

  it("prints an unused cell as 0", () => {
    assert.equal(out("ad3 #99"), "0\n");
  });
});

describe("input", () => {
  it("reads numbers, including decimals and negatives", () => {
    assert.equal(out("ad2 #0\nad2 #1\nad1 #0 #1\nad3 #0", { input: [" 1.5 ", "-4"] }), "-2.5\n");
  });

  it("reads a line of text", () => {
    assert.equal(out("rd3 #0\nad3 #0", { input: ["hello there"] }), "hello there\n");
  });

  it("takes input from a function too", () => {
    assert.equal(out("rd3 #0\nad3 #0", { input: () => "from a function" }), "from a function\n");
  });

  it("complains when the input isn't a number", () => {
    assert.throws(() => out("ad2 #0", { input: ["twelve"] }), (error) => {
      assert.ok(error instanceof TwistRuntimeError);
      assert.equal(error.line, 1);
      assert.match(error.message, /asked for a number, but got "twelve"/);
      return true;
    });
  });

  it("complains when the input runs out", () => {
    assert.throws(() => out("rd3 #0"), /no input left/);
    assert.throws(() => out("ad2 #0"), /no input left/);
  });
});

describe("memory", () => {
  it("plants, copies, swaps and cleans cells", () => {
    const source = 'ps3 #0 "x"\nps3 #1 #0\nps3 #2 5\njz2 #1 #2\ncl3 #0\nad3 #0\nad3 #1\nad3 #2';
    assert.equal(out(source), "0\n5\nx\n");
  });
});

describe("math", () => {
  const calc = (lines) => out(`${lines}\nad3 #0`).trim();

  it("adds, subtracts, multiplies and divides, with decimals", () => {
    assert.equal(calc("ps3 #0 10\nad1 #0 2.5"), "12.5");
    assert.equal(calc("ps3 #0 10\nsb1 #0 12"), "-2");
    assert.equal(calc("ps3 #0 1.5\nmu1 #0 4"), "6");
    assert.equal(calc("ps3 #0 7\ndv1 #0 2"), "3.5");
    assert.equal(calc("ps3 #0 7\nmd1 #0 3"), "1");
    assert.equal(calc("ps3 #0 0.1\nad1 #0 0.2"), "0.3");
  });

  it("uses a cell as the other number", () => {
    assert.equal(calc("ps3 #0 6\nps3 #1 7\nmu1 #0 #1"), "42");
  });

  it("rounds down, even below zero", () => {
    assert.equal(calc("ps3 #0 2.9\nrd1 #0"), "2");
    assert.equal(calc("ps3 #0 -2.1\nrd1 #0"), "-3");
  });

  it("compares", () => {
    assert.equal(calc('ps3 #0 "yes"\neq1 #0 "yes"'), "1");
    assert.equal(calc("ps3 #0 5\neq1 #0 \"5\""), "0");
    assert.equal(calc("ps3 #0 5\ngt1 #0 4.5"), "1");
    assert.equal(calc("ps3 #0 5\ngt1 #0 5"), "0");
  });

  it("turns dividing by zero into 0 and a note instead of a crash", () => {
    const result = runProgram("ps3 #0 9\ndv1 #0 0\nad3 #0\nps3 #1 9\nmd1 #1 #7\nad3 #1");
    assert.equal(result.output, "0\n0\n");
    assert.equal(result.notes.length, 2);
    assert.match(result.notes[0], /^line 2: dividing by zero/);
  });

  it("refuses to do math on text", () => {
    assert.throws(() => out('ps3 #0 "five"\nad1 #0 1'), /ad1 needs a number, but #0 is the text "five"/);
    assert.throws(() => out('ad1 #0 "five"'), /needs a number, but "five" is the text "five"/);
  });
});

describe("running", () => {
  it("stops at hl1", () => {
    assert.equal(out('ps1 "a"\nhl1\nps1 "b"'), "a\n");
  });

  it("can be run one step at a time", () => {
    const printed = [];
    const machine = new Machine(loadProgram('ps1 "a"\nps3 #0 2\nhl1\nps1 "b"'), { output: (text) => printed.push(text) });
    assert.equal(machine.current.code, "ps1");
    assert.equal(machine.step(), true);
    assert.deepEqual(printed, ["a\n"]);
    assert.equal(machine.current.line, 2);
    assert.equal(machine.step(), true);
    assert.deepEqual(machine.snapshot(), [[0, 2]]);
    assert.equal(machine.step(), false);
    assert.equal(machine.halted, true);
    assert.equal(machine.current, undefined);
    assert.equal(machine.steps, 3);
  });

  it("refuses to run a program the checker rejects", () => {
    assert.throws(() => runProgram("zz9\nps1"), (error) => {
      assert.ok(error instanceof TwistCheckError);
      assert.equal(error.errors.length, 2);
      assert.match(error.message, /^line 1: Unknown instruction zz9 \(and 1 more\)/);
      return true;
    });
  });

  it("keeps the output printed before a runtime error", () => {
    try {
      runProgram('ps1 "before"\nps3 #0 "x"\nmu1 #0 2');
      assert.fail("should have thrown");
    } catch (error) {
      assert.equal(error.output, "before\n");
      assert.equal(error.line, 3);
    }
  });
});
