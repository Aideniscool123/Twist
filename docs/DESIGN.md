# Twist design

Twist is a language where the instruction names are deliberately misleading:
`ps1` prints a string, `ps2` jumps somewhere else in the program, and `ps3`
plants a number in memory. Same two letters, three unrelated jobs.

## The chaos rule

Every instruction is **two letters + a number**. The number is part of the
instruction's identity, not a variant of the letters.

To make sure the chaos is real and not an accident, there is one rule:

> Instructions that share the same two letters must all be in **different
> categories**.

The categories are `output`, `input`, `memory`, `math`, `control` and `misc`.
So there can be a `ps` instruction that prints and a `ps` instruction that
jumps, but never two `ps` instructions that both print.

The rule is checked by `chaosViolations` in `src/language/instructions.js`, and
the tests fail if a new instruction breaks it.

Every instruction also gets a silly full name that explains the code after the
fact: `ps1` is **P**rint **S**tring, `ps2` is **P**ounce **S**omewhere, `ps3` is
**P**lant **S**eed.

## Memory

- Memory is a row of numbered **cells**: `#0`, `#1`, `#2`, and so on.
- Each cell holds one whole number.
- Every cell starts at `0`, so a program never has to set up a cell before
  using it.
- In theory there are unlimited cells. Real implementations may cap how big a
  number can get.

## Running a program

1. The program runs from the top, one instruction at a time.
2. `ps2` and `jz1` jump to a **label** (a line like `@again:`). Execution
   carries on from the line after the label.
3. The program stops when it reaches `hl1`, or when it runs off the bottom.

## Input and output

- `ps1` and `ad3` print a line of output.
- `ad2` reads a whole number from the user.

## Why it can compute anything

Three things are enough to make a language "do everything" (be Turing
complete): memory that can hold numbers, a way to change those numbers, and a
conditional jump. Twist already has all three in its first ten
instructions:

- Cells with `ps3` (set) and `ad1` (add, which also covers subtract).
- A conditional jump, `jz1`.
- An unconditional jump, `ps2`.

Cells plus add, subtract and jump-if-zero make a "counter machine", and a
counter machine can compute anything a normal computer can (as far as memory
allows). Phase 2 adds more instructions for convenience and for fun, but none
of them are needed for the language to be complete.

## The first ten instructions

The full table lives in `src/language/instructions.js`, and the generated
[instruction reference](INSTRUCTIONS.md) shows every instruction with its
operands and an example.

| Code | Name | Category |
| --- | --- | --- |
| `ps1` | Print String | output |
| `ps2` | Pounce Somewhere | control |
| `ps3` | Plant Seed | memory |
| `ad1` | Add Digits | math |
| `ad2` | Ask Directly | input |
| `ad3` | Announce Digit | output |
| `jz1` | Jump if Zero | control |
| `jz2` | Juggle Zones | memory |
| `hl1` | Halt Lightly | control |
| `hl2` | Hang Loose | misc |

See [SYNTAX.md](SYNTAX.md) for how lines are written.
