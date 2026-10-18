---
title: Your first program
sidebar_position: 2
description: Write, run, break and fix your first Twist program.
---

# Your first program

## Write it

Make a file called `greet.twist`:

```twist
; greet.twist - my first Twist program
ps1 "Hi! I'm Twist."
ps3 #0 7
ad1 #0 35
sy1 "The answer is "
ad3 #0
```

What each line does:

| Line | Meaning |
| --- | --- |
| `; greet.twist ...` | A comment. Twist ignores everything after `;` |
| `ps1 "Hi! I'm Twist."` | **P**rint **S**tring: print the text and a new line |
| `ps3 #0 7` | **P**lant **S**eed: put `7` into cell `#0` |
| `ad1 #0 35` | **A**dd **D**igits: add `35` to cell `#0` |
| `sy1 "The answer is "` | **S**ay **Y**onder: print without starting a new line |
| `ad3 #0` | **A**nnounce **D**igit: print what's in cell `#0` |

## Run it

```bash
node bin/twist.js run greet.twist
```

```text
Hi! I'm Twist.
The answer is 42
```

## Break it

Change `ps1` to `ps9` and run it again:

```text
greet.twist:2: Unknown instruction ps9. Did you just make that up?
```

Twist checks the **whole program** before running any of it. Every mistake
gets the file name, the line number, what's wrong, and a remark you didn't
ask for. The useful part always comes first.

Now try `ps2` instead. `ps2` is a real instruction, but it jumps to a label,
so it wants something like `@loop`, not text:

```text
greet.twist:2: ps2 operand 1 (target) should be a label like @loop, but got "Hi! I'm Twist.". Close. Well, no, not really.
```

This is the whole idea of Twist: `ps1` and `ps2` look like cousins, but they
aren't even the same species. Put it back to `ps1`.

## Next

- Learn the language properly in the [tutorial](/docs/tutorial/hello).
- See every way to [run programs](./running-programs).
