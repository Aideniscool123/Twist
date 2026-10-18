---
title: The parser
sidebar_position: 3
description: How tokens become a program the machine can run.
---

# The parser

`src/language/parser.js` turns tokens into a **program**:

```js
import { parse } from "./src/language/parser.js";
parse("@top:\nad1 #0 1\nps2 @top\n");
```

```text
instructions:
  0: line 2  ad1  [cell #0, number 1]
  1: line 3  ps2  [label @top]
labels:
  top → { line: 1, index: 0 }
errors: []
```

## Instructions

Every instruction line becomes `{ line, code, operands }`, where each operand
is `{ kind, text, value }`. Blank lines, comments and labels don't become
instructions.

## Labels point at instructions

A label is stored as the **position in the instruction list** of the first
instruction after it. That's all the machine needs to jump: set "next" to
that number. Several labels in a row all point at the same instruction, and
a label at the very end points just past the last one.

## What the parser checks

The parser checks **structure**:

- each line is a blank, comment, label, or instruction,
- each label is alone on its line, and defined only once,
- every label that's used is defined somewhere.

It does **not** check whether an instruction exists or has the right
operands. That needs the instruction table, and that's the
[checker](./checker)'s job. So `parse("zz9 #0")` is fine, as far as the
parser cares.

## Errors

Errors are collected, not thrown: `{ line, column, message }`. The parser
keeps going after a bad line, so one mistake doesn't hide the next.
