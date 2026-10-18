---
title: Behaviors
sidebar_position: 6
description: What each instruction does, and the helpers it uses.
---

# Behaviors

`src/runtime/behaviors.js` is one object, `BEHAVIORS`, with a function for
every instruction code. Each function gets the machine and its operands:

```js
export const BEHAVIORS = {
  ps1(m, [text]) {
    m.printLine(m.stringOf(text));
  },
  ad1: (m, ops) => math(m, ops, (a, b) => a + b),
  jz1(m, [cell, target]) {
    m.labelOf(target);
    if (isEmpty(m.read(m.cellOf(cell)))) m.jump(target);
  },
  // ...
};
```

## Operand helpers

Behaviors never read `operand.value` directly. They use the machine's
helpers, which **check the operand at run time** and throw a clear error if
it's wrong. That matters because, after a swap, an instruction can be handed
operands meant for a different job.

| Helper | Returns | Complains unless |
| --- | --- | --- |
| `m.cellOf(op)` | the cell number | it's a cell |
| `m.valueOf(op)` | the value (a cell's contents, or the literal) | it's a cell, number or string |
| `m.numberOf(op)` | a number | the value is a number |
| `m.textOf(op)` | text | the value is text |
| `m.numberIn(op)` | the number in a cell | it's a cell holding a number |
| `m.textIn(op)` | the text in a cell | it's a cell holding text |
| `m.listIn(op)` | the list in a cell (the real one, not a copy) | it's a cell holding a list |
| `m.wholeNumberOf(op)` | a whole number | it's a whole number |
| `m.stringOf(op)` | the string literal | it's a string |
| `m.labelOf(op)` | the label name | it's a label |
| `m.codeOf(op)` | the instruction code | it's a code |

## Machine actions

| Action | Does |
| --- | --- |
| `m.read(i)`, `m.write(i, v)` | read and write cells |
| `m.print(t)`, `m.printLine(t)` | print, through the mood |
| `m.readLine()` | read input (`null` when there is none) |
| `m.jump(op)`, `m.call(op)`, `m.returnFromCall()` | control flow |
| `m.stop()` | halt |
| `m.reverse()` | flip direction |
| `m.swapJobs(a, b)` | swap two codes' jobs |
| `m.changeMood(delta, reason)` | change the mood (ignored when calm) |
| `m.roll(n)`, `m.random()` | randomness |
| `m.remark(text)` | say something on stderr |

## Errors

Throw `Oops` with a message that says **what was expected and what was
found**. Use `m.who`, which reads "ps1" normally, or "ps1 (doing ad3's job)"
after a swap:

```js
throw new Oops(`${m.who} can't pop anything off ${list.text}, the list is empty`);
```
