import type { SketchPoint, SketchSegment } from "@/types/layerling";

/**
 * Die fertigen Formen, die sich in eine Skizze legen lassen.
 *
 * Sie entstehen als ganz gewoehnliche Punkte und Kanten - genau das, was auch
 * von Hand gezeichnet wird. Danach ist an ihnen nichts Besonderes mehr: jeder
 * Punkt laesst sich anfassen, jede Kante teilen. Ein Kreis, den man nicht mehr
 * verformen kann, waere in einer Skizze wenig wert.
 */
export type SketchPrimitive = "rectangle" | "circle" | "ellipse" | "halfCircle" | "triangle" | "hexagon";

export const SKETCH_PRIMITIVES: readonly SketchPrimitive[] = [
  "rectangle",
  "circle",
  "ellipse",
  "halfCircle",
  "triangle",
  "hexagon",
];

export function isSketchPrimitive(value: unknown): value is SketchPrimitive {
  return typeof value === "string" && (SKETCH_PRIMITIVES as readonly string[]).includes(value);
}

/**
 * Wie weit der Griff eines Bezierbogens reichen muss, damit ein Viertelkreis
 * herauskommt. Der Bogen liegt damit auf vier Nachkommastellen genau auf dem
 * echten Kreis - naeher kommt man mit vier Stuetzpunkten nicht heran.
 */
const KAPPA = 0.5522847498307936;

/** Die Kantenlaenge, mit der eine neu eingefuegte Form beginnt. */
export const SKETCH_PRIMITIVE_SIZE = 20;

export type SketchPrimitiveGeometry = { points: SketchPoint[]; segments: SketchSegment[] };
type MakeId = (prefix: string) => string;

/**
 * Die vier Stuetzpunkte einer geschlossenen Ellipse, im Uhrzeigersinn ab
 * rechts. Ein Kreis ist davon nur der Fall `rx === rz`, deshalb teilen sich
 * beide diese Funktion - sonst stuenden zwei Beschreibungen derselben Kurve
 * nebeneinander und nur eine wuerde gepflegt.
 */
function ellipsePoints(makeId: MakeId, cx: number, cz: number, rx: number, rz: number): SketchPoint[] {
  const hx = KAPPA * rx;
  const hz = KAPPA * rz;
  return [
    {
      id: makeId("sketch-point"), x: cx + rx, z: cz, mode: "smooth",
      handleIn: { x: cx + rx, z: cz - hz },
      handleOut: { x: cx + rx, z: cz + hz },
    },
    {
      id: makeId("sketch-point"), x: cx, z: cz + rz, mode: "smooth",
      handleIn: { x: cx + hx, z: cz + rz },
      handleOut: { x: cx - hx, z: cz + rz },
    },
    {
      id: makeId("sketch-point"), x: cx - rx, z: cz, mode: "smooth",
      handleIn: { x: cx - rx, z: cz + hz },
      handleOut: { x: cx - rx, z: cz - hz },
    },
    {
      id: makeId("sketch-point"), x: cx, z: cz - rz, mode: "smooth",
      handleIn: { x: cx - hx, z: cz - rz },
      handleOut: { x: cx + hx, z: cz - rz },
    },
  ];
}

/** Verbindet die Punkte der Reihe nach zu einem geschlossenen Zug. */
function closedLoop(makeId: MakeId, points: SketchPoint[], kind: SketchSegment["kind"]): SketchSegment[] {
  return points.map((point, index) => ({
    id: makeId("sketch-segment"),
    startId: point.id,
    endId: points[(index + 1) % points.length]!.id,
    kind,
  }));
}

/**
 * Der Halbkreis: Durchmesser waagerecht, Bogen darueber, und die Gerade
 * schliesst ihn. Eine Skizze wird nur extrudiert, wenn ihr Umriss geschlossen
 * ist - ein blosser Bogen waere hier also nichts, womit sich weiterarbeiten
 * liesse. Die beiden Enden sind Ecken: Dort trifft die Gerade im rechten
 * Winkel auf den Bogen, und das soll sie auch nach dem Verschieben noch.
 */
function halfCircleGeometry(makeId: MakeId, cx: number, cz: number, radius: number): SketchPrimitiveGeometry {
  const flatZ = cz + radius / 2;
  const topZ = flatZ - radius;
  const reach = KAPPA * radius;
  const rechts: SketchPoint = {
    id: makeId("sketch-point"), x: cx + radius, z: flatZ, mode: "corner",
    handleOut: { x: cx + radius, z: flatZ - reach },
  };
  const scheitel: SketchPoint = {
    id: makeId("sketch-point"), x: cx, z: topZ, mode: "smooth",
    handleIn: { x: cx + reach, z: topZ },
    handleOut: { x: cx - reach, z: topZ },
  };
  const links: SketchPoint = {
    id: makeId("sketch-point"), x: cx - radius, z: flatZ, mode: "corner",
    handleIn: { x: cx - radius, z: flatZ - reach },
  };
  const points = [rechts, scheitel, links];
  return {
    points,
    segments: [
      { id: makeId("sketch-segment"), startId: rechts.id, endId: scheitel.id, kind: "bezier" },
      { id: makeId("sketch-segment"), startId: scheitel.id, endId: links.id, kind: "bezier" },
      { id: makeId("sketch-segment"), startId: links.id, endId: rechts.id, kind: "line" },
    ],
  };
}

/**
 * Baut eine Form um `center`. `makeId` kommt von aussen, damit sich das hier
 * ohne Browser pruefen laesst.
 */
export function sketchPrimitiveGeometry(
  primitive: SketchPrimitive,
  center: { x: number; z: number },
  makeId: MakeId,
  size = SKETCH_PRIMITIVE_SIZE,
): SketchPrimitiveGeometry {
  const cx = center.x;
  const cz = center.z;
  const radius = size / 2;

  if (primitive === "circle" || primitive === "ellipse") {
    // Das Oval ist halb so hoch wie breit - flach genug, dass man es auf einen
    // Blick vom Kreis unterscheidet, ohne dass es zum Strich wird.
    const points = ellipsePoints(makeId, cx, cz, radius, primitive === "ellipse" ? radius / 2 : radius);
    return { points, segments: closedLoop(makeId, points, "bezier") };
  }

  if (primitive === "halfCircle") return halfCircleGeometry(makeId, cx, cz, radius);

  const minX = cx - radius;
  const maxX = cx + radius;
  const minZ = cz - radius;
  const maxZ = cz + radius;
  const vertices: Array<{ x: number; z: number }> = primitive === "rectangle"
    ? [
        { x: minX, z: minZ },
        { x: maxX, z: minZ },
        { x: maxX, z: maxZ },
        { x: minX, z: maxZ },
      ]
    : primitive === "triangle"
      ? [
          { x: cx, z: minZ },
          { x: maxX, z: maxZ },
          { x: minX, z: maxZ },
        ]
      : Array.from({ length: 6 }, (_, index) => {
          const angle = -Math.PI / 2 + (index * Math.PI) / 3;
          return { x: cx + Math.cos(angle) * radius, z: cz + Math.sin(angle) * radius };
        });

  const points: SketchPoint[] = vertices.map((vertex) => ({ id: makeId("sketch-point"), ...vertex, mode: "corner" }));
  return { points, segments: closedLoop(makeId, points, "line") };
}
