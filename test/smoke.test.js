import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NAME, VERSION, TAGLINE } from "../src/index.js";

test("the project identifies itself", () => {
  assert.equal(NAME, "Twist");
  assert.ok(TAGLINE.length > 0);
});

test("VERSION matches package.json", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(VERSION, pkg.version);
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});
