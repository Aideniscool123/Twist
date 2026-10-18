import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { copyValue, describeValue, formatValue, isEmpty, typeOf, valuesEqual } from "../src/runtime/values.js";

describe("values", () => {
  it("knows what type a value is", () => {
    assert.equal(typeOf(1.5), "number");
    assert.equal(typeOf("hi"), "text");
    assert.equal(typeOf([]), "list");
  });

  it("prints numbers without floating-point noise", () => {
    assert.equal(formatValue(0.1 + 0.2), "0.3");
    assert.equal(formatValue(-2.5), "-2.5");
    assert.equal(formatValue(42), "42");
    assert.equal(formatValue(1 / 3), "0.333333333333");
  });

  it("prints text as itself, but quoted inside a list", () => {
    assert.equal(formatValue("hi"), "hi");
    assert.equal(formatValue([1, "1", ["a", []]]), '[1, "1", ["a", []]]');
  });

  it("describes values for error messages", () => {
    assert.equal(describeValue(5), "the number 5");
    assert.equal(describeValue("hi"), 'the text "hi"');
    assert.equal(describeValue([1]), "a list of 1 thing");
    assert.equal(describeValue([1, 2]), "a list of 2 things");
  });

  it("treats 0, empty text and empty lists as empty", () => {
    for (const value of [0, "", []]) assert.ok(isEmpty(value), formatValue(value, true));
    for (const value of [1, -0.5, " ", [0]]) assert.ok(!isEmpty(value), formatValue(value, true));
  });

  it("compares values", () => {
    assert.ok(valuesEqual(2, 2));
    assert.ok(valuesEqual("a", "a"));
    assert.ok(!valuesEqual(5, "5"));
    assert.ok(valuesEqual([1, ["x"]], [1, ["x"]]));
    assert.ok(!valuesEqual([1, 2], [1]));
    assert.ok(!valuesEqual([], 0));
  });

  it("copies lists all the way down", () => {
    const original = [1, [2, 3]];
    const copy = copyValue(original);
    copy[1].push(4);
    assert.deepEqual(original, [1, [2, 3]]);
  });
});
