---
title: Cells
sidebar_position: 8
description: Memory is a row of numbered cells that all start at 0.
---

# Cells

Memory is a row of numbered **cells**: `#0`, `#1`, `#2` and so on.

- Every cell starts at `0`. A program never has to set a cell up before
  using it.
- A cell holds exactly one value: a number, text or a list.
- There's no limit on how many cells you use. Unused cells take no space.
- Cells are numbered, not named. Keep a comment at the top of your program
  saying what each cell is for. You'll thank yourself later.

```twist
; #0 = the counter, #1 = the running total
ps3 #0 3
@loop:
jz1 #0 @done
ad1 #1 #0
ad1 #0 -1
ps2 @loop
@done:
ad3 #1
```

```text
6
```

## Instructions that change a cell in place

Math (`ad1`, `sb1`, `mu1`, `dv1`, `md1`, `rd1`), comparisons (`eq1`, `gt1`),
and text instructions (`jn2`, `up1`, `sp1`, `nm1`) all **replace** what's in
their first cell with the result. If you need the old value afterwards, copy
it first with `ps3`.

## Seeing your cells

- In the [playground](pathname:///play/playground/), the **Memory** panel shows
  every cell in use, and flashes the ones that change.
- In the [REPL](/docs/getting-started/the-repl), type `:cells`.
