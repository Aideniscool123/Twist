---
title: Running programs
sidebar_position: 3
description: twist run, its options, input, output, remarks and exit codes.
---

# Running programs

```bash
node bin/twist.js run <file.twist> [options]
```

## Options

| Option | What it does |
| --- | --- |
| `--calm` | No mood swings, and dice, coins and shuffles land the same way every time. Use it for testing. |
| `--seed <number>` | Keep all the chaos, but make the randomness repeatable. Same seed, same dice. |
| `--max-steps <n>` | Give up after this many steps (default 1,000,000), so an endless loop can't run forever. |

```bash
node bin/twist.js run examples/dice-duel.twist --seed 7
node bin/twist.js run examples/fizzbuzz.twist --calm
node bin/twist.js run examples/countdown.twist --max-steps 50
```

## Input

Programs read input with `ad2` (a number) and `rd3` (a line of text). When you
run a program in a terminal, Twist waits for you to type a line and press
Enter.

You can also pipe input in. Each line answers one `ad2` or `rd3`:

```bash
echo 42 | node bin/twist.js run examples/echo.twist
```

## Output and remarks

What your program prints goes to **stdout**. Twist's own remarks, like mood
changes, complaints about dividing by zero, and refusals, go to **stderr**,
starting with `(twist)`:

```text
chill
(twist) line 4: dividing by zero? Fine, it's 0 now. Twist is not amused.
(twist) line 4: Twist is furious now (you divided by zero).
FURIOUS
```

So `node bin/twist.js run moody.twist > out.txt` saves only the program's
output, without the remarks.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | The program ran to the end (or hit `hl1`). |
| `1` | The checker found mistakes, or the program crashed while running. |
| `2` | The command itself was wrong, like a missing file name or an unknown option. |
