// The `twist` command line tool.
//
// For now it helps with language design: list and explain instructions, and
// check programs for mistakes. Phase 7 adds `run` and a REPL.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NAME, TAGLINE, VERSION } from "./index.js";
import { INSTRUCTIONS, getInstruction, groupByMnemonic } from "./language/instructions.js";
import { validateProgram } from "./language/validate.js";

const USAGE = `${NAME} ${VERSION} - ${TAGLINE}

Usage:
  twist list               List every instruction
  twist explain <code>     Explain one instruction, for example: twist explain ps1
  twist check <path...>    Check .twist files (or folders of them) for mistakes
  twist --version          Show the version
  twist --help             Show this help`;

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
    fail(`Unknown instruction "${args[0]}". Try "twist list".`);
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
      for (const error of result.errors) fail(`${file}:${error.line}: ${error.message}`);
      failed += 1;
    }
  }

  return failed === 0 ? 0 : 1;
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
    default:
      fail(`Unknown command "${command}". Try "twist --help".`);
      return 2;
  }
}
