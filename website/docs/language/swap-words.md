---
title: Swap Words
sidebar_position: 12
description: Exactly how sw1 works, how swaps chain, and how the checker handles them.
---

# Swap Words

[`sw1 a b`](/docs/reference/instructions/sw1) swaps the **jobs** of two
instruction codes for the rest of the run.

## Codes and jobs

Every instruction code has a **job**: what it actually does. Normally a
code's job is itself: `ps1` does `ps1`'s job. `sw1` changes that.

When `sw1 a b` runs:

1. Twist looks up what job `a` is doing *right now*, and what job `b` is
   doing *right now*.
2. It gives `a` the job `b` had, and `b` the job `a` had.

That's why swapping twice undoes it, and why swaps **chain**:

| After | `ps1` does | `ad3` does | `ps2` does |
| --- | --- | --- | --- |
| (start) | ps1 | ad3 | ps2 |
| `sw1 ps1 ad3` | ad3 | ps1 | ps2 |
| `sw1 ps1 ps2` | ps2 | ps1 | ad3 |
| `sw1 ps1 ps2` (again) | ad3 | ps1 | ps2 |

Swaps last until the program ends. `sw1` itself can be swapped too, if you're
brave.

## Operands follow the job

A swapped code takes the operands of its **new** job. After `sw1 ps1 ad3`,
`ps1` wants a cell (like `ad3` did), and `ad3` wants a string.

## How the checker handles swaps

The checker reads the program before it runs, so it can't know which swaps
will have happened when a line runs. Instead it looks at every `sw1` in the
program and works out which codes **might** be swapped with which. A line is
accepted if its operands fit **any** of the jobs its code might be doing.

So this passes the checker:

```twist
sw1 ps1 ad3
ps3 #0 "fine"
ps1 #0
```

```text
fine
```

But this is refused, because `5` fits neither `ps1` (a string) nor `ad3` (a
cell):

```text
line 2: ps1 operand 1 (text) should be a string in quotes like "hi", but got 5. Close. Well, no, not really.
```

## At run time

Operands are checked again when each line runs, against its **current** job.
If they don't fit, the error names both the code and the job it was doing:

```text
line 2: ps1 (doing ps2's job) wants a label like @loop here, but got "hi". That's what you get for using sw1.
```
