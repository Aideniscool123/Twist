---
title: Lists
sidebar_position: 7
description: Lists hold values in order, are copied not shared, and count from 0.
---

# Lists

A list is an ordered collection of values: numbers, text, or other lists.

## Making and changing lists

Lists exist only in cells. Make one with [`mk1`](/docs/reference/instructions/mk1),
then change it **in place** with:

| Code | Does |
| --- | --- |
| [`ps4`](/docs/reference/instructions/ps4) | add a value to the end |
| [`pp1`](/docs/reference/instructions/pp1) | remove the last item, into another cell |
| [`st1`](/docs/reference/instructions/st1) | replace item N |
| [`sh1`](/docs/reference/instructions/sh1) | shuffle |

And read from it with:

| Code | Does |
| --- | --- |
| [`gt2`](/docs/reference/instructions/gt2) | copy item N into a cell (also gets letter N of text) |
| [`ln1`](/docs/reference/instructions/ln1) | count the items (or the letters in text) |

[`sp1`](/docs/reference/instructions/sp1) also makes a list, by splitting text.

## Indexes

- Items count from **0**.
- An index must be a **whole number** from `0` to `length - 1`. Anything else
  is an error. There are no negative indexes counting from the end.

## Copied, never shared

Whenever a list is stored somewhere, by `ps3`, `ps4`, `st1` or `gt2`, Twist
stores a **separate copy**, all the way down. Two cells never share the same
list, so changing one can never surprise you by changing another.

```twist
mk1 #0
ps4 #0 "a"
ps3 #1 #0
ps4 #1 "b"
ad3 #0
ad3 #1
```

```text
["a"]
["a", "b"]
```

## Empty lists

An empty list `[]` counts as **empty** for [`jz1`](/docs/reference/instructions/jz1),
just like `0` and `""`.

## Equality

Two lists are equal if they have the same length and equal items in the same
order. `[1, "2"]` does not equal `[1, 2]`.

## Printing

Lists print with square brackets and commas, and text inside them gets
quotes: `[1, "two", [3]]`.
