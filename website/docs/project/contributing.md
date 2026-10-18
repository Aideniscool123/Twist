---
title: Contributing
sidebar_position: 4
description: How to help make Twist worse, in the best way.
---

# Contributing

## Getting set up

```bash
git clone https://github.com/Aideniscool123/Twist.git
cd Twist
npm test
```

Twist itself has no dependencies. The website does:

```bash
cd website
npm install
npm start
```

## Ways to help

- **Write an example program.** Add it to `examples/` and to
  `playground/examples.js`, then run `npm run docs`. It appears in the
  gallery, the playground and this site.
- **Add an instruction.** Follow
  [Adding an instruction](/docs/internals/adding-an-instruction). Make it
  confusing.
- **Improve the docs.** Every page on this site has an *Edit this page* link
  at the bottom.
- **Report a bug.** Open an issue with the program, what you expected, and
  what happened. Include `--seed` if randomness was involved.

## Rules

1. `npm test` must pass.
2. New instructions must obey the [chaos rule](/docs/language/the-chaos-rule).
3. Error messages say **what's wrong first**, sass second.
4. Language and runtime code must not use Node-only features, so the
   playground keeps working.
5. Tests must not be flaky: use `calm: true` or a fixed `random`.

## Pull requests

One feature per pull request, with tests. If you change how Twist behaves,
update the docs that describe it. The doc tests will remind you.
