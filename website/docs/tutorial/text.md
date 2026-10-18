---
title: 7. Text
sidebar_position: 7
description: Joining, uppercasing, splitting, and turning text into numbers.
---

# 7. Text

| Code | Name | Does |
| --- | --- | --- |
| `jn2` | Join Neatly | sticks a value onto the end of the text in a cell |
| `up1` | Uppercase Please | MAKES THE TEXT UPPERCASE |
| `sp1` | Split Pieces | cuts text into a list |
| `nm1` | Number Me | turns text like `"42"` into the number `42` |

## Join Neatly

`jn2` works with anything. Numbers and lists are turned into text first:

```twist
ps3 #0 "Score: "
jn2 #0 10
jn2 #0 "/"
jn2 #0 20
ad3 #0
```

```text
Score: 10/20
```

## Uppercase Please

```twist
ps3 #0 "please be quiet"
up1 #0
ad3 #0
```

```text
PLEASE BE QUIET
```

## Split Pieces

`sp1` cuts text wherever the separator appears, and gives you a
[list](./lists). An empty separator `""` cuts between every letter:

```twist
ps3 #0 "red,green,blue"
sp1 #0 ","
ad3 #0
ps3 #1 "Twist"
sp1 #1 ""
ad3 #1
```

```text
["red", "green", "blue"]
["T", "w", "i", "s", "t"]
```

## Number Me

Text that looks like a number isn't one yet. `"5"` and `5` are different to
Twist. `nm1` converts it:

```twist
ps3 #0 "41"
nm1 #0
ad1 #0 1
ad3 #0
```

```text
42
```

`rd3` always reads text, so `rd3` followed by `nm1` is another way to read a
number.

## Try it

Read someone's name with `rd3` and print it shouted, like `HELLO, AIDEN!`.
