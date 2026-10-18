---
title: The checker
sidebar_position: 4
description: Finding every mistake before anything runs.
---

# The checker

`validateProgram` in `src/language/validate.js` runs the parser, then checks
every instruction against the instruction table.

```js
import { validateProgram } from "./src/language/validate.js";
const result = validateProgram(source);
result.ok;      // true or false
result.errors;  // [{ line, message }], sorted by line
```

## What it checks

1. Every **parser** error (passed through, with the column added).
2. Every instruction **exists**.
3. Every instruction has the right **number** of operands.
4. Every operand is the right **kind**. A `value` slot accepts a cell, a
   number or a string.
5. Every code given to `sw1` is a real instruction.

## Swaps

The checker can't know what `sw1` will have swapped by the time a line runs,
so it works out every code a line *might* be doing:

1. Treat each `sw1 a b` line as joining `a` and `b` into a group.
2. Merge groups that share a code. (`sw1 ps1 ad3` and `sw1 ad3 ps2` make one
   group of three.)
3. A line is fine if its operands fit **any** instruction in its code's
   group.

This is generous on purpose: it never refuses a program that could work.
Mistakes it lets through are caught at run time, with a message naming the
swap.

## Who uses it

- `twist check` prints the result.
- `twist run` and the playground refuse to run unless `ok` is true.
- The REPL checks the whole program again after every line.
