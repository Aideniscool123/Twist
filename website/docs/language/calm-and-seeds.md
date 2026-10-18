---
title: Calm and seeds
sidebar_position: 14
description: How to make Twist's chaos repeatable.
---

# Calm and seeds

Twist uses randomness for dice (`rd2`), coins (`cl2`), shuffles (`sh1`),
random mood swings, and refusals. Two options tame it.

## `--calm`

```bash
node bin/twist.js run game.twist --calm
```

- The mood stays **chill**, and nothing changes it. So no ALL CAPS, no
  refusals and no ` :D`.
- Dice, coins and shuffles use a **fixed seed** (seed 0), so they land the
  same way every run.
- `sw1` and `rv1` still work. They're predictable, just rude.

Use it for testing, and for showing output in docs. Every output on this
site comes from `--calm`.

## `--seed <number>`

```bash
node bin/twist.js run game.twist --seed 42
```

- **All the chaos stays on**: moods, refusals, everything.
- But the randomness follows the seed, so the same seed gives exactly the
  same run, mood swings included.

Use it to reproduce something weird. Seeds are whole numbers from 0 up.

## Both

`--calm --seed 7` keeps Twist calm, and uses seed 7 for the dice.

## In the playground

- The **Calm** switch is `--calm`.
- The **Seed** box is `--seed`. Leave it empty for real randomness.

## In code

```js
import { runProgram } from "./src/runtime/machine.js";
runProgram(source, { calm: true });
runProgram(source, { seed: 42 });
```

The random number generator is a small, fast one called *mulberry32*, in
`src/runtime/random.js`.
