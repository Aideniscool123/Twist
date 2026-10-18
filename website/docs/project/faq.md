---
title: FAQ
sidebar_position: 2
description: Questions people ask about Twist, usually while angry.
---

# FAQ

### Why is `ps2` a jump?

Because it's funny. The [chaos rule](/docs/language/the-chaos-rule)
guarantees that instructions sharing letters do unrelated jobs, so the
letters never help you. That's the whole language.

### Why is my output SHOUTING?

Twist is grumpy. Long loops jump a lot, and every 25 jumps make it a little
dizzier. Add a `ty1` inside the loop, or run with `--calm`. See
[Mood](/docs/tutorial/mood).

### Why did a line of my program not run?

Twist was furious or livid and **refused** it. Check stderr for "refuses to
run". Say `ty1`.

### Why did my output end with `:D`?

Twist is ecstatic. You've been very nice to it. Congratulations, probably.

### Why does my program run some lines twice?

You used `rv1`. Going up, Twist runs every line it passed on the way down.
See [Reverse Vibes](/docs/tutorial/reverse-vibes).

### `ps1` is printing a number instead of text!

Somewhere above, there's a `sw1` that swapped `ps1`. Search for `sw1`.

### Why does `5` not equal `"5"`?

One is a number and one is text. Use `nm1` to turn text into a number.

### Can Twist really compute anything?

Yes. It has memory, arithmetic and a conditional jump, which makes it
Turing complete. See [why](/docs/language/the-chaos-rule#why-it-can-compute-anything).
Whether you *should* compute anything in it is a different question.

### Why are the dice always the same?

You're running with `--calm`, or with a `--seed`. Both make the dice
repeatable. Take them off for real randomness.

### Does the website need a server?

No. This site and the playground are plain files on GitHub Pages. Everything
runs in your browser.

### Who made this?

See [Credits](./credits).
