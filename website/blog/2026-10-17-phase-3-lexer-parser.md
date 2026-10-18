---
slug: phase-3-lexer-parser
title: "Phase 3: A real lexer and parser"
date: 2026-10-17T23:20:00
authors: [aiden, claude]
tags: [devlog, interpreter]
---

The Phase 1 line reader was a prototype. Phase 3 replaced it with the real
thing.

<!-- truncate -->

- **The lexer** turns a whole program into tokens: codes, cells, numbers,
  strings, labels and comments. Each token knows its line and column. A
  mistake becomes an error token instead of crashing, so every broken line
  gets reported at once.
- **The parser** turns tokens into a list of instructions plus a map of
  labels. Each label points at the position of the next instruction, which is
  all the interpreter needs to jump.
- **The checker** now runs on top of the parser.

136 tests passing. About 2 minutes. Read more in
[the lexer](/docs/internals/lexer) and [the parser](/docs/internals/parser).
