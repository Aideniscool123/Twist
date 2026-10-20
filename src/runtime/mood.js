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

export const JUMPS_PER_DIZZY_SPELL = 25;

export const RANDOM_SWING_ODDS = 500;

export const REFUSAL_CHANCE = Object.freeze({ [-3]: 0.25, [-2]: 0.1 });

export function moodName(level) {
  return MOODS[level];
}

export function moodify(text, level) {
  let result = level <= -1 ? text.toUpperCase() : text;
  if (level >= HIGHEST_MOOD) result = result.replace(/\n/g, " :D\n");
  return result;
}
