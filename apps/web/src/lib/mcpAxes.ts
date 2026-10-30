import { displayY, displayYTurn, insideZ, insideZTurn } from "@/lib/displayAxes";
import { shapeDepth, shapeWidth } from "@/lib/workplaneShapes";
import type { WorkplaneShape } from "@/types/layerling";

/*
 * The MCP tools name directions and sizes as the inspector and the formulas do (#182): X to the right, Y towards the
 * back, Z up; width along X, length along Y, height along Z; turns about those same axes. Inside, the editor keeps
 * three.js's x, z towards the viewer and elevation, width and depth, and a turn `rotation` about the vertical. This is
 * where the two meet, so a command's handler keeps reading the names it always read.
 */

/** The commands whose parameters take the inspector's names so far; the rest still take the editor's own (x, z, elevation). */
export const MCP_INSPECTOR_AXES_ACTIONS: ReadonlySet<string> = new Set(["create_shape", "update_object", "import_mesh"]);

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

/** Two names for one value given together: the tools' earlier name next to the inspector's. */
function refuseBoth(params: Record<string, unknown>, name: string, earlier: string, meaning: string) {
  if (params[name] !== undefined && params[earlier] !== undefined) {
    throw new Error(`Give ${name} or ${earlier}, not both: ${name} is ${meaning}, as the inspector shows it`);
  }
}

/**
 * A command's parameters with the inspector's names (x, y, z; width, length, height; rotationX, rotationY, rotationZ;
 * rotationPivot { x, y, z }) turned into the names its handler reads. The names these tools took before stay accepted
 * where they cannot be mistaken: elevation for z, depth for length, rotation for rotationZ.
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
  const pivot = params.rotationPivot;
  if (pivot && typeof pivot === "object" && "y" in pivot) {
    const { x: pivotX, y: pivotY, z: pivotZ } = pivot as Record<string, unknown>;
    next.rotationPivot = { x: pivotX, z: flipped(pivotY), elevation: pivotZ };
  }
  return next;
}
