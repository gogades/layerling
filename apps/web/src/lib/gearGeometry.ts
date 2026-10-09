import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { GearProfile, GearType, WorkplaneShape } from "@/types/layerling";

export const DEFAULT_GEAR_TEETH = 12;
export const DEFAULT_GEAR_TOOTH_SIZE = 2.5;
export const DEFAULT_GEAR_CENTER_HOLE_SIZE = 6;
export const DEFAULT_GEAR_TYPE: GearType = "spur";
export const DEFAULT_GEAR_HELIX_ANGLE = 22.5;
export const DEFAULT_GEAR_HELIX_QUALITY = 16;
export const MIN_GEAR_TEETH = 6;
export const MAX_GEAR_TEETH = 64;
export const MIN_GEAR_HELIX_ANGLE = -45;
export const MAX_GEAR_HELIX_ANGLE = 45;
export const MIN_GEAR_HELIX_QUALITY = 4;
export const MAX_GEAR_HELIX_QUALITY = 32;
/** Ein Kegelrad ist oben um diesen Faktor kleiner als am Fuss, zur Achse hin. */
export const BEVEL_GEAR_TOP_SCALE = 0.68;
/** Involute teeth (#201): the standard 20° pressure angle, and the play a printed pair needs. */
export const DEFAULT_GEAR_PRESSURE_ANGLE = 20;
export const MIN_GEAR_PRESSURE_ANGLE = 14.5;
export const MAX_GEAR_PRESSURE_ANGLE = 30;
export const DEFAULT_GEAR_BACKLASH = 0.2;
/** New involute gears start at this module. */
export const DEFAULT_GEAR_MODULE = 2;
export const MAX_GEAR_BACKLASH = 2;
/** Points along one involute flank of the drawn outline; the exact body takes the true curve. */
const INVOLUTE_FLANK_STEPS = 5;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** A gear saved before involute teeth (#201) has no profile and keeps its straight teeth. */
export function normalizeGearProfile(value?: string): GearProfile {
  return value === "involute" ? "involute" : "simple";
}

export function normalizeGearPressureAngle(value?: number) {
  return clamp(Number.isFinite(value) ? value as number : DEFAULT_GEAR_PRESSURE_ANGLE, MIN_GEAR_PRESSURE_ANGLE, MAX_GEAR_PRESSURE_ANGLE);
}

/** The module of an involute gear: its outside diameter is module x (teeth + 2). */
export function involuteGearModule(width: number, depth: number, teeth?: number) {
  return Math.max(0.01, Math.min(width, depth)) / (normalizeGearTeeth(teeth) + 2);
}

/** The outside diameter for a module and a number of teeth - the gear's width and length. */
export function involuteGearDiameter(module: number, teeth?: number) {
  return Math.max(0.001, module) * (normalizeGearTeeth(teeth) + 2);
}

/** Backlash is the play of a meshing pair, half taken off each gear's teeth; at most half a module. */
export function normalizeGearBacklash(value: number | undefined, module: number) {
  return clamp(Number.isFinite(value) ? value as number : DEFAULT_GEAR_BACKLASH, 0, Math.min(MAX_GEAR_BACKLASH, module * 0.5));
}

/** Centre distance of two meshing involute gears with the same module. */
export function involuteCentreDistance(module: number, teethA: number, teethB: number) {
  return (module * (normalizeGearTeeth(teethA) + normalizeGearTeeth(teethB))) / 2;
}

type GearPairShape = Pick<WorkplaneShape, "kind" | "gearProfile" | "teeth" | "size" | "width" | "depth" | "x" | "z">;

/**
 * Two selected involute gears (#201): the centre distance they mesh at and how far apart their
 * centres stand now, or the two modules when those differ. Null for anything else.
 */
export function involuteGearPair(a: GearPairShape, b: GearPairShape) {
  const involute = (shape: GearPairShape) => shape.kind === "gear" && normalizeGearProfile(shape.gearProfile) === "involute";
  if (!involute(a) || !involute(b)) return null;
  const moduleOf = (shape: GearPairShape) => involuteGearModule(shape.width ?? shape.size, shape.depth ?? shape.size, shape.teeth);
  const modules = [moduleOf(a), moduleOf(b)] as const;
  const current = Math.hypot(a.x - b.x, a.z - b.z);
  if (Math.abs(modules[0] - modules[1]) > 1e-3 * Math.max(modules[0], modules[1])) return { modules, current, distance: null };
  return { modules, current, distance: involuteCentreDistance(modules[0], a.teeth ?? DEFAULT_GEAR_TEETH, b.teeth ?? DEFAULT_GEAR_TEETH) };
}

/** inv(a) = tan a - a, the angle an involute has turned through at pressure angle a. */
function involuteFunction(angle: number) {
  return Math.tan(angle) - angle;
}

export type InvoluteGearMeasures = {
  teeth: number;
  module: number;
  pitchRadius: number;
  baseRadius: number;
  tipRadius: number;
  rootRadius: number;
  /** Where the involute starts: the base circle, or the root circle when that lies outside it. */
  flankRadius: number;
  /** Turn of a flank's involute from the tooth's centre line, at the base circle. */
  flankTurn: number;
  /** Roll angles of the involute where the flank starts and where it meets the tip. */
  rollStart: number;
  rollEnd: number;
};

/**
 * The standard involute tooth (#201) for a gear of `width` x `depth`: tip at module x
 * (teeth + 2), root a quarter module deeper than one module below the pitch circle, the
 * tooth thinned by half the backlash on the pitch circle. Below the base circle the flank
 * runs straight down to the root, as many generators draw it.
 */
export function involuteGearMeasures(width: number, depth: number, options: Pick<WorkplaneShape, "teeth" | "gearPressureAngle" | "gearBacklash">): InvoluteGearMeasures {
  const teeth = normalizeGearTeeth(options.teeth);
  const module = involuteGearModule(width, depth, teeth);
  const pressure = THREE.MathUtils.degToRad(normalizeGearPressureAngle(options.gearPressureAngle));
  const backlash = normalizeGearBacklash(options.gearBacklash, module);
  const pitchRadius = (module * teeth) / 2;
  const baseRadius = pitchRadius * Math.cos(pressure);
  const rootRadius = Math.max(pitchRadius * 0.2, pitchRadius - 1.25 * module);
  const flankRadius = Math.max(baseRadius, rootRadius);
  // Half the tooth's angle on the pitch circle, carried back to the base circle.
  const halfThickness = (Math.PI * module) / 2 - backlash / 2;
  const flankTurn = halfThickness / (2 * pitchRadius) + involuteFunction(pressure);
  const roll = (radius: number) => Math.sqrt(Math.max(0, (radius / baseRadius) ** 2 - 1));
  // The two flanks meet where the turn is used up; the tip stops short of that point.
  let tipRadius = pitchRadius + module;
  const turnAt = (radius: number) => flankTurn - (roll(radius) - Math.atan(roll(radius)));
  if (turnAt(tipRadius) < flankTurn * 0.08) {
    let low = flankRadius;
    let high = tipRadius;
    for (let step = 0; step < 50; step += 1) {
      const middle = (low + high) / 2;
      if (turnAt(middle) < flankTurn * 0.08) high = middle;
      else low = middle;
    }
    tipRadius = low;
  }
  return { teeth, module, pitchRadius, baseRadius, tipRadius, rootRadius, flankRadius, flankTurn, rollStart: roll(flankRadius), rollEnd: roll(tipRadius) };
}

/**
 * A point of a flank and its derivative by the roll angle `roll`, for the tooth centred at
 * `centre` (radians from +x towards +z); `side` -1 is the flank before the centre, +1 the one
 * after it. The involute unwinds from the base circle away from the tooth's centre line.
 */
export function involuteFlankPoint(measures: InvoluteGearMeasures, centre: number, side: -1 | 1, roll: number) {
  const { baseRadius, flankTurn } = measures;
  const turn = centre + side * flankTurn;
  // The involute of the base circle, unwinding towards smaller angles for side +1.
  const localX = baseRadius * (Math.cos(roll) + roll * Math.sin(roll));
  const localZ = -side * baseRadius * (Math.sin(roll) - roll * Math.cos(roll));
  const dLocalX = baseRadius * roll * Math.cos(roll);
  const dLocalZ = -side * baseRadius * roll * Math.sin(roll);
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  return {
    x: localX * cos - localZ * sin,
    z: localX * sin + localZ * cos,
    dx: dLocalX * cos - dLocalZ * sin,
    dz: dLocalX * sin + dLocalZ * cos,
  };
}

/** The angle of a flank point from +x towards +z at a radius, as the corners list it. */
function involuteFlankAngle(measures: InvoluteGearMeasures, centre: number, side: -1 | 1, radius: number) {
  const roll = Math.sqrt(Math.max(0, (Math.max(radius, measures.baseRadius) / measures.baseRadius) ** 2 - 1));
  return centre + side * (measures.flankTurn - (roll - Math.atan(roll)));
}

/** The centre angle of tooth `index`, as the straight teeth are laid out. */
export function involuteToothCentre(teeth: number, index: number) {
  return ((index + 0.5) / teeth) * Math.PI * 2;
}

/** The involute outline as corners on circles, for the display mesh and the helical body. */
function involuteOutlineCorners(measures: InvoluteGearMeasures) {
  const { teeth, rootRadius, flankRadius, tipRadius, rollStart, rollEnd, baseRadius } = measures;
  const corners: Array<{ angle: number; radiusX: number; radiusZ: number }> = [];
  const push = (angle: number, radius: number) => corners.push({ angle, radiusX: radius, radiusZ: radius });
  const radii = Array.from({ length: INVOLUTE_FLANK_STEPS + 1 }, (_, step) => {
    const roll = rollStart + ((rollEnd - rollStart) * step) / INVOLUTE_FLANK_STEPS;
    return baseRadius * Math.sqrt(1 + roll * roll);
  });
  radii[0] = flankRadius;
  radii[radii.length - 1] = tipRadius;
  const radial = rootRadius < flankRadius - 1e-9;
  for (let tooth = 0; tooth < teeth; tooth += 1) {
    const centre = involuteToothCentre(teeth, tooth);
    if (radial) push(involuteFlankAngle(measures, centre, -1, flankRadius), rootRadius);
    for (const radius of radii) push(involuteFlankAngle(measures, centre, -1, radius), radius);
    push(centre, tipRadius);
    for (const radius of [...radii].reverse()) push(involuteFlankAngle(measures, centre, 1, radius), radius);
    if (radial) push(involuteFlankAngle(measures, centre, 1, flankRadius), rootRadius);
    push(centre + Math.PI / teeth, rootRadius);
  }
  return corners;
}

export function normalizeGearTeeth(value?: number) {
  return clamp(Math.round(Number.isFinite(value) ? value as number : DEFAULT_GEAR_TEETH), MIN_GEAR_TEETH, MAX_GEAR_TEETH);
}

export function normalizeGearType(value?: string): GearType {
  return value === "helical" || value === "bevel" ? value : DEFAULT_GEAR_TYPE;
}

export function normalizeGearToothSize(value: number | undefined, width: number, depth: number) {
  const maximum = Math.max(0.2, Math.min(width, depth) * 0.22);
  return clamp(Number.isFinite(value) ? value as number : DEFAULT_GEAR_TOOTH_SIZE, 0.2, maximum);
}

export function gearToothPitch(width: number, depth: number, teeth?: number) {
  return Math.PI * Math.max(0.01, Math.min(width, depth)) / normalizeGearTeeth(teeth);
}

export function normalizeGearToothWidth(value: number | undefined, width: number, depth: number, teeth?: number) {
  const pitch = gearToothPitch(width, depth, teeth);
  return clamp(Number.isFinite(value) ? value as number : pitch * 0.54, pitch * 0.12, pitch * 0.82);
}

/** The radius at the foot of the teeth, by the smaller of width and depth. */
function gearRootRadius(width: number, depth: number, toothSize?: number, profile?: Partial<GearOutlineOptions>) {
  const outerRadius = Math.max(0.005, Math.min(width, depth) / 2);
  if (normalizeGearProfile(profile?.gearProfile) === "involute") {
    return involuteGearMeasures(Math.max(0.01, width), Math.max(0.01, depth), profile ?? {}).rootRadius;
  }
  const normalizedToothSize = normalizeGearToothSize(toothSize, width, depth);
  return Math.max(outerRadius * 0.34, outerRadius - normalizedToothSize);
}

export function gearCenterHoleLimits(width: number, depth: number, toothSize?: number, profile?: Partial<GearOutlineOptions>) {
  const rootRadius = gearRootRadius(width, depth, toothSize, profile);
  const max = Math.max(0.01, rootRadius * 1.5);
  return { min: 0, max };
}

export function normalizeGearCenterHoleSize(value: number | undefined, width: number, depth: number, toothSize?: number, profile?: Partial<GearOutlineOptions>) {
  const limits = gearCenterHoleLimits(width, depth, toothSize, profile);
  const outerRadius = Math.max(0.005, Math.min(width, depth) / 2);
  const rootRadius = gearRootRadius(width, depth, toothSize, profile);
  const defaultSize = Math.min(outerRadius * 0.4, rootRadius * 1.1);
  return clamp(Number.isFinite(value) ? value as number : defaultSize, limits.min, limits.max);
}

export function normalizeGearHelixAngle(value?: number) {
  return clamp(
    Number.isFinite(value) ? value as number : DEFAULT_GEAR_HELIX_ANGLE,
    MIN_GEAR_HELIX_ANGLE,
    MAX_GEAR_HELIX_ANGLE,
  );
}

export function normalizeGearHelixQuality(value?: number) {
  return clamp(
    Math.round(Number.isFinite(value) ? value as number : DEFAULT_GEAR_HELIX_QUALITY),
    MIN_GEAR_HELIX_QUALITY,
    MAX_GEAR_HELIX_QUALITY,
  );
}

export function gearSettings(shape: Pick<WorkplaneShape, "width" | "depth" | "teeth" | "toothSize" | "toothWidth" | "centerHoleSize" | "gearType" | "helixAngle" | "helixQuality">) {
  return {
    teeth: normalizeGearTeeth(shape.teeth),
    toothSize: normalizeGearToothSize(shape.toothSize, shape.width, shape.depth),
    toothWidth: normalizeGearToothWidth(shape.toothWidth, shape.width, shape.depth, shape.teeth),
    centerHoleSize: normalizeGearCenterHoleSize(shape.centerHoleSize, shape.width, shape.depth, shape.toothSize),
    gearType: normalizeGearType(shape.gearType),
    helixAngle: normalizeGearHelixAngle(shape.helixAngle),
    helixQuality: normalizeGearHelixQuality(shape.helixQuality),
  };
}

export type GearOutlineOptions = Pick<WorkplaneShape, "teeth" | "toothSize" | "toothWidth" | "gearProfile" | "gearPressureAngle" | "gearBacklash">;

/**
 * How the ring of corners is stretched to width x depth. Straight teeth are stretched until
 * they span exactly that; involute teeth by their tip circle, so the module stays exact even
 * where no tooth tip reaches the frame (#201). Null for the straight teeth.
 */
export function involuteOutlineStretch(width: number, depth: number, options: GearOutlineOptions) {
  if (normalizeGearProfile(options.gearProfile) !== "involute") return null;
  const safeWidth = Math.max(0.01, width);
  const safeDepth = Math.max(0.01, depth);
  const measures = involuteGearMeasures(safeWidth, safeDepth, options);
  const diameter = measures.module * (measures.teeth + 2);
  return { x: safeWidth / diameter, z: safeDepth / diameter };
}

/**
 * Die Ecken des Zahnkranzes auf einem Ring, vor dem Strecken auf Breite x
 * Tiefe: je Zahn vier (Fuss, Kopf, Kopf, Fuss) auf der Fuss- und der
 * Kopfellipse, beim Winkel `angle` von +x nach +z. Anzeigenetz und exakter
 * Koerper (`cadProfileExtrusion.ts`) nehmen dieselben Ecken.
 */
export function gearOutlineCorners(width: number, depth: number, options: GearOutlineOptions) {
  const safeWidth = Math.max(0.01, width);
  const safeDepth = Math.max(0.01, depth);
  if (normalizeGearProfile(options.gearProfile) === "involute") {
    return involuteOutlineCorners(involuteGearMeasures(safeWidth, safeDepth, options));
  }
  const teeth = normalizeGearTeeth(options.teeth);
  const toothSize = normalizeGearToothSize(options.toothSize, safeWidth, safeDepth);
  const toothFraction = normalizeGearToothWidth(options.toothWidth, safeWidth, safeDepth, teeth) / gearToothPitch(safeWidth, safeDepth, teeth);
  const outerX = safeWidth / 2;
  const outerZ = safeDepth / 2;
  const rootX = Math.max(outerX * 0.34, outerX - toothSize);
  const rootZ = Math.max(outerZ * 0.34, outerZ - toothSize);
  const toothPhases = [0.05, (1 - toothFraction) / 2, (1 + toothFraction) / 2, 0.95] as const;
  const corners: Array<{ angle: number; radiusX: number; radiusZ: number }> = [];
  for (let tooth = 0; tooth < teeth; tooth += 1) {
    toothPhases.forEach((phase, phaseIndex) => {
      const isOuter = phaseIndex === 1 || phaseIndex === 2;
      corners.push({ angle: ((tooth + phase) / teeth) * Math.PI * 2, radiusX: isOuter ? outerX : rootX, radiusZ: isOuter ? outerZ : rootZ });
    });
  }
  return corners;
}

type GearGeometryOptions = {
  width: number;
  depth: number;
  height: number;
  teeth?: number;
  toothSize?: number;
  toothWidth?: number;
  centerHoleSize?: number;
  gearType?: GearType;
  helixAngle?: number;
  helixQuality?: number;
  gearProfile?: GearProfile;
  gearPressureAngle?: number;
  gearBacklash?: number;
};

/**
 * How far a helical gear's teeth turn from foot to top, in radians. Straight teeth take the
 * helix angle as that turn; involute teeth take it as the true helix angle on the pitch
 * circle (#201), so two gears with the same module and angle mesh at any size - one turned
 * the other way.
 */
export function gearHelixTwist(width: number, depth: number, height: number, options: GearOutlineOptions & Pick<WorkplaneShape, "helixAngle">) {
  const angle = THREE.MathUtils.degToRad(normalizeGearHelixAngle(options.helixAngle));
  if (normalizeGearProfile(options.gearProfile) !== "involute") return angle;
  const { pitchRadius } = involuteGearMeasures(Math.max(0.01, width), Math.max(0.01, depth), options);
  return (Math.max(0.01, height) * Math.tan(angle)) / pitchRadius;
}

export function createGearGeometry({
  width,
  depth,
  height,
  teeth: requestedTeeth,
  toothSize: requestedToothSize,
  toothWidth: requestedToothWidth,
  centerHoleSize: requestedCenterHoleSize,
  gearType: requestedType,
  helixAngle: requestedHelixAngle,
  helixQuality: requestedHelixQuality,
  gearProfile,
  gearPressureAngle,
  gearBacklash,
}: GearGeometryOptions) {
  const safeWidth = Math.max(0.01, width);
  const safeDepth = Math.max(0.01, depth);
  const safeHeight = Math.max(0.01, height);
  const teeth = normalizeGearTeeth(requestedTeeth);
  const toothSize = normalizeGearToothSize(requestedToothSize, safeWidth, safeDepth);
  const profile: GearOutlineOptions = { teeth, toothSize: requestedToothSize, toothWidth: requestedToothWidth, gearProfile, gearPressureAngle, gearBacklash };
  const corners = gearOutlineCorners(safeWidth, safeDepth, profile);
  const involute = involuteOutlineStretch(safeWidth, safeDepth, profile);
  const centerHoleSize = normalizeGearCenterHoleSize(requestedCenterHoleSize, safeWidth, safeDepth, toothSize, profile);
  const hasCenterHole = centerHoleSize > 0;
  const gearType = normalizeGearType(requestedType);
  const helixQuality = normalizeGearHelixQuality(requestedHelixQuality);
  const outlineCount = corners.length;
  const ringCount = gearType === "helical" ? helixQuality : 2;
  const twist = gearType === "helical" ? gearHelixTwist(safeWidth, safeDepth, safeHeight, { ...profile, helixAngle: requestedHelixAngle }) : 0;
  const topScale = gearType === "bevel" ? BEVEL_GEAR_TOP_SCALE : 1;
  const boreX = centerHoleSize / 2;
  const boreZ = centerHoleSize / 2;
  const positions: number[] = [];
  const indices: number[] = [];

  const outerIndex = (ring: number, point: number) => ring * outlineCount * 2 + point;
  const innerIndex = (ring: number, point: number) => ring * outlineCount * 2 + outlineCount + point;

  for (let ring = 0; ring < ringCount; ring += 1) {
    const progress = ring / (ringCount - 1);
    const y = progress * safeHeight;
    const ringTwist = progress * twist;
    const scale = 1 + (topScale - 1) * progress;

    for (const corner of corners) {
      const angle = corner.angle + ringTwist;
      positions.push(Math.cos(angle) * corner.radiusX * scale, y, Math.sin(angle) * corner.radiusZ * scale);
    }

    for (let point = 0; point < outlineCount; point += 1) {
      // The bore of involute teeth turns with the ring; its end faces are filled below.
      const angle = (point / outlineCount) * Math.PI * 2 + (involute ? ringTwist : 0);
      positions.push(Math.cos(angle) * boreX, y, Math.sin(angle) * boreZ);
    }
  }

  let outlineMinX = Number.POSITIVE_INFINITY;
  let outlineMaxX = Number.NEGATIVE_INFINITY;
  let outlineMinZ = Number.POSITIVE_INFINITY;
  let outlineMaxZ = Number.NEGATIVE_INFINITY;
  for (let ring = 0; ring < ringCount; ring += 1) {
    for (let point = 0; point < outlineCount; point += 1) {
      const offset = outerIndex(ring, point) * 3;
      outlineMinX = Math.min(outlineMinX, positions[offset]);
      outlineMaxX = Math.max(outlineMaxX, positions[offset]);
      outlineMinZ = Math.min(outlineMinZ, positions[offset + 2]);
      outlineMaxZ = Math.max(outlineMaxZ, positions[offset + 2]);
    }
  }
  const outlineScaleX = involute ? involute.x : safeWidth / Math.max(Number.EPSILON, outlineMaxX - outlineMinX);
  const outlineScaleZ = involute ? involute.z : safeDepth / Math.max(Number.EPSILON, outlineMaxZ - outlineMinZ);
  for (let ring = 0; ring < ringCount; ring += 1) {
    for (let point = 0; point < outlineCount; point += 1) {
      const offset = outerIndex(ring, point) * 3;
      positions[offset] *= outlineScaleX;
      positions[offset + 2] *= outlineScaleZ;
    }
  }

  for (let ring = 0; ring < ringCount - 1; ring += 1) {
    for (let point = 0; point < outlineCount; point += 1) {
      const next = (point + 1) % outlineCount;
      const outerBottom = outerIndex(ring, point);
      const outerNextBottom = outerIndex(ring, next);
      const outerTop = outerIndex(ring + 1, point);
      const outerNextTop = outerIndex(ring + 1, next);
      indices.push(outerBottom, outerTop, outerNextTop, outerBottom, outerNextTop, outerNextBottom);

      if (hasCenterHole) {
        const innerBottom = innerIndex(ring, point);
        const innerNextBottom = innerIndex(ring, next);
        const innerTop = innerIndex(ring + 1, point);
        const innerNextTop = innerIndex(ring + 1, next);
        indices.push(innerBottom, innerNextBottom, innerNextTop, innerBottom, innerNextTop, innerTop);
      }
    }
  }

  const topRing = ringCount - 1;
  // Involute teeth have many corners close together, some straight above each other below
  // the base circle: a fan of spokes from the bore would fold over or lose its area there,
  // and the edge lines drew every spoke. Each end is filled as an outline with a hole.
  if (involute) {
    for (const [ring, up] of [[0, false], [topRing, true]] as const) {
      const at = (index: number) => new THREE.Vector2(positions[index * 3], positions[index * 3 + 2]);
      const contour = Array.from({ length: outlineCount }, (_, point) => at(outerIndex(ring, point)));
      const hole = hasCenterHole ? Array.from({ length: outlineCount }, (_, point) => at(innerIndex(ring, point))) : null;
      const vertex = (index: number) => (index < outlineCount ? outerIndex(ring, index) : innerIndex(ring, index - outlineCount));
      for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(contour, hole ? [hole] : [])) {
        const pa = a < outlineCount ? contour[a] : hole![a - outlineCount];
        const pb = b < outlineCount ? contour[b] : hole![b - outlineCount];
        const pc = c < outlineCount ? contour[c] : hole![c - outlineCount];
        // The y of (b - a) x (c - a), with x/z as here: positive faces up.
        const facesUp = (pb.y - pa.y) * (pc.x - pa.x) - (pb.x - pa.x) * (pc.y - pa.y) > 0;
        indices.push(vertex(a), ...(facesUp === up ? [vertex(b), vertex(c)] : [vertex(c), vertex(b)]));
      }
    }
  }
  for (let point = 0; point < outlineCount && !involute; point += 1) {
    const next = (point + 1) % outlineCount;
    const bottomOuter = outerIndex(0, point);
    const bottomOuterNext = outerIndex(0, next);
    const bottomInner = innerIndex(0, point);
    const bottomInnerNext = innerIndex(0, next);
    if (hasCenterHole) {
      indices.push(bottomOuter, bottomOuterNext, bottomInnerNext, bottomOuter, bottomInnerNext, bottomInner);
    } else {
      indices.push(bottomOuter, bottomOuterNext, innerIndex(0, 0));
    }

    const topOuter = outerIndex(topRing, point);
    const topOuterNext = outerIndex(topRing, next);
    const topInner = innerIndex(topRing, point);
    const topInnerNext = innerIndex(topRing, next);
    if (hasCenterHole) {
      indices.push(topOuter, topInner, topInnerNext, topOuter, topInnerNext, topOuterNext);
    } else {
      indices.push(topOuter, innerIndex(topRing, 0), topOuterNext);
    }
  }

  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  indexed.setIndex(indices);
  const geometry = toCreasedNormals(indexed, THREE.MathUtils.degToRad(12));
  indexed.dispose();
  geometry.computeBoundingBox();
  return geometry;
}
