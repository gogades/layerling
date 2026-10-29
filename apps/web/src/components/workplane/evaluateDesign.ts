import { propertyUsesLengthUnit, shapeNumberFields, type RangePropertyConfig } from "@/components/workplane/ShapeInspector";
import { SELF_VARIABLE_NAME, type DesignVariable } from "@/lib/designVariables";
import { withFieldFormula } from "@/lib/fieldFormulas";
import { evaluateFormula, formulaReferences, renameReference, shiftFormula, type FormulaError } from "@/lib/formula";
import { t } from "@/lib/i18n";
import { displayToMillimeters, evaluateArithmetic, millimetersToDisplay } from "@/lib/measurementUnits";
import { shapeWithParametricSource } from "@/lib/workplaneShapes";
import type { WorkplaneShape, WorkplaneWorkspaceSettings } from "@/types/layerling";

/*
 * The advanced mode's recalculation: every formula of the design - the variables table's and the bodies' fields' -
 * worked out in the order they depend on each other. Fields are read and set through shapeNumberFields, so a value
 * means here what it means in the Properties panel: same field, same unit, same limits, same linked values.
 * See the design doc "Advanced mode and variables".
 */

const GROUPED_PATHS: Record<string, string> = {
  positionX: "position.x", positionY: "position.y", positionZ: "position.z",
  rotateX: "rotation.x", rotateY: "rotation.y", rotateZ: "rotation.z",
  pivotX: "pivot.x", pivotY: "pivot.y", pivotZ: "pivot.z",
  width: "size.width", length: "size.length", height: "size.height", diameter: "size.diameter",
};

/** The name a formula reads a field by after `$name.`: `size.width`, `position.x`, or the field's own id (`teeth`). */
export function attributePath(fieldId: string) {
  return GROUPED_PATHS[fieldId] ?? fieldId;
}

/** Beside the formula's own errors: a loop, a field the body no longer has, a locked body, two formulas fighting over one value. */
export type DesignFormulaError = FormulaError | { kind: "cycle" } | { kind: "field" } | { kind: "locked" } | { kind: "conflict" };

export type DesignEvaluation = {
  /** What changed on each body, by id, as the inspector would have handed it over. */
  patches: Map<string, Partial<WorkplaneShape>>;
  /** The table with each row's value worked out again. */
  variables: DesignVariable[];
  /** What failed, by `variable:<name in lower case>` or `<body id>/<field id>`; those keep their last value. */
  errors: Map<string, DesignFormulaError>;
};

/** The key of a table row in the order and in `errors`. */
export function variableKey(name: string) {
  return `variable:${name.toLowerCase()}`;
}

const MAX_PASSES = 4;

/** A field's value as the Properties panel shows it: in the editor's unit for a length. */
function shownValue(field: RangePropertyConfig, workspace: WorkplaneWorkspaceSettings) {
  return propertyUsesLengthUnit(field.id) ? millimetersToDisplay(field.value, workspace) : field.value;
}

/**
 * Whether a field's formula is the advanced mode's (names or functions). Plain arithmetic (#180) is a remembered
 * calculation, not a formula to keep true: a drag may have left it behind, and it never moves anything.
 */
export function isDesignFormula(text: string | undefined): text is string {
  return Boolean(text) && !Number.isFinite(evaluateArithmetic(text as string));
}

/** Whether a design has anything of the advanced mode: a variables table, a variable name or a formula. */
export function designUsesFormulas(shapes: WorkplaneShape[], variables: DesignVariable[]) {
  return variables.length > 0 || shapes.some((shape) => shape.variableName || Object.values(shape.formulas ?? {}).some(isDesignFormula));
}

function sameValue(a: number, b: number) {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
}

/** The part of `patch` that changes `shape`, or null when none does. */
function changedFields(shape: WorkplaneShape, patch: Partial<WorkplaneShape> | null): Partial<WorkplaneShape> | null {
  if (!patch) return null;
  const changed = Object.entries(patch).filter(([key, value]) => JSON.stringify(shape[key as keyof WorkplaneShape]) !== JSON.stringify(value));
  return changed.length ? Object.fromEntries(changed) : null;
}

type FormulaNode = { formula: string; row?: DesignVariable; shapeId?: string; fieldId?: string };

/**
 * The design as formulas see it: the table's rows, the named bodies, each body's fields as the inspector shows them,
 * and what a reference reads. `working` is the design being worked out; setField changes a field the way typing would.
 */
function designScope(shapes: WorkplaneShape[], variables: DesignVariable[], workspace: WorkplaneWorkspaceSettings) {
  const working = new Map(shapes.map((shape) => [shape.id, shape]));
  const rows = variables.map((row) => ({ ...row }));
  const rowByName = new Map(rows.map((row) => [row.name.toLowerCase(), row]));
  const shapeByName = new Map<string, string>();
  for (const shape of shapes) {
    const name = shape.variableName?.toLowerCase();
    if (name && !shapeByName.has(name)) shapeByName.set(name, shape.id);
  }

  // A field's onChange hands its patch here; the field list is built again only for a body that changed.
  let captured: Partial<WorkplaneShape> | null = null;
  const capture = (patch: Partial<WorkplaneShape>) => {
    captured = patch;
  };
  const fieldCache = new Map<string, { shape: WorkplaneShape; fields: RangePropertyConfig[] }>();
  const fieldsOf = (shapeId: string) => {
    const shape = working.get(shapeId) as WorkplaneShape;
    const cached = fieldCache.get(shapeId);
    if (cached?.shape === shape) return cached.fields;
    const fields = shapeNumberFields(shapeWithParametricSource(shape), capture, workspace);
    fieldCache.set(shapeId, { shape, fields });
    return fields;
  };

  /** What a reference in a formula of `ownerId` (none for the table) points at: a row's key, or a body's field. */
  const resolve = (reference: string, ownerId?: string): { key: string; field?: RangePropertyConfig } | null => {
    const [name, ...rest] = reference.toLowerCase().split(".");
    if (!rest.length) return rowByName.has(name) ? { key: variableKey(name) } : null;
    const shapeId = name === SELF_VARIABLE_NAME ? ownerId : shapeByName.get(name);
    const path = rest.join(".");
    const field = shapeId ? fieldsOf(shapeId).find((candidate) => attributePath(candidate.id).toLowerCase() === path) : undefined;
    return field ? { key: `${shapeId}/${field.id}`, field } : null;
  };
  const reader = (ownerId?: string) => (reference: string) => {
    const target = resolve(reference, ownerId);
    if (!target) return undefined;
    return target.field ? shownValue(target.field, workspace) : rowByName.get(reference.toLowerCase())?.value;
  };
  const setField = (field: RangePropertyConfig, value: number) => {
    captured = null;
    field.onChange(Math.max(field.min, propertyUsesLengthUnit(field.id) ? displayToMillimeters(value, workspace) : value));
    // onChange set it through `capture`; TypeScript cannot see that and still thinks it null.
    return captured as Partial<WorkplaneShape> | null;
  };
  return { working, rows, fieldsOf, resolve, reader, setField };
}

// shortcut: only the design's top-level bodies take part; parts inside closed groups come with group editing.
export function evaluateDesign(shapes: WorkplaneShape[], variables: DesignVariable[], workspace: WorkplaneWorkspaceSettings): DesignEvaluation {
  const { working, rows, fieldsOf, resolve, reader, setField } = designScope(shapes, variables, workspace);
  const shown = (field: RangePropertyConfig) => shownValue(field, workspace);

  const nodes = new Map<string, FormulaNode>();
  for (const row of rows) if (row.formula.trim()) nodes.set(variableKey(row.name), { formula: row.formula, row });
  for (const shape of shapes) {
    for (const [fieldId, formula] of Object.entries(shape.formulas ?? {})) {
      if (isDesignFormula(formula)) nodes.set(`${shape.id}/${fieldId}`, { formula, shapeId: shape.id, fieldId });
    }
  }

  // Dependency order (Kahn): a node is worked out once every formula it reads is. What is left over is a loop.
  const waiting = new Map<string, Set<string>>();
  const readers = new Map<string, string[]>();
  for (const [key, node] of nodes) {
    const reads = new Set(formulaReferences(node.formula).map((reference) => resolve(reference, node.shapeId)?.key).filter((dependency): dependency is string => Boolean(dependency && nodes.has(dependency))));
    waiting.set(key, reads);
    for (const dependency of reads) readers.set(dependency, [...(readers.get(dependency) ?? []), key]);
  }
  const order = [...waiting].filter(([, reads]) => reads.size === 0).map(([key]) => key);
  for (let index = 0; index < order.length; index += 1) {
    for (const reader of readers.get(order[index]) ?? []) {
      const reads = waiting.get(reader) as Set<string>;
      reads.delete(order[index]);
      if (reads.size === 0) order.push(reader);
    }
  }
  const errors = new Map<string, DesignFormulaError>();
  const ordered = new Set(order);
  for (const key of nodes.keys()) if (!ordered.has(key)) errors.set(key, { kind: "cycle" });

  // Setting one field can move another of the same body (a turn about a pivot moves its position), so the ordered
  // pass runs again while it still changes something. A field still changing in the last pass is fighting another.
  const patches = new Map<string, Partial<WorkplaneShape>>();
  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    let changed = false;
    for (const key of order) {
      errors.delete(key);
      const node = nodes.get(key) as FormulaNode;
      const result = evaluateFormula(node.formula, reader(node.shapeId));
      if (!result.ok) {
        errors.set(key, result.error);
        continue;
      }
      if (node.row) {
        node.row.value = result.value;
        continue;
      }
      const shapeId = node.shapeId as string;
      const shape = working.get(shapeId) as WorkplaneShape;
      const field = fieldsOf(shapeId).find((candidate) => candidate.id === node.fieldId);
      if (!field) {
        errors.set(key, { kind: "field" });
        continue;
      }
      if (sameValue(shown(field), result.value)) continue;
      // A locked body holds still, as it does for every other change; the field says why.
      if (shape.locked) {
        errors.set(key, { kind: "locked" });
        continue;
      }
      const patch = changedFields(shape, setField(field, result.value));
      // A value held at the field's limit gives the same patch every time: nothing to do.
      if (!patch) continue;
      changed = true;
      if (pass === MAX_PASSES - 1) errors.set(key, { kind: "conflict" });
      working.set(shapeId, { ...shape, ...patch });
      patches.set(shapeId, { ...patches.get(shapeId), ...patch });
    }
    if (!changed) break;
  }
  // Fields that went round and came back where they started are no change.
  for (const [shapeId, patch] of patches) {
    const left = changedFields(shapes.find((shape) => shape.id === shapeId) as WorkplaneShape, patch);
    if (left) patches.set(shapeId, left);
    else patches.delete(shapeId);
  }
  return { patches, variables: rows, errors };
}

/**
 * The bodies after an edit that did not type the formula itself (a drag, a nudge, an alignment, a linked field). Outside the
 * advanced mode a field whose value the edit moved loses its formula. In it, such a field keeps its formula when the formula
 * still gives the new value (a body moved together with the one it follows), and otherwise gets the difference written on:
 * `$a * 2` becomes `$a * 2 + 5`. The same array when nothing changes.
 */
export function formulasAfterEdit(before: WorkplaneShape[], after: WorkplaneShape[], variables: DesignVariable[], workspace: WorkplaneWorkspaceSettings, advanced: boolean): WorkplaneShape[] {
  const previous = new Map(before.map((shape) => [shape.id, shape]));
  const valueIn = (shape: WorkplaneShape, id: string) => {
    const field = shapeNumberFields(shapeWithParametricSource(shape), () => undefined, workspace).find((candidate) => candidate.id === id);
    return field ? shownValue(field, workspace) : Number.NaN;
  };
  // What each formula gives in the edited design, read lazily: most edits move nothing that has one.
  let scope: ReturnType<typeof designScope> | null = null;
  const formulaGives = (shapeId: string, formula: string) => {
    scope ??= designScope(after, variables, workspace);
    const result = evaluateFormula(formula, scope.reader(shapeId));
    return result.ok ? result.value : Number.NaN;
  };
  let changed = false;
  const next = after.map((shape) => {
    const old = previous.get(shape.id);
    if (!old || old === shape) return shape;
    const ids = Object.keys(shape.formulas ?? {}).filter((id) => isDesignFormula(shape.formulas?.[id]) && old.formulas?.[id] === shape.formulas?.[id]);
    let formulas = shape.formulas;
    for (const id of ids) {
      const now = valueIn(shape, id);
      if (!Number.isFinite(now) || sameValue(valueIn(old, id), now)) continue;
      if (!advanced) {
        formulas = withFieldFormula(formulas, id, null);
        continue;
      }
      const gives = formulaGives(shape.id, formulas?.[id] as string);
      if (Number.isFinite(gives) && !sameValue(gives, now)) formulas = withFieldFormula(formulas, id, shiftFormula(formulas?.[id] as string, now - gives));
    }
    if (formulas === shape.formulas) return shape;
    changed = true;
    return { ...shape, formulas };
  });
  return changed ? next : after;
}

/** Every formula of the design with `$from` read as `$to` (any case): a renamed body or row keeps the formulas that use it. */
export function withRenamedReference(shapes: WorkplaneShape[], rows: DesignVariable[], from: string, to: string) {
  const rewrite = (text: string) => renameReference(text, from, to);
  return {
    shapes: shapes.map((shape) => {
      const entries = Object.entries(shape.formulas ?? {});
      const rewritten = entries.map(([id, text]) => [id, rewrite(text)] as const);
      return rewritten.some(([, text], index) => text !== entries[index][1]) ? { ...shape, formulas: Object.fromEntries(rewritten) } : shape;
    }),
    rows: rows.map((row) => {
      const formula = rewrite(row.formula);
      return formula === row.formula ? row : { ...row, formula };
    }),
  };
}

/**
 * The bodies an edit brought in (a paste, a copy, an inserted design) with their variable name taken away where another
 * body or a row already goes by it, in any case; and which names went.
 */
function withoutTakenNames(before: WorkplaneShape[], after: WorkplaneShape[], rows: DesignVariable[]) {
  const existing = new Set(before.map((shape) => shape.id));
  const staying = new Set(after.map((shape) => shape.id));
  // Only bodies still there hold their name: one replaced in the same edit (a cut, a rebuild) hands it on.
  const taken = new Set([...before.filter((shape) => staying.has(shape.id)).map((shape) => shape.variableName?.toLowerCase()), ...rows.map((row) => row.name.toLowerCase())]);
  const blanked: string[] = [];
  const shapes = after.map((shape) => {
    const name = shape.variableName?.toLowerCase();
    if (!name || existing.has(shape.id)) return shape;
    if (!taken.has(name)) {
      taken.add(name);
      return shape;
    }
    blanked.push(shape.variableName as string);
    return { ...shape, variableName: undefined };
  });
  return { shapes: blanked.length ? shapes : after, blanked };
}

export type SettledDesign = { shapes: WorkplaneShape[]; variables: DesignVariable[]; errors: Map<string, DesignFormulaError>; blanked: string[] };

/**
 * An edit of the design, settled: the formulas it moved shifted or dropped (formulasAfterEdit), then in the advanced mode
 * every formula worked out again, each change applied with `apply` the way the inspector applies a typed value.
 * `variables` comes back as the same array when no value of the table changed.
 */
export function designAfterEdit(
  before: WorkplaneShape[],
  after: WorkplaneShape[],
  variables: DesignVariable[],
  workspace: WorkplaneWorkspaceSettings,
  advanced: boolean,
  apply: (shape: WorkplaneShape, patch: Partial<WorkplaneShape>) => WorkplaneShape,
): SettledDesign {
  // Names first: a copy never shares one, and a renamed body takes its formulas' references along.
  const { shapes: named, blanked } = withoutTakenNames(before, after, variables);
  let renamed = { shapes: named, rows: variables };
  const previous = new Map(before.map((shape) => [shape.id, shape]));
  for (const shape of named) {
    const from = previous.get(shape.id)?.variableName;
    if (from && shape.variableName && from !== shape.variableName) renamed = withRenamedReference(renamed.shapes, renamed.rows, from, shape.variableName);
  }
  variables = renamed.rows;
  const edited = formulasAfterEdit(before, renamed.shapes, variables, workspace, advanced);
  if (!advanced) return { shapes: edited, variables, errors: new Map(), blanked };
  const result = evaluateDesign(edited, variables, workspace);
  const shapes = result.patches.size
    ? edited.map((shape) => {
      const patch = result.patches.get(shape.id);
      return patch ? apply(shape, patch) : shape;
    })
    : edited;
  const sameTable = JSON.stringify(result.variables) === JSON.stringify(variables);
  return { shapes, variables: sameTable ? variables : result.variables, errors: result.errors, blanked };
}

/** What a field with a failed formula says when the pointer rests on it. */
export function formulaErrorText(error: DesignFormulaError) {
  switch (error.kind) {
    case "unknown": return t("formula.errorUnknown", { name: `$${error.name}` });
    case "math": return t("formula.errorMath");
    case "cycle": return t("formula.errorCycle");
    case "field": return t("formula.errorField");
    case "locked": return t("formula.errorLocked");
    case "conflict": return t("formula.errorConflict");
    default: return t("formula.errorSyntax");
  }
}
