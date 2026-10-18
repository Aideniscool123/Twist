---
slug: phase-5-control-flow
title: "Phase 5: Loops, calls and FizzBuzz"
date: 2026-10-17T23:24:00
authors: [aiden]
tags: [devlog, interpreter]
---

Jumps, loops, function calls, and the first FizzBuzz.

<!-- truncate -->

- **Jumps:** `ps2`, `jz1` (empty means 0, `""` or `[]`), `jn1`, `je1`.
- **Calls:** `cl1` and `rt1`, with a call stack, so functions nest and can
  call themselves.
- **Safety nets:** clear errors for `rt1` with nothing to return to,
  runaway recursion, and endless loops.

The call stack remembers which **direction** Twist was running, which
nobody needed yet. Phase 6 needed it.

181 tests passing. About a minute, plus a retry after PowerShell mangled the
pull request description.
