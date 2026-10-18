---
title: Operands
sidebar_position: 4
description: Cells, numbers, strings, labels, codes, and the value slot.
---

# Operands

Operands are the things after the instruction code. There are five kinds you
can write:

| Kind | Looks like | Meaning |
| --- | --- | --- |
| **cell** | `#0`, `#12` | A numbered memory cell. |
| **number** | `5`, `-3`, `0`, `2.5`, `-0.125` | A number. See [Numbers](./numbers). |
| **string** | `"hello"` | Text in double quotes. See [Text and escapes](./text-and-escapes). |
| **label** | `@again` | The name of a label defined somewhere in the program. |
| **code** | `ps1` | An instruction code. Only [`sw1`](/docs/reference/instructions/sw1) uses these. |

## The value slot

Many instructions take a **value**, which means "a cell, a number or a
string". A cell in a value slot means *whatever is in that cell*:

```twist
ps3 #0 5          ; value is the number 5
ps3 #1 "five"     ; value is the text "five"
ps3 #2 #0         ; value is whatever is in #0 (5)
ad3 #2
```

```text
5
```

Labels and codes can never be values.

## Checked twice

Operands are checked **before** the program runs, against what each
instruction expects:

```text
line 1: ps3 operand 1 (cell) should be a cell like #0, but got 5. Close. Well, no, not really.
line 2: ps1 (Print String) takes 1 operand, but this line has 0. Counting is hard, I know.
```

And they're checked **again** at run time, because
[Swap Words](./swap-words) can hand an instruction operands meant for another
job, and because values have types: `ad1` needs the cell it changes to hold
a number, not text.

## Cell numbers

Cell numbers start at `#0` and can be as big as you like (up to about 9
quadrillion). `#-1` and `#01` aren't valid.
