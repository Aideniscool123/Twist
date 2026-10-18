// Twist's moods, from livid (-3) to ecstatic (3). See docs/DESIGN.md.

export const MOODS = Object.freeze({
  [-3]: "livid",
  [-2]: "furious",
  [-1]: "grumpy",
  0: "chill",
  1: "cheerful",
  2: "delighted",
  3: "ecstatic",
});

export const LOWEST_MOOD = -3;
export const HIGHEST_MOOD = 3;

/** Every this many jumps, Twist gets dizzy and grumpier. */
export const JUMPS_PER_DIZZY_SPELL = 25;

/** Each instruction has a 1 in this many chance of nudging the mood for no reason. */
export const RANDOM_SWING_ODDS = 500;

/** How often Twist refuses to run an instruction, by mood. */
export const REFUSAL_CHANCE = Object.freeze({ [-3]: 0.25, [-2]: 0.1 });

export function moodName(level) {
  return MOODS[level];
}

/** Change what's printed to suit the mood: ALL CAPS when grumpy or worse, ` :D` on every line when ecstatic. */
export function moodify(text, level) {
  let result = level <= -1 ? text.toUpperCase() : text;
  if (level >= HIGHEST_MOOD) result = result.replace(/\n/g, " :D\n");
  return result;
}
