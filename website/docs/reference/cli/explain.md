---
title: twist explain
sidebar_position: 6
description: Explain one instruction.
---

# twist explain

```text
twist explain <code>
```

Explains one instruction: its name, category, what it does, how to write it,
an example, and which instructions share its letters.

```bash
node bin/twist.js explain cl2
```

```text
cl2 - Coin Leap (chaos)
Flip a coin. Heads: jump to the label. Tails: carry on.

Usage:   cl2 <target:label>
Example: cl2 @lucky

Same letters, different jobs: cl1 Call Label, cl3 Clean Locker
```

Uppercase is fine here: `twist explain CL2` works too.

## Exit codes

| Code | When |
| --- | --- |
| `0` | Explained |
| `1` | Not a real instruction |
| `2` | No code, or more than one |
