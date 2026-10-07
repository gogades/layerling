import type { WorkplaneNote } from "@/types/layerling";

export type ReferenceBox = { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number };
export type ReferencePointSpot = "center" | "corners" | "midpoints";
export type ReferencePosition = { x: number; y: number; z: number };

/** Points closer than this to an existing one count as the same point. */
export const REFERENCE_POINT_TOLERANCE = 0.001;

/**
 * Where the marks go on the top face of an axis-parallel box: its centre, its
 * four corners or the middles of its four edges. They sit on the top face -
 * what a hole or a part is placed on - and are named in the world's axes
 * (y is the height).
 */
export function referencePointsForBox(box: ReferenceBox, spot: ReferencePointSpot): ReferencePosition[] {
  const y = box.maxY;
  const midX = (box.minX + box.maxX) / 2;
  const midZ = (box.minZ + box.maxZ) / 2;
  if (spot === "center") return [{ x: midX, y, z: midZ }];
  if (spot === "corners") {
    return [
      { x: box.minX, y, z: box.minZ },
      { x: box.maxX, y, z: box.minZ },
      { x: box.maxX, y, z: box.maxZ },
      { x: box.minX, y, z: box.maxZ },
    ];
  }
  return [
    { x: midX, y, z: box.minZ },
    { x: box.maxX, y, z: midZ },
    { x: midX, y, z: box.maxZ },
    { x: box.minX, y, z: midZ },
  ];
}

/** The union of several boxes; null for none. */
export function unionReferenceBoxes(boxes: readonly ReferenceBox[]): ReferenceBox | null {
  if (boxes.length === 0) return null;
  return boxes.reduce((total, box) => ({
    minX: Math.min(total.minX, box.minX),
    maxX: Math.max(total.maxX, box.maxX),
    minY: Math.min(total.minY, box.minY),
    maxY: Math.max(total.maxY, box.maxY),
    minZ: Math.min(total.minZ, box.minZ),
    maxZ: Math.max(total.maxZ, box.maxZ),
  }));
}

/** Rounds away the float noise of a computed position, so a point lands on a clean value. */
export function cleanReferencePosition(position: ReferencePosition): ReferencePosition {
  const clean = (value: number) => {
    const rounded = Math.round(value * 1e4) / 1e4;
    return Object.is(rounded, -0) ? 0 : rounded;
  };
  return { x: clean(position.x), y: clean(position.y), z: clean(position.z) };
}

/** The points of `wanted` that are not already marked, each once. */
export function newReferencePositions(existing: readonly Pick<WorkplaneNote, "x" | "y" | "z" | "kind">[], wanted: readonly ReferencePosition[]): ReferencePosition[] {
  const marked = existing.filter((note) => note.kind === "point");
  const fresh: ReferencePosition[] = [];
  wanted.map(cleanReferencePosition).forEach((position) => {
    const known = (other: ReferencePosition) =>
      Math.abs(other.x - position.x) <= REFERENCE_POINT_TOLERANCE
      && Math.abs(other.y - position.y) <= REFERENCE_POINT_TOLERANCE
      && Math.abs(other.z - position.z) <= REFERENCE_POINT_TOLERANCE;
    if (!marked.some(known) && !fresh.some(known)) fresh.push(position);
  });
  return fresh;
}
