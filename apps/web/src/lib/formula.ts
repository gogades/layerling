/**
 * The one reader of calculations in number fields: the arithmetic of #180 (`(140+2)/2`, with `x`, `×`, `÷` and a
 * decimal comma), and in the advanced mode `$` references and a few functions (`$wall * 2`, `sqrt($a)`, `sin(30)`). Read by
 * hand - no eval. Without `references` a name is a mistake, so the normal mode takes exactly the arithmetic it always took.
 * See the design doc "Advanced mode and variables".
 */

/** The value `$box.position.x` stands for, asked as `box.position.x`; undefined when nothing has that name. */
export type FormulaReferences = (reference: string) => number | undefined;

export type FormulaError = { kind: "syntax" } | { kind: "unknown"; name: string } | { kind: "math" };
export type FormulaResult = { ok: true; value: number } | { ok: false; error: FormulaError };

const degrees = Math.PI / 180;
// One argument each: a second would need a separator, and the comma is a decimal point here.
const FUNCTIONS = new Map<string, (value: number) => number>([
  // Halves round away from zero, as in a spreadsheet: round(-2.5) is -3, where Math.round gives -2.
  ["round", (value) => Math.sign(value) * Math.round(Math.abs(value))],
  ["sqrt", Math.sqrt],
  ["sin", (value) => Math.sin(value * degrees)],
  ["cos", (value) => Math.cos(value * degrees)],
]);

const NAME = /^[A-Za-z_][A-Za-z0-9_]*/;
// Spaces between digits are a thousands gap, as #180 always read them: `1 000` is 1000.
const NUMBER = /^(\d+(?:\s+\d+)*\.?\d*|\.\d+)/;

export function evaluateFormula(text: string, references?: FormulaReferences): FormulaResult {
  const source = text.replace(/,/g, ".").replace(/×/g, "*").replace(/÷/g, "/").replace(/[−–]/g, "-");
  let index = 0;
  let error: FormulaError | null = null;
  const fail = (reason: FormulaError) => {
    error ??= reason;
    return Number.NaN;
  };
  const peek = () => {
    while (/\s/.test(source[index] ?? "")) index += 1;
    return source[index];
  };
  const name = () => {
    const match = NAME.exec(source.slice(index));
    if (!match) return null;
    index += match[0].length;
    return match[0];
  };
  const bracketed = () => {
    index += 1;
    const value = sum();
    if (peek() !== ")") return fail({ kind: "syntax" });
    index += 1;
    return value;
  };
  const reference = () => {
    index += 1;
    const parts = [name()];
    while (parts[parts.length - 1] && source[index] === ".") {
      index += 1;
      parts.push(name());
    }
    if (parts.some((part) => !part)) return fail({ kind: "syntax" });
    const path = parts.join(".");
    const value = references?.(path);
    return value === undefined ? fail({ kind: "unknown", name: path }) : value;
  };
  const call = () => {
    const word = name()?.toLowerCase() ?? "";
    if (word === "pi") return Math.PI;
    const run = FUNCTIONS.get(word);
    return run && peek() === "(" ? run(bracketed()) : fail({ kind: "syntax" });
  };
  const factor = (): number => {
    const next = peek();
    if (next === "-") {
      index += 1;
      return -factor();
    }
    if (next === "+") {
      index += 1;
      return factor();
    }
    if (next === "(") return bracketed();
    if (references && next === "$") return reference();
    if (references && NAME.test(next ?? "")) return call();
    const match = NUMBER.exec(source.slice(index));
    if (!match) return fail({ kind: "syntax" });
    index += match[0].length;
    return Number(match[0].replace(/\s/g, ""));
  };
  const product = (): number => {
    let value = factor();
    for (let operator = peek(); operator === "*" || operator === "/" || operator === "x" || operator === "X"; operator = peek()) {
      index += 1;
      const right = factor();
      value = operator === "/" ? value / right : value * right;
    }
    return value;
  };
  const sum = (): number => {
    let value = product();
    for (let operator = peek(); operator === "+" || operator === "-"; operator = peek()) {
      index += 1;
      const right = product();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  };

  if (!source.trim()) return { ok: false, error: { kind: "syntax" } };
  const value = sum();
  if (!error && peek() !== undefined) fail({ kind: "syntax" });
  if (error) return { ok: false, error };
  return Number.isFinite(value) ? { ok: true, value } : { ok: false, error: { kind: "math" } };
}
