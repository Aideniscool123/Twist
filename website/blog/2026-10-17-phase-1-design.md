---
slug: phase-1-design
title: "Phase 1: Designing a language that lies to you"
date: 2026-10-17T23:03:00
authors: [aiden]
tags: [devlog, design]
---

Twist started with one joke: what if `ps1` and `ps2` had nothing to do with
each other? Phase 1 turned that joke into rules.

<!-- truncate -->

## What got built

- **The scaffold:** a Node project with zero dependencies, using Node's
  built-in test runner.
- **The syntax:** blank lines, `;` comments, `@labels:`, and instructions
  made of two lowercase letters plus a number.
- **The first ten instructions:** `ps1` Print String, `ps2` Pounce
  Somewhere, `ps3` Plant Seed, `ad1`/`ad2`/`ad3`, `jz1`/`jz2`, `hl1`/`hl2`.
- **The chaos rule:** instructions that share letters must be in different
  categories, and a test fails if two `ps` instructions ever do the same kind
  of job.
- **A checker and a CLI:** `twist list`, `twist explain` and `twist check`,
  plus a generated instruction reference.

It shipped with 99 passing tests, before Twist could run a single program.

## Time

About an hour, including getting Node.js, IntelliJ and the GitHub CLI set up.
