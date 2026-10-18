// Twist values: numbers, text and lists.
//
// Numbers are plain JavaScript numbers, text is a JavaScript string, and a
// list is a JavaScript array of values. These helpers are the only place that
// decides how values print, compare and copy.

export const ValueType = Object.freeze({
  NUMBER: "number",
  TEXT: "text",
  LIST: "list",
});

export function typeOf(value) {
  if (typeof value === "number") return ValueType.NUMBER;
  if (typeof value === "string") return ValueType.TEXT;
  return ValueType.LIST;
}

/** Print a number without floating-point noise: 0.1 + 0.2 prints as 0.3. */
export function formatNumber(value) {
  if (Number.isInteger(value) || !Number.isFinite(value)) return String(value);
  return String(Number(value.toPrecision(12)));
}

/**
 * Turn a value into the text Twist prints for it. Text prints as itself, but
 * text inside a list gets quotes so ["1", 1] doesn't look like [1, 1].
 */
export function formatValue(value, nested = false) {
  switch (typeOf(value)) {
    case ValueType.NUMBER:
      return formatNumber(value);
    case ValueType.TEXT:
      return nested ? JSON.stringify(value) : value;
    default:
      return `[${value.map((item) => formatValue(item, true)).join(", ")}]`;
  }
}

/** Describe a value for an error message: `the number 5`, `the text "hi"`, `a list of 3 things`. */
export function describeValue(value) {
  switch (typeOf(value)) {
    case ValueType.NUMBER:
      return `the number ${formatNumber(value)}`;
    case ValueType.TEXT:
      return value.length > 30 ? `the text ${JSON.stringify(`${value.slice(0, 27)}...`)}` : `the text ${JSON.stringify(value)}`;
    default:
      return value.length === 1 ? "a list of 1 thing" : `a list of ${value.length} things`;
  }
}

/** Empty means 0, "" or an empty list. */
export function isEmpty(value) {
  if (typeof value === "number") return value === 0;
  return value.length === 0;
}

/** Numbers equal numbers, text equals text, and lists are equal item by item. A number never equals text. */
export function valuesEqual(a, b) {
  const type = typeOf(a);
  if (type !== typeOf(b)) return false;
  if (type !== ValueType.LIST) return a === b;
  return a.length === b.length && a.every((item, index) => valuesEqual(item, b[index]));
}

/** Copy a value. Lists are copied all the way down, so the copy never shares anything with the original. */
export function copyValue(value) {
  return Array.isArray(value) ? value.map(copyValue) : value;
}
