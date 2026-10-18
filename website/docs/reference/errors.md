---
title: Error messages
sidebar_position: 5
description: Every error Twist can give you, what it means, and how to fix it.
---

# Error messages

Twist's errors always start with **the line number and the real problem**.
The rude remark comes last. This page lists every error, grouped by when it
happens.

## Before running: the checker

The checker reads your whole program first. If it finds anything, nothing
runs.

### Reading lines

| Message | Means | Fix |
| --- | --- | --- |
| Expected an instruction code like ps1, but found X | The line doesn't start with an instruction. | Start every line with a code (lowercase!), a label, or `;`. |
| Labels are defined with a colon, like @x: | You wrote `@x` alone on a line. | Add the colon: `@x:`. |
| A label needs a line to itself | Something follows a label definition. | Put the instruction on the next line. |
| Can't read X as an operand | An operand isn't a cell, number, string, label or code. | Check for typos like `#x`, `1.` or a missing `@`. |
| This string is missing its closing quote | A `"` was never closed. | Close it on the same line. |
| Unknown escape "\q" in a string | Only `\" \\ \n \t` are allowed. | Write `\\` for a real backslash. |
| Put a space after a string | Something is stuck to the end of a string. | Add a space. |
| The number X is too big | Over about 9 quadrillion. | Use a smaller number. |
| -0 is just 0 wearing a minus sign | You wrote `-0` (or `-0.0`). | Write `0`. |
| The cell number in X is too big | A huge cell number. | Use a smaller cell number. |

### Instructions and operands

| Message | Means | Fix |
| --- | --- | --- |
| Unknown instruction X | No instruction has that code. | Check the [reference](./instructions). |
| X takes N operands, but this line has M | Too many or too few operands. | Check the instruction's page. |
| X operand N (name) should be ..., but got Y | The wrong kind of operand. | A cell is `#0`, a label is `@x`, text is in quotes. |
| sw1 operand N: X isn't an instruction | `sw1` named a code that doesn't exist. | Use a real code. |

### Labels

| Message | Means | Fix |
| --- | --- | --- |
| Label @x is already defined on line N | Two `@x:` lines. | Rename one. |
| Label @x is never defined | You jump to `@x`, but there's no `@x:`. | Add the label, or fix the typo. |

## While running

These stop the program. Everything printed before the error stays printed.

| Message | Means |
| --- | --- |
| X needs a number, but #0 is the text "..." | Math on something that isn't a number. Use `nm1` to convert text. |
| X needs text, but ... | A text instruction got a number or list. |
| X needs a list, but ... Make one with mk1 | A list instruction on a cell without a list. Remember: every cell starts as `0`. |
| X needs a whole number, but ... is 2.5 | An index or dice size with a decimal. |
| X wants item N of #0, but it only has M items | The index is past the end. Items count from 0. |
| X can't pop anything off #0, the list is empty | `pp1` on an empty list. |
| X can measure a list or text, but ... is the number N | `ln1` on a number. |
| X can't turn "..." into a number | `nm1` on text that isn't a number. |
| X can't roll a dice with N sides | `rd2` with 0 or fewer sides. |
| X asked for a number, but got "..." | `ad2` read something that isn't a number. |
| X asked for ..., but there's no input left | `ad2` or `rd3` ran out of input. |
| X wants to return, but nothing called it | `rt1` without a matching `cl1`. Usually a missing `hl1` before your functions. |
| X called 10,000 levels deep without coming back | Recursion that never stops. |
| Twist gave up after N steps | An endless loop, or a really long program. Raise it with `--max-steps`. |
| X (doing Y's job) wants ... | A [swapped](/docs/language/swap-words) instruction got the operands of its *old* job. |

## Not errors

These are **remarks**. The program keeps running, and they go to stderr.

| Remark | Means |
| --- | --- |
| dividing by zero? Fine, it's 0 now. Twist is not amused. | `dv1`/`md1` by zero gave 0. |
| Twist is grumpy now (...) | A [mood](/docs/language/mood-system) change, and why. |
| Twist is furious and refuses to run X. Maybe try ty1? | The instruction was skipped. |

## The remarks

Each kind of mistake gets its own remark, like "Did you just make that up?"
for an unknown instruction, or "It's turtles all the way down." for runaway
recursion. Anything without its own remark gets one of five general ones
("Bold choice. Wrong, but bold."), and the same message always gets the same
remark. They're all in `src/language/sass.js`.
