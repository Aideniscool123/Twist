# Twist syntax

A Twist program is plain text. It is read one line at a time, and each line
is one of: blank, a comment, a label, or an instruction.

## Lines

| Kind | Looks like | Notes |
| --- | --- | --- |
| Blank | (nothing) | Ignored. |
| Comment | `; this is a note` | Everything after `;` is ignored, unless the `;` is inside a string. |
| Label | `@again:` | Marks a spot to jump to. A label needs a line to itself (a comment after it is fine). |
| Instruction | `ps3 #0 10` | An instruction code, then zero or more operands separated by spaces. |

Spaces and tabs around things are ignored. Everything is lowercase.

## Instruction codes

An instruction code is **two lowercase letters followed by a number**, with no
space between them and no leading zeros: `ps1`, `ad3`, `jz12`.

The number is part of the instruction's identity. It is **not** a variant of
the letters. `ps1` and `ps2` are two completely different instructions that
happen to start with the same two letters. See [DESIGN.md](DESIGN.md) for the
rule that keeps them different.

Valid: `ps1`, `hl2`, `ab10`.
Not valid: `PS1` (uppercase), `p1` (one letter), `ps0` (number starts at 1),
`ps01` (leading zero), `abc1` (three letters).

## Operands

| Kind | Looks like | Meaning |
| --- | --- | --- |
| Cell | `#0`, `#12` | A numbered memory cell. |
| Number | `5`, `-3`, `0`, `2.5`, `-0.125` | A whole number or a decimal. No leading zeros, no `-0`, and a decimal point needs digits on both sides (`0.5`, not `.5` or `5.`). |
| String | `"hello"` | Text in double quotes. May contain spaces and `;`. |
| Label | `@again` | The name of a label defined somewhere in the program. |
| Code | `ps1` | An instruction code, used by `sw1` (Swap Words). |

In the [instruction reference](INSTRUCTIONS.md), an operand marked **value**
can be a cell, a number or a string. A cell there means "whatever is in that
cell".

### Strings and escapes

Inside a string, a backslash starts an escape:

| Write | Get |
| --- | --- |
| `\"` | a double quote |
| `\\` | a backslash |
| `\n` | a new line |
| `\t` | a tab |

Any other escape is an error. A string must be closed on the same line, and
there must be a space (or a comment, or the end of the line) right after it.

### Label names

Lowercase letters, digits and underscores, and the first character can't be a
digit: `again`, `_start`, `loop_2`.

## Example

```
; count down from 3
ps3 #0 3          ; plant a seed: cell 0 = 3
@again:
jz1 #0 @done      ; if cell 0 is zero, jump to done
ad3 #0            ; announce the number
ad1 #0 -1         ; subtract one
ps2 @again        ; pounce back up
@done:
ps1 "Liftoff!"
```
