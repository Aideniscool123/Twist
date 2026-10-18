---
title: 1. Hello
sidebar_position: 1
description: ps1, comments, and why the numbers lie.
---

# 1. Hello

```twist
ps1 "Hello, reef!"
```

```text
Hello, reef!
```

`ps1` is **Print String**. It prints the text in quotes, then starts a new
line.

## Instruction codes

Every Twist instruction is **two lowercase letters and a number**: `ps1`,
`ad3`, `jz12`. The number is part of the name. It is *not* a version, and it
is *not* a variant.

So `ps2` is not "a slightly different print". It's **Pounce Somewhere**, and
it jumps to another part of your program. `ps3` is **Plant Seed**, and it
stores a value. They share two letters and nothing else.

Each instruction has a silly full name that explains the letters *after* the
fact: **P**rint **S**tring, **P**ounce **S**omewhere, **P**lant **S**eed.

## Comments

Everything after a `;` is a comment, and Twist ignores it:

```twist
; this whole line is a comment
ps1 "Hi"   ; and so is this part
ps1 "a ; inside quotes is just text"
```

```text
Hi
a ; inside quotes is just text
```

## Text

Text goes in double quotes. Inside quotes, a backslash starts an escape:

```twist
ps1 "She said \"hi\""
ps1 "one\ntwo"
ps1 "tab\there"
```

```text
She said "hi"
one
two
tab	here
```

| Write | Get |
| --- | --- |
| `\"` | a double quote |
| `\\` | a backslash |
| `\n` | a new line |
| `\t` | a tab |

## Try it

Print a three-line poem using only **one** `ps1`.
