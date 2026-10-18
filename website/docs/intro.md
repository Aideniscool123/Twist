---
title: What is Twist?
sidebar_label: What is Twist?
sidebar_position: 1
slug: /intro
description: Twist is a tiny, chaotic programming language where ps1 and ps2 mean totally different things.
---

# What is Twist?

Twist is a tiny programming language with one bad idea at its heart: every
instruction is two letters and a number, and **the number changes everything**.

`ps1` prints a string. `ps2` jumps somewhere else in your program. `ps3` plants
a value in memory. `ps4` piles something onto a list. Same two letters, four
jobs that have nothing to do with each other.

```twist
; count down from 3
ps3 #0 3          ; Plant Seed: cell #0 = 3
@again:
jz1 #0 @done      ; Jump if Zero: leave the loop when #0 is 0
ad3 #0            ; Announce Digit: print #0
ad1 #0 -1         ; Add Digits: subtract one
ps2 @again        ; Pounce Somewhere: back to the top
@done:
ps1 "Liftoff!"    ; Print String
```

```text
3
2
1
Liftoff!
```

And then it gets worse. Twist has **moods**: a grumpy Twist SHOUTS everything
it prints, and a furious one refuses to run some of your instructions. One
instruction can **swap what two other instructions do**. Another one makes
your program **run backwards**.

## Where to start

- **New here?** Follow [Getting started](/docs/getting-started), then the
  [tutorial](/docs/tutorial/hello). It takes about 15 minutes.
- **Just want to play?** Open the [playground](pathname:///play/playground/) and pick
  an example.
- **Looking something up?** Every instruction has its own page in the
  [reference](/docs/reference/instructions).
- **Curious how it works?** Read the [internals](/docs/internals).

## What Twist is not

- **Fast.** It's an interpreter written in plain JavaScript, built for fun.
- **Serious.** Its error messages are rude. On purpose.
- **Kind.** `ps1` and `ps2` really are unrelated, and Twist will not
  apologise.

It *is* a real language, though. It has memory, arithmetic and a
conditional jump, which is enough to compute
[anything a computer can](/docs/language/the-chaos-rule#why-it-can-compute-anything).
