---
title: The chaos rule
sidebar_position: 3
description: Instructions that share two letters must do different kinds of job.
---

# The chaos rule

> Instructions that share the same two letters must all be in **different
> categories**.

There are nine categories: `output`, `input`, `memory`, `math`, `control`,
`text`, `list`, `chaos` and `misc`. So there can be a `ps` instruction that
prints and a `ps` instruction that jumps, but never two `ps` instructions that
both print.

That's what makes the confusion **real** and not an accident:

| Letters | Instructions |
| --- | --- |
| `ps` | `ps1` Print String (output), `ps2` Pounce Somewhere (control), `ps3` Plant Seed (memory), `ps4` Pile Stuff (list) |
| `ad` | `ad1` Add Digits (math), `ad2` Ask Directly (input), `ad3` Announce Digit (output) |
| `rd` | `rd1` Round Down (math), `rd2` Roll Dice (chaos), `rd3` Read Dialogue (input) |
| `cl` | `cl1` Call Label (control), `cl2` Coin Leap (chaos), `cl3` Clean Locker (memory) |
| `jz` | `jz1` Jump if Zero (control), `jz2` Juggle Zones (memory) |
| `jn` | `jn1` Jump if Negative (control), `jn2` Join Neatly (text) |
| `gt` | `gt1` Greater Than (math), `gt2` Grab Thing (list) |
| `mo` | `mo1` Mood Out (output), `mo2` Mood Observe (memory) |
| `hl` | `hl1` Halt Lightly (control), `hl2` Hang Loose (misc) |

Every instruction also has a silly full name that explains the letters
*after* the fact. That's the only connection between them.

The rule is checked by `chaosViolations` in
`src/language/instructions.js`, and the tests fail if a new instruction
breaks it.

## Why it can compute anything

Three things are enough to make a language able to compute anything a
computer can (to be "Turing complete"):

1. memory that can hold numbers,
2. a way to change those numbers,
3. a jump that only happens sometimes.

Twist had all three in its first ten instructions: cells with `ps3` (set)
and `ad1` (add, which also subtracts), and `jz1` (Jump if Zero), plus `ps2`
for always jumping. Cells with add, subtract and jump-if-zero make what's
called a **counter machine**, and a counter machine can compute anything a
normal computer can, as far as memory allows.

Everything else in Twist is there for convenience, or for fun.
