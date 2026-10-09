import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { CadModifierProfileLoop } from "@/lib/cadModifierTypes";
import { regularPolygonFootprintScale } from "@/lib/regularPolygonFootprint";
import { meshYawDegrees, mirrorSign } from "@/lib/workplaneShapes";
import type { WorkplaneShape } from "@/types/layerling";

/**
 * The transition ("Übergang", a loft, #188): one outline at the bottom, another at the top,
 * joined by a straight-ruled wall - a hose adapter, a square fan onto a round duct, a stand.
 * With a wall thickness it is a tube open at both ends.
 *
 * Both outlines are cut into the same number of pieces at the same angles round their own
 * middles, so piece i at the bottom faces piece i at the top: the exact body (a ruled loft,
 * edge by edge) and the display mesh (sampled piece by piece along the same parameter) are
 * the same surface, and nothing twists.
 */

export type LoftOutline = "round" | "rectangle" | "polygon";
export const LOFT_OUTLINES: readonly LoftOutline[] = ["round", "rectangle", "polygon"];

export const DEFAULT_LOFT = {
  bottomOutline: "rectangle" as LoftOutline,
  topOutline: "round" as LoftOutline,
  bottomWidth: 40,
  bottomDepth: 40,
  topWidth: 30,
  topDepth: 30,
  bottomCorner: 3,
  topCorner: 3,
  bottomSides: 6,
  topSides: 6,
  offsetX: 0,
  offsetZ: 0,
  wall: 0,
  height: 30,
};

export const MIN_LOFT_SIZE = 1;
export const MIN_LOFT_SIDES = 3;
export const MAX_LOFT_SIDES = 24;
/** What a wall leaves at least of the opening, so the inner outline stays a real outline. */
const MIN_LOFT_OPENING = 0.4;

type Point = { x: number; z: number };

/** One end of the transition: an outline of a kind and size, centred on (cx, cz). */
export type LoftSection = {
  outline: LoftOutline;
  width: number;
  depth: number;
  corner: number;
  sides: number;
  cx: number;
  cz: number;
};

/** The values a person sets, in millimetres: the two ends, how far the top is moved, the wall. */
export type LoftMeasures = {
  bottomOutline: LoftOutline;
  topOutline: LoftOutline;
  bottomWidth: number;
  bottomDepth: number;
  topWidth: number;
  topDepth: number;
  bottomCorner: number;
  topCorner: number;
  bottomSides: number;
  topSides: number;
  offsetX: number;
  offsetZ: number;
  wall: number;
};

export type LoftShapeFields = Pick<WorkplaneShape,
  "width" | "depth" | "size" | "height"
  | "loftBottomOutline" | "loftTopOutline" | "loftBottomWidth" | "loftBottomDepth" | "loftTopWidth" | "loftTopDepth"
  | "loftBottomCorner" | "loftTopCorner" | "loftBottomSides" | "loftTopSides" | "loftOffsetX" | "loftOffsetZ" | "loftWall">;

export function normalizeLoftOutline(value: unknown, fallback: LoftOutline = "round"): LoftOutline {
  return value === "round" || value === "rectangle" || value === "polygon" ? value : fallback;
}

const finite = (value: unknown, fallback: number) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);

export function normalizeLoftSides(value: unknown, fallback = DEFAULT_LOFT.bottomSides) {
  return Math.min(MAX_LOFT_SIDES, Math.max(MIN_LOFT_SIDES, Math.round(finite(value, fallback))));
}

/** A corner rounding fits into the smaller half of its rectangle. */
export function normalizeLoftCorner(value: unknown, width: number, depth: number) {
  return Math.min(Math.min(width, depth) / 2, Math.max(0, finite(value, 0)));
}

/** The thickest wall that still leaves both openings. */
export function maxLoftWall(measures: Pick<LoftMeasures, "bottomWidth" | "bottomDepth" | "topWidth" | "topDepth">) {
  return Math.max(0, Math.min(measures.bottomWidth, measures.bottomDepth, measures.topWidth, measures.topDepth) / 2 - MIN_LOFT_OPENING);
}

/** Every value in its range: sizes at least 1 mm, corners inside their rectangle, the wall leaving an opening. */
export function normalizeLoftMeasures(raw: Partial<LoftMeasures>): LoftMeasures {
  const bottomWidth = Math.max(MIN_LOFT_SIZE, finite(raw.bottomWidth, DEFAULT_LOFT.bottomWidth));
  const bottomDepth = Math.max(MIN_LOFT_SIZE, finite(raw.bottomDepth, DEFAULT_LOFT.bottomDepth));
  const topWidth = Math.max(MIN_LOFT_SIZE, finite(raw.topWidth, DEFAULT_LOFT.topWidth));
  const topDepth = Math.max(MIN_LOFT_SIZE, finite(raw.topDepth, DEFAULT_LOFT.topDepth));
  const sizes = { bottomWidth, bottomDepth, topWidth, topDepth };
  return {
    bottomOutline: normalizeLoftOutline(raw.bottomOutline, DEFAULT_LOFT.bottomOutline),
    topOutline: normalizeLoftOutline(raw.topOutline, DEFAULT_LOFT.topOutline),
    ...sizes,
    bottomCorner: normalizeLoftCorner(raw.bottomCorner ?? DEFAULT_LOFT.bottomCorner, bottomWidth, bottomDepth),
    topCorner: normalizeLoftCorner(raw.topCorner ?? DEFAULT_LOFT.topCorner, topWidth, topDepth),
    bottomSides: normalizeLoftSides(raw.bottomSides, DEFAULT_LOFT.bottomSides),
    topSides: normalizeLoftSides(raw.topSides, DEFAULT_LOFT.topSides),
    offsetX: finite(raw.offsetX, 0),
    offsetZ: finite(raw.offsetZ, 0),
    wall: Math.min(maxLoftWall(sizes), Math.max(0, finite(raw.wall, 0))),
  };
}

/** The stored values of a shape, as set (before the frame stretches them). */
export function loftStoredMeasures(shape: LoftShapeFields): LoftMeasures {
  return normalizeLoftMeasures({
    bottomOutline: shape.loftBottomOutline,
    topOutline: shape.loftTopOutline,
    bottomWidth: shape.loftBottomWidth,
    bottomDepth: shape.loftBottomDepth,
    topWidth: shape.loftTopWidth,
    topDepth: shape.loftTopDepth,
    bottomCorner: shape.loftBottomCorner,
    topCorner: shape.loftTopCorner,
    bottomSides: shape.loftBottomSides,
    topSides: shape.loftTopSides,
    offsetX: shape.loftOffsetX,
    offsetZ: shape.loftOffsetZ,
    wall: shape.loftWall,
  });
}

/** Both ends side by side: [minX, minZ, maxX, maxZ] with the bottom's middle at the origin. */
export function loftMeasuresBounds(measures: LoftMeasures) {
  return [
    Math.min(-measures.bottomWidth / 2, measures.offsetX - measures.topWidth / 2),
    Math.min(-measures.bottomDepth / 2, measures.offsetZ - measures.topDepth / 2),
    Math.max(measures.bottomWidth / 2, measures.offsetX + measures.topWidth / 2),
    Math.max(measures.bottomDepth / 2, measures.offsetZ + measures.topDepth / 2),
  ];
}

/**
 * The values as the body shows them. Like every body the transition fills its frame: when the
 * frame was dragged bigger, the stored ends are stretched along with it (corners and wall
 * keep their size), and this is what they measure now.
 */
export function loftMeasures(shape: LoftShapeFields): LoftMeasures {
  const stored = loftStoredMeasures(shape);
  const [minX, minZ, maxX, maxZ] = loftMeasuresBounds(stored);
  const width = shape.width ?? shape.size;
  const depth = shape.depth ?? shape.size;
  const sx = Number.isFinite(width) && width > 0 ? width / (maxX - minX) : 1;
  const sz = Number.isFinite(depth) && depth > 0 ? depth / (maxZ - minZ) : 1;
  if (Math.abs(sx - 1) < 1e-9 && Math.abs(sz - 1) < 1e-9) return stored;
  return normalizeLoftMeasures({
    ...stored,
    bottomWidth: stored.bottomWidth * sx,
    bottomDepth: stored.bottomDepth * sz,
    topWidth: stored.topWidth * sx,
    topDepth: stored.topDepth * sz,
    offsetX: stored.offsetX * sx,
    offsetZ: stored.offsetZ * sz,
  });
}

/** The frame the measures need: the width and depth of both ends together. */
export function loftFrameSize(measures: LoftMeasures) {
  const [minX, minZ, maxX, maxZ] = loftMeasuresBounds(measures);
  return { width: maxX - minX, depth: maxZ - minZ, centerX: (minX + maxX) / 2, centerZ: (minZ + maxZ) / 2 };
}

/**
 * The shape fields for changed measures, and how far the frame's middle moves in the shape's
 * own frame (x, z) so the bottom stays where it is - a top moved sideways should not drag the
 * foot along.
 */
export function loftMeasuresPatch(shape: LoftShapeFields, change: Partial<LoftMeasures>) {
  const before = loftMeasures(shape);
  const next = normalizeLoftMeasures({ ...before, ...change });
  const oldFrame = loftFrameSize(before);
  const newFrame = loftFrameSize(next);
  return {
    patch: {
      width: newFrame.width,
      depth: newFrame.depth,
      ...loftFieldsFromMeasures(next),
    } satisfies Partial<WorkplaneShape>,
    shift: { x: newFrame.centerX - oldFrame.centerX, z: newFrame.centerZ - oldFrame.centerZ },
  };
}

/**
 * The whole change for a placed shape: the fields, the new frame, and the frame's middle moved
 * in the world - turned and mirrored as the shape is - so the bottom stays put.
 */
export function loftShapePatch(shape: WorkplaneShape, change: Partial<LoftMeasures>): Partial<WorkplaneShape> {
  const { patch, shift } = loftMeasuresPatch(shape, change);
  const offset = new THREE.Vector3(shift.x * mirrorSign(shape.mirrorX), 0, shift.z * mirrorSign(shape.mirrorZ)).applyEuler(new THREE.Euler(
    THREE.MathUtils.degToRad(shape.rotationX ?? 0),
    THREE.MathUtils.degToRad(meshYawDegrees(shape)),
    THREE.MathUtils.degToRad(shape.rotationZ ?? 0),
    "XYZ",
  ));
  return { ...patch, size: Math.max(patch.width, patch.depth), x: shape.x + offset.x, z: shape.z + offset.z };
}

export function loftFieldsFromMeasures(measures: LoftMeasures): Partial<WorkplaneShape> {
  return {
    loftBottomOutline: measures.bottomOutline,
    loftTopOutline: measures.topOutline,
    loftBottomWidth: measures.bottomWidth,
    loftBottomDepth: measures.bottomDepth,
    loftTopWidth: measures.topWidth,
    loftTopDepth: measures.topDepth,
    loftBottomCorner: measures.bottomCorner,
    loftTopCorner: measures.topCorner,
    loftBottomSides: measures.bottomSides,
    loftTopSides: measures.topSides,
    loftOffsetX: measures.offsetX,
    loftOffsetZ: measures.offsetZ,
    loftWall: measures.wall,
  };
}

/** The two ends in the shape's own frame, the frame's middle at the origin. */
export function loftSections(shape: LoftShapeFields): { bottom: LoftSection; top: LoftSection; wall: number } {
  const measures = loftMeasures(shape);
  const frame = loftFrameSize(measures);
  return {
    bottom: {
      outline: measures.bottomOutline,
      width: measures.bottomWidth,
      depth: measures.bottomDepth,
      corner: measures.bottomCorner,
      sides: measures.bottomSides,
      cx: -frame.centerX,
      cz: -frame.centerZ,
    },
    top: {
      outline: measures.topOutline,
      width: measures.topWidth,
      depth: measures.topDepth,
      corner: measures.topCorner,
      sides: measures.topSides,
      cx: measures.offsetX - frame.centerX,
      cz: measures.offsetZ - frame.centerZ,
    },
    wall: measures.wall,
  };
}

// --- Outlines as pieces ----------------------------------------------------------------------

type LinePiece = { kind: "line"; a: Point; b: Point };
/** An arc of the ellipse (cx + rx cos t, cz + rz sin t), t running from t0 up to t1. */
type ArcPiece = { kind: "arc"; cx: number; cz: number; rx: number; rz: number; t0: number; t1: number };
type Piece = LinePiece | ArcPiece;

function pieceAt(piece: Piece, f: number): Point {
  if (piece.kind === "line") return { x: piece.a.x + (piece.b.x - piece.a.x) * f, z: piece.a.z + (piece.b.z - piece.a.z) * f };
  const t = piece.t0 + (piece.t1 - piece.t0) * f;
  return { x: piece.cx + piece.rx * Math.cos(t), z: piece.cz + piece.rz * Math.sin(t) };
}

function subPiece(piece: Piece, f0: number, f1: number): Piece {
  if (piece.kind === "line") return { kind: "line", a: pieceAt(piece, f0), b: pieceAt(piece, f1) };
  return { ...piece, t0: piece.t0 + (piece.t1 - piece.t0) * f0, t1: piece.t0 + (piece.t1 - piece.t0) * f1 };
}

/** A regular polygon fitted into width x depth like the polygon shape, running counter-clockwise (x towards z). */
function polygonPoints(section: LoftSection, scale = 1): Point[] {
  const count = section.sides;
  const fit = regularPolygonFootprintScale(section.width, section.depth, count);
  const middle = { x: section.cx + fit.offsetX, z: section.cz + fit.offsetZ };
  const points = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return { x: middle.x + Math.sin(angle) * fit.x * scale, z: middle.z + Math.cos(angle) * fit.z * scale };
  });
  return signedArea(points) < 0 ? points.reverse() : points;
}

function signedArea(points: Point[]) {
  let sum = 0;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    sum += point.x * next.z - next.x * point.z;
  });
  return sum / 2;
}

/** The middle the polar angles are taken round: a polygon with an odd count is not centred in its box. */
function sectionMiddle(section: LoftSection): Point {
  if (section.outline !== "polygon") return { x: section.cx, z: section.cz };
  const fit = regularPolygonFootprintScale(section.width, section.depth, section.sides);
  return { x: section.cx + fit.offsetX, z: section.cz + fit.offsetZ };
}

/** The outline, counter-clockwise, as lines and arcs. */
function sectionPieces(section: LoftSection): Piece[] {
  const { cx, cz } = section;
  const hw = section.width / 2;
  const hd = section.depth / 2;
  if (section.outline === "round") return [{ kind: "arc", cx, cz, rx: hw, rz: hd, t0: 0, t1: Math.PI * 2 }];
  if (section.outline === "polygon") {
    const points = polygonPoints(section);
    return points.map((point, index) => ({ kind: "line", a: point, b: points[(index + 1) % points.length] }));
  }
  const r = Math.min(section.corner, hw, hd);
  if (r <= 1e-4) {
    const corners = [{ x: cx + hw, z: cz - hd }, { x: cx + hw, z: cz + hd }, { x: cx - hw, z: cz + hd }, { x: cx - hw, z: cz - hd }];
    return corners.map((point, index) => ({ kind: "line", a: point, b: corners[(index + 1) % 4] }));
  }
  const arc = (acx: number, acz: number, from: number): ArcPiece => ({ kind: "arc", cx: acx, cz: acz, rx: r, rz: r, t0: from, t1: from + Math.PI / 2 });
  const pieces: Piece[] = [];
  const corners = [
    arc(cx + hw - r, cz + hd - r, 0),
    arc(cx - hw + r, cz + hd - r, Math.PI / 2),
    arc(cx - hw + r, cz - hd + r, Math.PI),
    arc(cx + hw - r, cz - hd + r, Math.PI * 1.5),
  ];
  corners.forEach((corner, index) => {
    const previous = corners[(index + 3) % 4];
    const from = pieceAt(previous, 1);
    const to = pieceAt(corner, 0);
    // A side shrunk to nothing (a corner as big as the half side) leaves no line between two arcs.
    if (Math.hypot(to.x - from.x, to.z - from.z) > 1e-6) pieces.push({ kind: "line", a: from, b: to });
    pieces.push(corner);
  });
  return pieces;
}

const TWO_PI = Math.PI * 2;
const wrap = (angle: number) => ((angle % TWO_PI) + TWO_PI) % TWO_PI;
const polarOf = (point: Point, middle: Point) => wrap(Math.atan2(point.z - middle.z, point.x - middle.x));

/** Where a piece reaches the polar angle `target` (between its ends), as a fraction along it. */
function fractionAtPolar(piece: Piece, middle: Point, start: number, target: number) {
  let low = 0;
  let high = 1 - 1e-12;
  const span = wrap(target - start);
  for (let step = 0; step < 64; step += 1) {
    const mid = (low + high) / 2;
    if (wrap(polarOf(pieceAt(piece, mid), middle) - start) < span) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/**
 * The outline cut at every polar angle of `cuts` (round its own middle), starting at angle 0:
 * two outlines cut at the same angles have the same number of pieces, piece i of one facing
 * piece i of the other.
 */
function cutAtAngles(pieces: Piece[], middle: Point, cuts: number[]): Piece[] {
  const out: Array<{ piece: Piece; from: number }> = [];
  pieces.forEach((piece) => {
    const start = polarOf(pieceAt(piece, 0), middle);
    const whole = piece.kind === "arc" && Math.abs(Math.abs(piece.t1 - piece.t0) - TWO_PI) < 1e-9;
    const span = whole ? TWO_PI : wrap(polarOf(pieceAt(piece, 1), middle) - start) || TWO_PI;
    const inside = cuts
      .map((cut) => ({ cut, at: wrap(cut - start) }))
      .filter(({ at }) => at > 1e-7 && at < span - 1e-7)
      .sort((a, b) => a.at - b.at);
    const fractions = [0, ...inside.map(({ cut }) => fractionAtPolar(piece, middle, start, cut)), 1];
    for (let index = 0; index + 1 < fractions.length; index += 1) {
      const part = subPiece(piece, fractions[index], fractions[index + 1]);
      out.push({ piece: part, from: polarOf(pieceAt(part, 0), middle) });
    }
  });
  // Start at the piece that begins at angle 0.
  let first = 0;
  let nearest = Infinity;
  out.forEach((entry, index) => {
    const distance = Math.min(entry.from, TWO_PI - entry.from);
    if (distance < nearest) {
      nearest = distance;
      first = index;
    }
  });
  return [...out.slice(first), ...out.slice(0, first)].map((entry) => entry.piece);
}

/** The polar angles where an outline turns a corner or changes from line to arc. */
function cornerAngles(pieces: Piece[], middle: Point) {
  return pieces.map((piece) => polarOf(pieceAt(piece, 0), middle));
}

function uniqueAngles(angles: number[]) {
  const sorted = angles.map(wrap).sort((a, b) => a - b);
  const out: number[] = [];
  sorted.forEach((angle) => {
    if (!out.length || angle - out[out.length - 1] > 1e-7) out.push(angle);
  });
  if (out.length > 1 && TWO_PI - out[out.length - 1] + out[0] <= 1e-7) out.pop();
  return out;
}

/** The section shrunk inwards by the wall: the opening of a tube. */
function insetSection(section: LoftSection, wall: number): LoftSection {
  if (section.outline === "polygon") {
    // A regular polygon shrinks evenly: every side moves in by the wall when the apothem does.
    const points = polygonPoints(section);
    const middle = sectionMiddle(section);
    const apothem = Math.min(...points.map((point, index) => {
      const next = points[(index + 1) % points.length];
      const length = Math.hypot(next.x - point.x, next.z - point.z);
      return Math.abs((next.x - point.x) * (middle.z - point.z) - (next.z - point.z) * (middle.x - point.x)) / length;
    }));
    const scale = Math.max(0.01, (apothem - wall) / apothem);
    return {
      ...section,
      width: section.width * scale,
      depth: section.depth * scale,
      cx: middle.x + (section.cx - middle.x) * scale,
      cz: middle.z + (section.cz - middle.z) * scale,
    };
  }
  return {
    ...section,
    width: section.width - 2 * wall,
    depth: section.depth - 2 * wall,
    corner: Math.max(0, section.corner - wall),
  };
}

export type LoftPieces = { bottom: Piece[]; top: Piece[] };

/**
 * The outer pair of outlines and, with a wall, the inner pair (the opening), each pair cut
 * alike. Angles 0, 90, 180 and 270 degrees are always cuts, so even two circles meet in four
 * pieces and start at the same point.
 */
export function loftPieces(shape: LoftShapeFields): { outer: LoftPieces; inner: LoftPieces | null } {
  const { bottom, top, wall } = loftSections(shape);
  const pair = (lower: LoftSection, upper: LoftSection): LoftPieces => {
    const lowerMiddle = sectionMiddle(lower);
    const upperMiddle = sectionMiddle(upper);
    const lowerPieces = sectionPieces(lower);
    const upperPieces = sectionPieces(upper);
    const cuts = uniqueAngles([
      0, Math.PI / 2, Math.PI, Math.PI * 1.5,
      ...cornerAngles(lowerPieces.filter((piece) => piece.kind === "line" || Math.abs(piece.t1 - piece.t0) < TWO_PI - 1e-9), lowerMiddle),
      ...cornerAngles(upperPieces.filter((piece) => piece.kind === "line" || Math.abs(piece.t1 - piece.t0) < TWO_PI - 1e-9), upperMiddle),
    ]);
    return { bottom: cutAtAngles(lowerPieces, lowerMiddle, cuts), top: cutAtAngles(upperPieces, upperMiddle, cuts) };
  };
  const outer = pair(bottom, top);
  const inner = wall > 1e-6 ? pair(insetSection(bottom, wall), insetSection(top, wall)) : null;
  return { outer, inner };
}

function piecesToLoop(pieces: Piece[]): CadModifierProfileLoop {
  const start = pieceAt(pieces[0], 0);
  return {
    x: start.x,
    z: start.z,
    segments: pieces.map((piece) => {
      const end = pieceAt(piece, 1);
      if (piece.kind === "line") return { kind: "line" as const, x: end.x, z: end.z };
      return { kind: "arc" as const, x: end.x, z: end.z, cx: piece.cx, cz: piece.cz, rx: piece.rx, rz: piece.rz, start: piece.t0, end: piece.t1 };
    }),
  };
}

/** The loops of the exact body: outer first, the opening second, bottom and top piece for piece. */
export function loftProfileLoops(shape: LoftShapeFields) {
  const { outer, inner } = loftPieces(shape);
  const loops = [piecesToLoop(outer.bottom)];
  const topLoops = [piecesToLoop(outer.top)];
  if (inner) {
    loops.push(piecesToLoop(inner.bottom));
    topLoops.push(piecesToLoop(inner.top));
  }
  return { loops, topLoops };
}

// --- Display mesh ----------------------------------------------------------------------------

/** Steps along a piece pair: one for two lines, more for an arc, by how far it turns. */
function pieceSteps(a: Piece, b: Piece) {
  const steps = (piece: Piece) => (piece.kind === "line" ? 1 : Math.max(2, Math.ceil(Math.abs(piece.t1 - piece.t0) / (TWO_PI / 96))));
  return Math.max(steps(a), steps(b));
}

/** Both outlines sampled at the same fractions of each piece: ring i of the bottom faces ring i of the top. */
function sampledRings(pair: LoftPieces) {
  const bottom: Point[] = [];
  const top: Point[] = [];
  pair.bottom.forEach((piece, index) => {
    const partner = pair.top[index];
    const steps = pieceSteps(piece, partner);
    for (let step = 0; step < steps; step += 1) {
      bottom.push(pieceAt(piece, step / steps));
      top.push(pieceAt(partner, step / steps));
    }
  });
  return { bottom, top };
}

/** How many rows up the wall keep the two triangles of every quad within a few degrees of each other. */
function wallRows(rings: { bottom: Point[]; top: Point[] }, height: number) {
  const count = rings.bottom.length;
  const at = (point: Point, y: number) => new THREE.Vector3(point.x, y, point.z);
  let worst = 0;
  for (let i = 0; i < count; i += 1) {
    const j = (i + 1) % count;
    const [b0, b1, t0, t1] = [at(rings.bottom[i], 0), at(rings.bottom[j], 0), at(rings.top[i], height), at(rings.top[j], height)];
    const first = new THREE.Vector3().crossVectors(t1.clone().sub(b0), b1.clone().sub(b0));
    const second = new THREE.Vector3().crossVectors(t0.clone().sub(b0), t1.clone().sub(b0));
    if (first.lengthSq() < 1e-18 || second.lengthSq() < 1e-18) continue;
    worst = Math.max(worst, first.angleTo(second));
  }
  return Math.min(32, Math.max(1, Math.ceil(THREE.MathUtils.radToDeg(worst) / 6)));
}

export function createLoftGeometry(shape: LoftShapeFields): THREE.BufferGeometry {
  const height = Math.max(0.01, shape.height);
  const { outer, inner } = loftPieces(shape);
  const positions: number[] = [];
  const indices: number[] = [];
  const addRing = (points: Point[], y: number) => {
    const first = positions.length / 3;
    points.forEach((point) => positions.push(point.x, y, point.z));
    return first;
  };
  // The outlines run counter-clockwise (x towards z); seen that way a wall triangle
  // (bottom i, top i+1, bottom i+1) faces outwards, the opening's the other way round.
  // Where a small corner below meets a long side above the wall is twisted, and one quad from
  // bottom to top folds into two triangles up to 60 degrees apart - drawn as a zigzag of edge
  // lines. The wall is then cut into rows up the height, as many as that twist needs.
  const addWall = (rings: { bottom: Point[]; top: Point[] }, outward: boolean) => {
    const count = rings.bottom.length;
    const rows = wallRows(rings, height);
    const starts: number[] = [];
    for (let row = 0; row <= rows; row += 1) {
      const v = row / rows;
      starts.push(addRing(rings.bottom.map((b, i) => ({ x: b.x + (rings.top[i].x - b.x) * v, z: b.z + (rings.top[i].z - b.z) * v })), height * v));
    }
    for (let row = 0; row < rows; row += 1) {
      const b = starts[row];
      const t = starts[row + 1];
      for (let i = 0; i < count; i += 1) {
        const j = (i + 1) % count;
        if (outward) indices.push(b + i, t + j, b + j, b + i, t + i, t + j);
        else indices.push(b + i, b + j, t + j, b + i, t + j, t + i);
      }
    }
    return { bottom: starts[0], top: starts[rows] };
  };
  const outerRings = sampledRings(outer);
  const innerRings = inner ? sampledRings(inner) : null;
  const outerStart = addWall(outerRings, true);
  const innerStart = innerRings ? addWall(innerRings, false) : null;
  // The two ends on the walls' own rim points, the opening as a hole: facing down at the bottom, up at the top.
  const addCap = (contour: Point[], contourStart: number, hole: Point[] | null, holeStart: number, up: boolean) => {
    const all = hole ? [...contour, ...hole] : contour;
    const index = (k: number) => (k < contour.length ? contourStart + k : holeStart + k - contour.length);
    THREE.ShapeUtils.triangulateShape(contour.map((p) => new THREE.Vector2(p.x, p.z)), hole ? [hole.map((p) => new THREE.Vector2(p.x, p.z))] : [])
      .forEach(([a, b, c]) => {
        // A triangle running counter-clockwise (x towards z) faces down.
        const area = (all[b].x - all[a].x) * (all[c].z - all[a].z) - (all[c].x - all[a].x) * (all[b].z - all[a].z);
        const facesDown = area > 0;
        if (facesDown === !up) indices.push(index(a), index(b), index(c));
        else indices.push(index(a), index(c), index(b));
      });
  };
  addCap(outerRings.bottom, outerStart.bottom, innerRings?.bottom ?? null, innerStart?.bottom ?? 0, false);
  addCap(outerRings.top, outerStart.top, innerRings?.top ?? null, innerStart?.top ?? 0, true);

  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  indexed.setIndex(indices);
  const geometry = toCreasedNormals(indexed, THREE.MathUtils.degToRad(30));
  indexed.dispose();
  geometry.computeBoundingBox();
  return geometry;
}
