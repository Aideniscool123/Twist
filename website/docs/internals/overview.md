---
title: How Twist works
sidebar_label: Overview
sidebar_position: 1
description: The pipeline from program text to output, and where everything lives.
---

# How Twist works

Twist is plain JavaScript (ES modules) with **no dependencies**. The same
code runs in Node (the `twist` command) and in the browser (the playground).

## The pipeline

```text
program text
   │
   ▼  lexer      src/language/lexer.js      text → tokens, each with a line and column
tokens
   │
   ▼  parser     src/language/parser.js     tokens → instructions + a map of labels
program
   │
   ▼  checker    src/language/validate.js   is every instruction real, with the right operands?
checked program
   │
   ▼  machine    src/runtime/machine.js     runs it, one step() at a time
output, remarks, errors
```

Each stage has its own page: [lexer](./lexer), [parser](./parser),
[checker](./checker), [machine](./machine) and [behaviors](./behaviors).

## Where everything lives

| Path | What it is |
| --- | --- |
| `src/language/` | Reading and checking programs: syntax rules, lexer, parser, the instruction table, the checker, the sass |
| `src/runtime/` | Running programs: values, the machine, what each instruction does, mood, randomness, errors |
| `src/cli.js`, `bin/twist.js` | The `twist` command |
| `src/repl.js` | The REPL |
| `src/stdin.js` | Reads input synchronously, so a program can ask for it mid-instruction |
| `playground/` | The web playground |
| `website/` | This site |
| `examples/` | Example programs |
| `test/` | The tests |

## Two rules the code follows

1. **Describing is separate from doing.** `instructions.js` says what each
   instruction *is* (name, category, operands). `behaviors.js` says what it
   *does*. The checker, docs and CLI only need the first.
2. **Nothing depends on Node in the language or runtime.** That's what lets
   the playground import `src/` directly. A test follows every import from
   the playground and fails if anything needs Node.
