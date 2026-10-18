---
title: Calls
sidebar_position: 11
description: cl1 and rt1, the call stack, and recursion.
---

# Calls

[`cl1`](/docs/reference/instructions/cl1) (Call Label) jumps to a label, and
remembers:

- **where to come back to:** the instruction after the `cl1`, in the
  direction Twist was going,
- **which way Twist was going.**

[`rt1`](/docs/reference/instructions/rt1) (Return Trip) goes back to the most
recent call that hasn't returned yet, and restores its direction.

## The call stack

Remembered calls pile up on a **call stack**:

- each `cl1` adds one,
- each `rt1` takes the most recent one off.

So calls can nest, and a label can call itself (recursion). The playground's
**Calls** counter shows how deep you are.

## Limits and mistakes

| Situation | What happens |
| --- | --- |
| `rt1` with nothing on the stack | Error: "nothing called it. There's nowhere to go back to" |
| More than 10,000 calls deep | Error: "Is something calling itself forever?" |
| A program ends with calls still on the stack | Fine. Nothing happens. |

## Conventions

Twist has no arguments or return values. By convention:

- write in a comment which cells a function reads, writes and messes up,
- put `hl1` before your functions so the main program doesn't fall into
  them.

```twist
ps3 #0 4
cl1 @square        ; #0 = #0 * #0
ad3 #0
hl1

; square: #0 = #0 squared. Uses #9 for scratch.
@square:
ps3 #9 #0
mu1 #0 #9
rt1
```

```text
16
```
