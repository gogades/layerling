import { describe, expect, it } from "vitest";
import { SKETCH_PRIMITIVES, isSketchPrimitive, sketchPrimitiveGeometry } from "@/lib/sketchPrimitives";
import type { SketchPoint, SketchSegment } from "@/types/layerling";

/*
 * Eine fertige Form taugt nur etwas, wenn ihr Umriss geschlossen ist - sonst
 * laesst sie sich nicht extrudieren, und das merkt man erst zwei Schritte
 * spaeter. Deshalb pruefen die Tests hier vor allem das: jeder Punkt genau
 * einmal Anfang und einmal Ende, und die Kurven liegen da, wo sie sollen.
 */

let zaehler = 0;
const makeId = (prefix: string) => `${prefix}-${(zaehler += 1)}`;

function punkte(points: SketchPoint[]) {
  return new Map(points.map((point) => [point.id, point]));
}

/** Laeuft der Zug einmal herum und kommt wieder an? */
function istGeschlossen(points: SketchPoint[], segments: SketchSegment[]) {
  if (segments.length !== points.length) return false;
  const anfaenge = segments.map((segment) => segment.startId).sort();
  const enden = segments.map((segment) => segment.endId).sort();
  const ids = points.map((point) => point.id).sort();
  return JSON.stringify(anfaenge) === JSON.stringify(ids) && JSON.stringify(enden) === JSON.stringify(ids);
}

/** Ein Punkt auf dem Bezierbogen zwischen zwei Stuetzpunkten. */
function aufBogen(from: SketchPoint, to: SketchPoint, amount: number) {
  const first = from.handleOut!;
  const second = to.handleIn!;
  const inverse = 1 - amount;
  return {
    x: inverse ** 3 * from.x + 3 * inverse ** 2 * amount * first.x + 3 * inverse * amount ** 2 * second.x + amount ** 3 * to.x,
    z: inverse ** 3 * from.z + 3 * inverse ** 2 * amount * first.z + 3 * inverse * amount ** 2 * second.z + amount ** 3 * to.z,
  };
}

describe("fertige Skizzenformen", () => {
  it("schliesst jede Form zu einem Ring", () => {
    for (const primitive of SKETCH_PRIMITIVES) {
      const { points, segments } = sketchPrimitiveGeometry(primitive, { x: 0, z: 0 }, makeId);
      expect(istGeschlossen(points, segments), `${primitive} ist nicht geschlossen`).toBe(true);
    }
  });

  it("legt jede Form um den angegebenen Mittelpunkt", () => {
    for (const primitive of SKETCH_PRIMITIVES) {
      const versetzt = sketchPrimitiveGeometry(primitive, { x: 40, z: -15 }, makeId);
      const mitteX = (Math.min(...versetzt.points.map((p) => p.x)) + Math.max(...versetzt.points.map((p) => p.x))) / 2;
      expect(mitteX, primitive).toBeCloseTo(40, 6);
    }
  });

  it("zeichnet den Kreis rund - auch zwischen den vier Stuetzpunkten", () => {
    const { points, segments } = sketchPrimitiveGeometry("circle", { x: 0, z: 0 }, makeId);
    expect(points).toHaveLength(4);
    expect(segments.every((segment) => segment.kind === "bezier")).toBe(true);

    const byId = punkte(points);
    for (const segment of segments) {
      for (const amount of [0.15, 0.35, 0.5, 0.65, 0.85]) {
        const auf = aufBogen(byId.get(segment.startId)!, byId.get(segment.endId)!, amount);
        // Vier Bezierboegen treffen den Kreis auf etwa ein Zehntausendstel
        // seines Halbmessers genau. Mehr ist damit nicht zu holen, weniger
        // waere sichtbar.
        expect(Math.hypot(auf.x, auf.z)).toBeCloseTo(10, 2);
      }
    }
  });

  it("macht das Oval halb so hoch wie breit", () => {
    const { points } = sketchPrimitiveGeometry("ellipse", { x: 0, z: 0 }, makeId);
    const breite = Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
    const hoehe = Math.max(...points.map((p) => p.z)) - Math.min(...points.map((p) => p.z));
    expect(breite).toBeCloseTo(20, 6);
    expect(hoehe).toBeCloseTo(10, 6);
  });

  it("gibt dem Halbkreis eine gerade Sehne und einen Bogen darueber", () => {
    const { points, segments } = sketchPrimitiveGeometry("halfCircle", { x: 0, z: 0 }, makeId);
    expect(points).toHaveLength(3);
    expect(segments.filter((segment) => segment.kind === "bezier")).toHaveLength(2);
    expect(segments.filter((segment) => segment.kind === "line")).toHaveLength(1);

    const gerade = segments.find((segment) => segment.kind === "line")!;
    const byId = punkte(points);
    const von = byId.get(gerade.startId)!;
    const nach = byId.get(gerade.endId)!;
    expect(von.z).toBeCloseTo(nach.z, 6);
    expect(Math.abs(nach.x - von.x)).toBeCloseTo(20, 6);

    // Der Scheitel liegt einen vollen Halbmesser ueber der Sehne.
    const scheitel = points.find((point) => point.id !== von.id && point.id !== nach.id)!;
    expect(von.z - scheitel.z).toBeCloseTo(10, 6);

    // Und der Bogen dazwischen bleibt auf dem Kreis um die Mitte der Sehne.
    for (const segment of segments.filter((s) => s.kind === "bezier")) {
      for (const amount of [0.25, 0.5, 0.75]) {
        const auf = aufBogen(byId.get(segment.startId)!, byId.get(segment.endId)!, amount);
        expect(Math.hypot(auf.x, auf.z - von.z)).toBeCloseTo(10, 2);
      }
    }
  });

  it("baut die eckigen Formen aus Geraden", () => {
    for (const [primitive, ecken] of [["rectangle", 4], ["triangle", 3], ["hexagon", 6]] as const) {
      const { points, segments } = sketchPrimitiveGeometry(primitive, { x: 0, z: 0 }, makeId);
      expect(points, primitive).toHaveLength(ecken);
      expect(segments.every((segment) => segment.kind === "line"), primitive).toBe(true);
      expect(points.every((point) => point.mode === "corner"), primitive).toBe(true);
    }
  });

  it("nimmt nur die Formen an, die es gibt", () => {
    expect(isSketchPrimitive("circle")).toBe(true);
    expect(isSketchPrimitive("halfCircle")).toBe(true);
    expect(isSketchPrimitive("kreisel")).toBe(false);
    expect(isSketchPrimitive(null)).toBe(false);
  });

  it("skaliert mit der uebergebenen Groesse", () => {
    const { points } = sketchPrimitiveGeometry("rectangle", { x: 0, z: 0 }, makeId, 50);
    expect(Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x))).toBeCloseTo(50, 6);
  });
});
