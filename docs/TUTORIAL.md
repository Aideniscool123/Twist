# Learn Twist in 15 minutes

Twist is small, rude, and deliberately confusing. This tutorial walks you
through it from "hello" to making Twist run your program backwards.

You can follow along in the playground (`npm run playground`, then open
http://localhost:8080), or save each program as a `.twist` file and run it:

```
node bin/twist.js run hello.twist
```

> Every program in this tutorial is checked by the tests, and every output
> shown is what Twist really prints with `--calm`.

## 1. Hello

```twist
ps1 "Hello, reef!"
```

```text
Hello, reef!
```

`ps1` is **P**rint **S**tring. Every instruction is two letters and a number,
and the number is not a version or a variant. `ps2` is a completely different
instruction (it jumps), and so is `ps3` (it stores a value). That's the whole
joke of Twist, and you will get it wrong at least once.

Anything after a `;` is a comment.

## 2. Cells

Twist keeps values in numbered **cells**: `#0`, `#1`, `#2` and so on. Every
cell starts at `0`.

```twist
ps3 #0 10        ; Plant Seed: put 10 in cell #0
ad1 #0 5         ; Add Digits: add 5 to it
ad3 #0           ; Announce Digit: print it
```

```text
15
```

A cell can hold a number (`7`, `-2.5`), text (`"hi"`) or a list. Math
instructions take a **value**, which can be a number, text or another cell:

```twist
ps3 #0 6
ps3 #1 7
mu1 #0 #1        ; Multiply Up: #0 = #0 * #1
ad3 #0
dv1 #0 4         ; Divide Vigorously
ad3 #0
```

```text
42
10.5
```

## 3. Loops

A line like `@again:` is a **label**. Jumps go to labels. `ps2` always jumps,
and `jz1` (Jump if Zero) only jumps when a cell is empty.

```twist
ps3 #0 3
@again:
jz1 #0 @done     ; stop when #0 reaches 0
ad3 #0
ad1 #0 -1
ps2 @again       ; Pounce Somewhere: back to the top
@done:
ps1 "Liftoff!"
```

```text
3
2
1
Liftoff!
```

To compare, use `gt1` (Greater Than) or `eq1` (Equal Question). Both replace
the cell with `1` (yes) or `0` (no), so compare a copy if you still need the
original. Or use `je1`, which jumps if a cell equals a value:

```twist
ps3 #0 1
@loop:
ad3 #0
je1 #0 3 @done
ad1 #0 1
ps2 @loop
@done:
```

```text
1
2
3
```

## 4. Input

`ad2` (Ask Directly) reads a number. `rd3` (Read Dialogue) reads a line of
text. In the playground, put the input in the Input box, one line per read.

```twist
ps1 "What's your name?"
rd3 #0
ps3 #1 "Hi, "
jn2 #1 #0        ; Join Neatly: stick #0 on the end
ad3 #1
```

Typed in: `Aiden`

```text
What's your name?
Hi, Aiden
```

## 5. Text and lists

`up1` uppercases, `sp1` splits text into a list, and `nm1` turns text like
`"42"` into a number.

Lists start with `mk1` (Make Kit). `ps4` (Pile Stuff) adds to the end, `pp1`
(Pop Pop) takes from the end, `gt2` (Grab Thing) reads an item, `st1` (Stash
Thing) replaces one, and `ln1` (Length Now) counts them. Items count from 0.

```twist
mk1 #0
ps4 #0 "eggs"
ps4 #0 "milk"
ps4 #0 3
ad3 #0
gt2 #1 #0 1      ; #1 = item 1
ad3 #1
ln1 #2 #0
ad3 #2
```

```text
["eggs", "milk", 3]
milk
3
```

## 6. Functions

`cl1` (Call Label) jumps to a label and remembers where it came from. `rt1`
(Return Trip) goes back. Calls can nest, and a function can call itself.

```twist
ps3 #0 "world"
cl1 @greet
ps3 #0 "Twist"
cl1 @greet
hl1              ; Halt Lightly: stop here, don't fall into the function

@greet:
ps3 #1 "Hello, "
jn2 #1 #0
ad3 #1
rt1
```

```text
Hello, world
Hello, Twist
```

## 7. The chaos

This is where Twist stops being polite.

### Dice

`rd2` (Roll Dice) rolls a dice, `cl2` (Coin Leap) jumps on heads, and `sh1`
(Shuffle Heap) shuffles a list. Run with `--calm` (or tick **Calm** in the
playground) and the dice land the same way every time. Use `--seed 7` to keep
the chaos but make it repeatable.

### Swap Words

`sw1` swaps what two instructions do, for the rest of the run:

```twist
ps3 #0 "I'm in a cell"
sw1 ps1 ad3      ; ps1 and ad3 trade jobs
ps1 #0           ; ps1 now announces a cell...
ad3 "and ad3 prints text"
```

```text
I'm in a cell
and ad3 prints text
```

Swap them again to undo it. If you forget what you swapped, Twist will remind
you, rudely, the moment a swapped instruction gets the wrong kind of operand.

### Reverse Vibes

`rv1` flips the direction Twist runs. After it, the program runs **upward**
until the next `rv1` (or until it falls off the top).

```twist
jz1 #0 @start    ; the first time through, #0 is 0, so skip ahead
ps1 "3. ...and off the top."
ps1 "2. Now going up..."
@start:
ps3 #0 1         ; so the jz1 won't jump next time
ps1 "1. Going down."
rv1
```

```text
1. Going down.
1. Going down.
2. Now going up...
3. ...and off the top.
```

Notice "1. Going down." printed twice: going up from `rv1`, the next line is
the one just above it. And everything you pass on the way down runs again on
the way up, which is why the `jz1` at the top needs a cell that has changed
by then. Without it, Twist would jump back down to `@start`, run upward again,
and go round forever (or until it gets dizzy, furious and gives up). Reverse
Vibes is not for the faint of heart.

### Mood

Twist has a mood, from `livid` to `ecstatic`. It starts `chill`.

- Every 25th jump makes it dizzy (worse mood).
- Dividing by zero gives `0` instead of crashing, but upsets it a lot.
- Sometimes its mood just changes, for no reason.
- `ty1` (Thank You) cheers it up.

A grumpy Twist prints in ALL CAPS. A furious one refuses to run some of your
instructions. An ecstatic one ends every line with ` :D`. `mo1` prints the
mood and `mo2` stores it in a cell.

```twist
ps1 "everything is fine"
ty1
ty1
ty1
mo1
```

```text
everything is fine
chill
```

(That's the `--calm` output, where Twist has no feelings. Without it, three
compliments take Twist all the way to ecstatic, and the last line is usually
`ecstatic :D`.)

## 8. When things go wrong

Twist checks your whole program before running it, and tells you exactly
which line is wrong. It is not nice about it:

```
bad.twist:2: Unknown instruction ps9. Did you just make that up?
bad.twist:3: Label @nowhere is never defined. Jumping into the void, are we?
```

The line number and the real problem always come first.

## Where next

- [The instruction reference](INSTRUCTIONS.md) lists all 42 instructions.
- [The gallery](GALLERY.md) has bigger programs: FizzBuzz, primes, sorting,
  a guessing game and a dice duel.
- [The design](DESIGN.md) explains every rule, including exactly how Reverse
  Vibes and the mood work.
- `node bin/twist.js repl` lets you type Twist one line at a time.
