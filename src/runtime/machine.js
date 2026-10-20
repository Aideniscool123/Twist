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

export const MAX_CALL_DEPTH = 10_000;

export function inputFromLines(lines) {
  const queue = [...lines];
  return () => (queue.length > 0 ? String(queue.shift()) : null);
}

export function loadProgram(source) {
  const result = validateProgram(source);
  if (!result.ok) throw new TwistCheckError(result.errors);
  return { instructions: result.instructions, labels: result.labels };
}

export class Machine {
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

  get current() {
    return this.halted ? undefined : this.program.instructions[this.pc];
  }

  read(index) {
    return this.cells.get(index) ?? 0;
  }

  write(index, value) {
    this.cells.set(index, value);
  }

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

  labelOf(operand) {
    if (operand.kind !== "label") throw new Oops(`${this.who} wants a label like @loop here, but got ${operand.text}`);
    return operand.value;
  }

  jump(operand) {
    const { index } = this.program.labels.get(this.labelOf(operand));
    this.next = this.direction === 1 ? index : index - 1;
    this.jumps += 1;
    this.jumped();
  }

  call(operand) {
    if (this.callStack.length >= MAX_CALL_DEPTH) {
      throw new Oops(`${this.who} called ${MAX_CALL_DEPTH.toLocaleString("en-US")} levels deep without coming back. Is something calling itself forever?`);
    }
    this.callStack.push({ returnTo: this.pc + this.direction, direction: this.direction });
    this.jump(operand);
  }

  returnFromCall() {
    const frame = this.callStack.pop();
    if (!frame) throw new Oops(`${this.who} wants to return, but nothing called it. There's nowhere to go back to`);
    this.direction = frame.direction;
    this.next = frame.returnTo;
  }

  jumped() {
    if (this.jumps % JUMPS_PER_DIZZY_SPELL === 0) this.changeMood(-1, "all this jumping around is making it dizzy");
  }

  dividedByZero() {
    this.remark("dividing by zero? Fine, it's 0 now. Twist is not amused.");
    this.changeMood(-2, "you divided by zero");
  }

  remark(text) {
    const line = this.running?.instruction.line;
    this.note(line === undefined ? text : `line ${line}: ${text}`);
  }

  get moodName() {
    return moodName(this.mood);
  }

  changeMood(delta, reason) {
    if (this.calm) return;
    const mood = Math.max(LOWEST_MOOD, Math.min(HIGHEST_MOOD, this.mood + delta));
    if (mood === this.mood) return;
    this.mood = mood;
    this.remark(`Twist is ${this.moodName} now (${reason}).`);
  }

  roll(sides) {
    return 1 + Math.floor(this.random() * sides);
  }

  swapJobs(first, second) {
    const firstJob = this.jobOf(first);
    const secondJob = this.jobOf(second);
    const assign = (code, job) => (code === job ? this.swaps.delete(code) : this.swaps.set(code, job));
    assign(first, secondJob);
    assign(second, firstJob);
  }

  reverse() {
    this.direction = -this.direction;
    this.next = this.pc + this.direction;
  }

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

  get who() {
    const { instruction, job } = this.running;
    return instruction.code === job ? job : `${instruction.code} (doing ${job}'s job)`;
  }

  cellOf(operand) {
    if (operand.kind !== "cell") throw new Oops(`${this.who} wants a cell like #0 here, but got ${operand.text}`);
    return operand.value;
  }

  valueOf(operand) {
    if (operand.kind === "cell") return this.read(operand.value);
    if (operand.kind === "number" || operand.kind === "string") return operand.value;
    throw new Oops(`${this.who} wants a cell, a number or a string here, but got ${operand.text}`);
  }

  numberOf(operand) {
    const value = this.valueOf(operand);
    if (typeOf(value) !== ValueType.NUMBER) {
      throw new Oops(`${this.who} needs a number, but ${operand.text} is ${describeValue(value)}`);
    }
    return value;
  }

  textOf(operand) {
    const value = this.valueOf(operand);
    if (typeOf(value) !== ValueType.TEXT) {
      throw new Oops(`${this.who} needs text, but ${operand.text} is ${describeValue(value)}`);
    }
    return value;
  }

  numberIn(operand) {
    this.cellOf(operand);
    return this.numberOf(operand);
  }

  textIn(operand) {
    this.cellOf(operand);
    return this.textOf(operand);
  }

  listIn(operand) {
    const value = this.read(this.cellOf(operand));
    if (typeOf(value) !== ValueType.LIST) {
      throw new Oops(`${this.who} needs a list, but ${operand.text} is ${describeValue(value)}. Make one with mk1`);
    }
    return value;
  }

  wholeNumberOf(operand) {
    const value = this.numberOf(operand);
    if (!Number.isInteger(value)) throw new Oops(`${this.who} needs a whole number, but ${operand.text} is ${formatValue(value)}`);
    return value;
  }

  codeOf(operand) {
    if (operand.kind !== "code") throw new Oops(`${this.who} wants an instruction code like ps1 here, but got ${operand.text}`);
    return operand.value;
  }

  stringOf(operand) {
    if (operand.kind !== "string") throw new Oops(`${this.who} wants a string in quotes here, but got ${operand.text}`);
    return operand.value;
  }

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

  jobOf(code) {
    return this.swaps.get(code) ?? code;
  }

  run() {
    while (this.step()) {
    }
    return this;
  }

  snapshot() {
    return [...this.cells.entries()].sort((a, b) => a[0] - b[0]).map(([index, value]) => [index, copyValue(value)]);
  }
}

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
    error.output = output;
    error.notes = notes;
    throw error;
  }
  return { output, notes, machine };
}
