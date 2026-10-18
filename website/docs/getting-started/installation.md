---
title: Installation
sidebar_position: 1
description: Get Twist running on your computer. All you need is Node.js.
---

# Installation

Twist has **no dependencies**. All you need is Node.js.

## 1. Install Node.js

Twist needs **Node.js 18 or newer**. Download the LTS installer from
[nodejs.org](https://nodejs.org) and accept the defaults.

Check it worked by opening a terminal and running:

```bash
node --version
```

You should see a version number like `v24.22.0`.

:::tip Windows: "node is not recognized"?
Close every terminal (and your editor) and open them again. Programs only
pick up a newly installed command when they start. If it still fails,
restart the computer.
:::

## 2. Get Twist

Clone the repository:

```bash
git clone https://github.com/Aideniscool123/Twist.git
cd Twist
```

Or download it as a ZIP from GitHub and unzip it.

## 3. Check everything works

```bash
npm test
```

You'll see a long list of checks, ending with something like:

```text
ℹ tests 287
ℹ pass 287
ℹ fail 0
```

There is nothing to `npm install`. Twist uses only what comes with Node.

## 4. Say hello

```bash
node bin/twist.js run examples/hello.twist
```

```text
Hello, reef!
```

That's it. Next: [write your own first program](./first-program).

## Editors

Twist programs are plain text files ending in `.twist`. Any editor works.

- **IntelliJ IDEA:** go to *Settings → Editor → File Types*, pick *Text*, and
  add `*.twist`, so it stops asking what kind of file it is.
- **VS Code:** it opens `.twist` files as plain text automatically.

For colors and instant error checking, use the
[playground](./the-playground) instead.
