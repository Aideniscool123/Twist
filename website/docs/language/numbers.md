---
title: Numbers
sidebar_position: 5
description: Whole numbers and decimals, how they're written, and how they're printed.
---

# Numbers

Twist has one kind of number. Whole numbers and decimals are the same thing.

## Writing numbers

| Valid | Not valid | Why not |
| --- | --- | --- |
| `0` | `007` | leading zeros |
| `42` | `-0` | that's just 0 wearing a minus sign |
| `-3` | `.5` | needs a digit before the point |
| `2.5` | `5.` | needs a digit after the point |
| `-0.125` | `1.2.3` | two points |
| `0.5` | `1e5` | no scientific notation |

The biggest number you can write is about 9 quadrillion
(9,007,199,254,740,991). Bigger numbers are refused, because they can't be
stored exactly. ("Calm down.")

## How numbers print

Twist hides the tiny rounding errors computers make with decimals. It prints
at most 12 significant digits:

```twist
ps3 #0 0.1
ad1 #0 0.2
ad3 #0
ps3 #1 1
dv1 #1 3
ad3 #1
```

```text
0.3
0.333333333333
```

Whole numbers always print as whole numbers: `10 ÷ 2` prints `5`, not `5.0`.

## Reading numbers

`ad2` and `nm1` are more relaxed than the code you write. They accept spaces
around the number, a leading `+`, and forms like `.5` and `5.`.

## Rounding

`rd1` (Round Down) rounds toward negative infinity: `2.9` becomes `2`, and
`-2.1` becomes `-3`. There's no instruction for rounding to the nearest
number. Add `0.5` and then use `rd1`.

## Dividing by zero

`dv1` and `md1` give `0` when dividing by zero, instead of crashing, and Twist
[gets upset](./mood-system).
