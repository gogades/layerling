import { beforeAll, describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { OcctKernel, type ShapeHandle } from "occt-wasm";
import { shellSolid } from "@/lib/cadShell";

// Layerling is Y-up; OCCT primitives are built along Z.
const ROTATE_Z_TO_Y: number[] = [
  1, 0, 0, 0,
  0, 0, 1, 0,
  0, -1, 0, 0,
];

describe("hollowing a solid with the real OCCT kernel", () => {
  let kernel: OcctKernel;

  beforeAll(async () => {
    const wasm = join(dirname(fileURLToPath(import.meta.resolve("occt-wasm"))), "occt-wasm.wasm");
    kernel = await OcctKernel.init({ wasm });
  });

  function yUp(shape: ShapeHandle) {
    const turned = kernel.transform(shape, ROTATE_Z_TO_Y);
    kernel.release(shape);
    return turned;
  }

  // 40 x 20 x 30 (x, y = up, z), standing on y = 0.
  function box() {
    return yUp(kernel.makeBox(40, 30, 20));
  }

  function expectHollow(result: ShapeHandle, expectedVolume: number) {
    expect(kernel.isValid(result)).toBe(true);
    expect(kernel.getVolume(result)).toBeCloseTo(expectedVolume, 3);
    const bounds = kernel.getBoundingBox(result, false);
    // Walls grow inward: the outside does not move.
    expect(bounds.xmax - bounds.xmin).toBeCloseTo(40, 4);
    expect(bounds.ymax - bounds.ymin).toBeCloseTo(20, 4);
    expect(bounds.zmax - bounds.zmin).toBeCloseTo(30, 4);
  }

  it("opens the top of a box like a tray", () => {
    const solid = box();
    const result = shellSolid(kernel, solid, 2, "top");
    // Cavity 36 x 18 x 26: the floor stays 2 mm, the top is gone.
    expectHollow(result, 40 * 20 * 30 - 36 * 18 * 26);
    kernel.release(result);
    kernel.release(solid);
  });

  it("opens the bottom of a box like a lid", () => {
    const solid = box();
    const result = shellSolid(kernel, solid, 2, "bottom");
    expectHollow(result, 40 * 20 * 30 - 36 * 18 * 26);
    kernel.release(result);
    kernel.release(solid);
  });

  it("opens top and bottom into a frame", () => {
    const solid = box();
    const result = shellSolid(kernel, solid, 2, "top-bottom");
    expectHollow(result, 40 * 20 * 30 - 36 * 20 * 26);
    kernel.release(result);
    kernel.release(solid);
  });

  it("closes a box on every side around a sealed cavity", () => {
    const solid = box();
    const result = shellSolid(kernel, solid, 2, "none");
    expectHollow(result, 40 * 20 * 30 - 36 * 16 * 26);
    kernel.release(result);
    kernel.release(solid);
  });

  it("turns a cylinder into a cup with its opening on top", () => {
    const solid = yUp(kernel.makeCylinder(10, 20));
    const result = shellSolid(kernel, solid, 1.5, "top");
    expect(kernel.isValid(result)).toBe(true);
    const expected = Math.PI * 10 * 10 * 20 - Math.PI * 8.5 * 8.5 * 18.5;
    expect(kernel.getVolume(result) / expected).toBeCloseTo(1, 3);
    kernel.release(result);
    kernel.release(solid);
  });

  it("hollows a sphere, which has no flat face, as a closed shell", () => {
    const solid = kernel.makeSphere(10);
    const result = shellSolid(kernel, solid, 1, "none");
    const expected = (4 / 3) * Math.PI * (10 ** 3 - 9 ** 3);
    expect(kernel.getVolume(result) / expected).toBeCloseTo(1, 2);
    kernel.release(result);
    kernel.release(solid);
  });

  it("explains when there is no flat face to open", () => {
    const solid = kernel.makeSphere(10);
    expect(() => shellSolid(kernel, solid, 1, "top")).toThrow(/no flat top face/);
    kernel.release(solid);
  });

  it("refuses walls too thick for the body", () => {
    const solid = box();
    // Two 16 mm walls do not fit into the 30 mm depth.
    expect(() => shellSolid(kernel, solid, 16, "top")).toThrow(/thinner wall/);
    kernel.release(solid);
  });
});
