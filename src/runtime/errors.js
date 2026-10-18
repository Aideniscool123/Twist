// Errors a Twist program can run into.

/** A program failed the checker, so it can't run. `errors` is the checker's list. */
export class TwistCheckError extends Error {
  constructor(errors) {
    const first = errors[0];
    const more = errors.length > 1 ? ` (and ${errors.length - 1} more)` : "";
    super(`line ${first.line}: ${first.message}${more}`);
    this.name = "TwistCheckError";
    this.errors = errors;
  }
}

/** Something went wrong while a program was running. `line` is the program line it happened on. */
export class TwistRuntimeError extends Error {
  constructor(message, line) {
    super(line === undefined ? message : `line ${line}: ${message}`);
    this.name = "TwistRuntimeError";
    this.reason = message;
    this.line = line;
  }
}

/** Thrown inside an instruction; the machine turns it into a TwistRuntimeError with the line number. */
export class Oops extends Error {
  constructor(message) {
    super(message);
    this.name = "Oops";
  }
}
