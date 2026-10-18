---
title: twist run
sidebar_position: 2
description: Run a Twist program.
---

# twist run

```text
twist run <file.twist> [--calm] [--seed <number>] [--max-steps <n>]
```

Checks the program, then runs it.

## Options

| Option | Default | Does |
| --- | --- | --- |
| `--calm` | off | Mood stays chill; dice, coins and shuffles use seed 0. |
| `--seed <number>` | random | Seeds the randomness. Must be a whole number of 0 or more. |
| `--max-steps <n>` | 1,000,000 | Stops with an error after this many steps. |

Options can go before or after the file name.

## Streams

| Stream | Gets |
| --- | --- |
| stdin | Input for `ad2` and `rd3`, one line each |
| stdout | Everything the program prints |
| stderr | Twist's remarks (starting `(twist)`) and errors |

## Examples

```bash
node bin/twist.js run examples/fizzbuzz.twist
node bin/twist.js run examples/guess.twist --seed 3
echo Twist | node bin/twist.js run examples/reverse.twist
node bin/twist.js run loop.twist --max-steps 1000
```

## Errors

If the checker finds mistakes, **nothing runs**. Every mistake is listed with
its file and line:

```text
bad.twist:2: Unknown instruction ps9. Did you just make that up?
bad.twist:3: Label @nowhere is never defined. Jumping into the void, are we?
```

If something goes wrong while running, everything printed up to that point
stays printed, then the error:

```text
before
crash.twist:3: mu1 needs a number, but #0 is the text "x". Math. On that. Really?
```

Both exit with code `1`. See [Error messages](../errors) for every error.
