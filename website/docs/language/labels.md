---
title: Labels
sidebar_position: 9
description: Labels mark the spots that jumps and calls go to.
---

# Labels

A label marks a spot in the program. It's written on a line of its own, as
`@` + a name + `:`

```twist
@start:
ps1 "a label doesn't do anything by itself"
```

```text
a label doesn't do anything by itself
```

## Names

- Lowercase letters, digits and underscores.
- The first character can't be a digit.
- Valid: `again`, `_start`, `loop_2`, `done`.
- Not valid: `2a`, `Loop`, `a-b`.

## Defining and using

| Where | Written as |
| --- | --- |
| Defining a label | `@done:` (with a colon, alone on its line) |
| Jumping to it | `jz1 #0 @done` (no colon) |

## Rules

- Each label can be defined **once**. A second `@done:` is a mistake: "One
  was plenty."
- Every label you jump to must be defined **somewhere** in the program,
  before or after the jump. Otherwise: "Jumping into the void, are we?"
- Labels can be defined and never used. That's fine.
- Several labels in a row all point at the same next instruction.
- A label at the very end of the program points past the last instruction.
  Jumping there ends the program.

## Where a jump lands

A label points at **the first instruction after it**, and a jump carries on
from there. When Twist is running backwards (after
[`rv1`](./control-flow#direction)), it carries on from the line **above**
the label instead.
