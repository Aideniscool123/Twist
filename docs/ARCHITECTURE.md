# How Twist works inside

Twist is plain JavaScript (ES modules) with no dependencies. The same code
runs in Node (the `twist` command) and in the browser (the playground).

## The pipeline

```
program text
   │
   ▼  src/language/lexer.js      tokenize(): text → tokens with line and column
tokens
   │
   ▼  src/language/parser.js     parse(): tokens → instructions + label map
program
   │
   ▼  src/language/validate.js   validateProgram(): checks every instruction and operand
checked program
   │
   ▼  src/runtime/machine.js     Machine: runs it, one step() at a time
output, remarks, errors
```

### Language (`src/language/`)

| File | What it does |
| --- | --- |
| `syntax.js` | Shared rules: operand kinds, what an instruction code looks like, `operandFits` |
| `lexer.js` | Turns text into tokens. Mistakes become `ERROR` tokens instead of exceptions, so every line gets checked |
| `parser.js` | Turns tokens into `{ instructions, labels, errors }`. Each label points at the index of the next instruction |
| `instructions.js` | The instruction table: code, name, category, operands, summary, example. This is data only |
| `validate.js` | The checker. Knows about `sw1`, so swapped instructions may use each other's operands |
| `docs.js` | Renders `docs/INSTRUCTIONS.md` from the table |
| `sass.js` | Adds a rude remark to an error message, after the useful part |

### Runtime (`src/runtime/`)

| File | What it does |
| --- | --- |
| `values.js` | Numbers, text and lists: printing (no floating-point noise), equality, copying, emptiness |
| `machine.js` | The `Machine`: cells, the next instruction (`pc`), direction, call stack, swaps, mood. `step()` runs one instruction; `run()` runs them all; `runProgram()` does everything in one call |
| `behaviors.js` | What each instruction does, keyed by code. Each one gets the machine and its operands |
| `mood.js` | Mood levels, names, and how mood changes printed text |
| `random.js` | A seeded random number generator, so `--seed` and `--calm` repeat exactly |
| `errors.js` | `TwistCheckError` (the checker said no), `TwistRuntimeError` (something broke while running), and `Oops`, which behaviors throw and the machine turns into a runtime error with the line number |

### How a step works

1. Find the instruction at `pc`.
2. Look up its **job**: normally its own code, but `sw1` may have swapped it.
3. Work out the default next instruction: `pc + direction`.
4. Unless calm: maybe a random mood swing, and maybe refuse the instruction.
5. Run the job's behavior. Jumps change `next`; `rv1` flips `direction`.
6. Move to `next`. Off either end of the program means the program is done.

Operands are checked again at run time (`cellOf`, `valueOf`, `labelOf` and
friends), because after a swap an instruction can be handed operands meant for
another job.

### Everything else

| Path | What it is |
| --- | --- |
| `src/cli.js`, `bin/twist.js` | The `twist` command: `run`, `repl`, `check`, `list`, `explain` |
| `src/repl.js` | The REPL. Each typed line is added to a growing program and run straight away |
| `src/stdin.js` | Reads stdin synchronously, so a program can ask for input in the middle of an instruction |
| `src/gallery.js` | Renders `docs/GALLERY.md` by running every example |
| `playground/` | The web playground. `highlight.js` uses the real lexer for colors; `app.js` drives a `Machine` |
| `scripts/` | `generate-docs.js` (`npm run docs`) and `serve.js` (`npm run playground`) |

## Adding an instruction

1. **Describe it** in `src/language/instructions.js`. Pick a code whose two
   letters are already used by a *different* category, for maximum confusion.
   The chaos rule test fails if two instructions with the same letters share a
   category.
2. **Make it work** in `src/runtime/behaviors.js`. Read operands with the
   machine's helpers (`m.cellOf`, `m.valueOf`, `m.numberOf`, `m.listIn`,
   `m.labelOf`...) and throw `Oops` for anything wrong. Say what was expected
   and what was found.
3. **Test it.** Add cases to the matching file in `test/`.
4. **Regenerate the docs** with `npm run docs`. A test fails if you forget.

The tests also check that every instruction has an example the checker
accepts, so the reference never shows broken code.

## Tests

`npm test` runs everything with Node's built-in test runner. There is nothing
to install. Tests that run programs use `calm: true` (or a fixed `random`),
so the chaos never makes a test flaky.
