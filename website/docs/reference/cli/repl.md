---
title: twist repl
sidebar_position: 3
description: Run Twist one line at a time.
---

# twist repl

```text
twist repl [--calm] [--seed <number>] [--max-steps <n>]
```

Starts an interactive session. Each line you type runs immediately. See the
[REPL guide](/docs/getting-started/the-repl) for a walkthrough.

## Commands

| Command | Does |
| --- | --- |
| `:cells` | Show every cell that has something in it |
| `:mood` | Show the mood |
| `:list` | Show every line typed so far |
| `:reset` | Forget everything |
| `:help` | Show the commands |
| `:quit`, `:exit`, `:q` | Leave |

## How lines run

- Each line is added to the program typed so far, and the **whole program is
  checked**. If the new line has a mistake, it's refused and forgotten.
- A new **instruction** runs straight away. If it jumps, the jump really
  happens, so jumping back to an earlier label replays the lines after it.
- A **label** or **comment** just gets added. Nothing runs.
- The step limit applies to each line separately.
- `ad2` and `rd3` read the **next line typed**.

## Ending

The REPL ends on `:quit`, Ctrl+C, or the end of input (Ctrl+Z then Enter on
Windows, Ctrl+D elsewhere). It always exits with code `0`.
