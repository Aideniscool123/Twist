---
title: The playground
sidebar_position: 4
description: Write and run Twist in your browser, and watch it think.
---

# The playground

The playground lets you write Twist in your browser and **watch it run**,
line by line.

**[Open the playground →](pathname:///play/playground/)**

To run it on your own computer instead:

```bash
npm run playground
```

Then open http://localhost:8080.

## The panels

| Panel | What it shows |
| --- | --- |
| **Program** | The editor. Instruction codes are colored by category, and the chaos instructions glow. Mistakes are underlined, and listed under the editor (click one to jump to that line). |
| **Controls** | **Run** runs everything. **Watch** runs slowly so you can follow along, with a speed slider. **Step** runs one instruction at a time. **Stop** pauses. **Reset** clears everything. |
| **Mood** | Twist's face, its mood name, and a meter from livid to ecstatic. |
| **Stats** | Which way Twist is running (↓ or ↑), steps taken, how deep the calls are, and how many jumps. |
| **Swapped** | Any instructions that `sw1` has swapped, like `ps1 → ad3`. |
| **Output** | What the program printed. Twist's remarks appear in purple, and crashes in red. |
| **Input** | One line for each `ad2` or `rd3`. |
| **Memory** | Every cell that has something in it. A cell flashes when it changes. |

## Stepping

Press **Step** once and the line about to run is highlighted, with nothing run
yet. Each press after that runs one instruction. This is the best way to see
[Reverse Vibes](/docs/tutorial/reverse-vibes) and
[Swap Words](/docs/tutorial/swap-words) in action.

## Calm and seed

- **Calm** turns off mood swings and fixes the dice.
- **Seed** keeps the chaos but makes it repeatable. Leave it empty for real
  randomness.

## Other buttons

- **Examples…** loads any example program, and fills in the input if it needs some.
- **Instructions** opens a searchable list of all 42 instructions. Click one
  to insert its example into your program.
- **Share** copies a link with your program inside it. Anyone who opens the
  link sees your code.
- **☀️/🌙** switches between the light and dark themes.

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| Ctrl+Enter | Run |
| Ctrl+. | Step |
| Tab | Insert two spaces |
| Esc | Close the instruction list |

Your program is saved in your browser, so it's still there when you come
back.
