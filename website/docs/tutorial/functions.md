---
title: 9. Functions
sidebar_position: 9
description: Calling a label, coming back, and functions that call themselves.
---

# 9. Functions

`cl1` (**Call Label**) jumps to a label *and remembers where it came from*.
`rt1` (**Return Trip**) goes back there. Together they make functions.

```twist
ps3 #0 "world"
cl1 @greet
ps3 #0 "Twist"
cl1 @greet
hl1              ; stop here, or we'd fall into the function

@greet:
ps3 #1 "Hello, "
jn2 #1 #0
ad3 #1
rt1
```

```text
Hello, world
Hello, Twist
```

Twist has no "arguments". A function just uses cells, and you agree which
cells it reads (here `#0`) and which it uses for scratch work (`#1`).

:::warning Don't forget hl1
Without the `hl1`, the program would carry on into `@greet` after the second
call, print a third time, and then hit `rt1` with nothing to return to:

```text
line 10: rt1 wants to return, but nothing called it. There's nowhere to go back to. Return to where, exactly?
```
:::

## Functions calling functions

Calls can nest. Each `rt1` goes back to the most recent `cl1`:

```twist
cl1 @outer
ps1 "all done"
hl1
@outer:
ps1 "outer starts"
cl1 @inner
ps1 "outer ends"
rt1
@inner:
ps1 "inner"
rt1
```

```text
outer starts
inner
outer ends
all done
```

## Functions that call themselves

A function can call **itself**. This works out 5! (5 × 4 × 3 × 2 × 1):

```twist
ps3 #0 5          ; n
ps3 #1 1          ; the answer builds up here
cl1 @fact
ad3 #1
hl1

@fact:
jz1 #0 @bottom    ; 0! is the end of the line
ad1 #0 -1
cl1 @fact         ; work out the rest first...
ad1 #0 1
mu1 #1 #0         ; ...then multiply on the way back up
@bottom:
rt1
```

```text
120
```

Each call goes one level deeper, until `#0` hits zero. Then every `rt1`
climbs back up one level and multiplies as it goes. If a function calls
itself forever, Twist stops it after 10,000 levels: "It's turtles all the
way down."

## Try it

Write a function `@shout` that prints whatever text is in `#0` in capitals,
and call it three times with different words.
