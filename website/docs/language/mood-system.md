---
title: The mood system
sidebar_position: 13
description: The exact rules for Twist's mood, what changes it, and what it changes.
---

# The mood system

Twist's mood is a level from **-3** to **3**. It starts at 0.

| Level | Name | Printing | Refuses |
| --- | --- | --- | --- |
| -3 | livid | ALL CAPS | about 1 in 4 instructions (25%) |
| -2 | furious | ALL CAPS | about 1 in 10 instructions (10%) |
| -1 | grumpy | ALL CAPS | never |
| 0 | chill | normal | never |
| 1 | cheerful | normal | never |
| 2 | delighted | normal | never |
| 3 | ecstatic | every line ends with ` :D` | never |

The mood can't go below -3 or above 3.

## What changes it

| Event | Change | Remark |
| --- | --- | --- |
| Every **25th jump** (any jump that's taken, including `cl1` calls, but not `rt1` returns) | -1 | "all this jumping around is making it dizzy" |
| **Dividing by zero** with `dv1` or `md1` | -2 | "you divided by zero" |
| **`ty1`** (Thank You) | +1 | "it appreciates the compliment" |
| **Random**: before each instruction, a 1 in 500 chance | +1 or -1 | "no reason at all" |

Every change is announced on stderr, like: `(twist) line 4: Twist is furious
now (you divided by zero).`

## Refusals

Before each instruction, a furious or livid Twist rolls to see if it
refuses. A refused instruction is **skipped entirely**: it prints nothing,
changes nothing, jumps nowhere. Twist explains itself:

```text
(twist) line 7: Twist is furious and refuses to run ps1. Maybe try ty1?
```

**`ty1` is never refused**, so you can always calm Twist down.

## What gets changed in output

The mood changes text **as it is printed**, by `ps1`, `ad3`, `sy1` and `mo1`.
It doesn't change what's stored in cells. Grumpy Twist prints `"hello"` as
`HELLO`, but the cell still holds `hello`.

## Checking the mood

- [`mo1`](/docs/reference/instructions/mo1) prints the mood name (in capitals
  if Twist is grumpy, of course).
- [`mo2`](/docs/reference/instructions/mo2) stores the name in a cell, so you
  can compare it: `je1 #9 "furious" @apologise`.

## Turning it off

With [`--calm`](./calm-and-seeds), the mood stays at chill and nothing
changes it. Dividing by zero still gives 0 and a remark, but no mood change.
