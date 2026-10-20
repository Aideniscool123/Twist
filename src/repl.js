import { Machine } from "./runtime/machine.js";
import { TwistRuntimeError } from "./runtime/errors.js";
import { formatValue } from "./runtime/values.js";
import { validateProgram } from "./language/validate.js";
import { sass } from "./language/sass.js";
import { NAME, TAGLINE, VERSION } from "./index.js";

const HELP = `Type a line of Twist and it runs. Labels (like @top:) mark a spot to jump back to.
  :cells   show every cell that has something in it
  :mood    show how Twist is feeling
  :list    show the program so far
  :reset   forget everything and start again
  :help    show this help
  :quit    leave (so does Ctrl+C)`;

const EMPTY_PROGRAM = { instructions: [], labels: new Map() };

export function runRepl({ readLine, write, writeError, options = {} }) {
  let lines = [];
  let machine;

  const reset = () => {
    lines = [];
    machine = new Machine(EMPTY_PROGRAM, {
      ...options,
      input: readLine,
      output: write,
      note: (text) => writeError(`(twist) ${text}\n`),
    });
  };

  const commands = {
    help: () => write(`${HELP}\n`),
    cells: () => {
      const cells = machine.snapshot();
      if (cells.length === 0) write("Every cell is 0.\n");
      for (const [index, value] of cells) write(`#${index} = ${formatValue(value, true)}\n`);
    },
    mood: () => write(`${machine.moodName}\n`),
    list: () => write(lines.length === 0 ? "Nothing yet.\n" : `${lines.join("\n")}\n`),
    reset: () => {
      reset();
      write("Forgotten. Fresh start.\n");
    },
  };

  reset();
  write(`${NAME} ${VERSION} - ${TAGLINE}\nType :help for help, :quit to leave.\n`);

  for (;;) {
    write("twist> ");
    const text = readLine();
    if (text === null) {
      write("\n");
      return 0;
    }

    const trimmed = text.trim();
    if (trimmed === "") continue;

    if (trimmed.startsWith(":")) {
      const name = trimmed.slice(1).toLowerCase();
      if (name === "quit" || name === "exit" || name === "q") return 0;
      const command = commands[name];
      if (command) command();
      else writeError(`${sass(`There's no :${name} command`)} Try :help.\n`);
      continue;
    }

    const candidate = [...lines, text];
    const result = validateProgram(candidate.join("\n"));
    if (!result.ok) {
      for (const error of result.errors) writeError(`${sass(error.message)}\n`);
      continue;
    }

    const before = machine.program.instructions.length;
    lines = candidate;
    machine.program = { instructions: result.instructions, labels: result.labels };
    if (result.instructions.length === before) continue;

    machine.pc = before;
    machine.halted = false;
    machine.steps = 0;
    try {
      machine.run();
    } catch (error) {
      if (!(error instanceof TwistRuntimeError)) throw error;
      writeError(`${sass(error.reason)}\n`);
    }
  }
}
