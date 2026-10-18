---
title: 5. Comparing
sidebar_position: 5
description: eq1, gt1, je1, and why you compare a copy.
---

# 5. Comparing

## Jump if Equal

The easiest way to compare is `je1` (**Jump if Equal**): it jumps if a cell
equals a value.

```twist
ps3 #0 1
@loop:
ad3 #0
je1 #0 3 @done
ad1 #0 1
ps2 @loop
@done:
ps1 "counted to 3"
```

```text
1
2
3
counted to 3
```

## Yes-or-no answers

`eq1` (**Equal Question**) and `gt1` (**Greater Than**) **replace** the cell
with an answer: `1` for yes, `0` for no.

```twist
ps3 #0 7
gt1 #0 5          ; is #0 bigger than 5?
ad3 #0
ps3 #1 "cat"
eq1 #1 "dog"      ; is #1 equal to "dog"?
ad3 #1
```

```text
1
0
```

Because the answer overwrites the cell, **compare a copy** if you still need
the original:

```twist
ps3 #0 12
ps3 #1 #0         ; copy it first
gt1 #1 10
jz1 #1 @small
ps1 "big number"
hl1
@small:
ps1 "small number"
```

```text
big number
```

## What counts as equal

- Numbers equal numbers: `5` and `5.0` are equal.
- Text equals text, exactly. `"Cat"` is not `"cat"`.
- **A number never equals text.** `5` and `"5"` are different.
- Two lists are equal if they hold equal things in the same order.

```twist
ps3 #0 5
eq1 #0 "5"
ad3 #0
```

```text
0
```

## Try it

Write a program that prints `even` or `odd` for the number in `#0`. (Hint:
`md1 #1 2` leaves the remainder after dividing by 2.)
