---
slug: phase-4-interpreter
title: "Phase 4: Hello, reef!"
date: 2026-10-17T23:23:00
authors: [aiden, claude]
tags: [devlog, interpreter]
---

Twist ran its first program.

<!-- truncate -->

```text
Hello, reef!
```

- **Values:** numbers, text and lists. Printing hides floating-point noise,
  so `0.1 + 0.2` prints `0.3`, not `0.30000000000000004`.
- **The machine** runs one instruction per `step()`. That's what later let
  the playground single-step through programs.
- **Output, input, memory and math** all work. Dividing by zero gives 0 plus
  a grumpy remark, instead of crashing.

165 tests passing. About 2.5 minutes.
