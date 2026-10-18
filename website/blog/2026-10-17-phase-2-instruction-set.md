---
slug: phase-2-instruction-set
title: "Phase 2: 10 instructions become 42"
date: 2026-10-17T23:18:00
authors: [aiden]
tags: [devlog, design, chaos]
---

Phase 2 grew Twist from 10 instructions to 42, and decided exactly how
chaotic it would be. The answer was **maximum**.

<!-- truncate -->

## The decisions

- **Decimals are allowed.** `2.5` and `-0.125` are numbers now. `-0` is
  still refused, because it's "just 0 wearing a minus sign".
- **Cells hold numbers, text and lists.**
- **Maximum chaos:** dice, instructions that swap jobs, reverse gear, and a
  mood system.
- **Error messages are fully sarcastic**, but always say the line number and
  the real problem first.

## The new instructions

New categories for text, lists and chaos. The chaos ones are `rd2` Roll
Dice, `cl2` Coin Leap, `sh1` Shuffle Heap, `sw1` Swap Words, `rv1` Reverse
Vibes and `ty1` Thank You. `rd`, `cl` and `ad` now each have three unrelated
jobs.

## The tricky part

`sw1` swaps what two instructions do, so `ps1 #0` is a mistake... unless the
program swaps `ps1` with `ad3`. The checker now works out every job a line
*might* be doing, and accepts operands that fit any of them.

118 tests passing. About 15 minutes, including a detour to set up Hackatime.
