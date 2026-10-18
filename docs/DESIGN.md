# Twist design

Twist is a language where the instruction names are deliberately misleading:
`ps1` prints a string, `ps2` jumps somewhere else in the program, `ps3` plants
a value in memory, and `ps4` piles something onto a list. Same two letters,
four unrelated jobs.

And then it gets worse: Twist has moods, it can run your program backwards,
and one instruction can secretly swap what two other instructions do.

## The chaos rule

Every instruction is **two letters + a number**. The number is part of the
instruction's identity, not a variant of the letters.

To make sure the chaos is real and not an accident, there is one rule:

> Instructions that share the same two letters must all be in **different
> categories**.

The categories are `output`, `input`, `memory`, `math`, `control`, `text`,
`list`, `chaos` and `misc`. So there can be a `ps` instruction that prints and
a `ps` instruction that jumps, but never two `ps` instructions that both print.

The rule is checked by `chaosViolations` in `src/language/instructions.js`, and
the tests fail if a new instruction breaks it.

Every instruction also gets a silly full name that explains the code after the
fact: `ps1` is **P**rint **S**tring, `ps2` is **P**ounce **S**omewhere, `ps3` is
**P**lant **S**eed, `ps4` is **P**ile **S**tuff.

## Values

A value is one of:

- a **number**, like `7`, `-2.5` or `0.125`. Whole numbers and decimals are the
  same kind of thing.
- a piece of **text**, like `"hello"`.
- a **list** of values, like `[1, "two", [3]]`. Lists are made with `mk1` and
  filled with `ps4`. They can hold anything, including other lists.

When Twist prints a number it hides floating-point noise, so `0.1 + 0.2`
prints as `0.3`. Lists print like `[1, "two", [3]]`.

**Empty** means `0`, `""` or an empty list. `jz1` jumps when a cell is empty.

**Equal** (`eq1`, `je1`) compares numbers as numbers and text as text. A number
never equals text, so `5` and `"5"` are different. Two lists are equal when
they hold equal items in the same order.

## Memory

- Memory is a row of numbered **cells**: `#0`, `#1`, `#2`, and so on.
- Every cell starts at `0`, so a program never has to set up a cell before
  using it.
- `ps3 #1 #0` copies a value. Copying a list makes a separate copy, so
  changing one list never changes the other.

## Running a program

1. The program runs from the top, one instruction at a time.
2. Jumps (`ps2`, `jz1`, `jn1`, `je1`, `cl1`, `cl2`) go to a **label** (a line
   like `@again:`). Execution carries on from the line after the label.
3. `cl1` remembers where it was called from, and `rt1` goes back there. Calls
   can nest. `rt1` with nothing to return to is an error.
4. The program stops at `hl1`, when it runs off the bottom (or the top), or
   when it hits an error.
5. A program that runs for too many steps is stopped, so an endless loop can't
   freeze anything.

## Input and output

- `ps1`, `ad3` and `mo1` print a line of output. `sy1` prints without starting
  a new line.
- `ad2` reads a number. `rd3` reads a line of text.

## Errors

Twist's error messages are rude, but they always tell you the line number and
what actually went wrong:

```
line 4: ps9 isn't an instruction. Did you just make that up?
```

## The chaos

### Dice

`rd2` rolls a dice, `cl2` flips a coin to decide whether to jump, and `sh1`
shuffles a list.

### Swap Words

`sw1 ps1 ad3` swaps what `ps1` and `ad3` do for the rest of the run. After it,
`ps1` announces a cell and `ad3` prints text. Swapping them again puts them
back. The checker still checks every line against the instruction's normal
job, so a swapped instruction can blow up at run time: after
`sw1 ps1 ps2`, the line `ps1 "hi"` tries to jump to `"hi"`, and Twist will
tell you exactly whose fault that is.

### Reverse Vibes

`rv1` flips the direction the program runs. After it, Twist runs upward, one
line at a time, until the next `rv1`. Jumps still land on their label, and
carry on in whatever direction Twist is currently going: going upward, the
next line after a jump is the one above the label. `cl1` remembers the
direction too, so `rt1` comes back the way it went. Running off the top of
the program ends it, just like running off the bottom.

### Mood

Twist has a mood, from `livid` up to `ecstatic`:

| Level | Mood | What changes |
| --- | --- | --- |
| -3 | livid | Output is ALL CAPS, and Twist refuses about 1 in 4 instructions |
| -2 | furious | Output is ALL CAPS, and Twist refuses about 1 in 10 instructions |
| -1 | grumpy | Output is ALL CAPS |
| 0 | chill | Nothing. This is where Twist starts |
| 1 | cheerful | Nothing |
| 2 | delighted | Nothing |
| 3 | ecstatic | Every line of output ends with ` :D` |

What changes the mood:

- **Too many jumps**: every 25th jump makes Twist dizzy (mood -1).
- **Errors and zero**: dividing by zero with `dv1` or `md1` gives 0 instead of
  crashing, but it upsets Twist (mood -2).
- **Being nice**: `ty1` (Thank You) cheers Twist up (mood +1). Twist never
  refuses a `ty1`, so you can always talk it down.
- **Random**: every instruction has a small chance (1 in 500) of nudging the
  mood up or down for no reason at all.

When Twist refuses an instruction, it skips it and complains. Complaints and
other remarks go to a separate channel from the program's output (stderr in
the terminal), so they don't get mixed into what the program prints.

`mo1` prints the mood, and `mo2` stores it in a cell as text.

### Calming down

Running with **`--calm`** turns the chaos down for testing:

- the mood stays `chill` and nothing changes it,
- dice, coins and shuffles use a fixed random seed, so every run is the same.

`sw1` and `rv1` still work with `--calm`: they are predictable, just rude.

`--seed <number>` keeps all the chaos but makes the randomness repeatable.

## Why it can compute anything

Three things are enough to make a language "do everything" (be Turing
complete): memory that can hold numbers, a way to change those numbers, and a
conditional jump. Twist had all three in its first ten instructions:

- Cells with `ps3` (set) and `ad1` (add, which also covers subtract).
- A conditional jump, `jz1`.
- An unconditional jump, `ps2`.

Cells plus add, subtract and jump-if-zero make a "counter machine", and a
counter machine can compute anything a normal computer can (as far as memory
allows). Everything else in Twist is there for convenience, or for fun.

## The instructions

The full table lives in `src/language/instructions.js`, and
[INSTRUCTIONS.md](INSTRUCTIONS.md) is generated from it.

See [SYNTAX.md](SYNTAX.md) for how lines are written.
