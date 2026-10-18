// What every Twist instruction does when it runs.
//
// Each behavior gets the machine and the instruction's operands. It reads and
// writes cells through the machine's helpers, which check operand kinds at run
// time (after sw1 an instruction may be handed operands meant for another
// job) and throw Oops with a message when something is wrong.

import { Oops } from "./errors.js";
import { copyValue, describeValue, formatValue, isEmpty, valuesEqual } from "./values.js";

const NUMBER_INPUT = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

function readNumber(m) {
  const line = m.readLine();
  if (line === null) throw new Oops(`${m.who} asked for a number, but there's no input left`);
  const text = line.trim();
  if (!NUMBER_INPUT.test(text)) throw new Oops(`${m.who} asked for a number, but got ${JSON.stringify(line)}`);
  return Number(text) || 0; // || 0 turns -0 into 0
}

// Check an index into a list or text and return it.
function checkIndex(m, items, where, operand) {
  const index = m.wholeNumberOf(operand);
  if (index < 0 || index >= items.length) {
    const what = typeof items === "string" ? "letters" : "items";
    const range = items.length === 0 ? "it's empty" : `it only has ${items.length} ${what} (0 to ${items.length - 1})`;
    throw new Oops(`${m.who} wants item ${index} of ${where.text}, but ${range}`);
  }
  return index;
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
  mo1(m) {
    m.printLine(m.moodName);
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
  mo2(m, [cell]) {
    m.write(m.cellOf(cell), m.moodName);
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

  // text
  jn2(m, [cell, value]) {
    const index = m.cellOf(cell);
    m.write(index, formatValue(m.read(index)) + formatValue(m.valueOf(value)));
  },
  up1(m, [cell]) {
    m.write(m.cellOf(cell), m.textIn(cell).toUpperCase());
  },
  sp1(m, [cell, separator]) {
    m.write(m.cellOf(cell), m.textIn(cell).split(m.textOf(separator)));
  },
  nm1(m, [cell]) {
    const index = m.cellOf(cell);
    const value = m.read(index);
    if (typeof value === "number") return;
    if (Array.isArray(value)) throw new Oops(`${m.who} can't turn a list into a number`);
    const text = value.trim();
    if (!NUMBER_INPUT.test(text)) throw new Oops(`${m.who} can't turn ${JSON.stringify(value)} into a number`);
    m.write(index, Number(text) || 0);
  },

  // list
  mk1(m, [cell]) {
    m.write(m.cellOf(cell), []);
  },
  ps4(m, [list, value]) {
    m.listIn(list).push(copyValue(m.valueOf(value)));
  },
  pp1(m, [list, into]) {
    const items = m.listIn(list);
    const target = m.cellOf(into);
    if (items.length === 0) throw new Oops(`${m.who} can't pop anything off ${list.text}, the list is empty`);
    m.write(target, items.pop());
  },
  gt2(m, [into, from, index]) {
    const target = m.cellOf(into);
    const source = m.read(m.cellOf(from));
    if (typeof source === "number") throw new Oops(`${m.who} needs a list or text, but ${from.text} is ${describeValue(source)}`);
    const position = checkIndex(m, source, from, index);
    m.write(target, typeof source === "string" ? source[position] : copyValue(source[position]));
  },
  st1(m, [list, index, value]) {
    const items = m.listIn(list);
    items[checkIndex(m, items, list, index)] = copyValue(m.valueOf(value));
  },
  ln1(m, [into, of]) {
    const target = m.cellOf(into);
    const value = m.valueOf(of);
    if (typeof value === "number") throw new Oops(`${m.who} can measure a list or text, but ${of.text} is ${describeValue(value)}`);
    m.write(target, value.length);
  },

  // chaos
  rd2(m, [cell, sides]) {
    const target = m.cellOf(cell);
    const count = m.wholeNumberOf(sides);
    if (count < 1) throw new Oops(`${m.who} can't roll a dice with ${count} sides`);
    m.write(target, m.roll(count));
  },
  cl2(m, [target]) {
    m.labelOf(target);
    if (m.random() < 0.5) m.jump(target);
  },
  sh1(m, [list]) {
    const items = m.listIn(list);
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = m.roll(i + 1) - 1;
      [items[i], items[j]] = [items[j], items[i]];
    }
  },
  sw1(m, [first, second]) {
    m.swapJobs(m.codeOf(first), m.codeOf(second));
  },
  rv1(m) {
    m.reverse();
  },
  ty1(m) {
    m.changeMood(1, "it appreciates the compliment");
  },

  // misc
  hl2() {
    // Hang Loose: nothing to do, on purpose
  },
};
