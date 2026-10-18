// The Twist machine: runs a checked program one instruction at a time.
//
// The machine holds everything a running program has: the cells, which
// instruction is next, and where output goes. `step()` runs one instruction,
// so the playground can single-step; `run()` keeps stepping until the program
// stops. What each instruction does lives in behaviors.js.

import { BEHAVIORS } from "./behaviors.js";
import { Oops, TwistCheckError, TwistRuntimeError } from "./errors.js";
import { copyValue, describeValue, typeOf, ValueType } from "./values.js";
import { validateProgram } from "../language/validate.js";

export const DEFAULT_MAX_STEPS = 1_000_000;

/** Make an `input` function that hands out these lines one at a time, then null. */
export function inputFromLines(lines) {
  const queue = [...lines];
  return () => (queue.length > 0 ? String(queue.shift()) : null);
}

/** Check a program and get it ready to run. Throws TwistCheckError if the checker finds mistakes. */
export function loadProgram(source) {
  const result = validateProgram(source);
  if (!result.ok) throw new TwistCheckError(result.errors);
  return { instructions: result.instructions, labels: result.labels };
}

export class Machine {
  /**
   * program   the result of loadProgram()
   * options:
   *   input     () => string | null   a line of input, or null when there is none left
   *   output    (text) => void        where printed text goes
   *   note      (text) => void        where Twist's remarks go (kept apart from output)
   *   maxSteps  stop with an error after this many steps (default 1,000,000)
   */
  constructor(program, options = {}) {
    this.program = program;
    this.input = options.input ?? (() => null);
    this.output = options.output ?? (() => {});
    this.note = options.note ?? (() => {});
    this.maxSteps = options.maxSteps ?? DEFAULT_MAX_STEPS;

    this.cells = new Map();
    this.pc = 0;
    this.direction = 1;
    this.halted = program.instructions.length === 0;
    this.steps = 0;
    this.running = null;
    this.next = 0;
  }

  /** The instruction that will run next, or undefined once the program has stopped. */
  get current() {
    return this.halted ? undefined : this.program.instructions[this.pc];
  }

  read(index) {
    return this.cells.get(index) ?? 0;
  }

  write(index, value) {
    this.cells.set(index, value);
  }

  /** Print text. Output always goes through here. */
  print(text) {
    this.output(text);
  }

  printLine(text) {
    this.print(`${text}\n`);
  }

  readLine() {
    const line = this.input();
    return line === null || line === undefined ? null : String(line).replace(/\r?\n$/, "");
  }

  stop() {
    this.halted = true;
  }

  /** dv1 and md1 call this instead of crashing. */
  dividedByZero() {
    this.note(`line ${this.running.instruction.line}: dividing by zero? Fine, it's 0 now. Twist is not amused.`);
  }

  // --- operand helpers for behaviors.js -------------------------------------

  /** Who is running: "ad1", or "ps1 (doing ad3's job)" after a swap. */
  get who() {
    const { instruction, job } = this.running;
    return instruction.code === job ? job : `${instruction.code} (doing ${job}'s job)`;
  }

  /** The cell number an operand names. */
  cellOf(operand) {
    if (operand.kind !== "cell") throw new Oops(`${this.who} wants a cell like #0 here, but got ${operand.text}`);
    return operand.value;
  }

  /** The value an operand stands for: what's in the cell, or the number or text written there. */
  valueOf(operand) {
    if (operand.kind === "cell") return this.read(operand.value);
    if (operand.kind === "number" || operand.kind === "string") return operand.value;
    throw new Oops(`${this.who} wants a cell, a number or a string here, but got ${operand.text}`);
  }

  /** Like valueOf, but it has to be a number. */
  numberOf(operand) {
    const value = this.valueOf(operand);
    if (typeOf(value) !== ValueType.NUMBER) {
      throw new Oops(`${this.who} needs a number, but ${operand.text} is ${describeValue(value)}`);
    }
    return value;
  }

  /** Like valueOf, but it has to be text. */
  textOf(operand) {
    const value = this.valueOf(operand);
    if (typeOf(value) !== ValueType.TEXT) {
      throw new Oops(`${this.who} needs text, but ${operand.text} is ${describeValue(value)}`);
    }
    return value;
  }

  /** The number in a cell (for instructions that change a number in place). */
  numberIn(operand) {
    this.cellOf(operand);
    return this.numberOf(operand);
  }

  /** The string an operand holds, for instructions that take a string literal. */
  stringOf(operand) {
    if (operand.kind !== "string") throw new Oops(`${this.who} wants a string in quotes here, but got ${operand.text}`);
    return operand.value;
  }

  // --- running ----------------------------------------------------------------

  /** Run one instruction. Returns true if there is more to run. */
  step() {
    if (this.halted) return false;

    const instruction = this.program.instructions[this.pc];
    if (!instruction) {
      this.halted = true;
      return false;
    }

    if (this.steps >= this.maxSteps) {
      this.halted = true;
      throw new TwistRuntimeError(
        `Twist gave up after ${this.maxSteps.toLocaleString("en-US")} steps. Is something looping forever?`,
        instruction.line,
      );
    }

    const job = this.jobOf(instruction.code);
    this.running = { instruction, job };
    this.next = this.pc + this.direction;

    try {
      const behavior = BEHAVIORS[job];
      if (!behavior) throw new Oops(`${job} isn't built yet`);
      behavior(this, instruction.operands);
    } catch (error) {
      if (!(error instanceof Oops)) throw error;
      this.halted = true;
      throw new TwistRuntimeError(error.message, instruction.line);
    } finally {
      this.steps += 1;
    }

    if (!this.halted) {
      this.pc = this.next;
      if (this.pc < 0 || this.pc >= this.program.instructions.length) this.halted = true;
    }
    return !this.halted;
  }

  /** Which instruction's job a code is doing right now. */
  jobOf(code) {
    return code;
  }

  /** Keep stepping until the program stops. */
  run() {
    while (this.step()) {
      // keep going
    }
    return this;
  }

  /** A snapshot of the cells that have been used, sorted by number: [[0, 5], [3, "hi"]]. */
  snapshot() {
    return [...this.cells.entries()].sort((a, b) => a[0] - b[0]).map(([index, value]) => [index, copyValue(value)]);
  }
}

/**
 * Check and run a whole program, collecting everything it prints.
 *
 * options: input (an array of lines, or a function), plus any Machine option.
 * Returns { output, notes, machine }. Throws TwistCheckError or TwistRuntimeError.
 */
export function runProgram(source, options = {}) {
  let output = "";
  const notes = [];
  const input = Array.isArray(options.input) ? inputFromLines(options.input) : options.input;
  const machine = new Machine(loadProgram(source), {
    ...options,
    input,
    output: (text) => {
      output += text;
      options.output?.(text);
    },
    note: (text) => {
      notes.push(text);
      options.note?.(text);
    },
  });
  try {
    machine.run();
  } catch (error) {
    // keep what was printed before things went wrong
    error.output = output;
    error.notes = notes;
    throw error;
  }
  return { output, notes, machine };
}
