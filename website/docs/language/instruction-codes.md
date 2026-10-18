---
title: Instruction codes
sidebar_position: 2
description: Two lowercase letters and a number. The number is part of the name.
---

# Instruction codes

An instruction code is **two lowercase letters followed by a number**, with
no space between them, and no leading zeros.

| Valid | Not valid | Why not |
| --- | --- | --- |
| `ps1` | `PS1` | uppercase |
| `hl2` | `p1` | only one letter |
| `ab10` | `ps0` | numbers start at 1 |
| `zz999` | `ps01` | leading zero |
| | `abc1` | three letters |
| | `ps 1` | a space in the middle |

## The number is part of the name

The number is **not** a version and **not** a variant. `ps1` and `ps2` are
two completely different instructions that happen to share their first two
letters. This is enforced by [the chaos rule](./the-chaos-rule).

The two letters are called the **mnemonic**, which is a fancy word for "a
hint that helps you remember". In Twist, the hint is a lie.

## Codes that don't exist

Any code that fits the pattern can be *written*, but only the
[42 real ones](/docs/reference/instructions) can be used. Anything else is
caught by the checker before the program runs:

```text
line 3: Unknown instruction zz9. Did you just make that up?
```

## Codes as operands

One instruction, [`sw1`](/docs/reference/instructions/sw1), takes instruction
codes as its operands: `sw1 ps1 ad3`. Both must be real instructions.
