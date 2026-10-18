# Twist

A tiny, chaotic programming language. Every instruction is a short code with a
number stuck to it, and `ps1` and `ps2` have **nothing** to do with each other.

The name is the whole idea: `ps2` is the plot twist after `ps1`.

```
; count down from 3
ps3 #0 3          ; plant a seed: cell 0 = 3
@again:
jz1 #0 @done      ; if cell 0 is zero, jump to done
ad3 #0            ; announce the number
ad1 #0 -1         ; subtract one
ps2 @again        ; pounce back up
@done:
ps1 "Liftoff!"
```

> **Status:** Phases 1-9 are done: the language, the command line, a REPL, a
web playground, a tutorial and an example gallery. Phase 10 (building
something real with Twist) is up to you.

## Requirements

- Node.js 18 or newer. There are no other dependencies and nothing to install.

## Playground

Twist has a web playground: an editor with syntax highlighting, Run, Watch
(run slowly) and Step buttons, a live view of every cell, Twist's mood and
direction, example programs, an instruction reference, and a dark/light theme.

```
npm run playground
```

Then open http://localhost:8080. The playground runs the same interpreter as
the command line, straight from `src/`, so there's nothing to build.

## Try it

```
node bin/twist.js run examples/fizzbuzz.twist    # run a program
node bin/twist.js run examples/moody.twist --calm  # no mood swings, same dice every time
node bin/twist.js run examples/moody.twist --seed 7  # full chaos, but repeatable
node bin/twist.js repl                           # type Twist one line at a time
node bin/twist.js check examples                 # check programs for mistakes
node bin/twist.js list                           # list every instruction
node bin/twist.js explain ps1                    # explain one instruction
npm test                                         # run the tests
npm run docs                                     # regenerate the reference and gallery
```

Twist's remarks (mood changes, refusals, complaints) go to stderr, so they
never get mixed into what your program prints.

## Docs

- [Tutorial](docs/TUTORIAL.md): learn Twist in 15 minutes
- [Example gallery](docs/GALLERY.md): every example with its real output (generated)
- [Instruction reference](docs/INSTRUCTIONS.md): all 42 instructions (generated)
- [Design](docs/DESIGN.md): the chaos rule, values, mood, Reverse Vibes and Swap Words
- [Syntax](docs/SYNTAX.md): what a line of Twist looks like
- [Architecture](docs/ARCHITECTURE.md): how the code fits together, and how to add an instruction

## Roadmap

- [x] Phase 1: Design the language rules and first instructions
- [x] Phase 2: Finish the instruction set (make it Turing complete)
- [x] Phase 3: Build the lexer and parser
- [x] Phase 4: Build the core interpreter (hello world)
- [x] Phase 5: Add control flow (labels, jumps, loops, call/return)
- [x] Phase 6: Add strings, lists, and the weird instructions
- [x] Phase 7: Add error messages, tests, and the `run` CLI/REPL
- [x] Phase 8: Build the web playground
- [x] Phase 9: Write docs and an example gallery
- [ ] Phase 10: Build something real with Twist
