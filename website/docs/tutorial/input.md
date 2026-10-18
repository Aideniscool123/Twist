---
title: 6. Input
sidebar_position: 6
description: Reading numbers and text from the user.
---

# 6. Input

| Code | Name | Reads |
| --- | --- | --- |
| `ad2` | Ask Directly | a number |
| `rd3` | Read Dialogue | a line of text |

```twist
ps1 "What's your name?"
rd3 #0
ps1 "How old are you?"
ad2 #1
ad1 #1 1
ps3 #2 "Hi "
jn2 #2 #0
jn2 #2 "! Next year you'll be "
jn2 #2 #1
ad3 #2
```

Typed in: `Aiden`, `14`

```text
What's your name?
How old are you?
Hi Aiden! Next year you'll be 15
```

(`jn2`, **Join Neatly**, sticks things onto the end of text. It's in the
[next chapter](./text).)

## Where input comes from

- **In a terminal**, Twist waits for you to type a line and press Enter.
- **In the playground**, put the lines in the **Input** box, one per read.
- **Piped in**: `echo 42 | node bin/twist.js run echo.twist`.

## When input goes wrong

`ad2` wants a number, and Twist checks:

```twist
ad2 #0
```

Typed in: `twelve`

```text
line 1: ad2 asked for a number, but got "twelve". That is not a number and you know it.
```

And if there's nothing left to read:

```text
line 1: rd3 asked for a line of text, but there's no input left. I can't read minds. Yet.
```

## Try it

Ask for two numbers and print their sum.
