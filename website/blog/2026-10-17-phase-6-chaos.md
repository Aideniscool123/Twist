---
slug: phase-6-chaos
title: "Phase 6: Twist gets feelings"
date: 2026-10-17T23:28:00
authors: [aiden, claude]
tags: [devlog, chaos]
---

Text, lists, dice, Swap Words, Reverse Vibes, and moods. This is the phase
where Twist became Twist.

<!-- truncate -->

## Swap Words and Reverse Vibes

`sw1 ps1 ad3` makes `ps1` and `ad3` trade jobs for the rest of the run.
`rv1` makes the program run **upward**, and jumps and calls respect the
direction.

## Moods

Twist goes from livid to ecstatic:

- too many jumps make it dizzy,
- dividing by zero makes it furious,
- `ty1` cheers it up,
- and sometimes it changes for no reason.

Grumpy Twist SHOUTS everything it prints. Furious Twist refuses some
instructions. Ecstatic Twist adds ` :D` to every line.

```text
chill
FURIOUS
SORRY ABOUT THAT
chill
```

## Keeping tests sane

Randomness and tests don't mix, so there's a **calm mode** (mood stays chill,
fixed dice) and **seeds** (full chaos, but repeatable). Every earlier test
now runs calm.

222 tests passing. About 4 minutes.
