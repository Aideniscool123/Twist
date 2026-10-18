---
title: 3. Math
sidebar_position: 3
description: Adding, subtracting, multiplying, dividing, remainders and rounding.
---

# 3. Math

Math instructions change the number **in a cell**. The second operand is a
**value**: a number you write, or another cell.

| Code | Name | Does |
| --- | --- | --- |
| `ad1` | Add Digits | cell = cell + value |
| `sb1` | Subtract Boldly | cell = cell - value |
| `mu1` | Multiply Up | cell = cell × value |
| `dv1` | Divide Vigorously | cell = cell ÷ value |
| `md1` | Modulo Dance | cell = the remainder of cell ÷ value |
| `rd1` | Round Down | cell = cell rounded down |

```twist
ps3 #0 10
ad1 #0 5
ad3 #0
sb1 #0 3
ad3 #0
mu1 #0 2
ad3 #0
dv1 #0 5
ad3 #0
md1 #0 2
ad3 #0
```

```text
15
12
24
4.8
0.8
```

## Using another cell

```twist
ps3 #0 6
ps3 #1 7
mu1 #0 #1
ad3 #0
```

```text
42
```

## Decimals

Twist numbers can have decimals, and Twist hides the tiny rounding errors
computers make. Most languages would print `0.30000000000000004` here:

```twist
ps3 #0 0.1
ad1 #0 0.2
ad3 #0
```

```text
0.3
```

`rd1` rounds **down**, even for negative numbers:

```twist
ps3 #0 2.9
rd1 #0
ad3 #0
ps3 #0 -2.1
rd1 #0
ad3 #0
```

```text
2
-3
```

## Dividing by zero

In most languages, dividing by zero crashes your program. In Twist it gives
`0`, and Twist **is not amused**:

```twist
ps3 #0 10
dv1 #0 0
ad3 #0
```

```text
0
```

You also get a remark (on stderr): *"dividing by zero? Fine, it's 0 now.
Twist is not amused."* Without `--calm`, it also puts Twist in a very bad
[mood](./mood).

## Math needs numbers

```twist
ps3 #0 "five"
ad1 #0 1
```

```text
line 2: ad1 needs a number, but #0 is the text "five". Math. On that. Really?
```

To turn text like `"5"` into a number, use [`nm1`](./text#number-me).

## Try it

Convert 100 degrees Fahrenheit to Celsius: subtract 32, multiply by 5, then
divide by 9.
