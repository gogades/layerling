import { canonicalizeShape } from "@/lib/workplaneShapes";
import { regularPolygonAspect } from "@/lib/regularPolygonFootprint";
import { normalizePyramidTop } from "@/lib/pyramidGeometry";
import { createLocalId } from "@/lib/localIds";
import {
  DEFAULT_GEAR_CENTER_HOLE_SIZE,
  DEFAULT_GEAR_HELIX_ANGLE,
  DEFAULT_GEAR_HELIX_QUALITY,
  DEFAULT_GEAR_TEETH,
  DEFAULT_GEAR_TOOTH_SIZE,
  DEFAULT_GEAR_TYPE,
  normalizeGearCenterHoleSize,
  normalizeGearHelixAngle,
  normalizeGearHelixQuality,
  normalizeGearTeeth,
  normalizeGearToothSize,
  normalizeGearToothWidth,
  normalizeGearType,
} from "@/lib/gearGeometry";
import {
  DEFAULT_THREAD_CLEARANCE,
  DEFAULT_THREAD_DIAMETER,
  DEFAULT_THREAD_HAND,
  DEFAULT_THREAD_HEAD,
  DEFAULT_THREAD_PITCH,
  DEFAULT_THREAD_QUALITY,
  DEFAULT_THREAD_ROLE,
  normalizeThreadClearance,
  normalizeThreadDiameter,
  normalizeThreadHand,
  normalizeThreadHead,
  normalizeThreadPitch,
  normalizeThreadQuality,
  normalizeThreadRole,
  defaultThreadChamfer,
  threadNaturalFootprint,
  threadNaturalHeight,
  threadSettings,
} from "@/lib/threadGeometry";
import {
  DEFAULT_SPRING_QUALITY,
  DEFAULT_SPRING_TURNS,
  DEFAULT_SPRING_WIRE,
  normalizeSpringQuality,
  normalizeSpringTurns,
  normalizeSpringWire,
} from "@/lib/springGeometry";
import { t, type MessageKey } from "@/lib/i18n";
import type { ShapeAsset, ShapeCustomization, ShapeKind, WorkplaneShape } from "@/types/layerling";

const SHAPE_LABEL_KEYS: Record<string, MessageKey> = {
  box: "shape.box",
  cylinder: "shape.cylinder",
  sphere: "shape.sphere",
  cone: "shape.cone",
  pyramid: "shape.pyramid",
  wedge: "shape.wedge",
  text: "shape.text",
  "round-roof": "shape.roundRoof",
  "half-sphere": "shape.halfSphere",
  torus: "shape.torus",
  tube: "shape.tube",
  gear: "shape.gear",
  thread: "shape.thread",
  spring: "shape.spring",
  polygon: "shape.polygon",
  ruler: "shape.ruler",
};

export type ToolbarShapeAsset = ShapeAsset & { menuIcon: string };

export const toolbarShapeAssets: ToolbarShapeAsset[] = [
  { id: "box", name: "Box", src: "assets/editor/shape-icons-gray/box.png", menuIcon: "assets/editor/shape-icons-gray/box.png", kind: "box", color: "#d41721" },
  { id: "cylinder", name: "Cylinder", src: "assets/editor/shape-icons-gray/cylinder.png", menuIcon: "assets/editor/shape-icons-gray/cylinder.png", kind: "cylinder", color: "#d97813" },
  { id: "polygon", name: "Polygon", src: "assets/editor/shape-icons-gray/polygon.png", menuIcon: "assets/editor/shape-icons-gray/polygon.png", kind: "polygon", color: "#5b5ce2" },
  { id: "sphere", name: "Sphere", src: "assets/editor/shape-icons-gray/sphere.png", menuIcon: "assets/editor/shape-icons-gray/sphere.png", kind: "sphere", color: "#0098c7" },
  { id: "cone", name: "Cone", src: "assets/editor/shape-icons-gray/cone.png", menuIcon: "assets/editor/shape-icons-gray/cone.png", kind: "cone", color: "#6e2786" },
  { id: "pyramid", name: "Pyramid", src: "assets/editor/shape-icons-gray/pyramid.png", menuIcon: "assets/editor/shape-icons-gray/pyramid.png", kind: "pyramid", color: "#f2cf10" },
  { id: "wedge", name: "Wedge", src: "assets/editor/shape-icons-gray/wedge.png", menuIcon: "assets/editor/shape-icons-gray/wedge.png", kind: "wedge", color: "#33983d" },
  { id: "round-roof", name: "Round Roof", src: "assets/editor/shape-icons-gray/round-roof.png", menuIcon: "assets/editor/shape-icons-gray/round-roof.png", kind: "roundRoof", color: "#67c4ce" },
  { id: "half-sphere", name: "Half Sphere", src: "assets/editor/shape-icons-gray/half-sphere.png", menuIcon: "assets/editor/shape-icons-gray/half-sphere.png", kind: "halfSphere", color: "#c9009a" },
  { id: "torus", name: "Torus", src: "assets/editor/shape-icons-gray/torus.png", menuIcon: "assets/editor/shape-icons-gray/torus.png", kind: "torus", color: "#0098c7" },
  { id: "tube", name: "Tube", src: "assets/editor/shape-icons-gray/tube.png", menuIcon: "assets/editor/shape-icons-gray/tube.png", kind: "tube", color: "#ce7013" },
  { id: "text", name: "Text", src: "assets/editor/shape-icons-gray/text.png", menuIcon: "assets/editor/shape-icons-gray/text.png", kind: "text", color: "#cf101b" },
  { id: "thread", name: "Thread", src: "assets/editor/shape-icons-gray/thread.png", menuIcon: "assets/editor/shape-icons-gray/thread.png", kind: "thread", color: "#8a98a6" },
  { id: "spring", name: "Spring", src: "assets/editor/shape-icons-gray/spring.png", menuIcon: "assets/editor/shape-icons-gray/spring.png", kind: "spring", color: "#18b99a" },
  { id: "gear", name: "Gear", src: "assets/editor/gear-types/spur.png", menuIcon: "assets/editor/gear-types/spur.png", kind: "gear", color: "#6f7f8d" },
  { id: "ruler", name: "Ruler", src: "assets/editor/shape-icons-gray/ruler.png", menuIcon: "assets/editor/shape-icons-gray/ruler.png", kind: "ruler", color: "#f2e4b8" },
];

/** Feste Kreuzausdehnung und Dicke des Lineals - nur die Laenge (width) ist einstellbar. */
export const RULER_DEPTH = 25;
export const RULER_HEIGHT = 3;

export function shapeAssetDefaultDimensions(kind: ShapeKind) {
  if (kind === "thread") {
    const settings = threadSettings({});
    const footprint = threadNaturalFootprint(settings);
    return { width: footprint.width, depth: footprint.depth, height: threadNaturalHeight(settings) };
  }
  if (kind === "spring") {
    return { width: 20, depth: 20, height: 30 };
  }
  if (kind === "polygon") {
    // Breite und Tiefe im Verhaeltnis des Vielecks, damit der Sechskant beim
    // Einfuegen wirklich gleichseitig ist und nicht gestaucht.
    const aspect = regularPolygonAspect(6);
    const longest = Math.max(aspect.width, aspect.depth);
    return { width: (20 * aspect.width) / longest, depth: (20 * aspect.depth) / longest, height: 20 };
  }
  if (kind === "ruler") {
    return { width: 150, depth: RULER_DEPTH, height: RULER_HEIGHT };
  }
  const roundProfile = kind === "sphere" || kind === "torus" || kind === "ring" || kind === "halfSphere";
  const flatProfile = kind === "torus" || kind === "ring" || kind === "text" || kind === "gear";
  const size = kind === "gear" ? 30 : roundProfile ? 22 : 20;
  return {
    width: kind === "text" ? 86 : size,
    depth: kind === "text" ? 28 : size,
    height: kind === "gear" ? 6 : kind === "text" ? 10 : kind === "roundRoof" ? 10 : kind === "halfSphere" ? 11 : flatProfile ? 5 : 20,
  };
}

export function shapeAssetSpecialDefaults(kind: ShapeKind, dimensions = shapeAssetDefaultDimensions(kind)): ShapeCustomization {
  // Ohne Seitenzahl folgt sie der Groesse; eine eingetragene haelt sie fest.
  if (kind === "cylinder") return {};
  if (kind === "sphere") return { steps: 24 };
  if (kind === "halfSphere") return { steps: 32 };
  if (kind === "cone") return { topRadius: 0, baseRadius: dimensions.width / 2 };
  if (kind === "pyramid") return { sides: 4, topWidth: 0, topDepth: 0 };
  if (kind === "polygon") return { sides: 6 };
  if (kind === "roundRoof") return { sides: 64 };
  if (kind === "tube" || kind === "ring") return { bevel: 4 };
  if (kind === "text") return { text: "TEXT", font: "Multilanguage", bevel: 0, segments: 0 };
  if (kind === "spring") {
    return {
      springTurns: DEFAULT_SPRING_TURNS,
      springWire: DEFAULT_SPRING_WIRE,
      springQuality: DEFAULT_SPRING_QUALITY,
    };
  }
  if (kind === "thread") {
    return {
      threadRole: DEFAULT_THREAD_ROLE,
      threadHead: DEFAULT_THREAD_HEAD,
      threadHand: DEFAULT_THREAD_HAND,
      threadDiameter: DEFAULT_THREAD_DIAMETER,
      threadPitch: DEFAULT_THREAD_PITCH,
      threadClearance: DEFAULT_THREAD_CLEARANCE,
      threadQuality: DEFAULT_THREAD_QUALITY,
      threadChamfer: defaultThreadChamfer(DEFAULT_THREAD_PITCH),
      threadHeadChamfer: 0,
    };
  }
  if (kind === "gear") {
    const teeth = DEFAULT_GEAR_TEETH;
    const toothSize = normalizeGearToothSize(DEFAULT_GEAR_TOOTH_SIZE, dimensions.width, dimensions.depth);
    return {
      teeth,
      toothSize,
      toothWidth: normalizeGearToothWidth(undefined, dimensions.width, dimensions.depth, teeth),
      centerHoleSize: normalizeGearCenterHoleSize(DEFAULT_GEAR_CENTER_HOLE_SIZE, dimensions.width, dimensions.depth, toothSize),
      gearType: DEFAULT_GEAR_TYPE,
      helixAngle: DEFAULT_GEAR_HELIX_ANGLE,
      helixQuality: DEFAULT_GEAR_HELIX_QUALITY,
    };
  }
  return {};
}

export function sceneShape(shape: Partial<WorkplaneShape> & Pick<WorkplaneShape, "name" | "kind" | "color">): WorkplaneShape {
  const width = shape.width ?? shape.size ?? 20;
  const depth = shape.depth ?? shape.size ?? 20;
  const height = shape.height ?? 20;
  return canonicalizeShape({
    id: shape.id ?? createLocalId("shape"),
    name: shape.name,
    kind: shape.kind,
    color: shape.color,
    hole: shape.hole,
    x: shape.x ?? 0,
    z: shape.z ?? 0,
    elevation: shape.elevation ?? 0,
    size: shape.size ?? Math.max(width, depth),
    width,
    depth,
    height,
    rotation: shape.rotation ?? 0,
    rotationX: shape.rotationX ?? 0,
    rotationZ: shape.rotationZ ?? 0,
    radius: shape.radius,
    steps: shape.steps,
    sides: shape.sides,
    bevel: shape.bevel,
    segments: shape.segments,
    topRadius: shape.topRadius,
    baseRadius: shape.baseRadius,
    topWidth: shape.topWidth,
    topDepth: shape.topDepth,
    taperTopWidth: shape.taperTopWidth,
    taperTopDepth: shape.taperTopDepth,
    taperBottomWidth: shape.taperBottomWidth,
    taperBottomDepth: shape.taperBottomDepth,
    taperTopScale: shape.taperTopScale,
    taperBottomScale: shape.taperBottomScale,
    teeth: shape.teeth,
    toothSize: shape.toothSize,
    toothWidth: shape.toothWidth,
    centerHoleSize: shape.centerHoleSize,
    gearType: shape.gearType,
    helixAngle: shape.helixAngle,
    helixQuality: shape.helixQuality,
    threadRole: shape.threadRole,
    threadHead: shape.threadHead,
    threadHand: shape.threadHand,
    threadDiameter: shape.threadDiameter,
    threadPitch: shape.threadPitch,
    threadClearance: shape.threadClearance,
    threadQuality: shape.threadQuality,
    threadHeadHeight: shape.threadHeadHeight,
    threadChamfer: shape.threadChamfer,
    threadHeadChamfer: shape.threadHeadChamfer,
    springTurns: shape.springTurns,
    springWire: shape.springWire,
    springQuality: shape.springQuality,
    text: shape.text,
    font: shape.font,
    importedMesh: shape.importedMesh,
    imagePlate: shape.imagePlate,
    sketchProfile: shape.sketchProfile,
    sketchOperation: shape.sketchOperation,
    sketchRevolve: shape.sketchRevolve,
    groupedShapes: shape.groupedShapes,
    groupedBaseWidth: shape.groupedBaseWidth,
    groupedBaseDepth: shape.groupedBaseDepth,
    groupedBaseHeight: shape.groupedBaseHeight,
    groupOperation: shape.groupOperation,
    locked: shape.locked ?? false,
    hidden: shape.hidden ?? false,
  });
}

export function makeShapeFromAsset(
  asset: ShapeAsset,
  point?: { x: number; z: number; elevation?: number },
  customization: ShapeCustomization = {},
): WorkplaneShape {
  const defaults = shapeAssetDefaultDimensions(asset.kind);
  // Ein Gewinde bekommt seinen Platzbedarf aus Durchmesser und Art. Eine
  // eingetragene Breite waere hier nicht nur ueberfluessig, sondern falsch:
  // sie wuerde spaeter als Zug am Anfasser gelesen und den Durchmesser
  // verstellen.
  const threadDefaults = asset.kind === "thread" ? threadSettings({
    threadRole: customization.threadRole,
    threadHead: customization.threadHead,
    threadHand: customization.threadHand,
    threadDiameter: customization.threadDiameter,
    threadPitch: customization.threadPitch,
    threadClearance: customization.threadClearance,
    threadQuality: customization.threadQuality,
    // Diese drei fehlten hier: die Bruecke und die Formvorgaben boten sie an,
    // angekommen ist beim Anlegen aber immer nur das Normmass.
    threadHeadHeight: customization.threadHeadHeight,
    threadChamfer: customization.threadChamfer,
    threadHeadChamfer: customization.threadHeadChamfer,
  }) : null;
  const threadFootprint = threadDefaults ? threadNaturalFootprint(threadDefaults) : null;
  const width = threadFootprint?.width ?? customization.width ?? defaults.width;
  const depth = threadFootprint?.depth ?? customization.depth ?? defaults.depth;
  const height = customization.height ?? (threadDefaults ? threadNaturalHeight(threadDefaults) : defaults.height);
  const size = Math.max(width, depth);
  const gearTeeth = asset.kind === "gear" ? normalizeGearTeeth(customization.teeth ?? DEFAULT_GEAR_TEETH) : undefined;
  const gearToothSize = asset.kind === "gear" ? normalizeGearToothSize(customization.toothSize ?? DEFAULT_GEAR_TOOTH_SIZE, width, depth) : undefined;
  const threadDiameter = asset.kind === "thread" ? normalizeThreadDiameter(customization.threadDiameter ?? DEFAULT_THREAD_DIAMETER) : undefined;

  return {
    id: createLocalId(asset.id),
    name: asset.name,
    kind: asset.kind,
    color: asset.color,
    hole: asset.hole,
    x: point?.x ?? 0,
    z: point?.z ?? 0,
    elevation: point?.elevation ?? 0,
    size,
    width,
    depth,
    height,
    rotation: 0,
    rotationX: 0,
    rotationZ: 0,
    radius: asset.kind === "box" ? 0 : undefined,
    text: asset.kind === "text" ? customization.text ?? "TEXT" : undefined,
    font: asset.kind === "text" ? customization.font ?? "Multilanguage" : undefined,
    steps: asset.kind === "box" ? 10 : asset.kind === "sphere" ? customization.steps ?? 24 : asset.kind === "halfSphere" ? customization.steps ?? 32 : undefined,
    sides: asset.kind === "cylinder" || asset.kind === "cone" || asset.kind === "tube" || asset.kind === "ring" ? customization.sides : asset.kind === "roundRoof" ? customization.sides ?? 64 : asset.kind === "pyramid" ? customization.sides ?? 4 : asset.kind === "polygon" ? customization.sides ?? 6 : undefined,
    bevel: asset.kind === "cylinder" ? 0 : asset.kind === "tube" || asset.kind === "ring" ? customization.bevel ?? 4 : asset.kind === "text" ? customization.bevel : undefined,
    segments: asset.kind === "cylinder" ? 1 : asset.kind === "text" ? customization.segments : undefined,
    topRadius: asset.kind === "cone" ? customization.topRadius ?? 0 : undefined,
    baseRadius: asset.kind === "cone" ? customization.baseRadius ?? width / 2 : undefined,
    topWidth: asset.kind === "pyramid" ? normalizePyramidTop(customization.topWidth, width) : undefined,
    topDepth: asset.kind === "pyramid" ? normalizePyramidTop(customization.topDepth, depth) : undefined,
    teeth: gearTeeth,
    toothSize: gearToothSize,
    toothWidth: asset.kind === "gear" && customization.toothWidth !== undefined
      ? normalizeGearToothWidth(customization.toothWidth, width, depth, gearTeeth)
      : undefined,
    centerHoleSize: asset.kind === "gear" ? normalizeGearCenterHoleSize(customization.centerHoleSize ?? DEFAULT_GEAR_CENTER_HOLE_SIZE, width, depth, gearToothSize) : undefined,
    gearType: asset.kind === "gear" ? normalizeGearType(customization.gearType ?? DEFAULT_GEAR_TYPE) : undefined,
    helixAngle: asset.kind === "gear" ? normalizeGearHelixAngle(customization.helixAngle ?? DEFAULT_GEAR_HELIX_ANGLE) : undefined,
    helixQuality: asset.kind === "gear" ? normalizeGearHelixQuality(customization.helixQuality ?? DEFAULT_GEAR_HELIX_QUALITY) : undefined,
    threadRole: asset.kind === "thread" ? normalizeThreadRole(customization.threadRole ?? DEFAULT_THREAD_ROLE) : undefined,
    threadHead: asset.kind === "thread" ? normalizeThreadHead(customization.threadHead ?? DEFAULT_THREAD_HEAD) : undefined,
    threadHand: asset.kind === "thread" ? normalizeThreadHand(customization.threadHand ?? DEFAULT_THREAD_HAND) : undefined,
    threadDiameter: threadDiameter,
    threadPitch: asset.kind === "thread" ? normalizeThreadPitch(customization.threadPitch ?? DEFAULT_THREAD_PITCH, threadDiameter ?? DEFAULT_THREAD_DIAMETER) : undefined,
    threadClearance: asset.kind === "thread" ? normalizeThreadClearance(customization.threadClearance ?? DEFAULT_THREAD_CLEARANCE) : undefined,
    threadQuality: asset.kind === "thread" ? normalizeThreadQuality(customization.threadQuality ?? DEFAULT_THREAD_QUALITY) : undefined,
    threadHeadHeight: threadDefaults ? threadDefaults.headHeight : undefined,
    threadChamfer: threadDefaults ? threadDefaults.chamfer : undefined,
    threadHeadChamfer: threadDefaults ? threadDefaults.headChamfer : undefined,
    springTurns: asset.kind === "spring" ? normalizeSpringTurns(customization.springTurns ?? DEFAULT_SPRING_TURNS, Math.max(width, depth), height, customization.springWire) : undefined,
    springWire: asset.kind === "spring" ? normalizeSpringWire(customization.springWire ?? DEFAULT_SPRING_WIRE, Math.max(width, depth), height) : undefined,
    springQuality: asset.kind === "spring" ? normalizeSpringQuality(customization.springQuality ?? DEFAULT_SPRING_QUALITY) : undefined,
    locked: false,
    hidden: false,
  };
}

/**
 * The palette's wording for an asset. The catalogue keeps the English name as
 * the stable identity used by tests and by projects saved before translation;
 * this is what a person reads, and what a new object is named after.
 */
export function shapeAssetLabel(asset: Pick<ShapeAsset, "id" | "name">): string {
  const key = SHAPE_LABEL_KEYS[asset.id];
  return key ? t(key) : asset.name;
}

/**
 * Die Zeile im Formenmenue darf mehr sagen als der Name des Objekts. Hinter
 * "Gewinde" stecken auch Schrauben und Muttern, und wer die sucht, soll den
 * Eintrag finden - benannt wird ein neues Objekt trotzdem nur "Gewinde".
 */
const SHAPE_MENU_LABEL_KEYS: Record<string, MessageKey> = {
  thread: "shape.threadMenu",
};

export function shapeAssetMenuLabel(asset: Pick<ShapeAsset, "id" | "name">): string {
  const key = SHAPE_MENU_LABEL_KEYS[asset.id];
  return key ? t(key) : shapeAssetLabel(asset);
}
