import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { Category, INSTRUCTIONS, groupByMnemonic } from "../../src/language/instructions.js";
import { OPERAND_DESCRIPTIONS, OPERAND_EXAMPLES } from "../../src/language/syntax.js";
import { runProgram } from "../../src/runtime/machine.js";
import { EXAMPLES } from "../../playground/examples.js";

const out = (path) => new URL(`../docs/${path}`, import.meta.url);
const write = (path, text) => writeFileSync(out(path), text);
const fresh = (dir, category) => {
  mkdirSync(out(dir), { recursive: true });
  for (const name of readdirSync(out(dir))) rmSync(out(`${dir}/${name}`), { recursive: true, force: true });
  if (category) write(`${dir}/_category_.json`, `${JSON.stringify(category, null, 2)}\n`);
};
const fence = (lang, text) => `\`\`\`${lang}\n${text.replace(/\n$/, "")}\n\`\`\``;
const title = (word) => word[0].toUpperCase() + word.slice(1);
const yaml = (text) => JSON.stringify(text);
const cell = (text) => text.replace(/\|/g, "\\|").replace(/</g, "&lt;").replace(/{/g, "&#123;");

const CATEGORY_BLURBS = {
  output: "Instructions that print things.",
  input: "Instructions that read what the user types.",
  memory: "Instructions that put values in cells, move them around and clear them.",
  math: "Instructions that do arithmetic and comparisons. Most of them change the number in a cell in place.",
  control: "Instructions that decide what runs next: jumps, calls, returns and stopping.",
  text: "Instructions that work on text.",
  list: "Instructions that make and change lists.",
  chaos: "The instructions that make Twist Twist: dice, coins, shuffles, Swap Words, Reverse Vibes and Thank You.",
  misc: "Everything else. (There is exactly one, and it does nothing.)",
};

const DEMOS = {
  ps2: 'ps2 @skip\nps1 "this never prints"\n@skip:\nps1 "jumped over it"',
  jz1: "ps3 #0 3\n@again:\njz1 #0 @done\nad3 #0\nad1 #0 -1\nps2 @again\n@done:\nps1 \"Liftoff!\"",
  jn1: 'ps3 #0 2\nsb1 #0 5\njn1 #0 @oops\nps1 "still positive"\nhl1\n@oops:\nps1 "went below zero"',
  je1: 'rd3 #0\nje1 #0 "quit" @bye\nps1 "staying"\nhl1\n@bye:\nps1 "bye!"',
  cl1: 'cl1 @greet\nps1 "back again"\nhl1\n@greet:\nps1 "hello from the function"\nrt1',
  rt1: 'cl1 @twice\nps1 "done"\nhl1\n@twice:\nps1 "in"\nps1 "in again"\nrt1',
  hl1: 'ps1 "before"\nhl1\nps1 "after (never printed)"',
  hl2: 'hl2\nhl2\nps1 "nothing happened, twice"',
  cl2: 'cl2 @heads\nps1 "tails"\nhl1\n@heads:\nps1 "heads"',
  sw1: 'ps3 #0 "printed by ps1, doing ad3\'s job"\nsw1 ps1 ad3\nps1 #0\nad3 "printed by ad3, doing ps1\'s job"',
  rv1: 'jz1 #0 @start\nps1 "3. and off the top"\nps1 "2. going up"\n@start:\nps3 #0 1\nps1 "1. going down"\nrv1',
  ty1: "ty1\nty1\nmo1",
  sy1: 'sy1 "Loading"\nsy1 "..."\nsy1 " done"',
};

function demo(instruction) {
  const input = { ad2: ["21"], rd3: ["hi there"], je1: ["quit"] }[instruction.code] ?? [];
  if (DEMOS[instruction.code]) return tryRun(DEMOS[instruction.code], input);
  if (instruction.operands.some((operand) => operand.kind === "label")) return null;
  const setup = {
    ad3: 'ps3 #0 "hello"',
    pp1: "mk1 #5\nps4 #5 1\nps4 #5 2",
    gt2: 'mk1 #5\nps4 #5 "a"\nps4 #5 "b"\nps4 #5 "c"',
    st1: "mk1 #5\nps4 #5 1\nps4 #5 2",
    ln1: "mk1 #5\nps4 #5 1\nps4 #5 2\nps4 #5 3",
    ps4: "mk1 #5",
    sh1: "mk1 #5\nps4 #5 1\nps4 #5 2\nps4 #5 3\nps4 #5 4",
    up1: 'ps3 #0 "quiet please"',
    sp1: 'ps3 #0 "one two three"',
    nm1: 'ps3 #0 "42"',
    jn2: 'ps3 #0 "Hello"',
    rd1: "ps3 #0 7.9",
    jz2: "ps3 #0 1\nps3 #1 2",
    sb1: "ps3 #0 10\nps3 #1 3",
    mu1: "ps3 #0 4",
    dv1: "ps3 #0 10",
    md1: "ps3 #0 7",
    eq1: 'ps3 #0 "yes"',
    gt1: "ps3 #0 150",
    ad1: "ps3 #0 10",
    cl3: "ps3 #4 99",
  }[instruction.code];
  const shows = {
    ps4: "ad3 #5",
    pp1: "ad3 #0\nad3 #5",
    gt2: "ad3 #0",
    st1: "ad3 #5",
    ln1: "ad3 #0",
    sh1: "ad3 #5",
    rd3: "ad3 #2",
    ad2: "ad3 #1",
    mo2: "ad3 #9",
    rd2: "ad3 #0",
    cl3: "ad3 #4",
    jz2: "ad3 #0\nad3 #1",
    mk1: "ad3 #5",
    ps3: "ad3 #0",
  }[instruction.code] ?? (["math", "text"].includes(instruction.category) ? "ad3 #0" : "");
  return tryRun([setup, instruction.example, shows].filter(Boolean).join("\n"), input);
}

function tryRun(source, input) {
  try {
    const { output } = runProgram(source, { calm: true, input });
    return output ? { source, output, input } : null;
  } catch (error) {
    throw new Error(`A demo program failed:\n${source}\n${error.message}`);
  }
}

fresh("reference/instructions", { label: "All instructions", position: 3 });
INSTRUCTIONS.forEach((instruction, index) => {
  const siblings = groupByMnemonic().get(instruction.mnemonic).filter((other) => other.code !== instruction.code);
  const usage = [instruction.code, ...instruction.operands.map((operand) => `<${operand.name}>`)].join(" ");
  const operands =
    instruction.operands.length === 0
      ? "None. Just write the code on its own line."
      : [
          "| Operand | Kind | Looks like |",
          "| --- | --- | --- |",
          ...instruction.operands.map(
            (operand) =>
              `| \`${operand.name}\` | ${OPERAND_DESCRIPTIONS[operand.kind]} | ${cell(OPERAND_EXAMPLES[operand.kind])} |`,
          ),
        ].join("\n");
  const run = demo(instruction);

  const parts = [
    "---",
    `title: ${yaml(`${instruction.code}: ${instruction.name}`)}`,
    `sidebar_label: ${yaml(`${instruction.code} ${instruction.name}`)}`,
    `sidebar_position: ${index + 1}`,
    `description: ${yaml(instruction.summary)}`,
    "---",
    "",
    `**Category:** [${instruction.category}](../categories/${instruction.category})`,
    "",
    instruction.summary,
    "",
    "## Usage",
    "",
    fence("text", usage),
    "",
    "## Operands",
    "",
    operands,
    "",
    "## Example",
    "",
    fence("twist", instruction.example),
  ];

  if (run) {
    parts.push("", "### Try it", "", "A complete little program using it:", "", fence("twist", run.source));
    if (run.input.length > 0) parts.push("", `Typed in: ${run.input.map((line) => `\`${line}\``).join(", ")}`);
    parts.push("", "Output (with `--calm`):", "", fence("text", run.output || "(nothing)"));
  }

  if (siblings.length > 0) {
    parts.push(
      "",
      "## Same letters, different jobs",
      "",
      `\`${instruction.code}\` has nothing to do with these, apart from the letters:`,
      "",
      ...siblings.map((other) => `- [\`${other.code}\` ${other.name}](./${other.code}) (${other.category})`),
    );
  }

  write(`reference/instructions/${instruction.code}.md`, `${parts.join("\n")}\n`);
});

fresh("reference/categories", { label: "Categories", position: 2 });
Object.values(Category).forEach((category, index) => {
  const list = INSTRUCTIONS.filter((instruction) => instruction.category === category);
  write(
    `reference/categories/${category}.md`,
    [
      "---",
      `title: ${yaml(`${title(category)} instructions`)}`,
      `sidebar_label: ${yaml(title(category))}`,
      `sidebar_position: ${index + 1}`,
      "---",
      "",
      CATEGORY_BLURBS[category],
      "",
      "| Code | Name | What it does |",
      "| --- | --- | --- |",
      ...list.map(
        (instruction) =>
          `| [\`${instruction.code}\`](../instructions/${instruction.code}) | ${instruction.name} | ${cell(instruction.summary)} |`,
      ),
      "",
    ].join("\n"),
  );
});

fresh("examples");
EXAMPLES.forEach(({ file, title: name, description, input }, index) => {
  const slug = file.replace(/\.twist$/, "");
  const source = readFileSync(new URL(`../../examples/${file}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const { output, notes } = runProgram(source, { calm: true, input: input ?? [] });
  const parts = [
    "---",
    `title: ${yaml(name)}`,
    `sidebar_position: ${index + 1}`,
    `description: ${yaml(description)}`,
    "---",
    "",
    description,
    "",
    fence("twist", source),
    "",
  ];
  if (input) parts.push(`Typed in: ${input.map((line) => `\`${line}\``).join(", ")}`, "");
  parts.push("**Output** (with `--calm`):", "", fence("text", output || "(nothing)"));
  if (notes.length > 0) parts.push("", "**Twist's remarks** (on stderr):", "", fence("text", notes.join("\n")));
  parts.push(
    "",
    "## Run it",
    "",
    fence("bash", `node bin/twist.js run examples/${file}`),
    "",
    `Or [open it in the playground](pathname:///play/playground/#code=${Buffer.from(source).toString("base64url")}).`,
    "",
  );
  write(`examples/${slug}.md`, parts.join("\n"));
});

console.log(
  `Generated ${INSTRUCTIONS.length} instruction pages, ${Object.values(Category).length} category pages and ${EXAMPLES.length} example pages.`,
);
