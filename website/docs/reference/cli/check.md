---
title: twist check
sidebar_position: 4
description: Check programs for mistakes without running them.
---

# twist check

```text
twist check <path...>
```

Checks files for mistakes **without running them**. Give it files, folders,
or both. For a folder, it checks every `.twist` file directly inside it.

```bash
node bin/twist.js check examples
```

```text
examples\backwards.twist: ok (12 instructions)
examples\countdown.twist: ok (7 instructions)
examples\dice-duel.twist: ok (31 instructions)
...
```

## What it checks

- Every line is readable (codes, operands, strings, labels).
- Every instruction exists.
- Every instruction has the right number and kinds of operands, allowing for
  [swaps](/docs/language/swap-words).
- Every `sw1` names real instructions.
- No label is defined twice, and every label jumped to exists.

It can't find mistakes that only happen while running, like doing math on
text, or reading past the end of a list.

## Output

Good files are listed on stdout. Mistakes go to stderr as `file:line:
message`:

```text
bad.twist:2: Unknown instruction zz9. Did you just make that up?
```

## Exit codes

| Code | When |
| --- | --- |
| `0` | Every file is fine |
| `1` | At least one file has a mistake, a path doesn't exist, or a folder has no `.twist` files |
| `2` | No path was given |
