import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JUMPS_PER_DIZZY_SPELL, Machine, loadProgram, moodify, runProgram, seededRandom } from "../src/runtime/index.js";

const example = (name) => readFileSync(new URL(`../examples/${name}`, import.meta.url), "utf8");
const calm = (source, options) => runProgram(source, { calm: true, ...options });

function scripted(...numbers) {
  let i = 0;
  return () => numbers[Math.min(i++, numbers.length - 1)];
}

describe("seeded randomness", () => {
  it("gives the same numbers for the same seed", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    for (let i = 0; i < 5; i += 1) assert.equal(a(), b());
  });

  it("stays between 0 and 1", () => {
    const random = seededRandom(7);
    for (let i = 0; i < 1000; i += 1) {
      const n = random();
      assert.ok(n >= 0 && n < 1);
    }
  });
});

describe("dice, coins and shuffles", () => {
  it("rolls from 1 to the number of sides", () => {
    const rolls = new Set();
    for (let seed = 0; seed < 200; seed += 1) {
      const { output } = calm("rd2 #0 6\nad3 #0", { seed });
      rolls.add(Number(output));
    }
    assert.deepEqual([...rolls].sort(), [1, 2, 3, 4, 5, 6]);
  });

  it("rolls the same way every time when calm", () => {
    const source = "rd2 #0 1000\nad3 #0\nrd2 #0 1000\nad3 #0";
    assert.equal(calm(source).output, calm(source).output);
  });

  it("refuses silly dice", () => {
    assert.throws(() => calm("rd2 #0 0"), /can't roll a dice with 0 sides/);
    assert.throws(() => calm("rd2 #0 2.5"), /needs a whole number/);
  });

  it("flips a coin to decide whether to jump", () => {
    const source = 'cl2 @heads\nps1 "tails"\nhl1\n@heads:\nps1 "heads"';
    assert.equal(calm(source, { random: () => 0.1 }).output, "heads\n");
    assert.equal(calm(source, { random: () => 0.9 }).output, "tails\n");
  });

  it("shuffles a list without losing anything", () => {
    const { machine } = calm("mk1 #0\nps4 #0 1\nps4 #0 2\nps4 #0 3\nps4 #0 4\nsh1 #0", { seed: 3 });
    assert.deepEqual([...machine.read(0)].sort(), [1, 2, 3, 4]);
  });
});

describe("Swap Words", () => {
  it("swaps what two instructions do", () => {
    const source = 'ps3 #0 "in a cell"\nsw1 ps1 ad3\nps1 #0\nad3 "from a string"';
    assert.equal(calm(source).output, "in a cell\nfrom a string\n");
  });

  it("swaps back when swapped again", () => {
    assert.equal(calm('sw1 ps1 ad3\nsw1 ps1 ad3\nps1 "normal"').output, "normal\n");
  });

  it("follows chains of swaps", () => {
    const source = 'sw1 ps1 ad3\nsw1 ps1 ps2\nps1 @end\nps1 "skipped"\n@end:';
    const { machine, output } = calm(source);
    assert.equal(output, "");
    assert.equal(machine.jobOf("ps2"), "ad3");
    assert.equal(machine.jobOf("ad3"), "ps1");
  });

  it("blames the swap when a swapped instruction gets the wrong operands", () => {
    assert.throws(() => calm('sw1 ps1 ps2\nps1 "hi"\n@x:\nps2 @x'), (error) => {
      assert.equal(error.line, 2);
      assert.match(error.message, /ps1 \(doing ps2's job\) wants a label like @loop here, but got "hi"/);
      return true;
    });
  });
});

describe("Reverse Vibes", () => {
  it("runs upward after rv1 and stops at the top", () => {
    assert.equal(calm('ps1 "c"\nps1 "b"\nrv1\nps1 "never"').output, "c\nb\nb\nc\n");
  });

  it("flips back with a second rv1", () => {
    const source = [
      "ps2 @start",
      "@fin:",
      'ps1 "end"',
      "hl1",
      "rv1 ; second turn: back to going down",
      "@back:",
      "ps2 @fin",
      "@start:",
      "je1 #0 1 @back ; only jumps on the way up",
      'ps1 "down"',
      "ps3 #0 1",
      "rv1 ; first turn: start going up",
    ].join("\n");
    assert.equal(calm(source).output, "down\ndown\nend\n");
  });

  it("carries on upward from a label after a jump in reverse", () => {
    const source = [
      "jz1 #0 @start",
      'ps1 "b"',
      'ps1 "a"',
      "@up:",
      "hl1 ; never runs: going up, the jump carries on above the label",
      "ps2 @up",
      "ps3 #0 1",
      "@start:",
      "rv1",
    ].join("\n");
    assert.equal(calm(source).output, "a\nb\n");
  });

  it("runs examples/backwards.twist", () => {
    assert.equal(
      calm(example("backwards.twist")).output,
      [
        "1. Going down.",
        "2. ps1 is announcing cell #0, and ad3 prints text:",
        "   see?",
        "3. Twist turned around, so now it reads upward...",
        "4. ...and runs off the top. The end.",
        "",
      ].join("\n"),
    );
  });

  it("runs a call upward and returns upward", () => {
    const source = [
      "jz1 #0 @start",
      'ps1 "after the call"',
      "cl1 @f",
      "ps3 #0 1",
      "@start:",
      "rv1",
      "hl1",
      "rt1 ; f's body runs upward from its label",
      'ps1 "in f"',
      "@f:",
    ].join("\n");
    assert.equal(calm(source).output, "in f\nafter the call\n");
  });
});

describe("mood", () => {
  it("starts chill and can be printed or stored", () => {
    assert.equal(calm("mo1\nmo2 #0\nad3 #0").output, "chill\nchill\n");
  });

  it("gets furious about dividing by zero, and shouts", () => {
    const { output, notes, machine } = runProgram('dv1 #0 0\nps1 "quiet please"\nmo1', { random: () => 0.99 });
    assert.equal(machine.mood, -2);
    assert.equal(output, "QUIET PLEASE\nFURIOUS\n");
    assert.match(notes.join("\n"), /Twist is furious now \(you divided by zero\)/);
  });

  it("cheers up with ty1, up to ecstatic", () => {
    const { output } = runProgram('ty1\nty1\nty1\nty1\nps1 "yay"\nmo1', { random: () => 0.99 });
    assert.equal(output, "yay :D\necstatic :D\n");
  });

  it("gets dizzy from too many jumps", () => {
    const source = `ps3 #0 ${JUMPS_PER_DIZZY_SPELL}\n@loop:\nad1 #0 -1\njz1 #0 @done\nps2 @loop\n@done:\nmo1`;
    const { output, notes } = runProgram(source, { random: () => 0.99 });
    assert.equal(output, "GRUMPY\n");
    assert.match(notes[0], /dizzy/);
  });

  it("refuses instructions when furious, but never ty1", () => {
    const program = loadProgram('ps1 "a"\nty1');
    const machine = new Machine(program, { random: scripted(0.99, 0.0, 0.99, 0.0) });
    const notes = [];
    machine.note = (text) => notes.push(text);
    machine.mood = -2;
    const printed = [];
    machine.output = (text) => printed.push(text);
    machine.run();
    assert.deepEqual(printed, []);
    assert.match(notes[0], /refuses to run ps1/);
    assert.equal(machine.mood, -1);
  });

  it("swings for no reason now and then", () => {
    const machine = new Machine(loadProgram("hl2"), { random: scripted(0.0, 0.9, 0.99) });
    machine.run();
    assert.equal(machine.mood, 1);
  });

  it("has no feelings when calm", () => {
    const { output, notes } = calm('dv1 #0 0\nty1\nps1 "fine"\nmo1');
    assert.equal(output, "fine\nchill\n");
    assert.equal(notes.length, 1);
  });

  it("changes printed text to suit the mood", () => {
    assert.equal(moodify("hi\nthere\n", 0), "hi\nthere\n");
    assert.equal(moodify("hi\n", -1), "HI\n");
    assert.equal(moodify("hi\n", 3), "hi :D\n");
    assert.equal(moodify("no newline", 3), "no newline");
  });

  it("runs examples/moody.twist", () => {
    const { output } = runProgram(example("moody.twist"), { random: () => 0.99 });
    assert.equal(output, "chill\nFURIOUS\nSORRY ABOUT THAT\nchill\n");
  });
});
