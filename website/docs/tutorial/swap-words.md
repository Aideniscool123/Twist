---
title: 11. Swap Words
sidebar_position: 11
description: sw1 swaps what two instructions do. For the rest of the run.
---

# 11. Swap Words

`sw1` (**Swap Words**) takes two instruction codes and **swaps their jobs**
for the rest of the run.

```twist
ps3 #0 "I'm in a cell"
sw1 ps1 ad3      ; ps1 and ad3 trade jobs
ps1 #0           ; ps1 now announces a cell...
ad3 "and ad3 prints text"
```

```text
I'm in a cell
and ad3 prints text
```

After the swap, `ps1` does `ad3`'s job (print a cell), and `ad3` does `ps1`'s
job (print text). Notice the operands changed to match.

## Swapping back

Swap the same two again and everything goes back to normal:

```twist
sw1 ps1 ad3
sw1 ps1 ad3
ps1 "back to normal"
```

```text
back to normal
```

## Chains

Swaps stack up. After these two lines, `ps1` jumps, `ps2` announces cells,
and `ad3` prints text:

```twist
sw1 ps1 ad3       ; ps1 does ad3's job, ad3 does ps1's job
sw1 ps1 ps2       ; now ps1 takes ps2's job, and ps2 takes ad3's
ps3 #0 "announced by ps2"
ps2 #0
ad3 "printed by ad3"
ps1 @end
ps1 "never runs: ps1 is a jump now"
@end:
```

```text
announced by ps2
printed by ad3
```

## When you forget what you swapped

The checker knows about swaps. In a program that swaps `ps1` and `ad3`, a
`ps1` line may use either instruction's operands. But at run time,
the instruction has to get what its *current* job needs, and if it doesn't,
Twist knows exactly whose fault it is:

```twist
sw1 ps1 ps2
ps1 "hi"
@x:
ps2 @x
```

```text
line 2: ps1 (doing ps2's job) wants a label like @loop here, but got "hi". That's what you get for using sw1.
```

In the playground, active swaps show up as chips like **ps1 → ps2** under
the mood.

## Try it

Swap `ad1` (Add Digits) with `sb1` (Subtract Boldly), then write a countdown
that only uses `ad1` to count down.
