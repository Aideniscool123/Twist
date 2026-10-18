---
title: 13. Mood
sidebar_position: 13
description: Twist has feelings. They affect your program.
---

# 13. Mood

Twist has a mood. It starts **chill**, and it changes as your program runs.

| Mood | What changes |
| --- | --- |
| 🤬 livid | Output in ALL CAPS, and Twist refuses about 1 in 4 instructions |
| 😡 furious | Output in ALL CAPS, and Twist refuses about 1 in 10 instructions |
| 😒 grumpy | Output in ALL CAPS |
| 😎 chill | Nothing. This is where Twist starts |
| 🙂 cheerful | Nothing |
| 😄 delighted | Nothing |
| 🤩 ecstatic | Every line of output ends with ` :D` |

## What changes it

- **Too many jumps.** Every 25th jump makes Twist dizzy: one step worse.
- **Dividing by zero.** It gives `0` instead of crashing, but upsets Twist a
  lot: two steps worse.
- **Being nice.** `ty1` (**Thank You**) cheers Twist up one step. Twist never
  refuses a `ty1`, so you can always talk it down.
- **Nothing at all.** Every instruction has a small chance (1 in 500) of
  nudging the mood up or down for no reason.

`mo1` (**Mood Out**) prints the mood, and `mo2` (**Mood Observe**) stores it
in a cell as text.

## Watching it change

This is the `moody.twist` example. Run it **without** `--calm`:

```text
chill
FURIOUS
SORRY ABOUT THAT
chill
```

```twist
mo1                     ; chill
ps3 #0 10
dv1 #0 0                ; dividing by zero: Twist is furious now
mo1                     ; FURIOUS (and it's shouting)
ps1 "sorry about that"
ty1                     ; Thank You: a little better
ty1                     ; and a little more
mo1                     ; chill again
```

Twist's remarks explain each change (on stderr):

```text
(twist) line 4: dividing by zero? Fine, it's 0 now. Twist is not amused.
(twist) line 4: Twist is furious now (you divided by zero).
(twist) line 7: Twist is grumpy now (it appreciates the compliment).
(twist) line 8: Twist is chill now (it appreciates the compliment).
```

## Why your loop is SHOUTING

Long loops do a lot of jumping, and every 25 jumps make Twist a little
dizzier. So a long FizzBuzz may start politely and finish SHOUTING, or even
skip some lines once Twist is furious enough to refuse them. Sprinkle a
`ty1` inside long loops to keep it happy.

## Turning feelings off

With `--calm` (or **Calm** in the playground), Twist has no feelings: the
mood stays chill and nothing changes it. All the examples on this site are
shown with `--calm`, so their output always looks the same.

```twist
ps1 "everything is fine"
dv1 #0 0
mo1
```

```text
everything is fine
chill
```

## Try it

Write a loop that jumps 100 times, and keep Twist from getting furious using
`ty1`.
