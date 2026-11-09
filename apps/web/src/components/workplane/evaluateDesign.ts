import { propertyUsesLengthUnit, shapeNumberFields, type RangePropertyConfig } from "@/components/workplane/ShapeInspector";
import { SELF_VARIABLE_NAME, type DesignVariable } from "@/lib/designVariables";
import { restoreGroupedChildren } from "@/lib/editorBooleans";
import { isDesignFormula, withFieldFormula } from "@/lib/fieldFormulas";
import { evaluateFormula, formulaReferences, renameReference, shiftFormula, type FormulaError, type FormulaResult } from "@/lib/formula";
import { t } from "@/lib/i18n";
import { displayToMillimeters, millimetersToDisplay } from "@/lib/measurementUnits";
import { shapeWithParametricSource } from "@/lib/workplaneShapes";
import type { WorkplaneShape, WorkplaneWorkspaceSettings } from "@/types/layerling";

/*
 * The advanced mode's recalculation: every formula of the design - the variables table's and the bodies' fields' -
 * worked out in the order they depend on each other. Fields are read and set through shapeNumberFields, so a value
 * means here what it means in the Properties panel: same field, same unit, same limits, same linked values.
 * See the design doc "Advanced mode and variables".
 */

/**
 * The readable name a formula reads each inspector field by after `$name.`, grouped by what the field belongs to:
 * `size.width`, `rotation.z`, `taper.top_length`, `twist.angle`, `gear.teeth`, `detail.sides`. Every number field gets one
 * (a test checks every shape kind); a field left out falls back to its id in snake case, never to a raw camel-case id.
 */
const ATTRIBUTE_PATHS: Record<string, string> = {
  // Shared by every body
  length: "size.length", width: "size.width", height: "size.height", diameter: "size.diameter",
  positionX: "position.x", positionY: "position.y", positionZ: "position.z",
  rotateX: "rotation.x", rotateY: "rotation.y", rotateZ: "rotation.z",
  pivotX: "pivot.x", pivotY: "pivot.y", pivotZ: "pivot.z",
  // The Taper and Twist cards (a pyramid's flat top uses the taper's top fields)
  topLength: "taper.top_length", topWidth: "taper.top_width", bottomLength: "taper.bottom_length", bottomWidth: "taper.bottom_width",
  extrudeTwist: "twist.angle", extrudeTopOffsetX: "twist.offset_width", extrudeTopOffsetZ: "twist.offset_length",
  // The Slope along and Narrow along cards
  slopeEnd: "slope.end_height", slopeAngle: "slope.angle", slopeCurve: "slope.curve", sideDrop: "slope.sides_lowered", sideCurve: "slope.sides_curve",
  narrowEnd: "narrow.end_width", narrowStart: "narrow.start", narrowCurve: "narrow.curve",
  // How finely a body is drawn
  sides: "detail.sides", steps: "detail.steps", quality: "detail.quality", segments: "detail.segments", loftSegments: "detail.segments",
  roundedBoxQuality: "detail.quality", starQuality: "detail.quality", heartQuality: "detail.quality", crescentQuality: "detail.quality", bentTubeQuality: "detail.quality",
  // Each kind's own settings
  cornerFillet: "round.corner", topBottomFillet: "round.top_bottom",
  topRadius: "cone.top_radius", baseRadius: "cone.base_radius", curvedConeTop: "cone.top_diameter", curvedConeBend: "cone.bend",
  slotSmallEnd: "slot.small_end", slotCentreDistance: "slot.centre_distance",
  torusTube: "torus.tube",
  outerDiameter: "tube.outer_diameter", innerDiameter: "tube.inner_diameter", thickness: "tube.wall",
  loftBottomWidth: "loft.bottom_width", loftBottomDepth: "loft.bottom_length", loftBottomCorner: "loft.bottom_corner",
  loftTopWidth: "loft.top_width", loftTopDepth: "loft.top_length", loftTopCorner: "loft.top_corner",
  loftOffsetX: "loft.offset_width", loftOffsetZ: "loft.offset_length", loftWall: "loft.wall", loftTwist: "loft.twist",
  loftSmooth: "loft.smooth", loftTiltX: "loft.tilt_x", loftTiltZ: "loft.tilt_y",
  loftSectionCount: "loft.sections", loftSectionHeight: "loft.section_height", loftSectionWidth: "loft.section_width", loftSectionDepth: "loft.section_length",
  loftSectionCorner: "loft.section_corner", loftSectionSides: "loft.section_sides", loftSectionOffsetX: "loft.section_offset_width", loftSectionOffsetZ: "loft.section_offset_length",
  bentTubeSize: "bent_tube.size", bentTubeWall: "bent_tube.wall", bentTubeSegmentLength: "bent_tube.segment_length",
  bentTubeBendRadius: "bent_tube.bend_radius", bentTubeBendAngle: "bent_tube.bend_angle", bentTubeRoll: "bent_tube.roll",
  screwHoleShaft: "hole.shaft", screwHoleHeadDepth: "hole.head_depth", screwHoleAngle: "hole.angle",
  teardropTipAngle: "teardrop.tip_angle",
  pitch: "thread.pitch", threadsPerInch: "thread.per_inch", threadLength: "thread.length", threadDepth: "thread.depth",
  threadCoreDiameter: "thread.core_diameter", threadFlankAngle: "thread.flank_angle", clearance: "thread.clearance",
  axialClearance: "thread.axial_clearance", boltClearance: "thread.bolt_clearance", chamfer: "thread.chamfer",
  chamferBottom: "thread.chamfer_bottom", headHeight: "thread.head_height", headChamfer: "thread.head_chamfer",
  headDiameter: "thread.head_diameter", driveSize: "thread.drive_size", driveDepth: "thread.drive_depth",
  collarHeight: "thread.collar_height", collarDiameter: "thread.collar_diameter",
  portCorner: "port.corner", portClearance: "port.clearance",
  turns: "spring.turns", wire: "spring.wire",
  teeth: "gear.teeth", gearModule: "gear.module", gearPressureAngle: "gear.pressure_angle", gearBacklash: "gear.backlash",
  centerHole: "gear.center_hole", gearRim: "gear.rim", toothSize: "gear.tooth_size", toothWidth: "gear.tooth_width", helixAngle: "gear.helix_angle", bevelHelixAngle: "gear.bevel_helix_angle",
  gridfinityUnitsX: "gridfinity.units_across", gridfinityUnitsZ: "gridfinity.units_deep", gridfinityUnitsY: "gridfinity.units_high",
  gridfinityLipChamfer: "gridfinity.lip_chamfer", gridfinityBinCornerRadius: "gridfinity.corner_radius", gridfinityCornerRadius: "gridfinity.corner_radius",
  gridfinityWallThickness: "gridfinity.wall", gridfinityFloorHeight: "gridfinity.floor_height", gridfinityDividerThickness: "gridfinity.divider_thickness",
  gridfinityScoopRadius: "gridfinity.scoop_radius", gridfinityLabelCornerSize: "gridfinity.label_corner_size",
  gridfinityOpeningCornerSize: "gridfinity.opening_corner_size", gridfinityDrawerWidth: "gridfinity.drawer_width", gridfinityDrawerDepth: "gridfinity.drawer_length",
  gridfinityCompartmentColumn: "gridfinity.compartment_column", gridfinityCompartmentRow: "gridfinity.compartment_row",
  gridfinityCompartmentLabelLength: "gridfinity.label_length", gridfinityCompartmentLabelWidth: "gridfinity.label_width",
  knurlCount: "knurl.count", knurlDepth: "knurl.depth", knurlChamfer: "knurl.chamfer", knurlAngle: "knurl.angle",
  hingeKnuckles: "hinge.knuckles", hingeKnuckleWidth: "hinge.knuckle_width", hingePinDiameter: "hinge.pin_diameter",
  hingeLeafThickness: "hinge.leaf_thickness", hingeCornerRadius: "hinge.corner_radius", hingeScrewHoles: "hinge.screw_holes",
  hingeAngle: "hinge.angle", hingeClearance: "hinge.clearance", hingeConeSize: "hinge.cone_size",
  hingeScrewDiameter: "hinge.screw_diameter", hingeScrewSpacing: "hinge.screw_spacing", hingeScrewAcross: "hinge.screws_across",
  dovetailNeckWidth: "dovetail.neck_width", dovetailClearance: "dovetail.clearance",
  starPoints: "star.points", starOuterSize: "star.outer_size", starInnerSize: "star.inner_size", starOuterFillet: "star.outer_fillet", starInnerFillet: "star.inner_fillet",
  heartTipFillet: "heart.tip_fillet",
  crescentThickness: "crescent.thickness", crescentTipFillet: "crescent.tip_fillet",
  honeycombCellSize: "honeycomb.cell_size", honeycombWallThickness: "honeycomb.wall", honeycombFrameWidth: "honeycomb.frame_width",
  letterSize: "text.letter_size", textLineWidth: "text.line_width", textEdgeSize: "text.edge_size", textRadius: "text.radius",
  textSpacing: "text.spacing", bevel: "text.rounding", iconWidth: "text.icon_width", iconTagCount: "text.icon_count",
  sketchLineWidth: "sketch.line_width", startAngle: "sketch.start_angle",
};

const snakeCase = (text: string) => text.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();

// A field the table does not name yet still gets its kind's group from the start of its id: gridfinityPaddingBack reads
// `gridfinity.padding_back`.
const GROUP_PREFIXES = ["bentTube", "crescent", "dovetail", "gear", "gridfinity", "heart", "hinge", "hirth", "honeycomb", "knurl", "loft", "pulley", "rib", "screwBoss", "screwHole", "slot", "sketch", "snapFit", "star", "teardrop", "text", "thread", "torus"];

/** The name a formula reads a field by after `$name.`: see ATTRIBUTE_PATHS. A vase's settings read `vase.floor.rubber_feet`. */
export function attributePath(fieldId: string) {
  const known = ATTRIBUTE_PATHS[fieldId];
  if (known) return known;
  // The vase's settings come by their setting's name, under vase, vaseFloor, vasePrint and vaseParts.
  const vase = /^vase(Floor|Print|Parts)?\.(.+)$/.exec(fieldId);
  if (vase) return ["vase", vase[1] ? snakeCase(vase[1]) : null, snakeCase(vase[2])].filter(Boolean).join(".");
  const prefix = GROUP_PREFIXES.find((start) => fieldId.startsWith(start) && /[A-Z]/.test(fieldId[start.length] ?? ""));
  return prefix ? `${snakeCase(prefix)}.${snakeCase(fieldId.slice(prefix.length).replace(/^./, (first) => first.toLowerCase()))}` : snakeCase(fieldId);
}

/**
 * Each field of a body under every name a formula reads it by: its path, and for a round body, whose one Diameter field
 * is both its width and its length, `size.width` and `size.length` too - so any body's size reads the same way.
 */
function fieldPaths(fields: RangePropertyConfig[]) {
  const paths = fields.map((field) => ({ path: attributePath(field.id), field }));
  const diameter = fields.find((field) => field.id === "diameter");
  if (diameter && !fields.some((field) => field.id === "width" || field.id === "length")) {
    paths.push({ path: "size.width", field: diameter }, { path: "size.length", field: diameter });
  }
  return paths;
}

/** Beside the formula's own errors: a loop, a field the body no longer has, a locked body, two formulas fighting over one value. */
export type DesignFormulaError = FormulaError | { kind: "cycle" } | { kind: "field" } | { kind: "locked" } | { kind: "conflict" };

export type DesignEvaluation = {
  /** What changed on each body of the workplane, by id, as the inspector would have handed it over. */
  patches: Map<string, Partial<WorkplaneShape>>;
  /** What changed on parts inside a group - by the group on the workplane, then by part - which a build of the group applies. */
  groups: Map<string, Map<string, Partial<WorkplaneShape>>>;
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
// A part inside a group comes back from a build of its group with its turn rounded to 2 decimals: closer than this is
// no change, or every build would ask for the next one.
const GROUPED_PART_TOLERANCE = 0.01;

/** A field's value as the Properties panel shows it: in the editor's unit for a length. */
function shownValue(field: RangePropertyConfig, workspace: WorkplaneWorkspaceSettings) {
  return propertyUsesLengthUnit(field.id) ? millimetersToDisplay(field.value, workspace) : field.value;
}

/** Whether a body, or a part inside it at any depth, has a variable name or a formula of the advanced mode. */
function hasFormulas(shape: WorkplaneShape): boolean {
  return Boolean(shape.variableName) || Object.values(shape.formulas ?? {}).some(isDesignFormula) || Boolean(shape.groupedShapes?.some(hasFormulas));
}

/** Whether a design has anything of the advanced mode: a variables table, a variable name or a formula. */
export function designUsesFormulas(shapes: WorkplaneShape[], variables: DesignVariable[]) {
  return variables.length > 0 || shapes.some(hasFormulas);
}

/** `shapes` with `change` made to every body, parts inside groups at any depth too; the same arrays where nothing changes. */
function mapBodies(shapes: WorkplaneShape[], change: (shape: WorkplaneShape) => WorkplaneShape): WorkplaneShape[] {
  let changed = false;
  const next = shapes.map((shape) => {
    const parts = shape.groupedShapes && mapBodies(shape.groupedShapes, change);
    const result = change(parts !== shape.groupedShapes ? { ...shape, groupedShapes: parts } : shape);
    changed ||= result !== shape;
    return result;
  });
  return changed ? next : shapes;
}

/** Whether a body other than `except.shapeId` (parts inside groups too) or a row other than `except.row` goes by `name`, in any case. */
export function designNameTaken(shapes: WorkplaneShape[], rows: DesignVariable[], name: string, except: { shapeId?: string; row?: string } = {}) {
  const wanted = name.toLowerCase();
  const inBody = (shape: WorkplaneShape): boolean => (shape.id !== except.shapeId && shape.variableName?.toLowerCase() === wanted) || Boolean(shape.groupedShapes?.some(inBody));
  return shapes.some(inBody) || rows.some((row) => row.name.toLowerCase() === wanted && row.name.toLowerCase() !== except.row?.toLowerCase());
}

/** A body formulas reach, with the body on the workplane it belongs to and whether a lock holds it. */
type DesignBody = { shape: WorkplaneShape; topId: string; locked: boolean };

/**
 * Every body formulas reach: the design's own, and the parts inside its groups at any depth - where opening the group
 * puts them, under the id they have in the group, as their formulas were typed. Only groups holding a name or a formula
 * are opened.
 */
function designBodies(shapes: WorkplaneShape[]) {
  const bodies: DesignBody[] = [];
  const visit = (shape: WorkplaneShape, topId: string, locked: boolean) => {
    bodies.push({ shape, topId, locked });
    const parts = shape.groupedShapes;
    // shortcut: a group with its own fillets or chamfers stays closed, as a build would lose them; open it with group editing.
    if (!parts?.length || shape.edgeTreatments?.length || !parts.some(hasFormulas)) return;
    restoreGroupedChildren(shape).forEach((part, index) => visit({ ...part, id: parts[index].id }, topId, locked || Boolean(part.locked)));
  };
  for (const shape of shapes) visit(shape, shape.id, Boolean(shape.locked));
  return bodies;
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
  const bodies = designBodies(shapes);
  const working = new Map(bodies.map(({ shape }) => [shape.id, shape]));
  const rows = variables.map((row) => ({ ...row }));
  const rowByName = new Map(rows.map((row) => [row.name.toLowerCase(), row]));
  const shapeByName = new Map<string, string>();
  for (const { shape } of bodies) {
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
    const field = shapeId ? fieldPaths(fieldsOf(shapeId)).find((candidate) => candidate.path.toLowerCase() === path)?.field : undefined;
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
  return { bodies, working, rows, shapeByName, fieldsOf, resolve, reader, setField };
}

export function evaluateDesign(shapes: WorkplaneShape[], variables: DesignVariable[], workspace: WorkplaneWorkspaceSettings): DesignEvaluation {
  const { bodies, working, rows, fieldsOf, resolve, reader, setField } = designScope(shapes, variables, workspace);
  const bodyById = new Map(bodies.map((body) => [body.shape.id, body]));
  const shown = (field: RangePropertyConfig) => shownValue(field, workspace);

  const nodes = new Map<string, FormulaNode>();
  for (const row of rows) if (row.formula.trim()) nodes.set(variableKey(row.name), { formula: row.formula, row });
  for (const { shape } of bodies) {
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
      const body = bodyById.get(shapeId) as DesignBody;
      const field = fieldsOf(shapeId).find((candidate) => candidate.id === node.fieldId);
      if (!field) {
        errors.set(key, { kind: "field" });
        continue;
      }
      if (body.topId === shapeId ? sameValue(shown(field), result.value) : Math.abs(shown(field) - result.value) <= GROUPED_PART_TOLERANCE) continue;
      // A locked body - or a part of a locked group - holds still, as it does for every other change; the field says why.
      if (body.locked) {
        errors.set(key, { kind: "locked" });
        continue;
      }
      const patch = changedFields(shape, setField(field, result.value));
      // A value held at the field's limit gives the same patch every time: nothing to do.
      if (!patch) continue;
      changed = true;
      if (pass === MAX_PASSES - 1) errors.set(key, { kind: "conflict" });
      const next = { ...shape, ...patch };
      working.set(shapeId, next);
      patches.set(shapeId, { ...patches.get(shapeId), ...patch });
      // A group that moved or grew takes its parts along: formulas read them where they now are.
      if (next.groupedShapes?.length) {
        for (const part of designBodies([next]).slice(1)) if (!patches.has(part.shape.id)) working.set(part.shape.id, part.shape);
      }
    }
    if (!changed) break;
  }
  // Fields that went round and came back where they started are no change; a part's change goes to its group's build.
  const groups = new Map<string, Map<string, Partial<WorkplaneShape>>>();
  for (const [shapeId, patch] of patches) {
    const body = bodyById.get(shapeId) as DesignBody;
    const left = changedFields(body.shape, patch);
    if (left && body.topId === shapeId) patches.set(shapeId, left);
    else patches.delete(shapeId);
    if (left && body.topId !== shapeId) groups.set(body.topId, (groups.get(body.topId) ?? new Map()).set(shapeId, left));
  }
  return { patches, groups, variables: rows, errors };
}

/**
 * The bodies after an edit that did not type the formula itself (a drag, a nudge, an alignment, a linked field). Outside the
 * advanced mode a field whose value the edit moved loses its formula. In it, such a field keeps its formula when the formula
 * still gives the new value (a body moved together with the one it follows), and otherwise gets the difference written on:
 * `$a * 2` becomes `$a * 2 + 5`. The same array when nothing changes.
 */
export function formulasAfterEdit(before: WorkplaneShape[], after: WorkplaneShape[], variables: DesignVariable[], workspace: WorkplaneWorkspaceSettings, advanced: boolean): WorkplaneShape[] {
  // Only bodies the edit touched, with the parts inside them: a moved or stretched group moves its parts too.
  const previousTop = new Map(before.map((shape) => [shape.id, shape]));
  const touched = after.filter((shape) => previousTop.has(shape.id) && previousTop.get(shape.id) !== shape);
  if (!touched.length) return after;
  const previous = new Map(designBodies(touched.map((shape) => previousTop.get(shape.id) as WorkplaneShape)).map(({ shape }) => [shape.id, shape]));
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
  const changes = new Map<string, WorkplaneShape["formulas"]>();
  for (const { shape } of designBodies(touched)) {
    const old = previous.get(shape.id);
    if (!old || old === shape) continue;
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
    if (formulas !== shape.formulas) changes.set(shape.id, formulas);
  }
  return changes.size ? mapBodies(after, (shape) => (changes.has(shape.id) ? { ...shape, formulas: changes.get(shape.id) } : shape)) : after;
}

/** Every formula of the design with `$from` read as `$to` (any case): a renamed body or row keeps the formulas that use it. */
export function withRenamedReference(shapes: WorkplaneShape[], rows: DesignVariable[], from: string, to: string) {
  const rewrite = (text: string) => renameReference(text, from, to);
  return {
    shapes: mapBodies(shapes, (shape) => {
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
 * The bodies an edit brought in (a paste, a copy, an inserted design), parts inside them too, with their variable name
 * taken away where another body or a row already goes by it, in any case; and which names went.
 */
function withoutTakenNames(before: WorkplaneShape[], after: WorkplaneShape[], rows: DesignVariable[]) {
  const existing = new Set(before.map((shape) => shape.id));
  const staying = new Set(after.map((shape) => shape.id));
  // Only bodies still there hold their name: one replaced in the same edit (a cut, a rebuild) hands it on.
  const taken = new Set(rows.map((row) => row.name.toLowerCase()));
  mapBodies(before.filter((shape) => staying.has(shape.id)), (shape) => {
    if (shape.variableName) taken.add(shape.variableName.toLowerCase());
    return shape;
  });
  const blanked: string[] = [];
  const shapes = after.map((shape) => (existing.has(shape.id) ? shape : mapBodies([shape], (body) => {
    const name = body.variableName?.toLowerCase();
    if (!name) return body;
    if (!taken.has(name)) {
      taken.add(name);
      return body;
    }
    blanked.push(body.variableName as string);
    return { ...body, variableName: undefined };
  })[0]));
  return { shapes: blanked.length ? shapes : after, blanked };
}

export type SettledDesign = {
  shapes: WorkplaneShape[];
  variables: DesignVariable[];
  errors: Map<string, DesignFormulaError>;
  blanked: string[];
  /** Groups whose parts the formulas changed, still to be built again: see DesignEvaluation.groups. */
  stale: DesignEvaluation["groups"];
};

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
  if (!advanced) return { shapes: edited, variables, errors: new Map(), blanked, stale: new Map() };
  const result = evaluateDesign(edited, variables, workspace);
  const shapes = result.patches.size
    ? edited.map((shape) => {
      const patch = result.patches.get(shape.id);
      return patch ? apply(shape, patch) : shape;
    })
    : edited;
  const sameTable = JSON.stringify(result.variables) === JSON.stringify(variables);
  return { shapes, variables: sameTable ? variables : result.variables, errors: result.errors, blanked, stale: result.groups };
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

/** What a formula typed for a field of `ownerId` (none for the table) gives in the design as it stands: the live result. */
export function formulaPreview(shapes: WorkplaneShape[], variables: DesignVariable[], workspace: WorkplaneWorkspaceSettings, ownerId: string | undefined, text: string): FormulaResult {
  return evaluateFormula(text, designScope(shapes, variables, workspace).reader(ownerId));
}

export type FormulaSuggestion = { label: string; insert: string; detail: string };

const SUGGESTED_FIRST = ["size.", "position.", "rotation.", "pivot."];

/**
 * What can be typed at the end of `before` (the text up to the caret): after `$`, the table's rows, the named bodies and
 * `self`; after `$name.`, that body's fields by the name formulas read them by. `start` is where the typed part begins.
 */
export function formulaSuggestions(shapes: WorkplaneShape[], variables: DesignVariable[], workspace: WorkplaneWorkspaceSettings, ownerId: string | undefined, before: string) {
  const typed = /\$([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]*)*)?$/.exec(before);
  if (!typed) return null;
  const token = typed[1] ?? "";
  const start = before.length - token.length;
  const scope = designScope(shapes, variables, workspace);
  const dot = token.indexOf(".");
  const matching = (items: FormulaSuggestion[], prefix: string) => items.filter((item) => item.insert.toLowerCase().startsWith(prefix.toLowerCase()) && item.insert.toLowerCase() !== prefix.toLowerCase());
  if (dot < 0) {
    const names: FormulaSuggestion[] = [
      ...scope.rows.map((row) => ({ label: `$${row.name}`, insert: row.name, detail: String(Number(row.value.toFixed(4))) })),
      ...scope.bodies.filter(({ shape }) => shape.variableName).map(({ shape }) => ({ label: `$${shape.variableName}`, insert: shape.variableName as string, detail: shape.name })),
      ...(ownerId ? [{ label: `$${SELF_VARIABLE_NAME}`, insert: SELF_VARIABLE_NAME, detail: "" }] : []),
    ];
    return { start, items: matching(names, token) };
  }
  const name = token.slice(0, dot).toLowerCase();
  const shapeId = name === SELF_VARIABLE_NAME ? ownerId : scope.shapeByName.get(name);
  if (!shapeId) return { start, items: [] };
  const prefix = token.slice(0, dot + 1);
  const fields = fieldPaths(scope.fieldsOf(shapeId)).map(({ path, field }) => ({ label: path, insert: `${prefix}${path}`, detail: `${Number(shownValue(field, workspace).toFixed(4))}` }));
  // Size, position, rotation and pivot first, the shape's own settings (taper, twist, teeth...) after them.
  const rank = (path: string) => {
    const group = SUGGESTED_FIRST.findIndex((start) => path.startsWith(start));
    return group < 0 ? SUGGESTED_FIRST.length : group;
  };
  return { start, items: matching(fields, token).sort((a, b) => rank(a.label) - rank(b.label)) };
}

/** Every field of a body by the name formulas read it by, with its id and its value as the inspector shows it. */
export function objectAttributes(shape: WorkplaneShape, workspace: WorkplaneWorkspaceSettings) {
  return fieldPaths(shapeNumberFields(shapeWithParametricSource(shape), () => undefined, workspace))
    .map(({ path, field }) => ({ field: path, id: field.id, value: shownValue(field, workspace) }));
}
