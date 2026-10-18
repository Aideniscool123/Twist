// The Twist machine: runs a checked program one instruction at a time.
//
// The machine holds everything a running program has: the cells, which
// instruction is next, and where output goes. `step()` runs one instruction,
// so the playground can single-step; `run()` keeps stepping until the program
// stops. What each instruction does lives in behaviors.js.

import { BEHAVIORS } from "./behaviors.js";
import { Oops, TwistCheckError, TwistRuntimeError } from "./errors.js";
import { copyValue, describeValue, formatValue, typeOf, ValueType } from "./values.js";
import { CALM_SEED, randomSeed, seededRandom } from "./random.js";
import {
  HIGHEST_MOOD,
  JUMPS_PER_DIZZY_SPELL,
  LOWEST_MOOD,
  RANDOM_SWING_ODDS,
  REFUSAL_CHANCE,
  moodName,
  moodify,
} from "./mood.js";
import { validateProgram } from "../language/validate.js";

export const DEFAULT_MAX_STEPS = 1_000_000;

/** How deep cl1 calls can nest before Twist assumes something went wrong. */
export const MAX_CALL_DEPTH = 10_000;

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
   *   calm      true to keep the mood at chill and use a fixed random seed
   *   seed      a number, to make dice, coins and mood swings repeatable
   *   random    () => number in [0, 1), to supply randomness directly (tests)
   */
  constructor(program, options = {}) {
    this.program = program;
    this.input = options.input ?? (() => null);
    this.output = options.output ?? (() => {});
    this.note = options.note ?? (() => {});
    this.maxSteps = options.maxSteps ?? DEFAULT_MAX_STEPS;
    this.calm = Boolean(options.calm);
    this.seed = options.seed ?? (this.calm ? CALM_SEED : randomSeed());
    this.random = options.random ?? seededRandom(this.seed);

    this.cells = new Map();
    this.pc = 0;
    this.direction = 1;
    this.halted = program.instructions.length === 0;
    this.steps = 0;
    this.jumps = 0;
    this.callStack = [];
    this.swaps = new Map();
    this.mood = 0;
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

  /** Print text. Output always goes through here, so the mood can mess with it. */
  print(text) {
    this.output(moodify(text, this.mood));
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

  // --- control flow -----------------------------------------------------------

  /** The label an operand names. */
  labelOf(operand) {
    if (operand.kind !== "label") throw new Oops(`${this.who} wants a label like @loop here, but got ${operand.text}`);
    return operand.value;
  }

  /**
   * Jump to a label. Execution carries on from the instruction after the label
   * in the direction Twist is going: below it normally, above it in reverse.
   */
  jump(operand) {
    const { index } = this.program.labels.get(this.labelOf(operand));
    this.next = this.direction === 1 ? index : index - 1;
    this.jumps += 1;
    this.jumped();
  }

  /** cl1: remember where to come back to (and which way we were going), then jump. */
  call(operand) {
    if (this.callStack.length >= MAX_CALL_DEPTH) {
      throw new Oops(`${this.who} called ${MAX_CALL_DEPTH.toLocaleString("en-US")} levels deep without coming back. Is something calling itself forever?`);
    }
    this.callStack.push({ returnTo: this.pc + this.direction, direction: this.direction });
    this.jump(operand);
  }

  /** rt1: go back to just after the most recent cl1. */
  returnFromCall() {
    const frame = this.callStack.pop();
    if (!frame) throw new Oops(`${this.who} wants to return, but nothing called it. There's nowhere to go back to`);
    this.direction = frame.direction;
    this.next = frame.returnTo;
  }

  /** Called after every jump. Too much jumping makes Twist dizzy. */
  jumped() {
    if (this.jumps % JUMPS_PER_DIZZY_SPELL === 0) this.changeMood(-1, "all this jumping around is making it dizzy");
  }

  /** dv1 and md1 call this instead of crashing. */
  dividedByZero() {
    this.remark("dividing by zero? Fine, it's 0 now. Twist is not amused.");
    this.changeMood(-2, "you divided by zero");
  }

  // --- the chaos --------------------------------------------------------------

  /** A remark from Twist about the current line. Remarks go to `note`, never to the output. */
  remark(text) {
    const line = this.running?.instruction.line;
    this.note(line === undefined ? text : `line ${line}: ${text}`);
  }

  get moodName() {
    return moodName(this.mood);
  }

  /** Nudge the mood up or down. Calm Twist doesn't have feelings. */
  changeMood(delta, reason) {
    if (this.calm) return;
    const mood = Math.max(LOWEST_MOOD, Math.min(HIGHEST_MOOD, this.mood + delta));
    if (mood === this.mood) return;
    this.mood = mood;
    this.remark(`Twist is ${this.moodName} now (${reason}).`);
  }

  /** A random whole number from 1 to `sides`. */
  roll(sides) {
    return 1 + Math.floor(this.random() * sides);
  }

  /** sw1: swap the jobs of two codes. Swapping again swaps them back. */
  swapJobs(first, second) {
    const firstJob = this.jobOf(first);
    const secondJob = this.jobOf(second);
    const assign = (code, job) => (code === job ? this.swaps.delete(code) : this.swaps.set(code, job));
    assign(first, secondJob);
    assign(second, firstJob);
  }

  /** rv1: turn around. */
  reverse() {
    this.direction = -this.direction;
    this.next = this.pc + this.direction;
  }

  // Before each instruction: maybe a random mood swing, and maybe a refusal.
  // Returns true if Twist refuses to run this one.
  moodCheck(job) {
    if (this.calm) return false;
    if (this.random() * RANDOM_SWING_ODDS < 1) {
      this.changeMood(this.random() < 0.5 ? -1 : 1, "no reason at all");
    }
    const chance = REFUSAL_CHANCE[this.mood] ?? 0;
    if (job === "ty1" || chance === 0 || this.random() >= chance) return false;
    this.remark(`Twist is ${this.moodName} and refuses to run ${this.running.instruction.code}. Maybe try ty1?`);
    return true;
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

  /** The text in a cell (for instructions that change text in place). */
  textIn(operand) {
    this.cellOf(operand);
    return this.textOf(operand);
  }

  /** The list in a cell. Lists are changed in place, so this is the real list, not a copy. */
  listIn(operand) {
    const value = this.read(this.cellOf(operand));
    if (typeOf(value) !== ValueType.LIST) {
      throw new Oops(`${this.who} needs a list, but ${operand.text} is ${describeValue(value)}. Make one with mk1`);
    }
    return value;
  }

  /** A whole number for counting: an index, or a number of dice sides. */
  wholeNumberOf(operand) {
    const value = this.numberOf(operand);
    if (!Number.isInteger(value)) throw new Oops(`${this.who} needs a whole number, but ${operand.text} is ${formatValue(value)}`);
    return value;
  }

  /** The instruction code an operand names (for sw1). */
  codeOf(operand) {
    if (operand.kind !== "code") throw new Oops(`${this.who} wants an instruction code like ps1 here, but got ${operand.text}`);
    return operand.value;
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
      if (!this.moodCheck(job)) behavior(this, instruction.operands);
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

  /** Which instruction's job a code is doing right now (sw1 can change it). */
  jobOf(code) {
    return this.swaps.get(code) ?? code;
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
