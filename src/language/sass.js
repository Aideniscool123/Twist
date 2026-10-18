// Twist's attitude.
//
// Error messages inside Twist are plain and precise. `sass` adds a rude remark
// on the end, for showing to people. The useful part (line number, what went
// wrong) always comes first, so the rudeness never hides the fix.

const SPECIFIC = [
  [/doing \S+'s job/, "That's what you get for using sw1."],
  [/^Unknown instruction/, "Did you just make that up?"],
  [/isn't an instruction/, "Swapping with an imaginary friend, are we?"],
  [/is never defined/, "Jumping into the void, are we?"],
  [/is already defined/, "One was plenty."],
  [/missing its closing quote/, "Strings have two ends. Both of them matter."],
  [/Unknown escape/, "That backslash is doing a lot of heavy lifting for nothing."],
  [/takes \d+ operands?, but/, "Counting is hard, I know."],
  [/should be/, "Close. Well, no, not really."],
  [/Can't read .* as an operand/, "I've seen clearer handwriting from a cat."],
  [/Expected an instruction code/, "Every line starts with an instruction. Every. Line."],
  [/colon/, "It's one tiny colon. You can do it."],
  [/needs a line to itself/, "Labels like their personal space."],
  [/too big/, "Calm down."],
  [/wearing a minus sign/, "Nice try."],
  [/no input left/, "I can't read minds. Yet."],
  [/asked for a number, but got/, "That is not a number and you know it."],
  [/gave up after/, "I have other things to do, you know."],
  [/nothing called it/, "Return to where, exactly?"],
  [/levels deep/, "It's turtles all the way down."],
  [/needs a number/, "Math. On that. Really?"],
  [/needs text/, "Words. It wanted words."],
  [/needs a list/, "That is very much not a list."],
  [/needs a whole number/, "Half an item isn't a thing."],
  [/can't turn .* into a number/, "Numbers are the ones with digits in."],
  [/wants item/, "Count again. Start from 0 this time."],
  [/can't pop anything/, "You can't take things out of nothing."],
  [/sides/, "Even Twist can't roll that."],
];

const GENERIC = [
  "Impressive, in a bad way.",
  "Bold choice. Wrong, but bold.",
  "Twist is disappointed, but not surprised.",
  "Have you tried reading the docs?",
  "Even ps2 couldn't jump over this one.",
];

// A tiny hash so the same message always gets the same remark.
function pick(list, text) {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return list[hash % list.length];
}

/** Add a remark to a plain error message: "Unknown instruction zz9. Did you just make that up?" */
export function sass(message) {
  const remark = SPECIFIC.find(([pattern]) => pattern.test(message))?.[1] ?? pick(GENERIC, message);
  const ending = /[.!?]$/.test(message) ? "" : ".";
  return `${message}${ending} ${remark}`;
}
