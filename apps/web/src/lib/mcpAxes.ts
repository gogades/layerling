import { displayY, displayYTurn, insideZ, insideZTurn } from "@/lib/displayAxes";
import { MCP_SETTING_NAMES } from "@/lib/mcpShapeSettings";
import { shapeDepth, shapeWidth } from "@/lib/workplaneShapes";
import type { TextKeyring, WorkplaneShape } from "@/types/layerling";

/*
 * The MCP tools name directions and sizes as the inspector and the formulas do (#182): X to the right, Y towards the
 * back, Z up; width along X, length along Y, height along Z; turns about those same axes. Inside, the editor keeps
 * three.js's x, z towards the viewer and elevation, width and depth, and a turn `rotation` about the vertical. This is
 * where the two meet, so a command's handler keeps reading the names it always read.
 */

type Params = Record<string, unknown>;
type Vector = [number, number, number];

const flipped = (value: unknown) => (typeof value === "number" ? insideZ(value) : value);
const flippedTurn = (value: unknown) => (typeof value === "number" ? insideZTurn(value) : value);

/** A point of the editor as the MCP tools give it. */
export function mcpPoint(point: { x: number; z: number; elevation: number }) {
  return { x: point.x, y: displayY(point.z), z: point.elevation };
}

/** A body's place, size, turns and mirroring as the inspector shows them. */
export function mcpPlacement(shape: WorkplaneShape) {
  return {
    position: mcpPoint({ x: shape.x, z: shape.z, elevation: shape.elevation ?? 0 }),
    dimensions: { width: shapeWidth(shape), length: shapeDepth(shape), height: shape.height, size: shape.size },
    rotation: { x: shape.rotationX ?? 0, y: displayYTurn(shape.rotationZ ?? 0), z: shape.rotation },
    mirror: { x: Boolean(shape.mirrorX), y: Boolean(shape.mirrorZ), z: Boolean(shape.mirrorY) },
  };
}

/**
 * A name tag's key ring hole as the summary reports it: a free one's corner and offsets with y towards the top of the
 * letters, its angle turning from +x towards +y, as layer_text takes it.
 */
export function mcpKeyring(keyring: TextKeyring) {
  if (!keyring.free) return keyring;
  const { az, dz, ...free } = keyring.free;
  return { ...keyring, free: { ...free, ay: -az, dy: displayY(dz), angle: displayYTurn(free.angle) } };
}

/** Two names for one value given together: the tools' earlier name next to the inspector's. */
function refuseBoth(params: Record<string, unknown>, name: string, earlier: string, meaning: string) {
  if (params[name] !== undefined && params[earlier] !== undefined) {
    throw new Error(`Give ${name} or ${earlier}, not both: ${name} is ${meaning}, as the inspector shows it`);
  }
}

/**
 * A command's parameters with the inspector's names (x, y, z; width, length, height; rotationX, rotationY, rotationZ;
 * rotationPivot { x, y, z }; the shape settings of MCP_SETTING_NAMES) turned into the names its handler reads. The names
 * these tools took before stay accepted where they cannot be mistaken: elevation for z, depth for length, rotation for
 * rotationZ, and every setting's own name.
 */
export function mcpParamsIn(params: Record<string, unknown>): Record<string, unknown> {
  refuseBoth(params, "z", "elevation", "the height");
  refuseBoth(params, "length", "depth", "the size from front to back");
  refuseBoth(params, "rotationZ", "rotation", "the turn about the vertical");
  const { y, z, length, rotationY, rotationZ, ...rest } = params;
  const next: Record<string, unknown> = { ...rest };
  if (y !== undefined) next.z = flipped(y);
  if (z !== undefined) next.elevation = z;
  if (length !== undefined) next.depth = length;
  if (rotationY !== undefined) next.rotationZ = flippedTurn(rotationY);
  if (rotationZ !== undefined) next.rotation = rotationZ;
  for (const [own, name] of Object.entries(MCP_SETTING_NAMES)) {
    refuseBoth(params, name, own, "the same setting");
    if (params[name] !== undefined) {
      next[own] = params[name];
      delete next[name];
    }
  }
  const pivot = params.rotationPivot;
  if (pivot && typeof pivot === "object" && "y" in pivot) {
    const { x: pivotX, y: pivotY, z: pivotZ } = pivot as Record<string, unknown>;
    next.rotationPivot = { x: pivotX, z: flipped(pivotY), elevation: pivotZ };
  }
  return next;
}

/** A world vector of the editor ([x, y up, z towards the viewer]) as the inspector names it, [X, Y, Z], and back. */
const vectorOut = ([x, y, z]: Vector): Vector => [x, displayY(z), y];
const vectorIn = ([x, y, z]: Vector): Vector => [x, z, insideZ(y)];
const isVector = (value: unknown): value is Vector => Array.isArray(value) && value.length === 3 && value.every((part) => typeof part === "number");
const isNumbers = (value: unknown): value is number[] => Array.isArray(value) && value.length % 3 === 0 && value.every((part) => typeof part === "number");
const inTriplets = (values: number[], turn: (vector: Vector) => Vector) => values.flatMap((_, index) => (index % 3 ? [] : turn(values.slice(index, index + 3) as Vector)));

/** A point given as the inspector names it, { x, y, z }, as the editor's { x, z, elevation }; one in the editor's names passes. */
function pointIn(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !("y" in value)) return value;
  const { x, y, z, ...rest } = value as Params;
  return { ...rest, x, z: flipped(y), elevation: z };
}

/** An axis as the inspector names it, as the editor names it, and back: Y and Z change places. */
const axisSwap = (axis: unknown) => (axis === "y" ? "z" : axis === "z" ? "y" : axis);

/**
 * A plane's axis, offset and side, as the section view takes them, from the inspector's names: an offset along Y runs
 * the other way inside, and so does the side kept, so "the side with the greater coordinate stays" holds for X, Y and Z.
 * Without an axis the section view's own counts, from `currentAxis` (the editor's name).
 */
function sectionIn(params: Params, currentAxis: () => string | undefined) {
  const axis = typeof params.axis === "string" ? params.axis.toLowerCase() : undefined;
  const alongY = axis ? axis === "y" : currentAxis() === "z";
  return {
    ...params,
    ...(axis ? { axis: axisSwap(axis) } : {}),
    ...(alongY && typeof params.offset === "number" ? { offset: insideZ(params.offset) } : {}),
    ...(alongY && typeof params.flipped === "boolean" ? { flipped: !params.flipped } : {}),
  };
}

/** The same, the other way: a plane the editor names, as the inspector names it. */
function sectionOut<T extends Params>(section: T): T {
  if (section.axis !== "y" && section.axis !== "z") return section;
  if (section.axis === "y") return { ...section, axis: "z" };
  return {
    ...section,
    axis: "y",
    ...(typeof section.offset === "number" ? { offset: displayY(section.offset) } : {}),
    ...(typeof section.flipped === "boolean" ? { flipped: !section.flipped } : {}),
  };
}

/** A range along an axis the editor names `axis` ({ min, max, center }), as it reads along the inspector's axis. */
function rangeOut<T extends Params>(range: T, axis: unknown): T {
  if (axis !== "z" || typeof range.min !== "number" || typeof range.max !== "number") return range;
  return { ...range, min: displayY(range.max), max: displayY(range.min), ...(typeof range.center === "number" ? { center: displayY(range.center) } : {}) };
}

export type McpAxesContext = { sectionAxis: () => string | undefined };

/**
 * A command's parameters with the inspector's names turned into the names its handler reads: places and sizes (see
 * mcpParamsIn), points ({ x, y, z } and [x, y, z]), normals, paths, and axes named x, y, z with Y towards the back.
 */
export function mcpCommandParamsIn(action: string, params: Params, context: McpAxesContext): Params {
  switch (action) {
    case "create_shape": case "update_object": case "insert_custom_shape": case "reference_image": case "create_sbc_board":
      return mcpParamsIn(params);
    case "import_mesh":
      return {
        ...mcpParamsIn(params),
        ...(isNumbers(params.positions) ? { positions: inTriplets(params.positions, vectorIn) } : {}),
        ...(isNumbers(params.normals) ? { normals: inTriplets(params.normals, vectorIn) } : {}),
      };
    case "lay_flat": case "place_on_face": case "perforate_face": case "push_face":
      return {
        ...params,
        ...(isVector(params.point) ? { point: vectorIn(params.point) } : {}),
        ...(isVector(params.normal) ? { normal: vectorIn(params.normal) } : {}),
      };
    case "mate_faces":
      return { ...params, facePoint: pointIn(params.facePoint), targetFacePoint: pointIn(params.targetFacePoint) };
    case "add_reference_points":
      return Array.isArray(params.points) ? { ...params, points: params.points.map(pointIn) } : params;
    case "add_note":
      return params.at ? { ...params, at: pointIn(params.at) } : params;
    case "sweep_sketch":
      return Array.isArray(params.path)
        ? { ...params, path: params.path.map((point) => (Array.isArray(point) && point.length === 2 ? [point[0], flipped(point[1])] : point && typeof point === "object" && "y" in point ? { x: (point as Params).x, z: flipped((point as Params).y) } : point)) }
        : params;
    case "align_objects": {
      // The far end along Y is the near one along the editor's z.
      const alongY = params.axis === "y";
      return { ...params, axis: axisSwap(params.axis), ...(alongY ? { target: params.target === "min" ? "max" : params.target === "max" ? "min" : params.target } : {}) };
    }
    case "set_section_view": case "export_section_svg": case "sketch_from_section":
      return sectionIn(params, context.sectionAxis);
    case "measure_section":
      return { ...sectionIn(params, context.sectionAxis), from: pointIn(params.from), to: pointIn(params.to) };
    case "split_objects": {
      // The split already names its axes as the inspector does; its Y runs towards the back now, as the split panel's.
      const alongY = params.alongWorkplane === undefined && typeof params.axis === "string" && params.axis.toLowerCase() === "y";
      return {
        ...params,
        ...(typeof params.rotationY === "number" ? { rotationY: flippedTurn(params.rotationY) } : {}),
        ...(alongY && typeof params.position === "number" ? { position: flipped(params.position) } : {}),
      };
    }
    case "layer_text": case "layer_icon": {
      const keyring = params.keyring as Params | undefined;
      if (!keyring || typeof keyring !== "object" || keyring.side !== "free" || !("y" in keyring)) return params;
      // On the tag seen from above, y runs towards the top of the letters and the angle turns from +x towards +y.
      const { y, ...rest } = keyring;
      return { ...params, keyring: { ...rest, z: flipped(y), ...(typeof keyring.angle === "number" ? { angle: flippedTurn(keyring.angle) } : {}) } };
    }
    default:
      return params;
  }
}

// Object summaries are already in the inspector's names (mcpPlacement); the scene's settings stay as they are stored.
const KEEP_KEYS = new Set(["object", "objects", "parts", "shapes", "workspace", "rawShapes", "children", "svg"]);
const VECTOR_KEYS = new Set(["point", "normal", "center", "origin", "direction"]);

/** Points and vectors anywhere in an answer, as the inspector names them. */
function pointsOut(value: unknown, key?: string): unknown {
  if (Array.isArray(value)) {
    if (key && VECTOR_KEYS.has(key) && isVector(value)) return vectorOut(value);
    if (key === "points" && value.length && isNumbers(value)) return inTriplets(value, vectorOut);
    return value.map((entry) => pointsOut(entry));
  }
  if (!value || typeof value !== "object") return value;
  const record = value as Params;
  if (typeof record.x === "number" && typeof record.z === "number" && typeof record.elevation === "number" && !("y" in record)) {
    const { elevation, ...rest } = record;
    return { ...rest, x: record.x, y: displayY(record.z), z: elevation };
  }
  if (key && VECTOR_KEYS.has(key) && typeof record.x === "number" && typeof record.y === "number" && typeof record.z === "number") {
    const [x, y, z] = vectorOut([record.x, record.y, record.z]);
    return { ...record, x, y, z };
  }
  return Object.fromEntries(Object.entries(record).map(([name, entry]) => [name, KEEP_KEYS.has(name) ? entry : pointsOut(entry, name)]));
}

/** A section frame of the editor's ({ origin, xAxis, yAxis, zAxis }) with its axes as the inspector names them. */
function frameOut(frame: unknown) {
  if (!frame || typeof frame !== "object") return frame;
  const { origin, xAxis, yAxis, zAxis } = frame as Record<string, { x: number; y: number; z: number }>;
  const out = (vector: { x: number; y: number; z: number }, sign = 1) => {
    const [x, y, z] = vectorOut([vector.x * sign, vector.y * sign, vector.z * sign]);
    return { x, y, z };
  };
  return { origin: out(origin), xAxis: out(xAxis), yAxis: out(zAxis, -1), zAxis: out(yAxis) };
}

/** A command's answer with its points, vectors, axes and planes as the inspector names them; `params` as they were sent. */
export function mcpAnswerOut(action: string, answer: unknown, params: Params): unknown {
  if (!answer || typeof answer !== "object") return answer;
  const result = answer as Params;
  switch (action) {
    case "get_scene":
      return { ...result, workplane: pointsOut(result.workplane) };
    case "set_section_view": {
      const settings = result.settings as Params;
      return { ...result, settings: { ...sectionOut(settings), frame: frameOut(settings.frame) }, bounds: rangeOut(result.bounds as Params, settings.axis) };
    }
    case "export_section_svg": case "sketch_from_section":
      return sectionOut(result);
    case "measure_section": {
      const { deltaZ, deltaElevation, ...rest } = pointsOut(sectionOut(result)) as Params;
      return { ...rest, deltaY: typeof deltaZ === "number" ? displayY(deltaZ) : deltaZ, deltaZ: deltaElevation };
    }
    case "split_objects": {
      // Laid along the workplane, the plane's numbers are the workplane's own, as they were asked for.
      const alongY = result.axis === "y" && params.alongWorkplane === undefined;
      const range = alongY ? rangeOut({ min: result.min, max: result.max }, "z") : {};
      return {
        ...result,
        ...range,
        ...(alongY && typeof result.position === "number" ? { position: displayY(result.position) } : {}),
        ...(typeof result.rotationY === "number" ? { rotationY: displayYTurn(result.rotationY) } : {}),
      };
    }
    case "lay_flat": case "place_on_face": case "perforate_face": case "push_face": case "mate_faces": case "list_faces": case "list_edges":
    case "add_reference_points": case "list_reference_points": case "set_workplane": case "list_notes": case "add_note": case "update_note":
      return pointsOut(result);
    default:
      return answer;
  }
}
