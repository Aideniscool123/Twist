import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sass } from "../src/language/sass.js";

describe("sass", () => {
  it("keeps the useful part first", () => {
    assert.equal(sass("Unknown instruction zz9"), "Unknown instruction zz9. Did you just make that up?");
  });

  it("picks a remark that fits the mistake", () => {
    assert.match(sass("Label @x is never defined"), /void/);
    assert.match(sass("ps1 (doing ps2's job) wants a label like @loop here, but got \"hi\""), /sw1/);
  });

  it("falls back to a general remark, the same one every time", () => {
    const message = "something nobody planned for";
    assert.ok(sass(message).startsWith(`${message}. `));
    assert.equal(sass(message), sass(message));
  });

  it("doesn't add a second full stop", () => {
    assert.match(sass("Twist gave up after 5 steps. Is something looping forever?"), /forever\? I have/);
  });
});
