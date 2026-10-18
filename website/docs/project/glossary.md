---
title: Glossary
sidebar_position: 3
description: Twist words, explained.
---

# Glossary

- **Call stack**: The list of places `rt1` will return to. `cl1` adds to it, and `rt1` takes from it.
- **Calm**: Running with `--calm`: no mood changes, and repeatable dice.
- **Category**: The kind of job an instruction does: output, input, memory, math, control, text, list, chaos or misc.
- **Cell**: A numbered slot in memory, like `#0`. Holds one value. Starts at 0.
- **Chaos rule**: Instructions that share two letters must be in different categories.
- **Checker**: The part of Twist that finds mistakes before running anything.
- **Code**: An instruction's name, like `ps1`: two letters and a number.
- **Direction**: Which way Twist is running: down (normal) or up (after `rv1`).
- **Empty**: `0`, empty text `""`, or an empty list `[]`. What `jz1` jumps on.
- **Job**: What an instruction code actually does right now. Normally its own job, unless `sw1` swapped it.
- **Label**: A named spot in the program, like `@loop:`, that jumps go to.
- **Mnemonic**: The two letters of a code. Supposedly a memory aid. In Twist, a lie.
- **Mood**: Twist's feelings, from livid (-3) to ecstatic (3).
- **Operand**: Something an instruction acts on, written after its code.
- **Refusal**: When a furious or livid Twist skips an instruction.
- **Remark**: Something Twist says on stderr, like a mood change.
- **Sass**: The rude bit at the end of an error message.
- **Seed**: A number that makes randomness repeatable.
- **Step**: Running one instruction.
- **Swap**: What `sw1` does: two codes trade jobs.
- **Value**: A number, text or list. Also an operand slot that accepts a cell, a number or a string.
