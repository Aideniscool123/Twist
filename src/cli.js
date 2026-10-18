// The `twist` command line tool: run programs, check them, explore the
// instruction set, or play in the REPL.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NAME, TAGLINE, VERSION } from "./index.js";
import { INSTRUCTIONS, getInstruction, groupByMnemonic } from "./language/instructions.js";
import { validateProgram } from "./language/validate.js";
import { sass } from "./language/sass.js";
import { runProgram } from "./runtime/machine.js";
import { TwistCheckError, TwistRuntimeError } from "./runtime/errors.js";
import { createLineReader } from "./stdin.js";
import { runRepl } from "./repl.js";

const USAGE = `${NAME} ${VERSION} - ${TAGLINE}

Usage:
  twist run <file> [options]   Run a .twist program
  twist repl [options]         Type Twist one line at a time
  twist check <path...>        Check .twist files (or folders of them) for mistakes
  twist list                   List every instruction
  twist explain <code>         Explain one instruction, for example: twist explain ps1
  twist --version              Show the version
  twist --help                 Show this help

Options for run and repl:
  --calm              No mood swings, and the same dice rolls every time
  --seed <number>     Keep the chaos, but make the randomness repeatable
  --max-steps <n>     Give up after this many steps (default 1,000,000)`;

// Read --calm, --seed and --max-steps. Returns { options, rest } or { error }.
function parseRunOptions(args) {
  const options = {};
  const rest = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--calm") {
      options.calm = true;
    } else if (arg === "--seed" || arg === "--max-steps") {
      const value = Number(args[i + 1]);
      if (args[i + 1] === undefined || !Number.isInteger(value) || value < 0) {
        return { error: `${arg} needs a whole number after it` };
      }
      if (arg === "--seed") options.seed = value;
      else options.maxSteps = value;
      i += 1;
    } else if (arg.startsWith("--")) {
      return { error: `Unknown option ${arg}` };
    } else {
      rest.push(arg);
    }
  }
  return { options, rest };
}

function listCommand(print) {
  const header = { code: "CODE", name: "NAME", category: "CATEGORY", example: "EXAMPLE" };
  const rows = [header, ...INSTRUCTIONS];
  const width = (key) => Math.max(...rows.map((row) => row[key].length));
  const [codeWidth, nameWidth, categoryWidth] = ["code", "name", "category"].map(width);

  for (const row of rows) {
    print(
      `${row.code.padEnd(codeWidth)}  ${row.name.padEnd(nameWidth)}  ` +
        `${row.category.padEnd(categoryWidth)}  ${row.example}`,
    );
  }
  return 0;
}

function explainCommand(args, print, fail) {
  if (args.length !== 1) {
    fail("Usage: twist explain <code>   (for example: twist explain ps1)");
    return 2;
  }

  const instruction = getInstruction(args[0].toLowerCase());
  if (!instruction) {
    fail(sass(`Unknown instruction "${args[0]}". Try "twist list"`));
    return 1;
  }

  const usage = [instruction.code, ...instruction.operands.map((o) => `<${o.name}:${o.kind}>`)].join(" ");
  print(`${instruction.code} - ${instruction.name} (${instruction.category})`);
  print(instruction.summary);
  print();
  print(`Usage:   ${usage}`);
  print(`Example: ${instruction.example}`);

  const siblings = (groupByMnemonic().get(instruction.mnemonic) ?? []).filter(
    (other) => other.code !== instruction.code,
  );
  if (siblings.length > 0) {
    print();
    print(`Same letters, different jobs: ${siblings.map((s) => `${s.code} ${s.name}`).join(", ")}`);
  }
  return 0;
}

function collectFiles(paths, fail) {
  const files = [];
  for (const path of paths) {
    let info;
    try {
      info = statSync(path);
    } catch {
      fail(`Can't find ${path}`);
      return null;
    }

    if (info.isDirectory()) {
      const inside = readdirSync(path)
        .filter((name) => name.endsWith(".twist"))
        .sort()
        .map((name) => join(path, name));
      files.push(...inside);
    } else {
      files.push(path);
    }
  }
  return files;
}

function checkCommand(args, print, fail) {
  if (args.length === 0) {
    fail("Usage: twist check <file.twist | folder> ...");
    return 2;
  }

  const files = collectFiles(args, fail);
  if (files === null) return 1;
  if (files.length === 0) {
    fail("No .twist files found.");
    return 1;
  }

  let failed = 0;
  for (const file of files) {
    let source;
    try {
      source = readFileSync(file, "utf8");
    } catch {
      fail(`Can't read ${file}`);
      failed += 1;
      continue;
    }

    const result = validateProgram(source);
    if (result.ok) {
      const count = result.instructions.length;
      print(`${file}: ok (${count} instruction${count === 1 ? "" : "s"})`);
    } else {
      for (const error of result.errors) fail(`${file}:${error.line}: ${sass(error.message)}`);
      failed += 1;
    }
  }

  return failed === 0 ? 0 : 1;
}

function runCommand(args, io, print, fail) {
  const parsed = parseRunOptions(args);
  if (parsed.error || parsed.rest.length !== 1) {
    fail(parsed.error ?? "Usage: twist run <file.twist> [--calm] [--seed <number>] [--max-steps <n>]");
    return 2;
  }

  const [file] = parsed.rest;
  let source;
  try {
    source = readFileSync(file, "utf8");
  } catch {
    fail(`Can't read ${file}`);
    return 1;
  }

  try {
    runProgram(source, {
      ...parsed.options,
      input: io.input ?? createLineReader(),
      output: (text) => io.out.write(text),
      note: (text) => io.err.write(`(twist) ${text}\n`),
    });
    return 0;
  } catch (error) {
    if (error instanceof TwistCheckError) {
      for (const problem of error.errors) fail(`${file}:${problem.line}: ${sass(problem.message)}`);
      return 1;
    }
    if (error instanceof TwistRuntimeError) {
      fail(`${file}:${error.line}: ${sass(error.reason)}`);
      return 1;
    }
    throw error;
  }
}

function replCommand(args, io, fail) {
  const parsed = parseRunOptions(args);
  if (parsed.error || parsed.rest.length > 0) {
    fail(parsed.error ?? "Usage: twist repl [--calm] [--seed <number>] [--max-steps <n>]");
    return 2;
  }
  return runRepl({
    readLine: io.input ?? createLineReader(),
    write: (text) => io.out.write(text),
    writeError: (text) => io.err.write(text),
    options: parsed.options,
  });
}

/**
 * Run the CLI. `argv` is the list of arguments after the program name.
 * Returns the exit code (0 = success).
 */
export function run(argv, io = {}) {
  const out = io.stdout ?? process.stdout;
  const err = io.stderr ?? process.stderr;
  const print = (text = "") => out.write(`${text}\n`);
  const fail = (text) => err.write(`${text}\n`);

  const [command, ...args] = argv;

  switch (command) {
    case undefined:
    case "help":
    case "--help":
    case "-h":
      print(USAGE);
      return 0;
    case "--version":
    case "-v":
      print(`${NAME} ${VERSION}`);
      return 0;
    case "list":
      return listCommand(print);
    case "explain":
      return explainCommand(args, print, fail);
    case "check":
      return checkCommand(args, print, fail);
    case "run":
      return runCommand(args, { out, err, input: io.input }, print, fail);
    case "repl":
      return replCommand(args, { out, err, input: io.input }, fail);
    default:
      fail(sass(`Unknown command "${command}". Try "twist --help"`));
      return 2;
  }
}
