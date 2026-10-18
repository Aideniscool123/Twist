---
title: Adding an instruction
sidebar_position: 7
description: A step-by-step guide to adding your own instruction to Twist.
---

# Adding an instruction

As an example, let's add **`ps5` "Pick Something"**, which copies a random
item out of a list.

## 1. Pick a code that causes maximum confusion

Use two letters that already exist, in a category those letters **don't
have yet**. `ps` already covers output, control, memory and list. `ps5`
picks randomly, so its category is **chaos**, which `ps` doesn't have yet.

If you pick a category the letters already have, the chaos rule test fails.

## 2. Describe it

Add it to the table in `src/language/instructions.js`, next to the other
chaos instructions:

```js
{
  code: "ps5",
  name: "Pick Something",
  category: Category.CHAOS,
  operands: [
    ["into", CELL],
    ["list", CELL],
  ],
  summary: "Copy a random item out of the list into a cell.",
  example: "ps5 #0 #5",
},
```

The checker, `twist list`, `twist explain` and the docs all pick it up from
here.

## 3. Make it do something

Add it to `BEHAVIORS` in `src/runtime/behaviors.js`:

```js
ps5(m, [into, list]) {
  const target = m.cellOf(into);
  const items = m.listIn(list);
  if (items.length === 0) throw new Oops(`${m.who} can't pick anything from ${list.text}, the list is empty`);
  m.write(target, copyValue(items[m.roll(items.length) - 1]));
},
```

Use the [helpers](./behaviors): they check operands at run time, which
matters after a swap. Copy values when storing them, so lists never end up
shared.

## 4. Test it

Add tests in `test/chaos.test.js`:

```js
it("picks something from the list", () => {
  const { machine } = calm('mk1 #5\nps4 #5 "a"\nps4 #5 "b"\nps5 #0 #5');
  assert.ok(["a", "b"].includes(machine.read(0)));
});
```

## 5. Run the tests

```bash
npm test
```

The tests check that every instruction has an example the checker accepts,
and that the chaos rule holds.

## 6. Give it a sass line (optional)

If it has its own error, add a pattern and remark to `SPECIFIC` in
`src/language/sass.js`.

There's no doc page to write: the instruction's page on this site, with a
working demo, is generated from the table on the next build.
