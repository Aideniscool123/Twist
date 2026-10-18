---
title: The machine
sidebar_position: 5
description: How a checked program actually runs, one step at a time.
---

# The machine

`Machine` in `src/runtime/machine.js` holds everything a running program
has, and runs it **one instruction per `step()`**.

```js
import { Machine, loadProgram } from "./src/runtime/machine.js";

const machine = new Machine(loadProgram(source), {
  input: () => "a line of input, or null",
  output: (text) => process.stdout.write(text),
  note: (text) => console.error(text),
  calm: true,
});

while (machine.step()) {
  // the playground updates the screen here
}
```

For the simple case, `runProgram(source, options)` does all of it and returns
`{ output, notes, machine }`.

## What it holds

| Field | Is |
| --- | --- |
| `cells` | A map from cell number to value |
| `pc` | The position of the next instruction |
| `direction` | `1` going down, `-1` going up |
| `callStack` | Where each `rt1` will return to, and in which direction |
| `swaps` | Which codes are doing which jobs |
| `mood` | -3 to 3 |
| `jumps`, `steps` | Counters |
| `halted` | Whether it has stopped |

## One step

1. Find the instruction at `pc`. If there isn't one, the program is over.
2. Stop with an error if the step limit has been reached.
3. Work out its **job**: the code itself, unless `sw1` swapped it.
4. Set `next` to `pc + direction`.
5. Unless calm: maybe a random mood swing, then maybe a refusal.
6. Run the job's behavior. A jump changes `next`, and `rv1` flips
   `direction` (and `next` with it).
7. Move `pc` to `next`. Off either end means the program is over.

## Errors

Behaviors throw `Oops` with a plain message. `step()` catches it, stops the
machine, and throws a `TwistRuntimeError` with the **line number** added.
Anything else is a real bug in Twist, and is allowed to crash loudly.

## Output goes through the mood

All printing goes through `machine.print()`, which applies the mood:
uppercase when grumpy, ` :D` when ecstatic. That's the only place the mood
touches output, so no instruction needs to know about it.
