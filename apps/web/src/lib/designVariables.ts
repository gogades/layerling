import { MAX_FIELD_FORMULA_LENGTH } from "@/lib/fieldFormulas";

/**
 * The advanced mode's variables table: named values a formula reads as `$name`. It travels in each history entry
 * next to the notes, so undo, saving and the package format carry it like them. `value` is the last result, kept
 * for a layerling that does not calculate (the simple and normal modes). See the design doc "Advanced mode and variables".
 */
export type DesignVariable = { name: string; formula: string; description?: string; value: number };

/** Letters, digits and `_`, not starting with a digit; what `$name` can stand for. */
export const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,31}$/;
/** What an object's own fields call it, so nothing else can be named that. */
export const SELF_VARIABLE_NAME = "self";
const MAX_DESCRIPTION_LENGTH = 200;

export function isVariableName(name: unknown): name is string {
  return typeof name === "string" && VARIABLE_NAME_PATTERN.test(name) && name.toLowerCase() !== SELF_VARIABLE_NAME;
}

/** The rows that make sense, in order; a row with a bad name, or a name an earlier row has (in any case), is left out. */
export function normalizeDesignVariables(value: unknown): DesignVariable[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const rows: DesignVariable[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object" || !isVariableName(row.name) || seen.has(row.name.toLowerCase())) continue;
    const formula = typeof row.formula === "string" ? row.formula.slice(0, MAX_FIELD_FORMULA_LENGTH) : "";
    const description = typeof row.description === "string" ? row.description.slice(0, MAX_DESCRIPTION_LENGTH) : "";
    seen.add(row.name.toLowerCase());
    rows.push({ name: row.name, formula, ...(description ? { description } : {}), value: Number.isFinite(row.value) ? row.value : 0 });
  }
  return rows;
}
