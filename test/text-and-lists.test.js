import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runProgram } from "../src/runtime/index.js";

const out = (source, options) => runProgram(source, { calm: true, ...options }).output;
const show = (setup) => out(`${setup}\nad3 #0`).trim();

describe("text", () => {
  it("joins anything onto text", () => {
    assert.equal(show('ps3 #0 "score: "\njn2 #0 10\njn2 #0 "!"'), "score: 10!");
    assert.equal(show("ps3 #0 1\njn2 #0 2"), "12");
    assert.equal(show('mk1 #1\nps4 #1 1\nps3 #0 "list: "\njn2 #0 #1'), "list: [1]");
  });

  it("uppercases", () => {
    assert.equal(show('ps3 #0 "shh"\nup1 #0'), "SHH");
  });

  it("splits text into a list", () => {
    assert.equal(show('ps3 #0 "a b c"\nsp1 #0 " "'), '["a", "b", "c"]');
    assert.equal(show('ps3 #0 "hey"\nsp1 #0 ""'), '["h", "e", "y"]');
  });

  it("turns text into a number", () => {
    assert.equal(show('ps3 #0 " 42.5 "\nnm1 #0\nad1 #0 1'), "43.5");
    assert.equal(show("ps3 #0 7\nnm1 #0"), "7");
    assert.throws(() => show('ps3 #0 "seven"\nnm1 #0'), /can't turn "seven" into a number/);
  });

  it("refuses text instructions on numbers", () => {
    assert.throws(() => show("ps3 #0 5\nup1 #0"), /up1 needs text, but #0 is the number 5/);
  });
});

describe("lists", () => {
  it("makes a list and piles things onto it", () => {
    assert.equal(show('mk1 #0\nps4 #0 1\nps4 #0 "two"\nps4 #0 2.5'), '[1, "two", 2.5]');
  });

  it("copies values into a list, so changing the original later doesn't change it", () => {
    assert.equal(show("mk1 #1\nmk1 #0\nps4 #0 #1\nps4 #1 99"), "[[]]");
  });

  it("pops the last item", () => {
    assert.equal(out("mk1 #0\nps4 #0 1\nps4 #0 2\npp1 #0 #1\nad3 #1\nad3 #0"), "2\n[1]\n");
    assert.throws(() => out("mk1 #0\npp1 #0 #1"), /can't pop anything off #0, the list is empty/);
  });

  it("grabs items from lists and letters from text", () => {
    assert.equal(out('mk1 #0\nps4 #0 "a"\nps4 #0 "b"\ngt2 #1 #0 1\nad3 #1'), "b\n");
    assert.equal(out('ps3 #0 "hey"\nps3 #2 0\ngt2 #1 #0 #2\nad3 #1'), "h\n");
  });

  it("stashes an item in place", () => {
    assert.equal(show("mk1 #0\nps4 #0 1\nps4 #0 2\nst1 #0 0 99"), "[99, 2]");
  });

  it("measures lists and text", () => {
    assert.equal(out('mk1 #0\nps4 #0 1\nln1 #1 #0\nad3 #1\nln1 #1 "four"\nad3 #1'), "1\n4\n");
    assert.throws(() => out("ln1 #1 5"), /can measure a list or text, but 5 is the number 5/);
  });

  it("explains bad indexes", () => {
    assert.throws(() => out("mk1 #0\nps4 #0 1\ngt2 #1 #0 3"), /wants item 3 of #0, but it only has 1 items \(0 to 0\)/);
    assert.throws(() => out("mk1 #0\ngt2 #1 #0 0"), /but it's empty/);
    assert.throws(() => out("mk1 #0\nps4 #0 1\ngt2 #1 #0 0.5"), /needs a whole number, but 0.5 is 0.5/);
    assert.throws(() => out("mk1 #0\nst1 #0 -1 5"), /wants item -1/);
  });

  it("says when something isn't a list", () => {
    assert.throws(() => out("ps4 #0 1"), /ps4 needs a list, but #0 is the number 0. Make one with mk1/);
  });

  it("treats an empty list as zero for jz1", () => {
    assert.equal(out('mk1 #0\njz1 #0 @empty\nps1 "full"\nhl1\n@empty:\nps1 "empty"'), "empty\n");
  });

  it("copies a whole list with ps3, so the two lists are separate", () => {
    assert.equal(out("mk1 #0\nps3 #1 #0\nps4 #1 5\nad3 #0\nad3 #1"), "[]\n[5]\n");
  });

  it("runs examples/shopping.twist", () => {
    const source = readFileSync(new URL("../examples/shopping.twist", import.meta.url), "utf8");
    assert.equal(out(source), "- EGGS\n- MILK\n- GLITTER\nThat's everything.\n");
  });
});
