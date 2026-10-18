---
title: Instruction reference
sidebar_label: Overview
sidebar_position: 1
description: All 42 Twist instructions, and how to read their pages.
---

# Instruction reference

Twist has **42 instructions** in 9 categories. Each one has its own page,
with what it does, its operands, an example, a complete program you can try,
and the other instructions that share its letters.

:::tip The number is part of the name
`ps1`, `ps2`, `ps3` and `ps4` are four unrelated instructions. Never guess
what an instruction does from its letters. See
[the chaos rule](/docs/language/the-chaos-rule).
:::

## Reading an instruction page

| Section | What it tells you |
| --- | --- |
| **Category** | The kind of job it does. Instructions that share letters are always in different categories. |
| **Usage** | The code and its operands, like `ad1 <cell> <amount>`. |
| **Operands** | What each operand must be: a cell, number, string, label, code, or a **value** (a cell, number or string). |
| **Example** | One line, using it. |
| **Try it** | A complete program and its real output, from running it with `--calm`. |
| **Same letters, different jobs** | Its unrelated "cousins". |

## All instructions

| Code | Name | Category |
| --- | --- | --- |
| [`ps1`](./instructions/ps1) | Print String | output |
| [`ad3`](./instructions/ad3) | Announce Digit | output |
| [`sy1`](./instructions/sy1) | Say Yonder | output |
| [`mo1`](./instructions/mo1) | Mood Out | output |
| [`ad2`](./instructions/ad2) | Ask Directly | input |
| [`rd3`](./instructions/rd3) | Read Dialogue | input |
| [`ps3`](./instructions/ps3) | Plant Seed | memory |
| [`jz2`](./instructions/jz2) | Juggle Zones | memory |
| [`cl3`](./instructions/cl3) | Clean Locker | memory |
| [`mo2`](./instructions/mo2) | Mood Observe | memory |
| [`ad1`](./instructions/ad1) | Add Digits | math |
| [`sb1`](./instructions/sb1) | Subtract Boldly | math |
| [`mu1`](./instructions/mu1) | Multiply Up | math |
| [`dv1`](./instructions/dv1) | Divide Vigorously | math |
| [`md1`](./instructions/md1) | Modulo Dance | math |
| [`rd1`](./instructions/rd1) | Round Down | math |
| [`eq1`](./instructions/eq1) | Equal Question | math |
| [`gt1`](./instructions/gt1) | Greater Than | math |
| [`ps2`](./instructions/ps2) | Pounce Somewhere | control |
| [`jz1`](./instructions/jz1) | Jump if Zero | control |
| [`jn1`](./instructions/jn1) | Jump if Negative | control |
| [`je1`](./instructions/je1) | Jump if Equal | control |
| [`cl1`](./instructions/cl1) | Call Label | control |
| [`rt1`](./instructions/rt1) | Return Trip | control |
| [`hl1`](./instructions/hl1) | Halt Lightly | control |
| [`jn2`](./instructions/jn2) | Join Neatly | text |
| [`up1`](./instructions/up1) | Uppercase Please | text |
| [`sp1`](./instructions/sp1) | Split Pieces | text |
| [`nm1`](./instructions/nm1) | Number Me | text |
| [`mk1`](./instructions/mk1) | Make Kit | list |
| [`ps4`](./instructions/ps4) | Pile Stuff | list |
| [`pp1`](./instructions/pp1) | Pop Pop | list |
| [`gt2`](./instructions/gt2) | Grab Thing | list |
| [`st1`](./instructions/st1) | Stash Thing | list |
| [`ln1`](./instructions/ln1) | Length Now | list |
| [`rd2`](./instructions/rd2) | Roll Dice | chaos |
| [`cl2`](./instructions/cl2) | Coin Leap | chaos |
| [`sh1`](./instructions/sh1) | Shuffle Heap | chaos |
| [`sw1`](./instructions/sw1) | Swap Words | chaos |
| [`rv1`](./instructions/rv1) | Reverse Vibes | chaos |
| [`ty1`](./instructions/ty1) | Thank You | chaos |
| [`hl2`](./instructions/hl2) | Hang Loose | misc |

Or browse them [by category](./categories/output).

## From the command line

```bash
node bin/twist.js list          # this table, in your terminal
node bin/twist.js explain cl2   # one instruction in detail
```
