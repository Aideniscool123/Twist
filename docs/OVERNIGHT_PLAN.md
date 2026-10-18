# Overnight plan

Decisions made with Aiden on 2026-10-17. Start word: **poopy**.

## How the run works

- Runs on Aiden's PC with keep-awake on.
- One GitHub issue, branch and PR per phase. Merge each PR into `main` once
  `npm test` passes, then start the next phase from the updated `main`.
- `gh` lives at `C:\Program Files\GitHub CLI\gh.exe` (it may not be on PATH in
  an old session). Repo: `Aideniscool123/Twist`.
- Phases 1–9. **Skip Phase 10** (building something real).

## Phase 1 first

1. Unzip `twist-part-1` … `twist-part-5` from Downloads in order, later parts
   overwriting earlier ones. Keep Aiden's `package.json`.
2. Add `.idea/` to `.gitignore`.
3. `npm test` must pass (about 99 tests), then commit, PR, merge, and close
   the Phase 1 issue.

## Language decisions

- **Chaos level: maximum.** Keep the existing chaos rule (same two letters,
  different categories) and add:
  - **Dice instructions**: random numbers, coin-flip jumps.
  - **Renaming instructions**: swap what two codes do while the program runs.
  - **Reverse gear**: flip direction so the program runs upward until flipped
    back.
  - **Mood system**: Twist's mood changes from too many jumps, errors (like
    dividing by zero), a compliment instruction that cheers it up, and random
    swings. A grumpy Twist does things like print in ALL CAPS or refuse an
    instruction.
- **`--calm` flag** turns off dice randomness and mood so runs are repeatable.
  Tests use it (or a seeded random source) so they never flake.
- **Cells hold numbers, strings, and lists.**
- **Decimals are allowed.** This changes the Phase 1 number syntax
  (`3.5`, `-0.25`); update `SYNTAX.md` and the tests to match.
- **Error messages are fully sarcastic** but always include the line number
  and what's actually wrong.

## Web playground (Phase 8)

- Code editor, Run button and output panel, plus example programs to load.
- Live memory view showing cells change, with the running line highlighted and
  a step button.
- Should look polished and fancy, with a dark/light theme switch.
