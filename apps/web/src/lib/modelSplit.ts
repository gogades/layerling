import type { AlignAxis, WorkplaneShape } from "@/types/layerling";

/** Degrees about the two axes `splitRotationAxes` names for the split axis, in that order. */
export type SplitRotation = readonly [number, number];

export const NO_SPLIT_ROTATION: SplitRotation = [0, 0];

export type ModelSplitPlane = {
  axis: AlignAxis;
  rotation: SplitRotation;
  normal: [number, number, number];
  origin: [number, number, number];
  position: number;
  min: number;
  max: number;
  size: number;
};

type Point3 = readonly [number, number, number];

// The scene is y-up, but the panel and the AI name the axes as the Position
// card does: X to the right, Y along the depth (the scene's z), Z up (the scene's y).
export const SPLIT_AXIS_DISPLAY_ORDER: readonly AlignAxis[] = ["x", "z", "y"];

export function splitAxisLabel(axis: AlignAxis): "X" | "Y" | "Z" {
  return axis === "x" ? "X" : axis === "y" ? "Z" : "Y";
}

export function splitAxisFromLabel(label: string): AlignAxis | null {
  const value = label.trim().toLowerCase();
  return value === "x" ? "x" : value === "y" ? "z" : value === "z" ? "y" : null;
}

export function splitAxisNormal(axis: AlignAxis): [number, number, number] {
  return axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1];
}

/** The two axes the plane turns about - the two it does not cut across. */
export function splitRotationAxes(axis: AlignAxis): readonly [AlignAxis, AlignAxis] {
  return axis === "x" ? ["z", "y"] : axis === "y" ? ["x", "z"] : ["y", "x"];
}

function rotateAboutAxis(normal: readonly [number, number, number], axis: AlignAxis, degrees: number): [number, number, number] {
  const rotationVector = splitAxisNormal(axis);
  const radians = degrees * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const dot = rotationVector[0] * normal[0] + rotationVector[1] * normal[1] + rotationVector[2] * normal[2];
  const cross: [number, number, number] = [
    rotationVector[1] * normal[2] - rotationVector[2] * normal[1],
    rotationVector[2] * normal[0] - rotationVector[0] * normal[2],
    rotationVector[0] * normal[1] - rotationVector[1] * normal[0],
  ];
  return normal.map((value, index) => {
    const rotated = value * cosine + cross[index] * sine + rotationVector[index] * dot * (1 - cosine);
    return Math.abs(rotated) < 1e-12 ? 0 : rotated;
  }) as [number, number, number];
}

// The second turn is about a fixed axis, applied after the first, so either
// slider alone tilts the plane exactly as its label says.
function rotatedSplitNormal(axis: AlignAxis, rotation: SplitRotation): [number, number, number] {
  const [first, second] = splitRotationAxes(axis);
  return rotateAboutAxis(rotateAboutAxis(splitAxisNormal(axis), first, rotation[0]), second, rotation[1]);
}

function pointProjection(point: Point3, normal: Point3) {
  return point[0] * normal[0] + point[1] * normal[1] + point[2] * normal[2];
}

export function modelSplitPlane(points: readonly Point3[], axis: AlignAxis, requestedPosition?: number, rotation: SplitRotation = NO_SPLIT_ROTATION): ModelSplitPlane | null {
  if (points.length === 0) return null;
  const mins = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  const maxs = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
  points.forEach((point) => {
    point.forEach((value, index) => {
      if (!Number.isFinite(value)) return;
      mins[index] = Math.min(mins[index], value);
      maxs[index] = Math.max(maxs[index], value);
    });
  });
  if (![...mins, ...maxs].every(Number.isFinite)) return null;

  const normal = rotatedSplitNormal(axis, rotation);
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  points.forEach((point) => {
    if (!point.every(Number.isFinite)) return;
    const projection = pointProjection(point, normal);
    min = Math.min(min, projection);
    max = Math.max(max, projection);
  });
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  const midpoint = (min + max) / 2;
  const position = Math.min(max, Math.max(min, Number.isFinite(requestedPosition) ? requestedPosition as number : midpoint));
  const center: [number, number, number] = [
    (mins[0] + maxs[0]) / 2,
    (mins[1] + maxs[1]) / 2,
    (mins[2] + maxs[2]) / 2,
  ];
  const rawOffset = position - pointProjection(center, normal);
  const offset = Math.abs(rawOffset) < 1e-12 ? 0 : rawOffset;
  const origin: [number, number, number] = [
    center[0] + normal[0] * offset,
    center[1] + normal[1] * offset,
    center[2] + normal[2] * offset,
  ];

  return {
    axis,
    rotation,
    normal,
    origin,
    position,
    min,
    max,
    size: Math.max(10, Math.hypot(maxs[0] - mins[0], maxs[1] - mins[1], maxs[2] - mins[2]) * 1.1),
  };
}

export function splitPlaneIntersectsPoints(points: readonly Point3[], normal: Point3, position: number, tolerance = 1e-5) {
  let below = false;
  let above = false;
  for (const point of points) {
    const projection = pointProjection(point, normal);
    below ||= projection < position - tolerance;
    above ||= projection > position + tolerance;
    if (below && above) return true;
  }
  return false;
}

export function splitShapeFromWorldPositions(source: WorkplaneShape, positions: readonly number[], id: string, name: string): WorkplaneShape | null {
  if (positions.length < 9 || positions.length % 9 !== 0 || positions.some((value) => !Number.isFinite(value))) return null;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < positions.length; index += 3) {
    minX = Math.min(minX, positions[index]);
    minY = Math.min(minY, positions[index + 1]);
    minZ = Math.min(minZ, positions[index + 2]);
    maxX = Math.max(maxX, positions[index]);
    maxY = Math.max(maxY, positions[index + 1]);
    maxZ = Math.max(maxZ, positions[index + 2]);
  }
  if (![minX, minY, minZ, maxX, maxY, maxZ].every(Number.isFinite)) return null;

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const width = Math.max(0.01, maxX - minX);
  const height = Math.max(0.01, maxY - minY);
  const depth = Math.max(0.01, maxZ - minZ);
  const localPositions: number[] = [];
  for (let index = 0; index < positions.length; index += 3) {
    localPositions.push(positions[index] - centerX, positions[index + 1] - minY, positions[index + 2] - centerZ);
  }

  return {
    id,
    name,
    kind: "mesh",
    color: source.color,
    x: centerX,
    z: centerZ,
    elevation: minY,
    size: Math.max(width, depth),
    width,
    depth,
    height,
    rotation: 0,
    importedMesh: {
      positions: localPositions,
      baseWidth: width,
      baseDepth: depth,
      baseHeight: height,
      triangleCount: positions.length / 9,
      sourceFormat: "json",
    },
    locked: false,
    hidden: source.hidden,
    // A split hole leaves two holes, so both halves still cut once grouped.
    ...(source.hole ? { hole: true } : {}),
  };
}
