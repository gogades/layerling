/**
 * Patterns: the selection repeated n times in a row or around a circle - hole
 * rows, bolt circles, the teeth of a ring. Pure numbers; the editor turns them
 * into copies.
 *
 * Coordinates as the user sees them, like a slicer: X to the right, Y to the
 * back, Z up. In the scene that is x, -z and y.
 */
export type ArrayMode = "row" | "circle";
export type ArrayDirection = "x" | "y" | "z";

export type ArraySettings = {
  mode: ArrayMode;
  /** Pieces in the pattern, the original included. */
  count: number;
  /** Row: centre to centre, may be negative to run the other way. */
  spacing: number;
  direction: ArrayDirection;
  /** Circle: the angle the pattern spans; 360 closes the ring. */
  angle: number;
  /** Circle centre in user coordinates (X, Y). */
  centerX: number;
  centerY: number;
  /** Circle: turn each copy with the circle, like teeth, or keep it as it is. */
  rotateCopies: boolean;
};

export const ARRAY_MIN_COUNT = 2;
export const ARRAY_MAX_COUNT = 100;

export function clampArrayCount(count: number) {
  if (!Number.isFinite(count)) return ARRAY_MIN_COUNT;
  return Math.min(ARRAY_MAX_COUNT, Math.max(ARRAY_MIN_COUNT, Math.round(count)));
}

/** Scene offset of the copy at `index` (1 = first copy) in a row. */
export function rowOffset(settings: Pick<ArraySettings, "spacing" | "direction">, index: number) {
  const distance = settings.spacing * index;
  if (settings.direction === "x") return { dx: distance, dy: 0, dz: 0 };
  if (settings.direction === "y") return { dx: 0, dy: 0, dz: -distance };
  return { dx: 0, dy: distance, dz: 0 };
}

/**
 * Angle between neighbours on a circle. A full circle shares 360° among all
 * pieces - the last copy must not land on the original; an arc puts the first
 * and last piece on its two ends.
 */
export function circleStepDegrees(count: number, angle: number) {
  const pieces = clampArrayCount(count);
  const full = Math.abs(Math.abs(angle) - 360) < 1e-9 || Math.abs(angle) > 360;
  return full ? 360 / pieces * Math.sign(angle || 1) : angle / (pieces - 1);
}

/**
 * A scene point turned about the vertical axis through the centre (given in
 * user coordinates). Positive angles run counter-clockwise seen from above.
 */
export function rotateAroundVertical(point: { x: number; z: number }, center: { x: number; y: number }, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  // In user coordinates X = x and Y = -z; turn there, then go back.
  const relX = point.x - center.x;
  const relY = -point.z - center.y;
  const nextX = relX * cos - relY * sin;
  const nextY = relX * sin + relY * cos;
  return { x: center.x + nextX, z: -(center.y + nextY) };
}
