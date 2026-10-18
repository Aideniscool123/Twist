// Seeded randomness, so `--seed 42` gives the same dice rolls every time.

/** The seed --calm uses when no --seed is given. */
export const CALM_SEED = 0;

/** A small, fast seeded random number generator (mulberry32). Returns () => number in [0, 1). */
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh seed for runs that didn't ask for one. */
export function randomSeed() {
  return Math.floor(Math.random() * 2 ** 32);
}
