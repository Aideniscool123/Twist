// Read lines from standard input without waiting on promises, so a running
// Twist program can ask for input in the middle of an instruction.

import { readSync } from "node:fs";

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Returns a function that reads the next line from `fd`, or null at the end of input. */
export function createLineReader(fd = 0) {
  const buffer = Buffer.alloc(4096);
  let pending = "";
  let ended = false;

  function fill() {
    for (;;) {
      try {
        const count = readSync(fd, buffer, 0, buffer.length, null);
        if (count === 0) ended = true;
        else pending += buffer.toString("utf8", 0, count);
        return;
      } catch (error) {
        if (error.code === "EAGAIN") {
          sleep(20);
          continue;
        }
        if (error.code === "EOF") {
          ended = true;
          return;
        }
        throw error;
      }
    }
  }

  let first = true;

  return () => {
    while (!pending.includes("\n") && !ended) fill();
    if (first) {
      // PowerShell starts piped text with an invisible byte-order mark
      pending = pending.replace(/^﻿/, "");
      first = false;
    }
    if (pending === "" && ended) return null;
    const end = pending.indexOf("\n");
    const line = end === -1 ? pending : pending.slice(0, end);
    pending = end === -1 ? "" : pending.slice(end + 1);
    return line.replace(/\r$/, "");
  };
}
