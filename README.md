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

> **Status:** Phases 1-6 are done. Every instruction works, including dice,
Swap Words, Reverse Vibes and moods. The `twist run` command comes next.

## Requirements

- Node.js 18 or newer. There are no other dependencies and nothing to install.

## Try it

```
npm test                          # run the tests
npm run check:examples            # check every program in examples/
node bin/twist.js list         # list every instruction
node bin/twist.js explain ps1  # explain one instruction
node bin/twist.js check examples/countdown.twist
npm run docs                      # regenerate docs/INSTRUCTIONS.md
```

## Docs

- [Design](docs/DESIGN.md): the chaos rule, memory, and why it can compute anything
- [Syntax](docs/SYNTAX.md): what a line of Twist looks like
- [Instruction reference](docs/INSTRUCTIONS.md): every instruction (generated)

## Roadmap

- [x] Phase 1: Design the language rules and first instructions
- [x] Phase 2: Finish the instruction set (make it Turing complete)
- [x] Phase 3: Build the lexer and parser
- [x] Phase 4: Build the core interpreter (hello world)
- [x] Phase 5: Add control flow (labels, jumps, loops, call/return)
- [x] Phase 6: Add strings, lists, and the weird instructions
- [ ] Phase 7: Add error messages, tests, and the `run` CLI/REPL
- [ ] Phase 8: Build the web playground
- [ ] Phase 9: Write docs and an example gallery
- [ ] Phase 10: Build something real with Twist
