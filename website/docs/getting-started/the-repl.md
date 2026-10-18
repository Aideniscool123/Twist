---
title: The REPL
sidebar_position: 5
description: Type Twist one line at a time and see what happens.
---

# The REPL

The REPL runs each line as soon as you type it. It's good for trying an
instruction to see what it does.

```bash
node bin/twist.js repl
```

```text
Twist 0.1.0 - A single digit, changes the whole meaning
Type :help for help, :quit to leave.
twist> ps3 #0 6
twist> mu1 #0 7
twist> ad3 #0
42
twist> :cells
#0 = 42
twist> :quit
```

## Commands

| Command | What it does |
| --- | --- |
| `:cells` | Show every cell that has something in it |
| `:mood` | Show how Twist is feeling |
| `:list` | Show the program so far |
| `:reset` | Forget everything and start again |
| `:help` | Show help |
| `:quit` | Leave (so does Ctrl+C) |

## Labels and loops

Everything you type is added to a growing program. Typing a label just marks
the spot, and a later jump really does jump back and run the lines after it
again:

```text
twist> ps3 #0 0
twist> @top:
twist> ad1 #0 1
twist> ps3 #1 #0
twist> sb1 #1 3
twist> jn1 #1 @top
twist> ad3 #0
3
```

Typing the `jn1` line loops back to `@top` until `#0` reaches 3.

You can only jump to labels you've **already typed**. A jump to a label that
doesn't exist yet is refused, because the REPL can't see the future.

## Input

`ad2` and `rd3` read the **next line you type**:

```text
twist> rd3 #0
hello
twist> ad3 #0
hello
```

## Mistakes

A bad line is refused without forgetting the good ones, and a crash doesn't
end the session:

```text
twist> zz1
Unknown instruction zz1. Did you just make that up?
twist> ps3 #0 "x"
twist> mu1 #0 2
mu1 needs a number, but #0 is the text "x". Math. On that. Really?
twist> ps1 "still here"
still here
```

The REPL takes the same `--calm`, `--seed` and `--max-steps` options as
[`twist run`](./running-programs).
