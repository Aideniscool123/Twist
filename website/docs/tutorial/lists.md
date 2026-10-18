---
title: 8. Lists
sidebar_position: 8
description: Making lists, adding to them, reading them, and looping over them.
---

# 8. Lists

A list holds any number of values, in order. Lists can hold numbers, text
and even other lists.

| Code | Name | Does |
| --- | --- | --- |
| `mk1` | Make Kit | puts a new empty list in a cell |
| `ps4` | Pile Stuff | adds a value to the end |
| `pp1` | Pop Pop | takes the last item off |
| `gt2` | Grab Thing | copies out item number N |
| `st1` | Stash Thing | replaces item number N |
| `ln1` | Length Now | counts the items |

```twist
mk1 #0
ps4 #0 "eggs"
ps4 #0 "milk"
ps4 #0 3
ad3 #0
ln1 #1 #0
ad3 #1
```

```text
["eggs", "milk", 3]
3
```

## Items count from 0

The first item is item `0`:

```twist
mk1 #0
ps4 #0 "a"
ps4 #0 "b"
ps4 #0 "c"
gt2 #1 #0 0
ad3 #1
st1 #0 2 "z"
ad3 #0
```

```text
a
["a", "b", "z"]
```

`gt2` works on text too, and gives you one letter.

## Pop Pop

`pp1` takes the **last** item off the list and puts it in another cell. That
makes a list work like a stack of plates:

```twist
mk1 #0
ps4 #0 1
ps4 #0 2
pp1 #0 #1
ad3 #1
ad3 #0
```

```text
2
[1]
```

## Looping over a list

Keep a counter in a cell, and stop when it reaches the length:

```twist
mk1 #0
ps4 #0 "apple"
ps4 #0 "pear"
ps4 #0 "plum"
ln1 #1 #0
ps3 #2 0
@each:
je1 #2 #1 @done
gt2 #3 #0 #2
ad3 #3
ad1 #2 1
ps2 @each
@done:
```

```text
apple
pear
plum
```

## Lists are copied, not shared

`ps3 #1 #0` makes a **separate copy**, so changing one list never changes
the other:

```twist
mk1 #0
ps3 #1 #0
ps4 #1 "only in #1"
ad3 #0
ad3 #1
```

```text
[]
["only in #1"]
```

## Mistakes

```text
line 1: ps4 needs a list, but #0 is the number 0. Make one with mk1. That is very much not a list.
line 3: gt2 wants item 5 of #0, but it only has 2 items (0 to 1). Count again. Start from 0 this time.
```

## Try it

Make a list of five numbers and print the biggest one.
