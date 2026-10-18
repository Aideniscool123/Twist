import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MAX_CALL_DEPTH, Machine, TwistRuntimeError, loadProgram, runProgram } from "../src/runtime/index.js";

const example = (name) => readFileSync(new URL(`../examples/${name}`, import.meta.url), "utf8");
const out = (source, options) => runProgram(source, options).output;

describe("jumps", () => {
  it("runs the countdown loop", () => {
    assert.equal(out(example("countdown.twist")), "5\n4\n3\n2\n1\nLiftoff!\n");
  });

  it("runs fizzbuzz", () => {
    const lines = out(example("fizzbuzz.twist")).trim().split("\n");
    assert.equal(lines.length, 15);
    assert.deepEqual(lines.slice(0, 5), ["1", "2", "Fizz", "4", "Buzz"]);
    assert.equal(lines[14], "FizzBuzz");
  });

  it("jumps forward and backward with ps2", () => {
    const source = 'ps2 @b\n@a:\nps1 "a"\nhl1\n@b:\nps1 "b"\nps2 @a';
    assert.equal(out(source), "b\na\n");
  });

  it("treats 0, empty text and an empty list as zero for jz1", () => {
    const jumps = (setup) => out(`${setup}\njz1 #0 @yes\nps1 "no"\nhl1\n@yes:\nps1 "yes"`).trim();
    assert.equal(jumps("ps3 #0 0"), "yes");
    assert.equal(jumps('ps3 #0 ""'), "yes");
    assert.equal(jumps("ps3 #0 0.5"), "no");
    assert.equal(jumps('ps3 #0 "0"'), "no");
  });

  it("jumps on negative numbers with jn1", () => {
    const jumps = (value) => out(`ps3 #0 ${value}\njn1 #0 @neg\nps1 "no"\nhl1\n@neg:\nps1 "neg"`).trim();
    assert.equal(jumps("-0.1"), "neg");
    assert.equal(jumps("0"), "no");
    assert.equal(jumps('"-5"'), "no");
  });

  it("jumps on equal values with je1", () => {
    const source = 'rd3 #0\nje1 #0 "quit" @bye\nps1 "staying"\nhl1\n@bye:\nps1 "bye"';
    assert.equal(out(source, { input: ["quit"] }), "bye\n");
    assert.equal(out(source, { input: ["stay"] }), "staying\n");
  });

  it("ends the program when a jump lands on a label at the very end", () => {
    assert.equal(out('ps2 @end\nps1 "skipped"\n@end:\n'), "");
  });

  it("counts jumps", () => {
    const { machine } = runProgram("ps3 #0 3\n@loop:\njz1 #0 @done\nad1 #0 -1\nps2 @loop\n@done:");
    assert.equal(machine.jumps, 4);
  });
});

describe("call and return", () => {
  it("calls a label and comes back", () => {
    const source = 'cl1 @greet\nps1 "back"\nhl1\n@greet:\nps1 "hi"\nrt1';
    assert.equal(out(source), "hi\nback\n");
  });

  it("nests calls", () => {
    const source = [
      'cl1 @outer\nps1 "done"\nhl1',
      '@outer:\nps1 "outer start"\ncl1 @inner\nps1 "outer end"\nrt1',
      '@inner:\nps1 "inner"\nrt1',
    ].join("\n");
    assert.equal(out(source), "outer start\ninner\nouter end\ndone\n");
  });

  it("can recurse", () => {
    // count #0 down to zero, printing on the way back up
    const source = "ps3 #0 3\ncl1 @down\nhl1\n@down:\njz1 #0 @bottom\nad1 #0 -1\ncl1 @down\nad1 #0 1\nad3 #0\n@bottom:\nrt1";
    assert.equal(out(source), "1\n2\n3\n");
  });

  it("complains about rt1 with nothing to return to", () => {
    assert.throws(() => out('ps1 "a"\nrt1'), (error) => {
      assert.ok(error instanceof TwistRuntimeError);
      assert.equal(error.line, 2);
      assert.match(error.message, /nothing called it/);
      return true;
    });
  });

  it("stops calls that never come back", () => {
    assert.throws(() => out("@forever:\ncl1 @forever"), new RegExp(`called ${MAX_CALL_DEPTH.toLocaleString("en-US")} levels deep`));
  });

  it("shows the call stack while stepping", () => {
    const machine = new Machine(loadProgram("cl1 @f\nhl1\n@f:\nhl2\nrt1"));
    machine.step();
    assert.equal(machine.callStack.length, 1);
    assert.equal(machine.current.code, "hl2");
    machine.step();
    machine.step();
    assert.equal(machine.callStack.length, 0);
    assert.equal(machine.current.code, "hl1");
  });
});

describe("endless loops", () => {
  it("gives up after too many steps", () => {
    assert.throws(() => out("@spin:\nps2 @spin", { maxSteps: 500 }), /gave up after 500 steps/);
  });

  it("lets a long but finite loop finish", () => {
    const source = "ps3 #0 10000\n@loop:\nad1 #0 -1\njz1 #0 @done\nps2 @loop\n@done:\nad3 #0";
    assert.equal(out(source), "0\n");
  });
});
