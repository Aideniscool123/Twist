// Public entry point for Twist.

export const NAME = "Twist";
export const VERSION = "0.1.0";
export const TAGLINE = "A single digit, changes the whole meaning";

export * from "./language/syntax.js";
export * from "./language/lexer.js";
export * from "./language/parser.js";
export * from "./language/instructions.js";
export * from "./language/validate.js";
export * from "./runtime/index.js";
