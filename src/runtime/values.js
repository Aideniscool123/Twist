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

export function formatNumber(value) {
  if (Number.isInteger(value) || !Number.isFinite(value)) return String(value);
  return String(Number(value.toPrecision(12)));
}

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

export function isEmpty(value) {
  if (typeof value === "number") return value === 0;
  return value.length === 0;
}

export function valuesEqual(a, b) {
  const type = typeOf(a);
  if (type !== typeOf(b)) return false;
  if (type !== ValueType.LIST) return a === b;
  return a.length === b.length && a.every((item, index) => valuesEqual(item, b[index]));
}

export function copyValue(value) {
  return Array.isArray(value) ? value.map(copyValue) : value;
}
