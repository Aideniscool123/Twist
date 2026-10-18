---
title: Text and escapes
sidebar_position: 6
description: Strings in double quotes, escapes, and how text prints.
---

# Text and escapes

Text (a "string") is written in double quotes: `"hello"`. It can contain
spaces and `;`, and it must start and end on the same line.

## Escapes

Inside a string, a backslash starts an **escape**:

| Write | Get |
| --- | --- |
| `\"` | a double quote |
| `\\` | a backslash |
| `\n` | a new line |
| `\t` | a tab |

Any other escape, like `\q`, is a mistake:

```text
line 1: Unknown escape "\q" in a string (column 7). That backslash is doing a lot of heavy lifting for nothing.
```

## After a string

A string must be followed by a space, a comment, or the end of the line:

| Line | OK? |
| --- | --- |
| `ps1 "hi"` | ✅ |
| `ps1 "hi" ; note` | ✅ |
| `ps1 "hi";note` | ✅ |
| `ps1 "hi"x` | ❌ Put a space after a string |
| `ps1 "a""b"` | ❌ Put a space after a string |

## How text prints

Printed on its own, text prints exactly as it is, with no quotes. **Inside a
list**, text gets quotes, so `["1", 1]` doesn't look like `[1, 1]`:

```twist
ps3 #0 "1"
ad3 #0
mk1 #1
ps4 #1 "1"
ps4 #1 1
ad3 #1
```

```text
1
["1", 1]
```

## Text is not a number

`"5"` is text that happens to contain a 5. It never equals the number `5`,
and math instructions refuse it. Use [`nm1`](/docs/reference/instructions/nm1)
to convert it.
