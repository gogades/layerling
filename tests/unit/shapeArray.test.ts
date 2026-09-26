import { describe, expect, it } from "vitest";
import { circleStepDegrees, clampArrayCount, rotateAroundVertical, rowOffset } from "@/lib/shapeArray";

describe("shape arrays", () => {
  it("keeps the count between two pieces and a hundred", () => {
    expect(clampArrayCount(1)).toBe(2);
    expect(clampArrayCount(7.4)).toBe(7);
    expect(clampArrayCount(5000)).toBe(100);
    expect(clampArrayCount(Number.NaN)).toBe(2);
  });

  it("runs a row along X, back along Y and up along Z", () => {
    expect(rowOffset({ spacing: 10, direction: "x" }, 3)).toEqual({ dx: 30, dy: 0, dz: 0 });
    // Y points to the back, which is -z in the scene.
    expect(rowOffset({ spacing: 10, direction: "y" }, 2)).toEqual({ dx: 0, dy: 0, dz: -20 });
    expect(rowOffset({ spacing: -4, direction: "z" }, 1)).toEqual({ dx: 0, dy: -4, dz: 0 });
  });

  it("shares a full circle among all pieces and spans an arc end to end", () => {
    expect(circleStepDegrees(6, 360)).toBeCloseTo(60);
    expect(circleStepDegrees(5, 90)).toBeCloseTo(22.5);
    expect(circleStepDegrees(4, -360)).toBeCloseTo(-90);
  });

  it("turns counter-clockwise seen from above, around the given centre", () => {
    // A point 10 mm right of the centre (5 | 5) ends up 10 mm behind it.
    const quarter = rotateAroundVertical({ x: 15, z: -5 }, { x: 5, y: 5 }, 90);
    expect(quarter.x).toBeCloseTo(5);
    expect(quarter.z).toBeCloseTo(-15);
    const half = rotateAroundVertical({ x: 15, z: -5 }, { x: 5, y: 5 }, 180);
    expect(half.x).toBeCloseTo(-5);
    expect(half.z).toBeCloseTo(-5);
  });
});
