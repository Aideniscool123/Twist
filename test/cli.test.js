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

function capture(argv, inputLines = []) {
  const out = [];
  const err = [];
  const queue = [...inputLines];
  const code = run(argv, {
    stdout: { write: (text) => out.push(text) },
    stderr: { write: (text) => err.push(text) },
    input: () => (queue.length > 0 ? queue.shift() : null),
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

describe("run", () => {
  let dir;
  const write = (name, text) => {
    const path = join(dir, name);
    writeFileSync(path, text);
    return path;
  };

  before(() => {
    dir = mkdtempSync(join(tmpdir(), "twist-run-"));
  });

  after(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("runs a program", () => {
    const result = capture(["run", join(examplesDir, "countdown.twist"), "--calm"]);
    assert.equal(result.code, 0);
    assert.equal(result.out, "5\n4\n3\n2\n1\nLiftoff!\n");
    assert.equal(result.err, "");
  });

  it("feeds input to the program", () => {
    const result = capture(["run", join(examplesDir, "echo.twist"), "--calm"], ["7"]);
    assert.equal(result.out, "Give me a number:\nYou said:\n7\n");
  });

  it("sends Twist's remarks to stderr", () => {
    const result = capture(["run", join(examplesDir, "moody.twist"), "--calm"]);
    assert.equal(result.code, 0);
    assert.match(result.err, /^\(twist\) line 4: dividing by zero/);
    assert.ok(!result.out.includes("dividing"));
  });

  it("repeats the dice with --seed", () => {
    const path = write("dice.twist", "rd2 #0 1000\nad3 #0\nrd2 #0 1000\nad3 #0\n");
    const first = capture(["run", path, "--seed", "42"]);
    const second = capture(["run", path, "--seed", "42"]);
    assert.equal(first.out, second.out);
  });

  it("reports check errors with sass and the line number", () => {
    const path = write("bad.twist", 'ps1 "hi"\nps9 #0\n');
    const result = capture(["run", path]);
    assert.equal(result.code, 1);
    assert.equal(result.out, "");
    assert.match(result.err, /bad\.twist:2: Unknown instruction ps9\. Did you just make that up\?/);
  });

  it("reports runtime errors after printing what came before", () => {
    const path = write("crash.twist", 'ps1 "before"\nps3 #0 "x"\nmu1 #0 2\n');
    const result = capture(["run", path, "--calm"]);
    assert.equal(result.code, 1);
    assert.equal(result.out, "before\n");
    assert.match(result.err, /crash\.twist:3: mu1 needs a number, but #0 is the text "x"\. Math\. On that\. Really\?/);
  });

  it("stops endless loops with --max-steps", () => {
    const path = write("loop.twist", "@a:\nps2 @a\n");
    const result = capture(["run", path, "--calm", "--max-steps", "100"]);
    assert.equal(result.code, 1);
    assert.match(result.err, /gave up after 100 steps/);
  });

  it("rejects bad options", () => {
    assert.equal(capture(["run"]).code, 2);
    assert.equal(capture(["run", "a.twist", "b.twist"]).code, 2);
    assert.match(capture(["run", "a.twist", "--seed"]).err, /--seed needs a whole number/);
    assert.match(capture(["run", "a.twist", "--wild"]).err, /Unknown option --wild/);
  });

  it("fails for a file that doesn't exist", () => {
    const result = capture(["run", join(dir, "nope.twist")]);
    assert.equal(result.code, 1);
    assert.match(result.err, /Can't read/);
  });

  it("reads input piped into the real command", () => {
    const result = spawnSync(process.execPath, [binPath, "run", join(examplesDir, "echo.twist"), "--calm"], {
      encoding: "utf8",
      input: "\uFEFF12\n",
    });
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "Give me a number:\nYou said:\n12\n");
  });
});

describe("repl", () => {
  const repl = (lines) => capture(["repl", "--calm"], lines);

  it("runs each line as it is typed", () => {
    const result = repl(['ps1 "hi"', "ps3 #0 2", "mu1 #0 21", "ad3 #0"]);
    assert.equal(result.code, 0);
    assert.match(result.out, /twist> hi\ntwist> twist> twist> 42\n/);
  });

  it("jumps back to labels typed earlier", () => {
    // typing the jn1 loops back to @top until #0 reaches 3
    const result = repl(["ps3 #0 0", "@top:", "ad1 #0 1", "ps3 #1 #0", "sb1 #1 3", "jn1 #1 @top", "ad3 #0"]);
    assert.match(result.out, /twist> 3\n/);
  });

  it("refuses a jump to a label that hasn't been typed yet", () => {
    const result = repl(["ps2 @later"]);
    assert.match(result.err, /Label @later is never defined/);
  });

  it("shows cells, mood and the program so far", () => {
    const result = repl(['ps3 #1 "x"', ":cells", ":mood", ":list"]);
    assert.match(result.out, /#1 = "x"/);
    assert.match(result.out, /chill/);
    assert.match(result.out, /ps3 #1 "x"/);
  });

  it("forgets everything on :reset", () => {
    const result = repl(["ps3 #0 5", ":reset", ":cells"]);
    assert.match(result.out, /Every cell is 0/);
  });

  it("refuses bad lines without forgetting the good ones", () => {
    const result = repl(["ps3 #0 5", "zz1", "ad3 #0"]);
    assert.match(result.err, /Unknown instruction zz1\. Did you just make that up\?/);
    assert.match(result.out, /5\n/);
  });

  it("survives a runtime error", () => {
    const result = repl(['ps3 #0 "x"', "mu1 #0 2", 'ps1 "still here"']);
    assert.match(result.err, /mu1 needs a number/);
    assert.match(result.out, /still here/);
  });

  it("reads input for ad2 from the next line typed", () => {
    const result = repl(["ad2 #0", "41", "ad1 #0 1", "ad3 #0"]);
    assert.match(result.out, /42/);
  });

  it("explains unknown commands and quits on :quit", () => {
    const result = repl([":dance", ":quit", 'ps1 "never"']);
    assert.equal(result.code, 0);
    assert.match(result.err, /There's no :dance command/);
    assert.ok(!result.out.includes("never"));
  });
});
