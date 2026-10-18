---
title: 4. Loops
sidebar_position: 4
description: Labels, jumps, and the countdown.
---

# 4. Loops

## Labels

A line like `@again:` is a **label**. It doesn't do anything itself. It marks
a spot that jumps can go to. Label names use lowercase letters, digits and
underscores, and the colon is required.

## Jumping

`ps2` (**Pounce Somewhere**) always jumps. Execution carries on from the line
after the label:

```twist
ps2 @skip
ps1 "you'll never see this"
@skip:
ps1 "jumped over it"
```

```text
jumped over it
```

## Jump if Zero

`jz1` (**Jump if Zero**) only jumps when a cell is empty. That's how a loop
knows when to stop:

```twist
ps3 #0 5
@again:
jz1 #0 @done      ; leave when #0 reaches 0
ad3 #0
ad1 #0 -1
ps2 @again
@done:
ps1 "Liftoff!"
```

```text
5
4
3
2
1
Liftoff!
```

Read it as: *"Set #0 to 5. Again: if #0 is zero, go to done. Print it,
subtract one, go back to again."*

**Empty** means `0`, empty text `""`, or an empty list. Anything else counts
as not zero, including `0.5` and the text `"0"`.

## Jump if Negative

`jn1` jumps if a cell holds a number below zero:

```twist
ps3 #0 3
sb1 #0 5
jn1 #0 @below
ps1 "still fine"
hl1
@below:
ps1 "went below zero"
```

```text
went below zero
```

## Stopping

A program stops when it runs off the bottom, or at `hl1` (**Halt Lightly**).
You'll need `hl1` whenever there is code below that shouldn't run, like
in the example above.

## Endless loops

If you forget the way out, Twist gives up after a million steps:

```text
Twist gave up after 1,000,000 steps. Is something looping forever? I have other things to do, you know.
```

## Try it

Count **up** from 1 to 10 instead of down. (You'll need a way to stop at 10;
the next chapter has a neat one.)
