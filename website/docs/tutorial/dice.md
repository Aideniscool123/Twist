---
title: 10. Dice
sidebar_position: 10
description: Roll Dice, Coin Leap, Shuffle Heap, and taming them with --calm and --seed.
---

# 10. Dice

This is where Twist stops being predictable.

| Code | Name | Does |
| --- | --- | --- |
| `rd2` | Roll Dice | puts a random whole number from 1 to N in a cell |
| `cl2` | Coin Leap | flips a coin: heads jumps to a label, tails carries on |
| `sh1` | Shuffle Heap | shuffles a list into a random order |

```twist
rd2 #0 6
sy1 "You rolled a "
ad3 #0
cl2 @heads
ps1 "Tails!"
hl1
@heads:
ps1 "Heads!"
```

```text
You rolled a 2
Heads!
```

That output is from `--calm`. Run it yourself without `--calm` and you'll get
something different, probably different every time.

Notice that `rd2`, `rd1` (Round Down) and `rd3` (Read Dialogue) share
letters, and do math, chaos and input. Twist is consistent like that.

## Shuffling

```twist
mk1 #0
ps4 #0 "ace"
ps4 #0 "king"
ps4 #0 "queen"
ps4 #0 "jack"
sh1 #0
ad3 #0
```

```text
["jack", "queen", "ace", "king"]
```

## Taming the dice

| How you run it | Dice |
| --- | --- |
| normally | different every run |
| `--seed 7` | random-looking, but the same every run with seed 7 |
| `--calm` | the same every run (and Twist's mood stays chill) |

In the [playground](pathname:///play/playground/), tick **Calm** or type a
**Seed**.

Seeds are handy when you find a bug that only happens on some rolls. Note
the seed, and you can make it happen again whenever you want.

## Try it

Roll two dice 5 times and print the total each time. Then find a seed where
the first total is 12.
