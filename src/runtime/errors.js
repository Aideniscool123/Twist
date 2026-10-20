export class TwistCheckError extends Error {
  constructor(errors) {
    const first = errors[0];
    const more = errors.length > 1 ? ` (and ${errors.length - 1} more)` : "";
    super(`line ${first.line}: ${first.message}${more}`);
    this.name = "TwistCheckError";
    this.errors = errors;
  }
}

export class TwistRuntimeError extends Error {
  constructor(message, line) {
    super(line === undefined ? message : `line ${line}: ${message}`);
    this.name = "TwistRuntimeError";
    this.reason = message;
    this.line = line;
  }
}

export class Oops extends Error {
  constructor(message) {
    super(message);
    this.name = "Oops";
  }
}
