import { describe, expect, it } from "vitest";
import { editorHistoryEntry } from "@/lib/editorHistory";
import { exportLylProject, importLylProject } from "@/lib/lylProject";
import { makeShapeFromAsset, toolbarShapeAssets } from "@/lib/shapeCatalog";
import { canonicalizeShape } from "@/lib/workplaneShapes";
import { DEFAULT_SNAP_GRID, DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import {
  createThreadGeometry,
  defaultThreadPitch,
  normalizeThreadPitch,
  normalizeThreadQuality,
  threadNaturalFootprint,
  threadSettings,
  threadSizeFor,
  defaultThreadChamfer,
  defaultThreadHeadHeight,
  pitchToThreadsPerInch,
  threadUsesInchPitch,
  threadsPerInchToPitch,
  threadHeadDiameter,
} from "@/lib/threadGeometry";
import type { ThreadRole } from "@/types/layerling";

type Position = {
  count: number;
  getX: (index: number) => number;
  getY: (index: number) => number;
  getZ: (index: number) => number;
};

/**
 * Jede Kante eines geschlossenen Koerpers gehoert genau zwei Dreiecken. Steht
 * irgendwo eine Eins, hat der Koerper ein Loch; steht dort eine Drei, liegen
 * Flaechen doppelt. Beides faellt beim Drucken auf, hier vorher.
 */
function edgeUseCounts(position: Position) {
  const uses = new Map<string, number>();
  const keyForPoint = (index: number) => [position.getX(index), position.getY(index), position.getZ(index)]
    .map((value) => value.toFixed(5))
    .join(",");
  for (let index = 0; index + 2 < position.count; index += 3) {
    const triangle = [keyForPoint(index), keyForPoint(index + 1), keyForPoint(index + 2)];
    if (triangle[0] === triangle[1] || triangle[1] === triangle[2] || triangle[0] === triangle[2]) continue;
    for (let edge = 0; edge < 3; edge += 1) {
      const a = triangle[edge];
      const b = triangle[(edge + 1) % 3];
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      uses.set(key, (uses.get(key) ?? 0) + 1);
    }
  }
  return uses;
}

/** Positiv heisst: die Dreiecke schauen nach aussen. */
function signedVolume(position: Position) {
  let total = 0;
  for (let index = 0; index + 2 < position.count; index += 3) {
    const ax = position.getX(index);
    const ay = position.getY(index);
    const az = position.getZ(index);
    const bx = position.getX(index + 1);
    const by = position.getY(index + 1);
    const bz = position.getZ(index + 1);
    const cx = position.getX(index + 2);
    const cy = position.getY(index + 2);
    const cz = position.getZ(index + 2);
    total += (ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx)) / 6;
  }
  return total;
}

function geometryFor(role: ThreadRole, height: number, overrides: Record<string, unknown> = {}) {
  const settings = threadSettings({ threadRole: role, threadDiameter: 6, threadPitch: 1, ...overrides });
  const footprint = threadNaturalFootprint(settings);
  return {
    settings,
    footprint,
    geometry: createThreadGeometry({
      width: footprint.width,
      depth: footprint.depth,
      height,
      threadRole: role,
      threadDiameter: 6,
      threadPitch: 1,
      ...overrides,
    }),
  };
}

describe("thread geometry", () => {
  it.each<[ThreadRole, number]>([["rod", 20], ["screw", 24], ["nut", 5], ["bore", 14]])(
    "creates a closed %s that fills the requested bounds",
    (role, height) => {
      const { geometry, footprint } = geometryFor(role, height);
      const position = geometry.getAttribute("position") as unknown as Position;

      expect(position.count).toBeGreaterThan(1000);
      expect([...edgeUseCounts(position).values()].every((uses) => uses === 2)).toBe(true);
      expect(signedVolume(position)).toBeGreaterThan(0);
      expect(geometry.boundingBox?.min.y).toBeCloseTo(0, 5);
      expect(geometry.boundingBox?.max.y).toBeCloseTo(height, 5);
      expect((geometry.boundingBox?.max.x ?? 0) - (geometry.boundingBox?.min.x ?? 0)).toBeCloseTo(footprint.width, 4);
      expect((geometry.boundingBox?.max.z ?? 0) - (geometry.boundingBox?.min.z ?? 0)).toBeCloseTo(footprint.depth, 4);
    },
  );

  it("stays closed on a left-hand thread and on a coarse pitch", () => {
    for (const overrides of [{ threadHand: "left" }, { threadPitch: 4 }, { threadPitch: 0.35 }]) {
      const { geometry } = geometryFor("rod", 12, overrides);
      const position = geometry.getAttribute("position") as unknown as Position;
      expect([...edgeUseCounts(position).values()].every((uses) => uses === 2)).toBe(true);
      expect(signedVolume(position)).toBeGreaterThan(0);
    }
  });

  it("stays closed for every screw head", () => {
    for (const threadHead of ["cylinder", "countersunk", "hex"]) {
      const { geometry } = geometryFor("screw", 24, { threadHead });
      const position = geometry.getAttribute("position") as unknown as Position;
      expect([...edgeUseCounts(position).values()].every((uses) => uses === 2)).toBe(true);
      expect(signedVolume(position)).toBeGreaterThan(0);
    }
  });

  it("cuts the thread between the minor and the major diameter", () => {
    const { geometry } = geometryFor("rod", 20);
    const position = geometry.getAttribute("position") as unknown as Position;
    let smallest = Number.POSITIVE_INFINITY;
    let largest = 0;
    for (let index = 0; index < position.count; index += 1) {
      const y = position.getY(index);
      // Die Deckel ziehen den Radius bis zur Mitte, deshalb nur die Mantelflaeche.
      if (y < 4 || y > 16) continue;
      const radius = Math.hypot(position.getX(index), position.getZ(index));
      if (radius < smallest) smallest = radius;
      if (radius > largest) largest = radius;
    }
    // M6 mit einem Millimeter Steigung: Aussenradius 3, Kernradius rund 2,46.
    expect(largest).toBeCloseTo(3, 3);
    expect(smallest).toBeCloseTo(3 - 0.5413, 3);
  });

  it("hollows the nut out and leaves the bore wider than the bolt", () => {
    const nut = geometryFor("nut", 5);
    const nutVolume = signedVolume(nut.geometry.getAttribute("position") as unknown as Position);
    const acrossFlats = nut.footprint.depth;
    const solidHexVolume = ((Math.sqrt(3) / 2) * acrossFlats * acrossFlats) * 5;
    expect(nutVolume).toBeGreaterThan(solidHexVolume * 0.4);
    expect(nutVolume).toBeLessThan(solidHexVolume * 0.85);

    const bore = geometryFor("bore", 14, { threadClearance: 0.4, threadChamfer: 0 });
    const rod = geometryFor("rod", 14, { threadChamfer: 0 });
    expect(bore.footprint.width).toBeCloseTo(rod.footprint.width + 0.4, 6);
    // Die Fase weitet das Schneidwerkzeug am Mund zur Ansenkung auf.
    const sunk = geometryFor("bore", 14, { threadClearance: 0.4, threadChamfer: 0.8 });
    expect(sunk.footprint.width).toBeCloseTo(bore.footprint.width + 1.6, 6);
  });

  it("keeps the standard sizes reachable and the free values in range", () => {
    expect(threadSizeFor(6, 1)?.id).toBe("M6");
    expect(threadSizeFor(6, 1.25)).toBeNull();
    expect(defaultThreadPitch(8)).toBe(1.25);
    // Eine Steigung groesser als der Durchmesser haette keinen Kern mehr uebrig.
    expect(normalizeThreadPitch(40, 6)).toBe(4.5);
    expect(normalizeThreadQuality(50)).toBe(48);
    expect(normalizeThreadQuality(1000)).toBe(96);
  });

  it("carries the thread settings through a saved package", async () => {
    const asset = toolbarShapeAssets.find((entry) => entry.kind === "thread");
    expect(asset).toBeDefined();
    const shape = makeShapeFromAsset(asset!, { x: 4, z: 6 }, {
      threadRole: "screw",
      threadHead: "hex",
      threadHand: "left",
      threadDiameter: 8,
      threadPitch: 1.25,
      threadClearance: 0.35,
      threadQuality: 60,
    });
    const shapes = [shape];
    const bytes = await exportLylProject({
      projectId: "project-thread",
      projectName: "Gewinde",
      createdAt: 1_700_000_000_000,
      modifiedAt: 1_700_000_100_000,
      shapes,
      history: [editorHistoryEntry(shapes, [])],
      historyIndex: 0,
      assets: [],
      workspace: DEFAULT_WORKPLANE_WORKSPACE,
      snapGrid: DEFAULT_SNAP_GRID,
      placementElevation: 0,
    });
    const restored = await importLylProject(bytes);
    const loaded = restored.shapes[0];

    expect(loaded.kind).toBe("thread");
    expect(loaded.threadRole).toBe("screw");
    expect(loaded.threadHead).toBe("hex");
    expect(loaded.threadHand).toBe("left");
    expect(loaded.threadDiameter).toBe(8);
    expect(loaded.threadPitch).toBe(1.25);
    expect(loaded.threadClearance).toBe(0.35);
    expect(loaded.threadQuality).toBe(60);
  });
  it("turns a pull on the handles into a diameter, never into an oval", () => {
    const asset = toolbarShapeAssets.find((entry) => entry.kind === "thread");
    const shape = makeShapeFromAsset(asset!, { x: 0, z: 0 });
    expect(shape.threadDiameter).toBe(6);
    expect(shape.width).toBeCloseTo(6, 6);

    // So schreibt der Anfasser im Arbeitsbereich: direkt in Breite und Tiefe.
    const dragged = canonicalizeShape({ ...shape, width: 12, depth: 9 });

    expect(dragged.width).toBeCloseTo(dragged.depth as number, 6);
    expect(dragged.threadDiameter).toBeCloseTo(10.5, 6);
    expect(dragged.width).toBeCloseTo(10.5, 6);
    // Die Steigung waechst mit, sonst haette der Koerper kein stimmiges Profil.
    expect(dragged.threadPitch).toBeCloseTo(1.75, 6);

    // Ohne Zug bleibt alles, wie es ist - sonst liefe jedes Speichern davon.
    const again = canonicalizeShape(dragged);
    expect(again.threadDiameter).toBeCloseTo(dragged.threadDiameter as number, 9);
    expect(again.width).toBeCloseTo(dragged.width as number, 9);
  });

  it("keeps the head height on its own and lets the countersunk crown follow it", () => {
    const screw = threadSettings({ threadRole: "screw", threadHead: "cylinder", threadDiameter: 6, threadPitch: 1 });
    expect(screw.headHeight).toBeCloseTo(defaultThreadHeadHeight(screw), 6);
    expect(screw.headHeight).toBeCloseTo(6, 6);

    const flatter = threadSettings({ threadRole: "screw", threadHead: "cylinder", threadDiameter: 6, threadPitch: 1, threadHeadHeight: 3 });
    expect(flatter.headHeight).toBeCloseTo(3, 6);
    // Der Zylinderkopf behaelt seinen Durchmesser, der Senkkopf nicht.
    expect(threadHeadDiameter(flatter)).toBeCloseTo(threadHeadDiameter(screw), 6);

    const sunk = threadSettings({ threadRole: "screw", threadHead: "countersunk", threadDiameter: 6, threadPitch: 1 });
    expect(sunk.headHeight).toBeCloseTo(3, 6);
    expect(threadHeadDiameter(sunk)).toBeCloseTo(12, 6);
    const sunkFlat = threadSettings({ threadRole: "screw", threadHead: "countersunk", threadDiameter: 6, threadPitch: 1, threadHeadHeight: 2 });
    expect(threadHeadDiameter(sunkFlat)).toBeCloseTo(10, 6);
    expect(threadNaturalFootprint(sunkFlat).width).toBeCloseTo(10, 6);

    // Der Kopf darf die Gewindelaenge nicht auffressen.
    const tall = createThreadGeometry({
      width: 10,
      depth: 10,
      height: 24,
      threadRole: "screw",
      threadDiameter: 6,
      threadPitch: 1,
      threadHeadHeight: 9,
    });
    expect(tall.boundingBox?.max.y).toBeCloseTo(24, 5);
    expect(tall.boundingBox?.min.y).toBeCloseTo(0, 5);
  });
  it("breaks the sharp edge at the ends and stays closed doing it", () => {
    const plain = geometryFor("rod", 16, { threadChamfer: 0 });
    const plainPosition = plain.geometry.getAttribute("position") as unknown as Position;
    expect([...edgeUseCounts(plainPosition).values()].every((uses) => uses === 2)).toBe(true);

    const chamfer = defaultThreadChamfer(1);
    const broken = geometryFor("rod", 16, { threadChamfer: chamfer });
    const position = broken.geometry.getAttribute("position") as unknown as Position;
    expect([...edgeUseCounts(position).values()].every((uses) => uses === 2)).toBe(true);
    expect(signedVolume(position)).toBeGreaterThan(0);
    expect(signedVolume(position)).toBeLessThan(signedVolume(plainPosition));

    // Die Vorgabe ist genau die Gewindetiefe: die Stirnflaeche endet damit auf
    // dem Kerndurchmesser, die Kuppe laeuft unter 45 Grad darauf zu.
    let widest = 0;
    for (let index = 0; index < position.count; index += 1) {
      if (position.getY(index) > 0.001) continue;
      widest = Math.max(widest, Math.hypot(position.getX(index), position.getZ(index)));
    }
    expect(widest).toBeCloseTo(3 - chamfer, 3);

    // Auf halber Hoehe darf die Fase nichts weggenommen haben.
    let middle = 0;
    for (let index = 0; index < position.count; index += 1) {
      const y = position.getY(index);
      if (y < 7 || y > 9) continue;
      middle = Math.max(middle, Math.hypot(position.getX(index), position.getZ(index)));
    }
    expect(middle).toBeCloseTo(3, 3);
  });

  it("carries the inch sizes with the same profile", () => {
    const quarterUnc = threadSizeFor(6.35, 25.4 / 20);
    expect(quarterUnc?.id).toBe('1/4"-20 UNC');
    expect(quarterUnc?.system).toBe("inch");
    const quarterUnf = threadSizeFor(6.35, 25.4 / 28);
    expect(quarterUnf?.id).toBe('1/4"-28 UNF');
    // Grob und fein teilen sich den Durchmesser, nur die Steigung trennt sie.
    expect(quarterUnf?.diameter).toBeCloseTo(quarterUnc?.diameter as number, 9);

    expect(threadUsesInchPitch(6.35)).toBe(true);
    expect(threadUsesInchPitch(6)).toBe(false);
    expect(pitchToThreadsPerInch(threadsPerInchToPitch(20))).toBeCloseTo(20, 9);
    expect(pitchToThreadsPerInch(1.27)).toBeCloseTo(20, 6);

    const { geometry, footprint } = geometryFor("rod", 20, { threadDiameter: 6.35, threadPitch: 25.4 / 20 });
    const position = geometry.getAttribute("position") as unknown as Position;
    expect([...edgeUseCounts(position).values()].every((uses) => uses === 2)).toBe(true);
    expect(footprint.width).toBeCloseTo(6.35, 6);
  });
});
