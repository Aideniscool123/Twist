import { readSync } from "node:fs";

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

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
