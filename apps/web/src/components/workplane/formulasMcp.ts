import { evaluateDesign, formulaErrorText, formulaPreview, objectAttributes, variableKey, type DesignFormulaError } from "@/components/workplane/evaluateDesign";
import { isVariableName, type DesignVariable } from "@/lib/designVariables";
import { MAX_FIELD_FORMULA_LENGTH, withFieldFormula } from "@/lib/fieldFormulas";
import { evaluateFormula } from "@/lib/formula";
import { getAdvancedMode, getSimpleMode, setAdvancedMode } from "@/lib/simpleMode";
import type { WorkplaneShape, WorkplaneWorkspaceSettings } from "@/types/layerling";

/*
 * The advanced mode's formulas and variables through MCP: the mode itself, the variables table, a body's variable name
 * and formulas, and the formula editor's live result. A change goes through the editor's own commit, so it is one step
 * of the history and the design is worked out again, exactly as when it is typed. See the design doc "Advanced mode and
 * variables".
 */

export const FORMULA_MCP_ACTIONS = ["advanced_mode", "variables", "object_formulas", "evaluate_formula"] as const;

type FormulasMcpDeps = {
  shapes: () => WorkplaneShape[];
  variables: () => DesignVariable[];
  workspace: () => WorkplaneWorkspaceSettings;
  /** Takes the bodies as the editor's commit does: one step of the history, the formulas worked out again. */
  commit: (next: WorkplaneShape[]) => void;
  /** Takes the variables table as the table window does; a renamed row takes its references along. */
  setTable: (rows: DesignVariable[], rename?: { from: string; to: string }) => void;
};

const errorOf = (error: DesignFormulaError | undefined) => (error ? { error: { kind: error.kind, message: formulaErrorText(error) } } : {});

function modeName() {
  return getSimpleMode() ? "simple" : getAdvancedMode() ? "advanced" : "normal";
}

function requireAdvancedMode() {
  if (!getAdvancedMode()) throw new Error("Formulas and variables need the advanced mode: switch it on with layerling_advanced_mode({ enabled: true })");
}

/** A formula the editor can keep: one that reads (names may still be unknown) and is not too long. */
function checkedFormula(text: unknown, label: string) {
  if (typeof text !== "string" || !text.trim()) throw new Error(`${label} must be a formula or a number as text`);
  const formula = text.trim();
  if (formula.length > MAX_FIELD_FORMULA_LENGTH) throw new Error(`${label} is longer than ${MAX_FIELD_FORMULA_LENGTH} characters`);
  const read = evaluateFormula(formula, () => 1);
  if (!read.ok && read.error.kind === "syntax") throw new Error(`${label} cannot be read: ${formula}`);
  return formula;
}

/** A name for a body or a row: valid, and not already taken by another body or row (in any case). */
function checkedName(name: unknown, deps: FormulasMcpDeps, except: { shapeId?: string; row?: string }) {
  if (!isVariableName(name)) throw new Error(`${JSON.stringify(name)} is not a variable name: letters, digits and _, not starting with a digit, not "self"`);
  const wanted = name.toLowerCase();
  const takenByShape = deps.shapes().some((shape) => shape.id !== except.shapeId && shape.variableName?.toLowerCase() === wanted);
  const takenByRow = deps.variables().some((row) => row.name.toLowerCase() !== except.row?.toLowerCase() && row.name.toLowerCase() === wanted);
  if (takenByShape || takenByRow) throw new Error(`${name} is already used by another object or variable`);
  return name;
}

function tableAnswer(deps: FormulasMcpDeps) {
  const evaluation = evaluateDesign(deps.shapes(), deps.variables(), deps.workspace());
  return {
    mode: modeName(),
    variables: evaluation.variables.map((row) => ({
      name: row.name,
      formula: row.formula,
      ...(row.description ? { description: row.description } : {}),
      value: row.value,
      ...errorOf(evaluation.errors.get(variableKey(row.name))),
    })),
  };
}

function variablesCommand(params: Record<string, unknown>, deps: FormulasMcpDeps) {
  if (params.set === undefined && params.rename === undefined && params.remove === undefined) return tableAnswer(deps);
  requireAdvancedMode();
  let rows = deps.variables().map((row) => ({ ...row }));
  const indexOf = (name: unknown) => rows.findIndex((row) => typeof name === "string" && row.name.toLowerCase() === name.toLowerCase());
  let rename: { from: string; to: string } | undefined;
  if (params.rename !== undefined) {
    const { from, to } = (params.rename ?? {}) as { from?: unknown; to?: unknown };
    const index = indexOf(from);
    if (index < 0) throw new Error(`rename.from: there is no variable ${JSON.stringify(from)}`);
    const name = checkedName(to, deps, { row: rows[index].name });
    rename = { from: rows[index].name, to: name };
    rows[index] = { ...rows[index], name };
  }
  if (params.remove !== undefined) {
    if (!Array.isArray(params.remove)) throw new Error("remove must be a list of variable names");
    for (const name of params.remove) if (indexOf(name) < 0) throw new Error(`remove: there is no variable ${JSON.stringify(name)}`);
    rows = rows.filter((row) => !params.remove || !(params.remove as unknown[]).some((name) => typeof name === "string" && name.toLowerCase() === row.name.toLowerCase()));
  }
  if (params.set !== undefined) {
    if (!Array.isArray(params.set)) throw new Error("set must be a list of { name, formula, description }");
    for (const entry of params.set as Array<{ name?: unknown; formula?: unknown; description?: unknown }>) {
      const index = indexOf(entry?.name);
      const formula = checkedFormula(entry?.formula, `set: the formula of ${String(entry?.name)}`);
      const description = typeof entry?.description === "string" ? entry.description.trim().slice(0, 200) : undefined;
      if (index >= 0) {
        rows[index] = { ...rows[index], formula, ...(description !== undefined ? { description: description || undefined } : {}) };
      } else {
        rows.push({ name: checkedName(entry?.name, deps, {}), formula, ...(description ? { description } : {}), value: 0 });
      }
    }
  }
  deps.setTable(rows, rename);
  return tableAnswer(deps);
}

function objectAnswer(shape: WorkplaneShape, deps: FormulasMcpDeps) {
  const errors = evaluateDesign(deps.shapes(), deps.variables(), deps.workspace()).errors;
  const attributes = objectAttributes(shape, deps.workspace());
  return {
    id: shape.id,
    name: shape.name,
    mode: modeName(),
    ...(shape.variableName ? { variableName: shape.variableName } : {}),
    formulas: attributes
      .filter((attribute) => shape.formulas?.[attribute.id] !== undefined)
      .map((attribute) => ({ field: attribute.field, formula: shape.formulas?.[attribute.id], value: attribute.value, ...errorOf(errors.get(`${shape.id}/${attribute.id}`)) })),
    attributes: attributes.map(({ field, value }) => ({ field, value })),
  };
}

function objectFormulasCommand(params: Record<string, unknown>, deps: FormulasMcpDeps) {
  const id = typeof params.id === "string" ? params.id : "";
  const shape = deps.shapes().find((candidate) => candidate.id === id);
  // shortcut: only bodies on the workplane itself; parts inside a group take formulas once group editing reads them.
  if (!shape) throw new Error(`There is no object ${JSON.stringify(id)} on the workplane (parts inside a group cannot take formulas yet)`);
  if (params.variableName === undefined && params.formulas === undefined) return objectAnswer(shape, deps);
  requireAdvancedMode();
  if (shape.locked) throw new Error("The object is locked; unlock it first");
  let variableName = shape.variableName;
  if (params.variableName !== undefined) variableName = params.variableName === null ? undefined : checkedName(params.variableName, deps, { shapeId: shape.id });
  let formulas = shape.formulas;
  if (params.formulas !== undefined) {
    if (!params.formulas || typeof params.formulas !== "object" || Array.isArray(params.formulas)) throw new Error("formulas must map field names (size.width, position.x...) to a formula, or to null to remove it");
    const attributes = objectAttributes(shape, deps.workspace());
    for (const [field, text] of Object.entries(params.formulas as Record<string, unknown>)) {
      const attribute = attributes.find((candidate) => candidate.field === field.toLowerCase());
      if (!attribute) throw new Error(`The object has no field ${field}; its fields are listed as attributes by layerling_object_formulas`);
      formulas = withFieldFormula(formulas, attribute.id, text === null ? null : checkedFormula(text, `formulas.${field}`));
    }
  }
  deps.commit(deps.shapes().map((candidate) => (candidate.id === shape.id ? { ...candidate, variableName, formulas } : candidate)));
  const after = deps.shapes().find((candidate) => candidate.id === shape.id);
  return after ? objectAnswer(after, deps) : { id };
}

/** The answer to one of FORMULA_MCP_ACTIONS, or undefined for any other action. */
export function formulasMcpCommand(action: string, params: Record<string, unknown>, deps: FormulasMcpDeps) {
  switch (action) {
    case "advanced_mode":
      if (params.enabled !== undefined) {
        if (typeof params.enabled !== "boolean") throw new Error("enabled must be true or false");
        // The simple mode is a lock for children and classes: only the settings window leaves it, with a held press.
        if (getSimpleMode()) throw new Error("The editor is in the simple mode, which only the settings window leaves");
        setAdvancedMode(params.enabled);
      }
      return { mode: modeName() };
    case "variables":
      return variablesCommand(params, deps);
    case "object_formulas":
      return objectFormulasCommand(params, deps);
    case "evaluate_formula": {
      const formula = checkedFormula(params.formula, "formula");
      const ownerId = typeof params.id === "string" ? params.id : undefined;
      if (ownerId && !deps.shapes().some((shape) => shape.id === ownerId)) throw new Error(`There is no object ${JSON.stringify(ownerId)} on the workplane`);
      const result = formulaPreview(deps.shapes(), deps.variables(), deps.workspace(), ownerId, formula);
      return result.ok ? { ok: true, value: result.value } : { ok: false, ...errorOf(result.error) };
    }
    default:
      return undefined;
  }
}
