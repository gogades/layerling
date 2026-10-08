import { describe, expect, it } from "vitest";
import { sketchPrimitiveGeometry } from "@/lib/sketchPrimitives";
import { withSmoothSketchHandles } from "@/lib/sketchSmoothHandles";
import type { SketchProfile } from "@/types/layerling";

let counter = 0;
const makeId = (prefix: string) => `${prefix}-${(counter += 1)}`;

describe("smooth sketch handles", () => {
  it("leaves a circle and a line alone when a smooth curve is added elsewhere", () => {
    const circle = sketchPrimitiveGeometry("circle", { x: 0, z: 0 }, makeId);
    const line: SketchProfile = {
      points: [
        { id: "l1", x: 50, z: 0, mode: "corner" },
        { id: "l2", x: 50, z: 30, mode: "corner" },
      ],
      segments: [{ id: "ls", startId: "l1", endId: "l2", kind: "line" }],
    };
    const smooth: SketchProfile = {
      points: [
        { id: "s1", x: -50, z: 0, mode: "smooth" },
        { id: "s2", x: -40, z: 20, mode: "smooth" },
        { id: "s3", x: -30, z: 0, mode: "smooth" },
      ],
      segments: [
        { id: "ss1", startId: "s1", endId: "s2", kind: "smooth" },
        { id: "ss2", startId: "s2", endId: "s3", kind: "smooth" },
      ],
    };
    const before: SketchProfile = {
      points: [...circle.points, ...line.points, ...smooth.points],
      segments: [...circle.segments, ...line.segments, ...smooth.segments],
    };
    const after = withSmoothSketchHandles(before);
    for (const point of [...circle.points, ...line.points]) {
      const next = after.points.find((entry) => entry.id === point.id);
      expect(next).toEqual(point);
    }
    const middle = after.points.find((entry) => entry.id === "s2");
    expect(middle?.handleIn).toBeDefined();
    expect(middle?.handleOut).toBeDefined();
    expect(middle!.handleIn!.x + middle!.handleOut!.x).toBeCloseTo(middle!.x * 2);
    expect(Math.abs(middle!.handleOut!.x - middle!.x)).toBeGreaterThan(0);
  });

  it("still smooths the curve that was drawn", () => {
    const profile: SketchProfile = {
      points: [
        { id: "a", x: 0, z: 0 },
        { id: "b", x: 10, z: 10 },
        { id: "c", x: 20, z: 0 },
      ],
      segments: [
        { id: "s1", startId: "a", endId: "b", kind: "smooth" },
        { id: "s2", startId: "b", endId: "c", kind: "smooth" },
      ],
    };
    const after = withSmoothSketchHandles(profile);
    expect(after.points.every((point) => point.mode === "smooth" && point.handleIn && point.handleOut)).toBe(true);
  });
});
