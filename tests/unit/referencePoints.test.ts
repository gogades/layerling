import { describe, expect, it } from "vitest";
import { cleanReferencePosition, newReferencePositions, referencePointsForBox, unionReferenceBoxes } from "@/lib/referencePoints";
import { normalizeNotes, notesSignature, referencePoints } from "@/lib/workplaneNotes";

const box = { minX: -20, maxX: 40, minY: 0, maxY: 8, minZ: 10, maxZ: 30 };

describe("reference points", () => {
  it("marks the centre, the corners and the edge middles on the top face", () => {
    expect(referencePointsForBox(box, "center")).toEqual([{ x: 10, y: 8, z: 20 }]);
    expect(referencePointsForBox(box, "corners")).toHaveLength(4);
    expect(referencePointsForBox(box, "corners")).toContainEqual({ x: -20, y: 8, z: 30 });
    expect(referencePointsForBox(box, "midpoints")).toEqual([
      { x: 10, y: 8, z: 10 },
      { x: 40, y: 8, z: 20 },
      { x: 10, y: 8, z: 30 },
      { x: -20, y: 8, z: 20 },
    ]);
  });

  it("joins several boxes into one", () => {
    expect(unionReferenceBoxes([])).toBeNull();
    expect(unionReferenceBoxes([box, { ...box, minX: -50, maxY: 12 }])).toEqual({ ...box, minX: -50, maxY: 12 });
  });

  it("cleans float noise and skips points that are already marked", () => {
    expect(cleanReferencePosition({ x: 0.1 + 0.2, y: -1e-9, z: 5 })).toEqual({ x: 0.3, y: 0, z: 5 });
    const existing = [{ x: 10, y: 8, z: 20, kind: "point" as const }, { x: 0, y: 0, z: 0 }];
    const fresh = newReferencePositions(existing, [{ x: 10, y: 8, z: 20 }, { x: 10.0004, y: 8, z: 20 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 }]);
    // a plain note at (0, 0, 0) is not a point; the duplicate of the new one counts once
    expect(fresh).toEqual([{ x: 0, y: 0, z: 0 }, { x: 1, y: 2, z: 3 }]);
  });

  it("keeps the kind of a point through normalizing and tells it apart in the signature", () => {
    const notes = normalizeNotes([
      { id: "a", text: "hello", x: 1, y: 2, z: 3 },
      { id: "b", text: "ignored", x: 4, y: 5, z: 6, kind: "point", anchor: { shapeId: "s", normalized: [0, 0, 0] }, collapsed: true },
    ]);
    expect(notes[1]).toEqual({ id: "b", text: "", x: 4, y: 5, z: 6, kind: "point", collapsed: true });
    expect(referencePoints(notes).map((note) => note.id)).toEqual(["b"]);
    const asNote = normalizeNotes([{ id: "b", text: "", x: 4, y: 5, z: 6, collapsed: true }]);
    expect(notesSignature(notes)).not.toBe(notesSignature([notes[0], asNote[0]]));
  });
});
