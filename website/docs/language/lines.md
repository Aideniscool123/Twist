---
title: Lines
sidebar_position: 1
description: A Twist program is read one line at a time. Every line is one of four kinds.
---

# Lines

A Twist program is plain text, read **one line at a time**. Every line is
exactly one of these:

| Kind | Looks like | Notes |
| --- | --- | --- |
| Blank | (nothing, or only spaces and tabs) | Ignored. |
| Comment | `; a note` | Everything after `;` is ignored, unless the `;` is inside a string. |
| Label | `@again:` | Marks a spot to jump to. It needs a line to itself, though a comment after it is fine. |
| Instruction | `ps3 #0 10` | An instruction code, then zero or more operands separated by spaces. |

## Spacing

- Spaces and tabs around things are ignored, so you can indent however you
  like.
- Operands are separated by **at least one** space or tab.
- A string must be followed by a space, a comment or the end of the line.
  `ps1 "a"b` is a mistake.

## Case

**Everything is lowercase.** `PS1` is not an instruction, and `@Loop` is not
a label name.

## Line endings and invisible characters

Windows (`\r\n`) and Unix (`\n`) line endings both work. An invisible
"byte-order mark" at the very start of a file (Notepad sometimes adds one) is
ignored.

## One instruction per line

There's no way to put two instructions on one line, and no way to split one
instruction across two lines.

## See also

- [Instruction codes](./instruction-codes)
- [Operands](./operands)
- [Labels](./labels)
