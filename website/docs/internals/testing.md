---
title: Testing
sidebar_position: 8
description: How Twist is tested, and why the chaos never makes a test flaky.
---

# Testing

```bash
npm test
```

That runs every file in `test/` with Node's built-in test runner. There's
nothing to install.

## What's tested

| File | Covers |
| --- | --- |
| `syntax.test.js`, `lexer.test.js`, `parser.test.js` | Reading programs |
| `instructions.test.js` | The table, and the chaos rule |
| `validate.test.js` | The checker, including swaps |
| `values.test.js` | Printing, equality, copying |
| `interpreter.test.js` | Output, input, memory, math |
| `control.test.js` | Jumps, calls, endless loops |
| `text-and-lists.test.js` | Text and list instructions |
| `chaos.test.js` | Dice, Swap Words, Reverse Vibes, mood |
| `cli.test.js` | Every command, through the real `bin/twist.js` too |
| `sass.test.js` | The remarks |
| `examples.test.js` | Every example passes the checker |
| `docs.test.js` | `INSTRUCTIONS.md` and `GALLERY.md` are up to date |
| `tutorial.test.js` | Every snippet in `docs/TUTORIAL.md` prints what it claims |
| `site.test.js` | Every snippet on this website prints what it claims |
| `playground.test.js` | Highlighting, the examples menu, no Node-only code |

## Keeping chaos out of tests

Twist is random on purpose, which is terrible for tests. So tests never
leave randomness to chance:

- Most tests run with **`calm: true`**: no mood, and seed 0 for the dice.
- Tests that are *about* randomness pass their own `random` function, which
  returns exactly the numbers the test wants:

```js
const source = 'cl2 @heads\nps1 "tails"\nhl1\n@heads:\nps1 "heads"';
calm(source, { random: () => 0.1 }).output; // "heads\n"
calm(source, { random: () => 0.9 }).output; // "tails\n"
```

## Docs that test themselves

The tutorial and every page on this site are tested: a test finds each
` ```twist ` block, runs it, and compares the result to the ` ```text ` block
right after it. If you change how Twist behaves, the docs that describe it
fail, and you find out right away.
