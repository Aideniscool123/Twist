---
title: 2. Cells
sidebar_position: 2
description: Memory in Twist is a row of numbered cells.
---

# 2. Cells

Twist remembers things in **cells**: `#0`, `#1`, `#2` and so on, as many as
you want. Every cell starts at `0`, so you never have to set one up first.

```twist
ps3 #0 10        ; Plant Seed: put 10 in cell #0
ad3 #0           ; Announce Digit: print what's in #0
ad3 #7           ; never used, so it's still 0
```

```text
10
0
```

## What a cell can hold

A cell holds one value, and a value is a **number**, **text** or a **list**:

```twist
ps3 #0 -2.5
ps3 #1 "hello"
mk1 #2
ps4 #2 1
ps4 #2 "two"
ad3 #0
ad3 #1
ad3 #2
```

```text
-2.5
hello
[1, "two"]
```

(Lists get their own [chapter](./lists).)

## Copying and swapping

`ps3` can copy from another cell, and `jz2` (**Juggle Zones**) swaps two:

```twist
ps3 #0 "left"
ps3 #1 "right"
ps3 #2 #0        ; copy #0 into #2
jz2 #0 #1        ; swap #0 and #1
ad3 #0
ad3 #1
ad3 #2
```

```text
right
left
left
```

`cl3` (**Clean Locker**) puts a cell back to `0`.

## Printing without a new line

`ad3` always ends the line. `sy1` (**Say Yonder**) doesn't, so you can build
a line up in pieces:

```twist
ps3 #0 3
sy1 "I have "
sy1 #0
sy1 " cats"
ps1 ""
```

```text
I have 3 cats
```

## Try it

Put your name in `#0` and your age in `#1`, then print `Name: ..., age: ...`
on one line.
