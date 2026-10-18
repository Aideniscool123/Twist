// What every Twist instruction does when it runs.
//
// Each behavior gets the machine and the instruction's operands. It reads and
// writes cells through the machine's helpers, which check operand kinds at run
// time (after sw1 an instruction may be handed operands meant for another
// job) and throw Oops with a message when something is wrong.

import { Oops } from "./errors.js";
import { copyValue, formatValue, isEmpty, valuesEqual } from "./values.js";

const NUMBER_INPUT = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

function readNumber(m) {
  const line = m.readLine();
  if (line === null) throw new Oops(`${m.who} asked for a number, but there's no input left`);
  const text = line.trim();
  if (!NUMBER_INPUT.test(text)) throw new Oops(`${m.who} asked for a number, but got ${JSON.stringify(line)}`);
  return Number(text) || 0; // || 0 turns -0 into 0
}

// Change the number in a cell: `ad1 #0 5` is math(m, ops, (a, b) => a + b).
function math(m, [cell, other], combine) {
  const index = m.cellOf(cell);
  const result = combine(m.numberIn(cell), m.numberOf(other));
  m.write(index, result === 0 ? 0 : result);
}

// Divide or take a remainder. Dividing by zero gives 0 instead of crashing.
function divide(m, [cell, other], combine) {
  const index = m.cellOf(cell);
  const a = m.numberIn(cell);
  const b = m.numberOf(other);
  if (b === 0) {
    m.write(index, 0);
    m.dividedByZero();
    return;
  }
  const result = combine(a, b);
  m.write(index, result === 0 ? 0 : result);
}

export const BEHAVIORS = {
  // output
  ps1(m, [text]) {
    m.printLine(m.stringOf(text));
  },
  ad3(m, [cell]) {
    m.printLine(formatValue(m.read(m.cellOf(cell))));
  },
  sy1(m, [value]) {
    m.print(formatValue(m.valueOf(value)));
  },

  // input
  ad2(m, [cell]) {
    const index = m.cellOf(cell);
    m.write(index, readNumber(m));
  },
  rd3(m, [cell]) {
    const index = m.cellOf(cell);
    const line = m.readLine();
    if (line === null) throw new Oops(`${m.who} asked for a line of text, but there's no input left`);
    m.write(index, line);
  },

  // memory
  ps3(m, [cell, value]) {
    const index = m.cellOf(cell);
    m.write(index, copyValue(m.valueOf(value)));
  },
  jz2(m, [first, second]) {
    const a = m.cellOf(first);
    const b = m.cellOf(second);
    const held = m.read(a);
    m.write(a, m.read(b));
    m.write(b, held);
  },
  cl3(m, [cell]) {
    m.write(m.cellOf(cell), 0);
  },

  // math
  ad1: (m, ops) => math(m, ops, (a, b) => a + b),
  sb1: (m, ops) => math(m, ops, (a, b) => a - b),
  mu1: (m, ops) => math(m, ops, (a, b) => a * b),
  dv1: (m, ops) => divide(m, ops, (a, b) => a / b),
  md1: (m, ops) => divide(m, ops, (a, b) => a % b),
  rd1(m, [cell]) {
    const index = m.cellOf(cell);
    m.write(index, Math.floor(m.numberIn(cell)) || 0);
  },
  eq1(m, [cell, other]) {
    const index = m.cellOf(cell);
    m.write(index, valuesEqual(m.read(index), m.valueOf(other)) ? 1 : 0);
  },
  gt1(m, [cell, other]) {
    const index = m.cellOf(cell);
    m.write(index, m.numberIn(cell) > m.numberOf(other) ? 1 : 0);
  },

  // control
  ps2(m, [target]) {
    m.jump(target);
  },
  jz1(m, [cell, target]) {
    m.labelOf(target);
    if (isEmpty(m.read(m.cellOf(cell)))) m.jump(target);
  },
  jn1(m, [cell, target]) {
    m.labelOf(target);
    const value = m.read(m.cellOf(cell));
    if (typeof value === "number" && value < 0) m.jump(target);
  },
  je1(m, [cell, other, target]) {
    m.labelOf(target);
    if (valuesEqual(m.read(m.cellOf(cell)), m.valueOf(other))) m.jump(target);
  },
  cl1(m, [target]) {
    m.call(target);
  },
  rt1(m) {
    m.returnFromCall();
  },
  hl1(m) {
    m.stop();
  },

  // misc
  hl2() {
    // Hang Loose: nothing to do, on purpose
  },
};
