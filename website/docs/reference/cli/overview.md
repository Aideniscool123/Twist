---
title: Command line
sidebar_label: Overview
sidebar_position: 1
description: The twist command and everything it can do.
---

# Command line

Everything is in one command, `twist`. From the Twist folder, run it with
`node bin/twist.js`:

```text
Twist 0.1.0 - A single digit, changes the whole meaning

Usage:
  twist run <file> [options]   Run a .twist program
  twist repl [options]         Type Twist one line at a time
  twist check <path...>        Check .twist files (or folders of them) for mistakes
  twist list                   List every instruction
  twist explain <code>         Explain one instruction, for example: twist explain ps1
  twist --version              Show the version
  twist --help                 Show this help

Options for run and repl:
  --calm              No mood swings, and the same dice rolls every time
  --seed <number>     Keep the chaos, but make the randomness repeatable
  --max-steps <n>     Give up after this many steps (default 1,000,000)
```

| Command | Page |
| --- | --- |
| `twist run` | [run](./run) |
| `twist repl` | [repl](./repl) |
| `twist check` | [check](./check) |
| `twist list` | [list](./list) |
| `twist explain` | [explain](./explain) |

## Exit codes

Every command uses the same exit codes, so scripts can tell what happened:

| Code | Meaning |
| --- | --- |
| `0` | Everything went fine. |
| `1` | The program (or a file being checked) has a mistake, crashed, or couldn't be read. |
| `2` | The command was used wrong: unknown command, missing argument, bad option. |

## npm scripts

From the Twist folder:

| Script | Does |
| --- | --- |
| `npm test` | Runs every test |
| `npm run playground` | Serves the playground at http://localhost:8080 |
| `npm run check:examples` | Checks every program in `examples/` |
