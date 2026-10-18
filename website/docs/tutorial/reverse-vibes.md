---
title: 12. Reverse Vibes
sidebar_position: 12
description: rv1 makes your program run upward.
---

# 12. Reverse Vibes

`rv1` (**Reverse Vibes**) flips the direction Twist runs. After it, the
program runs **upward**, one line at a time, until the next `rv1`, or until
it falls off the top.

```twist
jz1 #0 @start    ; the first time through, #0 is 0, so skip ahead
ps1 "3. ...and off the top."
ps1 "2. Now going up..."
@start:
ps3 #0 1         ; so the jz1 won't jump next time
ps1 "1. Going down."
rv1
```

```text
1. Going down.
1. Going down.
2. Now going up...
3. ...and off the top.
```

Three things to notice:

1. **"1. Going down." prints twice.** Going up from `rv1`, the next line is
   the one just *above* it.
2. **Everything you passed on the way down runs again on the way up.** That
   includes the `ps3 #0 1` and the `jz1` at the top.
3. **That's why `#0` matters.** The first time through, `jz1` jumps (because
   `#0` is 0). On the way back up, `#0` is 1, so it doesn't jump, and Twist
   runs off the top and stops. Without that, it would loop forever.

## Jumping while going up

A jump always lands at its label, but which way it carries on depends on the
direction. Going down, it carries on from the line **below** the label.
Going up, from the line **above** it.

```twist
jz1 #0 @start
ps1 "b"
ps1 "a"
@up:
hl1 ; never runs: going up, the jump carries on above the label
ps2 @up
ps3 #0 1
@start:
rv1
```

```text
a
b
```

## Calls remember the direction

`cl1` remembers which way you were going, and `rt1` comes back the same way.
A function called while running upward has its body written **above** its
label, so it reads bottom to top:

```twist
jz1 #0 @start
ps1 "after the call"
cl1 @f
ps3 #0 1
@start:
rv1
hl1
rt1 ; f's body runs upward from its label
ps1 "in f"
@f:
```

```text
in f
after the call
```

Yes, this is horrible. That's the point.

## Try it

Watch the first example in the [playground](pathname:///play/playground/)
with **Step**. The arrow next to *Direction* flips when `rv1` runs.
