---
slug: phase-8-playground
title: "Phase 8: The playground"
date: 2026-10-17T23:37:00
authors: [aiden]
tags: [devlog, tools]
---

A web playground where you can write Twist and **watch it think**.

<!-- truncate -->

[Open the playground](pathname:///play/playground/).

- **Editor** with highlighting from the real lexer. The chaos instructions
  glow.
- **Run, Watch and Step**, with the line about to run highlighted.
- **Live memory:** cells flash when they change.
- **Twist's state:** a mood face and meter, direction, call depth, jumps,
  and swap chips like `ps1 → ad3`.
- Examples, a searchable instruction drawer, share links, and dark and light
  themes.

Testing it in a real browser found four bugs the tests couldn't: a drawer
that wouldn't hide, runs that froze in background tabs, output in the wrong
order, and overlapping stats. All fixed.

255 tests passing. About 6 minutes.
