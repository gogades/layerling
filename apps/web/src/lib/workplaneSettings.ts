import { DEFAULT_OVERHANG_ANGLE, normalizeOverhangAngle } from "@/lib/overhangLimits";
import type { CustomSnapGrid, CustomSnapGridSize, GridSize, HistoryRetentionLimit, MeasurementAccuracy, ShapeCustomization, ShapeCustomizationMap, ShapeKind, WorkplaneWorkspaceSettings } from "@/types/layerling";
import { normalizeScaleForUnits } from "@/lib/measurementUnits";
import { DEFAULT_IMPERIAL_GRID_BLOCK_PRESET, DEFAULT_METRIC_GRID_BLOCK_PRESET, DEFAULT_WORKPLANE_GRID_COLOR, inchGridPresetMm } from "@/lib/workplaneGrid";
import { isThreadProfile } from "@/lib/threadProfiles";

export const DEFAULT_SNAP_GRID: GridSize = "1.0 mm";
export const BRICK_SNAP_STEP = 8;
// Used only when the snap grid is off, so arrow keys keep their old feel.
export const KEYBOARD_NUDGE_FALLBACK_STEP = 1;
// Shift has always moved five times as far as a plain arrow press.
export const KEYBOARD_NUDGE_COARSE_FACTOR = 5;
export const MIN_CUSTOM_SHAPE_DIMENSION = 0.01;
export const MAX_CUSTOM_SHAPE_DIMENSION = 2000;
export const MAX_HIGH_RESOLUTION_SIDES = 512;
export const MAX_HIGH_RESOLUTION_STEPS = 256;

export const DEFAULT_WORKPLANE_WORKSPACE: WorkplaneWorkspaceSettings = {
  width: 200,
  depth: 200,
  sizePreset: "200 x 200 mm",
  printer: "",
  gridBlockSize: 5,
  gridBlockPreset: "5 mm",
  gridColor: DEFAULT_WORKPLANE_GRID_COLOR,
  background: "#fbf8f0",
  showShadows: true,
  overhangAngle: DEFAULT_OVERHANG_ANGLE,
  showGrid: true,
  clickToPlaceShapes: true,
  selectBeforeMove: false,
  objectSnap: true,
  dimensionsAlwaysVisible: true,
  zoomSpeed: 5,
  units: "Metric (Default)",
  inchFormat: "fraction",
  scale: "1:1 (millimeters)",
  accuracy: 2,
  historyLimit: 100,
  customSnapGrids: [],
  shapeCustomizations: {},
};

const ZOOM_SPEED_SLIDER_MIN = 1;
const ZOOM_SPEED_SLIDER_MAX = 10;
const ZOOM_SPEED_FAST_TO_SLOW = 20;
// OrbitControls.zoomSpeed at the default slider position. The old mapping was
// 0.28 + slider * 0.09, which left the fast end only about three times the slow end.
export const DEFAULT_ORBIT_ZOOM_SPEED = 0.73;

/**
 * Maps the 1–10 zoom slider onto OrbitControls.zoomSpeed.
 * Each wheel event scales camera distance by 0.95^(zoomSpeed * |deltaY| / 100),
 * so this value is the zoom rate. The curve is geometric: the fast end is
 * twenty times the slow end, and the default slider position keeps the old rate.
 */
export function orbitControlsZoomSpeed(slider: number): number {
  const span = ZOOM_SPEED_SLIDER_MAX - ZOOM_SPEED_SLIDER_MIN;
  const position = Number.isFinite(slider)
    ? Math.min(ZOOM_SPEED_SLIDER_MAX, Math.max(ZOOM_SPEED_SLIDER_MIN, slider))
    : DEFAULT_WORKPLANE_WORKSPACE.zoomSpeed;
  const slowest = DEFAULT_ORBIT_ZOOM_SPEED / ZOOM_SPEED_FAST_TO_SLOW ** ((DEFAULT_WORKPLANE_WORKSPACE.zoomSpeed - ZOOM_SPEED_SLIDER_MIN) / span);
  return slowest * ZOOM_SPEED_FAST_TO_SLOW ** ((position - ZOOM_SPEED_SLIDER_MIN) / span);
}

/** Raises a fixed distance multiplier by the slider's rate, so buttons match the wheel. */
export function zoomDistanceScale(step: number, slider: number): number {
  return step ** (orbitControlsZoomSpeed(slider) / DEFAULT_ORBIT_ZOOM_SPEED);
}

const METRIC_SNAP_GRIDS: GridSize[] = ["Off", "0.1 mm", "0.25 mm", "0.5 mm", "1.0 mm", "2.0 mm", "5.0 mm", "Brick"];
const IMPERIAL_SNAP_GRIDS: GridSize[] = ["Off", "1/64 in", "1/32 in", "1/16 in", "1/8 in", "1/4 in", "1/2 in", "1 in"];
const fixedSnapGrids: GridSize[] = [...METRIC_SNAP_GRIDS, ...IMPERIAL_SNAP_GRIDS.filter((size) => size !== "Off")];

export const MIN_CUSTOM_SNAP_GRID = 0.01;
export const MAX_CUSTOM_SNAP_GRID = 1000;
export const MAX_CUSTOM_SNAP_GRIDS = 12;
export const MAX_CUSTOM_SNAP_GRID_NAME = 32;
/** A custom measure snaps whole, halved and quartered: 1U, 0.5U and 0.25U (and with it 0.75U). */
export const CUSTOM_SNAP_GRID_DIVISORS = [1, 2, 4] as const;
const CUSTOM_SNAP_GRID_FRACTIONS: Record<number, string> = { 1: "1", 2: "½", 4: "¼" };

function cleanCustomSnapSize(value: number) {
  return Number(Math.min(MAX_CUSTOM_SNAP_GRID, Math.max(MIN_CUSTOM_SNAP_GRID, value)).toFixed(4));
}

export function customSnapGridSize(size: number, divisor: number): CustomSnapGridSize {
  return `custom:${cleanCustomSnapSize(size)}:${divisor}`;
}

/** The measure and divisor a custom snap step stands for, or null for any other value. */
export function parseCustomSnapGrid(value: unknown): { size: number; divisor: number } | null {
  if (typeof value !== "string") return null;
  const match = /^custom:(\d+(?:\.\d+)?):(\d+)$/.exec(value);
  if (!match) return null;
  const size = Number(match[1]);
  const divisor = Number(match[2]);
  if (!(CUSTOM_SNAP_GRID_DIVISORS as readonly number[]).includes(divisor)) return null;
  if (!Number.isFinite(size) || size < MIN_CUSTOM_SNAP_GRID || size > MAX_CUSTOM_SNAP_GRID) return null;
  return { size, divisor };
}

export function normalizeCustomSnapGrids(value: unknown, fallback: CustomSnapGrid[] = []): CustomSnapGrid[] {
  if (!Array.isArray(value)) return fallback;
  const grids: CustomSnapGrid[] = [];
  for (const entry of value) {
    if (grids.length >= MAX_CUSTOM_SNAP_GRIDS) break;
    if (!entry || typeof entry !== "object") continue;
    const { name, size } = entry as { name?: unknown; size?: unknown };
    if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) continue;
    grids.push({
      name: typeof name === "string" ? name.trim().slice(0, MAX_CUSTOM_SNAP_GRID_NAME) : "",
      size: cleanCustomSnapSize(size),
    });
  }
  return grids;
}

/** The snap steps offered for a unit system: inch fractions for Imperial, millimetres otherwise. */
export function snapGridOptionsForUnits(units: string): GridSize[] {
  return units === "Imperial" ? IMPERIAL_SNAP_GRIDS : METRIC_SNAP_GRIDS;
}

/** The snap menu: the steps of the unit system, then each custom measure whole, halved and quartered. */
export function snapGridOptions(units: string, customGrids: CustomSnapGrid[] = []): GridSize[] {
  const custom = customGrids.flatMap((grid) => CUSTOM_SNAP_GRID_DIVISORS.map((divisor) => customSnapGridSize(grid.size, divisor)));
  return [...snapGridOptionsForUnits(units), ...new Set(custom)];
}

/**
 * What a custom snap step is called in a menu: "½ × MX Key Unit". A step whose
 * measure is no longer in the list keeps working and shows its millimetres.
 */
export function customSnapGridLabel(value: unknown, customGrids: CustomSnapGrid[] = []): string | null {
  const parsed = parseCustomSnapGrid(value);
  if (!parsed) return null;
  const name = customGrids.find((grid) => grid.size === parsed.size)?.name.trim() || `${parsed.size} mm`;
  return `${CUSTOM_SNAP_GRID_FRACTIONS[parsed.divisor] ?? `1/${parsed.divisor}`} × ${name}`;
}

/**
 * The plate's grid for a unit system: an inch preset with Imperial, a
 * millimetre one otherwise. A preset of the other system (a design set to
 * Imperial before inch grids existed, or switched back to metric) gives way
 * to the usual default; a custom size stays as it is.
 */
export function gridBlockForUnits(units: string, preset: string, size: number): { gridBlockPreset: string; gridBlockSize: number } {
  const inchMm = inchGridPresetMm(preset);
  if (units === "Imperial") {
    if (inchMm !== null) return { gridBlockPreset: preset, gridBlockSize: inchMm };
    if (preset === "Custom") return { gridBlockPreset: preset, gridBlockSize: size };
    return { gridBlockPreset: DEFAULT_IMPERIAL_GRID_BLOCK_PRESET, gridBlockSize: inchGridPresetMm(DEFAULT_IMPERIAL_GRID_BLOCK_PRESET)! };
  }
  if (inchMm !== null) return { gridBlockPreset: DEFAULT_METRIC_GRID_BLOCK_PRESET, gridBlockSize: Number.parseFloat(DEFAULT_METRIC_GRID_BLOCK_PRESET) };
  return { gridBlockPreset: preset, gridBlockSize: size };
}

/** Keeps the current snap step when the unit system offers it, else the usual default (1.0 mm or 1/8 in). */
export function snapGridForUnits(units: string, snap: GridSize): GridSize {
  // A measure of the user's own is millimetres whatever the plate is ruled in.
  if (parseCustomSnapGrid(snap)) return snap;
  if (snapGridOptionsForUnits(units).includes(snap)) return snap;
  return units === "Imperial" ? "1/8 in" : DEFAULT_SNAP_GRID;
}
const customizableShapeKinds: ShapeKind[] = [
  "box", "roundedBox", "cylinder", "slot", "ellipse", "sphere", "sketch", "scribble", "cone", "pyramid", "roof", "text", "roundRoof",
  "halfSphere", "torus", "tube", "bentTube", "star", "heart", "crescent", "gear", "honeycomb", "hinge", "knurl", "dovetail", "counterbore", "countersink", "teardrop", "thread", "spring", "ring", "wedge", "polygon", "icosahedron", "ruler", "mesh",
];

function numberOrDefault(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function colorOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value.trim()) ? value : fallback;
}

function booleanOrDefault(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function accuracyOrDefault(value: unknown, fallback: MeasurementAccuracy) {
  return value === 1 || value === 2 || value === 3 ? value : fallback;
}

function historyLimitOrDefault(value: unknown, fallback: HistoryRetentionLimit): HistoryRetentionLimit {
  if (value === "unlimited") return value;
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(5000, Math.max(1, Math.round(value)));
}

function optionalShapeDimension(value: unknown, fallback: number | undefined) {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(MAX_CUSTOM_SHAPE_DIMENSION, Math.max(MIN_CUSTOM_SHAPE_DIMENSION, value));
}

function optionalShapeNumber(value: unknown, fallback: number | undefined, min: number, max: number, integer = false) {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const normalized = Math.min(max, Math.max(min, value));
  return integer ? Math.round(normalized) : normalized;
}

function optionalShapeText(value: unknown, fallback: string | undefined, maxLength: number) {
  if (value === undefined) return fallback;
  if (typeof value !== "string") return fallback;
  return value.slice(0, maxLength) || " ";
}

export function normalizeShapeCustomizations(value: unknown, fallback: ShapeCustomizationMap = {}): ShapeCustomizationMap {
  const candidate = value && typeof value === "object" ? value as Partial<Record<ShapeKind, unknown>> : {};
  const normalized: ShapeCustomizationMap = {};
  customizableShapeKinds.forEach((kind) => {
    const raw = candidate[kind];
    const source = raw && typeof raw === "object" ? raw as Partial<ShapeCustomization> : {};
    const fallbackEntry = fallback[kind];
    const entry: ShapeCustomization = {
      width: optionalShapeDimension(source.width, fallbackEntry?.width),
      depth: optionalShapeDimension(source.depth, fallbackEntry?.depth),
      height: optionalShapeDimension(source.height, fallbackEntry?.height),
      maxDimension: optionalShapeDimension(source.maxDimension, fallbackEntry?.maxDimension),
    };
    if (kind === "sphere" || kind === "halfSphere") {
      entry.steps = optionalShapeNumber(source.steps, fallbackEntry?.steps, 6, MAX_HIGH_RESOLUTION_STEPS, true);
    }
    if (kind === "cylinder" || kind === "ellipse" || kind === "slot" || kind === "cone" || kind === "tube" || kind === "ring" || kind === "counterbore" || kind === "countersink" || kind === "teardrop") {
      entry.sides = optionalShapeNumber(source.sides, fallbackEntry?.sides, 3, MAX_HIGH_RESOLUTION_SIDES, true);
    } else if (kind === "pyramid" || kind === "polygon") {
      entry.sides = optionalShapeNumber(source.sides, fallbackEntry?.sides, 3, 24, true);
      if (kind === "pyramid") {
        entry.topWidth = optionalShapeNumber(source.topWidth, fallbackEntry?.topWidth, 0, MAX_CUSTOM_SHAPE_DIMENSION);
        entry.topDepth = optionalShapeNumber(source.topDepth, fallbackEntry?.topDepth, 0, MAX_CUSTOM_SHAPE_DIMENSION);
      }
    } else if (kind === "roundRoof") {
      entry.sides = optionalShapeNumber(source.sides, fallbackEntry?.sides, 4, MAX_HIGH_RESOLUTION_SIDES, true);
    }
    if (kind === "cone") {
      entry.topRadius = optionalShapeNumber(source.topRadius, fallbackEntry?.topRadius, 0, MAX_CUSTOM_SHAPE_DIMENSION / 2);
      entry.baseRadius = optionalShapeNumber(source.baseRadius, fallbackEntry?.baseRadius, MIN_CUSTOM_SHAPE_DIMENSION, MAX_CUSTOM_SHAPE_DIMENSION / 2);
    }
    if (kind === "tube" || kind === "ring") {
      entry.bevel = optionalShapeNumber(source.bevel, fallbackEntry?.bevel, 0.5, 20);
    }
    if (kind === "star") {
      entry.starPoints = optionalShapeNumber(source.starPoints, fallbackEntry?.starPoints, 3, 32, true);
      entry.starInnerSize = optionalShapeNumber(source.starInnerSize, fallbackEntry?.starInnerSize, 0.1, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.starOuterFillet = optionalShapeNumber(source.starOuterFillet, fallbackEntry?.starOuterFillet, 0, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.starInnerFillet = optionalShapeNumber(source.starInnerFillet, fallbackEntry?.starInnerFillet, 0, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.starQuality = optionalShapeNumber(source.starQuality, fallbackEntry?.starQuality, 4, 48, true);
    }
    if (kind === "heart") {
      entry.heartTipFillet = optionalShapeNumber(source.heartTipFillet, fallbackEntry?.heartTipFillet, 0, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.heartQuality = optionalShapeNumber(source.heartQuality, fallbackEntry?.heartQuality, 16, 64, true);
    }
    if (kind === "crescent") {
      entry.crescentThickness = optionalShapeNumber(source.crescentThickness, fallbackEntry?.crescentThickness, 1, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.crescentTipFillet = optionalShapeNumber(source.crescentTipFillet, fallbackEntry?.crescentTipFillet, 0, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.crescentQuality = optionalShapeNumber(source.crescentQuality, fallbackEntry?.crescentQuality, 16, 64, true);
    }
    if (kind === "honeycomb") {
      entry.honeycombCellSize = optionalShapeNumber(source.honeycombCellSize, fallbackEntry?.honeycombCellSize, 2, 100);
      entry.honeycombWallThickness = optionalShapeNumber(source.honeycombWallThickness, fallbackEntry?.honeycombWallThickness, 0.4, 50);
      entry.honeycombFrameWidth = optionalShapeNumber(source.honeycombFrameWidth, fallbackEntry?.honeycombFrameWidth, 0, 100);
    }
    if (kind === "counterbore" || kind === "countersink") {
      entry.screwHoleShaft = optionalShapeNumber(source.screwHoleShaft, fallbackEntry?.screwHoleShaft, 0.1, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.screwHoleHeadDepth = optionalShapeNumber(source.screwHoleHeadDepth, fallbackEntry?.screwHoleHeadDepth, 0.1, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.screwHoleAngle = optionalShapeNumber(source.screwHoleAngle, fallbackEntry?.screwHoleAngle, 30, 150);
    }
    if (kind === "hinge") {
      entry.hingeKnuckles = optionalShapeNumber(source.hingeKnuckles, fallbackEntry?.hingeKnuckles, 3, 15, true);
      entry.hingePinDiameter = optionalShapeNumber(source.hingePinDiameter, fallbackEntry?.hingePinDiameter, 0.2, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.hingeLeafThickness = optionalShapeNumber(source.hingeLeafThickness, fallbackEntry?.hingeLeafThickness, 0.1, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.hingeClearance = optionalShapeNumber(source.hingeClearance, fallbackEntry?.hingeClearance, 0.1, 1);
    }
    if (kind === "knurl") {
      entry.knurlPattern = source.knurlPattern === "straight" || source.knurlPattern === "diamond" ? source.knurlPattern : fallbackEntry?.knurlPattern;
      entry.knurlCount = optionalShapeNumber(source.knurlCount, fallbackEntry?.knurlCount, 6, 180, true);
      entry.knurlDepth = optionalShapeNumber(source.knurlDepth, fallbackEntry?.knurlDepth, 0.1, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.knurlAngle = optionalShapeNumber(source.knurlAngle, fallbackEntry?.knurlAngle, 10, 60);
      entry.knurlChamfer = optionalShapeNumber(source.knurlChamfer, fallbackEntry?.knurlChamfer, 0, MAX_CUSTOM_SHAPE_DIMENSION);
    }
    if (kind === "dovetail") {
      entry.dovetailNeckWidth = optionalShapeNumber(source.dovetailNeckWidth, fallbackEntry?.dovetailNeckWidth, 0.1, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.dovetailClearance = optionalShapeNumber(source.dovetailClearance, fallbackEntry?.dovetailClearance, 0, 2);
    }
    if (kind === "roundedBox") {
      entry.cornerFillet = optionalShapeNumber(source.cornerFillet, fallbackEntry?.cornerFillet, 0, MAX_CUSTOM_SHAPE_DIMENSION / 2);
      entry.topBottomFillet = optionalShapeNumber(source.topBottomFillet, fallbackEntry?.topBottomFillet, 0, MAX_CUSTOM_SHAPE_DIMENSION / 2);
      entry.roundedBoxQuality = optionalShapeNumber(source.roundedBoxQuality, fallbackEntry?.roundedBoxQuality, 4, 32, true);
    }
    if (kind === "bentTube") {
      const profiles = ["round", "square", "hexagon", "octagon"];
      entry.bentTubeProfile = source.bentTubeProfile === undefined
        ? fallbackEntry?.bentTubeProfile
        : profiles.includes(source.bentTubeProfile)
          ? source.bentTubeProfile
          : fallbackEntry?.bentTubeProfile;
      entry.bentTubeInnerProfile = source.bentTubeInnerProfile === undefined
        ? fallbackEntry?.bentTubeInnerProfile
        : source.bentTubeInnerProfile === "none" || profiles.includes(source.bentTubeInnerProfile)
          ? source.bentTubeInnerProfile
          : fallbackEntry?.bentTubeInnerProfile;
      entry.bentTubeSize = optionalShapeNumber(source.bentTubeSize, fallbackEntry?.bentTubeSize, 1, 500);
      entry.bentTubeWall = optionalShapeNumber(source.bentTubeWall, fallbackEntry?.bentTubeWall, 0.2, 250);
      entry.bentTubeQuality = optionalShapeNumber(source.bentTubeQuality, fallbackEntry?.bentTubeQuality, 12, 96, true);
    }
    if (kind === "text") {
      entry.text = optionalShapeText(source.text, fallbackEntry?.text, 24);
      entry.font = source.font === undefined
        ? fallbackEntry?.font
        : ["Multilanguage", "Sans", "Serif", "Script", "Monospace", "Rounded", "Stencil"].includes(source.font)
          ? source.font
          : fallbackEntry?.font;
      entry.bevel = optionalShapeNumber(source.bevel, fallbackEntry?.bevel, 0, 8);
      entry.segments = optionalShapeNumber(source.segments, fallbackEntry?.segments, 0, 24, true);
      entry.textCurved = typeof source.textCurved === "boolean" ? source.textCurved : fallbackEntry?.textCurved;
      entry.textInward = typeof source.textInward === "boolean" ? source.textInward : fallbackEntry?.textInward;
      entry.textFlipped = typeof source.textFlipped === "boolean" ? source.textFlipped : fallbackEntry?.textFlipped;
      entry.textRadius = optionalShapeNumber(source.textRadius, fallbackEntry?.textRadius, 5, 500);
      entry.textSize = optionalShapeNumber(source.textSize, fallbackEntry?.textSize, 0.5, 200);
    }
    if (kind === "spring") {
      entry.springTurns = optionalShapeNumber(source.springTurns, fallbackEntry?.springTurns, 1, 60, true);
      entry.springWire = optionalShapeNumber(source.springWire, fallbackEntry?.springWire, 0.3, 120);
      entry.springQuality = optionalShapeNumber(source.springQuality, fallbackEntry?.springQuality, 12, 96, true);
      entry.springHand = source.springHand === undefined
        ? fallbackEntry?.springHand
        : source.springHand === "right" || source.springHand === "left"
          ? source.springHand
          : fallbackEntry?.springHand;
    }
    if (kind === "thread") {
      entry.threadRole = source.threadRole === undefined
        ? fallbackEntry?.threadRole
        : ["rod", "screw", "nut", "bore"].includes(source.threadRole)
          ? source.threadRole
          : fallbackEntry?.threadRole;
      entry.threadHead = source.threadHead === undefined
        ? fallbackEntry?.threadHead
        : ["cylinder", "countersunk", "hex"].includes(source.threadHead)
          ? source.threadHead
          : fallbackEntry?.threadHead;
      entry.threadHand = source.threadHand === undefined
        ? fallbackEntry?.threadHand
        : source.threadHand === "right" || source.threadHand === "left"
          ? source.threadHand
          : fallbackEntry?.threadHand;
      entry.threadProfile = source.threadProfile === undefined
        ? fallbackEntry?.threadProfile
        : isThreadProfile(source.threadProfile)
          ? source.threadProfile
          : fallbackEntry?.threadProfile;
      entry.threadDiameter = optionalShapeNumber(source.threadDiameter, fallbackEntry?.threadDiameter, 1, 160);
      entry.threadPitch = optionalShapeNumber(source.threadPitch, fallbackEntry?.threadPitch, 0.2, 12);
      entry.threadClearance = optionalShapeNumber(source.threadClearance, fallbackEntry?.threadClearance, 0, 1.5);
      entry.threadBoltClearance = optionalShapeNumber(source.threadBoltClearance, fallbackEntry?.threadBoltClearance, 0, 1);
      entry.threadQuality = optionalShapeNumber(source.threadQuality, fallbackEntry?.threadQuality, 12, 96, true);
      entry.threadChamfer = optionalShapeNumber(source.threadChamfer, fallbackEntry?.threadChamfer, 0, 40);
      entry.threadHeadChamfer = optionalShapeNumber(source.threadHeadChamfer, fallbackEntry?.threadHeadChamfer, 0, 40);
    }
    if (kind === "gear") {
      entry.teeth = optionalShapeNumber(source.teeth, fallbackEntry?.teeth, 6, 64, true);
      entry.toothSize = optionalShapeNumber(source.toothSize, fallbackEntry?.toothSize, 0.2, MAX_CUSTOM_SHAPE_DIMENSION / 2);
      entry.toothWidth = optionalShapeNumber(source.toothWidth, fallbackEntry?.toothWidth, MIN_CUSTOM_SHAPE_DIMENSION, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.centerHoleSize = optionalShapeNumber(source.centerHoleSize, fallbackEntry?.centerHoleSize, 0, MAX_CUSTOM_SHAPE_DIMENSION);
      entry.gearType = source.gearType === undefined
        ? fallbackEntry?.gearType
        : source.gearType === "spur" || source.gearType === "helical" || source.gearType === "bevel"
          ? source.gearType
          : fallbackEntry?.gearType;
      entry.helixAngle = optionalShapeNumber(source.helixAngle, fallbackEntry?.helixAngle, -45, 45);
      entry.helixQuality = optionalShapeNumber(source.helixQuality, fallbackEntry?.helixQuality, 4, 32, true);
    }
    const compact = Object.fromEntries(Object.entries(entry).filter(([, entryValue]) => entryValue !== undefined)) as ShapeCustomization;
    if (Object.keys(compact).length > 0) normalized[kind] = compact;
  });
  return normalized;
}

/**
 * Groesstes Mass, das eine Kante annehmen darf, solange der Arbeitsbereich fuer
 * die Art keins vorgibt. Das Merkmalsfeld und die MCP-Bruecke rechnen mit
 * derselben Zahl - haetten sie je eine eigene, liesse sich ueber die Bruecke
 * etwas bauen, das der Regler daneben nicht mehr einstellen kann.
 */
export const DEFAULT_TAPER_DIMENSION_MAX = 480;

export function shapeDimensionLimit(workspace: WorkplaneWorkspaceSettings, kind: ShapeKind, appDefault: number) {
  return workspace.shapeCustomizations[kind]?.maxDimension ?? appDefault;
}

export function normalizeSnapGrid(value: unknown, fallback: GridSize = DEFAULT_SNAP_GRID): GridSize {
  if (parseCustomSnapGrid(value)) return value as GridSize;
  return fixedSnapGrids.includes(value as GridSize) ? (value as GridSize) : fallback;
}

/** Step the snap grid setting represents, in millimetres. "Off" yields 0. */
export function snapGridStep(size: GridSize) {
  if (size === "Off") {
    return 0;
  }
  if (size === "Brick") {
    return BRICK_SNAP_STEP;
  }
  const custom = parseCustomSnapGrid(size);
  if (custom) return custom.size / custom.divisor;
  const inch = /^(\d+)(?:\/(\d+))? in$/.exec(size);
  if (inch) return (Number(inch[1]) / Number(inch[2] ?? 1)) * 25.4;
  return Number.parseFloat(size) || 1;
}

/**
 * Distance one arrow-key press moves the selection.
 *
 * Pointer dragging has always snapped to the snap grid, while the keyboard
 * moved a hard-coded millimetre. With the grid at 5mm a drag landed on the
 * 5mm lattice and the very next arrow press pushed the shape off it again.
 * Following the grid keeps an aligned shape aligned; Shift keeps its former
 * meaning of a coarser step. With the grid off, the old 1mm and 5mm stand.
 */
export function keyboardNudgeStep(size: GridSize, coarse: boolean) {
  const grid = snapGridStep(size);
  const base = grid > 0 ? grid : KEYBOARD_NUDGE_FALLBACK_STEP;
  return coarse ? base * KEYBOARD_NUDGE_COARSE_FACTOR : base;
}

// Projects saved before the workplane turned ochre still carry the turquoise
// grid and its cool background. Anyone who never picked a colour of their own
// gets the current default; a deliberate choice is left alone.
const LEGACY_GRID_COLOR = "#28b4de";
const LEGACY_BACKGROUND = "#f8fbfc";

function migratedLegacyColor(value: string, legacy: string, current: string) {
  return value.trim().toLowerCase() === legacy ? current : value;
}

export function normalizeWorkspaceSettings(value: unknown, fallback: WorkplaneWorkspaceSettings = DEFAULT_WORKPLANE_WORKSPACE): WorkplaneWorkspaceSettings {
  const candidate = value && typeof value === "object" ? (value as Partial<WorkplaneWorkspaceSettings>) : {};
  const units = stringOrDefault(candidate.units, fallback.units);
  return {
    width: numberOrDefault(candidate.width, fallback.width),
    depth: numberOrDefault(candidate.depth, fallback.depth),
    sizePreset: stringOrDefault(candidate.sizePreset, fallback.sizePreset),
    // Older settings have no printer; that is "none", not the fallback's choice.
    printer: typeof candidate.printer === "string" ? candidate.printer : candidate.sizePreset === undefined ? fallback.printer : "",
    ...gridBlockForUnits(
      units,
      stringOrDefault(candidate.gridBlockPreset, fallback.gridBlockPreset),
      numberOrDefault(candidate.gridBlockSize, fallback.gridBlockSize),
    ),
    gridColor: migratedLegacyColor(colorOrDefault(candidate.gridColor, fallback.gridColor), LEGACY_GRID_COLOR, fallback.gridColor),
    background: migratedLegacyColor(stringOrDefault(candidate.background, fallback.background), LEGACY_BACKGROUND, fallback.background),
    showShadows: booleanOrDefault(candidate.showShadows, fallback.showShadows),
    overhangAngle: normalizeOverhangAngle(candidate.overhangAngle, fallback.overhangAngle),
    showGrid: booleanOrDefault(candidate.showGrid, fallback.showGrid),
    // "gridFromOrigin" (1.34.0) switched the grid back to the plate's corner;
    // it went again in 1.34.1 and is ignored: the grid always meets the axes.
    // Earlier names are ignored on purpose: "cruiseShapes" (until 1.18.6) was on
    // but did nothing, and "placeShapesByClick" (1.18.7) was off by default -
    // with 1.18.8 click placement is on for everyone unless switched off again.
    clickToPlaceShapes: booleanOrDefault(candidate.clickToPlaceShapes, fallback.clickToPlaceShapes),
    selectBeforeMove: booleanOrDefault(candidate.selectBeforeMove, fallback.selectBeforeMove),
    objectSnap: booleanOrDefault(candidate.objectSnap, fallback.objectSnap),
    dimensionsAlwaysVisible: booleanOrDefault(candidate.dimensionsAlwaysVisible, fallback.dimensionsAlwaysVisible),
    zoomSpeed: numberOrDefault(candidate.zoomSpeed, fallback.zoomSpeed),
    units,
    inchFormat: candidate.inchFormat === "decimal" ? "decimal" : "fraction",
    scale: normalizeScaleForUnits(units, stringOrDefault(candidate.scale, fallback.scale)),
    accuracy: accuracyOrDefault(candidate.accuracy, fallback.accuracy),
    historyLimit: historyLimitOrDefault(candidate.historyLimit, fallback.historyLimit),
    customSnapGrids: normalizeCustomSnapGrids(candidate.customSnapGrids, fallback.customSnapGrids),
    shapeCustomizations: normalizeShapeCustomizations(candidate.shapeCustomizations, fallback.shapeCustomizations),
  };
}

export function canBeginShapeDrag(selectBeforeMove: boolean, alreadySelected: boolean) {
  return !selectBeforeMove || alreadySelected;
}

export function workplaneSettingsFingerprint(workspace: WorkplaneWorkspaceSettings, snapGrid: GridSize) {
  return JSON.stringify({ workspace, snapGrid });
}

export function workspaceHydrationSyncDecision(pendingFingerprint: string | null, currentFingerprint: string) {
  if (pendingFingerprint === null) {
    return { shouldSync: true, pendingFingerprint: null };
  }
  return {
    shouldSync: false,
    pendingFingerprint: currentFingerprint === pendingFingerprint ? null : pendingFingerprint,
  };
}

/**
 * "Make default" is meant for every design created afterwards, so it lives
 * under one key for the whole browser. It used to be filed under the id of
 * the project it was pressed in, which a new project never looks up - a new
 * design fell back to the built-in settings, shadows and zoom speed included.
 */
export const WORKSPACE_DEFAULT_STORAGE_KEY = "layerling.workspaceDefault.global";

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readWorkspaceDefault(storage: Storage | null = browserStorage()) {
  if (!storage) {
    return null;
  }
  try {
    const parsed = JSON.parse(storage.getItem(WORKSPACE_DEFAULT_STORAGE_KEY) ?? "null") as {
      workspace?: unknown;
      snap?: unknown;
    } | null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return {
      workspace: normalizeWorkspaceSettings(parsed.workspace),
      snap: normalizeSnapGrid(parsed.snap, DEFAULT_SNAP_GRID),
    };
  } catch {
    return null;
  }
}

export function saveWorkspaceDefault(
  workspace: WorkplaneWorkspaceSettings,
  snap: GridSize,
  storage: Storage | null = browserStorage(),
) {
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(WORKSPACE_DEFAULT_STORAGE_KEY, JSON.stringify({
      workspace: normalizeWorkspaceSettings(workspace),
      snap: normalizeSnapGrid(snap, DEFAULT_SNAP_GRID),
    }));
    return true;
  } catch {
    return false;
  }
}
