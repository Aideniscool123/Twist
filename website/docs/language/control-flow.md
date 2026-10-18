---
title: Control flow
sidebar_position: 10
description: The order instructions run in, jumps, direction, and how programs stop.
---

# Control flow

## The normal order

A program runs **from the top, one instruction at a time**. Blank lines,
comments and labels are skipped. They aren't instructions.

## Jumps

| Code | Jumps when |
| --- | --- |
| [`ps2`](/docs/reference/instructions/ps2) | always |
| [`jz1`](/docs/reference/instructions/jz1) | the cell is empty: `0`, `""` or `[]` |
| [`jn1`](/docs/reference/instructions/jn1) | the cell holds a number below 0 |
| [`je1`](/docs/reference/instructions/je1) | the cell equals a value |
| [`cl2`](/docs/reference/instructions/cl2) | a coin lands heads (50%) |
| [`cl1`](/docs/reference/instructions/cl1) | always, and it remembers where to come back to (see [Calls](./calls)) |

Every jump is counted, and [too many make Twist dizzy](./mood-system).

## Direction

Twist normally runs **downward**. [`rv1`](/docs/reference/instructions/rv1)
(Reverse Vibes) flips it, so the next instruction is the one **above**. The
next `rv1` flips it back.

| Situation | Going down | Going up |
| --- | --- | --- |
| Next instruction | the one below | the one above |
| After a jump | the instruction after the label | the instruction before the label |

After `rt1`, Twist goes back to the instruction after the `cl1` *in the
direction the call was made*, and carries on in that direction. See
[Calls](./calls).

## Stopping

A program stops when:

1. it runs `hl1` (Halt Lightly),
2. it runs off the **bottom** (going down) or the **top** (going up),
3. it jumps to a label at the very end (going down),
4. something goes wrong (a runtime error), or
5. it reaches the step limit, 1,000,000 by default. Change it with
   `--max-steps`.

## Refusals

When Twist is [furious or livid](./mood-system), it sometimes **refuses** to
run an instruction. The instruction is skipped, as if it weren't there, and
Twist complains on stderr. A refused jump doesn't jump, and a refused `hl1`
doesn't halt.
