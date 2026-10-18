---
title: The lexer
sidebar_position: 2
description: How program text becomes tokens.
---

# The lexer

`src/language/lexer.js` turns text into **tokens**: the smallest meaningful
pieces, like `ps1`, `#0` or `"hi"`.

```js
import { tokenize } from "./src/language/lexer.js";
tokenize('ps1 "hi" ; greet');
```

```text
code     ps1         line 1, column 1
string   "hi"        line 1, column 5   value: hi
comment  ; greet     line 1, column 10
newline              line 1
eof                  line 1
```

## Token types

| Type | Example | Value |
| --- | --- | --- |
| `code` | `ps1` | `"ps1"` |
| `cell` | `#3` | `3` |
| `number` | `-2.5` | `-2.5` |
| `string` | `"a\nb"` | the text, with escapes applied |
| `label` | `@loop` | `"loop"` |
| `label_def` | `@loop:` | `"loop"` |
| `comment` | `; note` | the text after `;` |
| `word` | `PS1` | anything unrecognised, for the parser to complain about |
| `error` | `"oops` | a message, like "This string is missing its closing quote" |
| `newline`, `eof` | | separate lines, and mark the end |

## How it reads a line

It walks the line one character at a time:

1. Skip spaces and tabs.
2. `;` means the rest of the line is a comment.
3. `"` starts a string. Read until the closing quote, applying escapes. No
   closing quote, an unknown escape, or text stuck to the end becomes an
   **error token**.
4. Anything else is a **word**, up to the next space or `;`. The word is
   then sorted into cell, number, label definition, label, code or (if none
   fit) `word`.

## Errors don't stop it

A mistake becomes an `error` token, and the rest of **that line** is
skipped, but the lexer carries on with the next line. That's why Twist can
report every broken line at once, instead of stopping at the first.

## Small details

- A byte-order mark at the start of the text is ignored.
- `\r\n` and `\n` line endings both work.
- Numbers are checked here: `-0` and numbers beyond about 9 quadrillion are
  errors.
