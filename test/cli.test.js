import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "../src/cli.js";
import { VERSION } from "../src/index.js";
import { INSTRUCTIONS } from "../src/language/instructions.js";

const examplesDir = fileURLToPath(new URL("../examples/", import.meta.url));
const binPath = fileURLToPath(new URL("../bin/twist.js", import.meta.url));

function capture(argv) {
  const out = [];
  const err = [];
  const code = run(argv, {
    stdout: { write: (text) => out.push(text) },
    stderr: { write: (text) => err.push(text) },
  });
  return { code, out: out.join(""), err: err.join("") };
}

describe("help and version", () => {
  it("prints usage for --help, help, -h and no arguments", () => {
    for (const argv of [["--help"], ["help"], ["-h"], []]) {
      const result = capture(argv);
      assert.equal(result.code, 0);
      assert.match(result.out, /Usage:/);
      assert.match(result.out, /twist explain/);
    }
  });

  it("prints the version", () => {
    const result = capture(["--version"]);
    assert.equal(result.code, 0);
    assert.equal(result.out, `Twist ${VERSION}\n`);
  });

  it("rejects an unknown command", () => {
    const result = capture(["dance"]);
    assert.equal(result.code, 2);
    assert.match(result.err, /Unknown command "dance"/);
  });
});

describe("list", () => {
  it("shows every instruction", () => {
    const result = capture(["list"]);
    assert.equal(result.code, 0);
    assert.match(result.out, /^CODE\s+NAME\s+CATEGORY\s+EXAMPLE/);
    for (const instruction of INSTRUCTIONS) {
      assert.ok(result.out.includes(instruction.name), `missing ${instruction.name}`);
      assert.ok(result.out.includes(instruction.example), `missing ${instruction.example}`);
    }
  });
});

describe("explain", () => {
  it("explains an instruction and its siblings", () => {
    const result = capture(["explain", "ps1"]);
    assert.equal(result.code, 0);
    assert.match(result.out, /ps1 - Print String \(output\)/);
    assert.match(result.out, /Usage:\s+ps1 <text:string>/);
    assert.match(result.out, /Example:\s+ps1 "Hello, reef!"/);
    assert.match(result.out, /Same letters, different jobs: ps2 Pounce Somewhere, ps3 Plant Seed/);
  });

  it("ignores letter case", () => {
    assert.equal(capture(["explain", "PS1"]).code, 0);
  });

  it("explains an instruction with no operands", () => {
    const result = capture(["explain", "hl2"]);
    assert.equal(result.code, 0);
    assert.match(result.out, /Usage:\s+hl2\n/);
  });

  it("fails for an unknown instruction", () => {
    const result = capture(["explain", "zz9"]);
    assert.equal(result.code, 1);
    assert.match(result.err, /Unknown instruction "zz9"/);
  });

  it("needs exactly one argument", () => {
    assert.equal(capture(["explain"]).code, 2);
    assert.equal(capture(["explain", "ps1", "ps2"]).code, 2);
  });
});

describe("check", () => {
  let dir;

  before(() => {
    dir = mkdtempSync(join(tmpdir(), "twist-test-"));
    writeFileSync(join(dir, "good.twist"), 'ps1 "fine"\n');
    writeFileSync(join(dir, "bad.twist"), 'ps1 "fine"\nzz9\n');
    writeFileSync(join(dir, "notes.txt"), "not a program\n");
    mkdirSync(join(dir, "empty"));
    writeFileSync(join(dir, "empty", "notes.txt"), "still not a program\n");
  });

  after(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("passes the bundled examples folder", () => {
    const result = capture(["check", examplesDir]);
    assert.equal(result.code, 0);
    assert.equal(result.err, "");
    for (const name of ["hello", "countdown", "echo", "swap"]) {
      assert.match(result.out, new RegExp(`${name}\\.twist: ok`));
    }
  });

  it("checks a single file", () => {
    const result = capture(["check", join(dir, "good.twist")]);
    assert.equal(result.code, 0);
    assert.match(result.out, /good\.twist: ok \(1 instruction\)/);
  });

  it("reports mistakes with file and line number", () => {
    const result = capture(["check", join(dir, "bad.twist")]);
    assert.equal(result.code, 1);
    assert.match(result.err, /bad\.twist:2: Unknown instruction zz9/);
  });

  it("fails if any file in a folder has a mistake", () => {
    const result = capture(["check", dir]);
    assert.equal(result.code, 1);
    assert.match(result.out, /good\.twist: ok/);
    assert.match(result.err, /bad\.twist:2:/);
  });

  it("fails when a path doesn't exist", () => {
    const result = capture(["check", join(dir, "nope.twist")]);
    assert.equal(result.code, 1);
    assert.match(result.err, /Can't find/);
  });

  it("fails when a folder has no .twist files", () => {
    const result = capture(["check", join(dir, "empty")]);
    assert.equal(result.code, 1);
    assert.match(result.err, /No \.twist files found/);
  });

  it("needs at least one path", () => {
    assert.equal(capture(["check"]).code, 2);
  });
});

describe("the real command", () => {
  it("runs through bin/twist.js and sets the exit code", () => {
    const version = spawnSync(process.execPath, [binPath, "--version"], { encoding: "utf8" });
    assert.equal(version.status, 0);
    assert.equal(version.stdout, `Twist ${VERSION}\n`);

    const unknown = spawnSync(process.execPath, [binPath, "explain", "zz9"], { encoding: "utf8" });
    assert.equal(unknown.status, 1);
    assert.match(unknown.stderr, /Unknown instruction/);
  });
});
