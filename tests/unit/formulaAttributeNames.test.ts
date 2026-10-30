import { describe, expect, it } from "vitest";
import { shapeNumberFields } from "@/components/workplane/ShapeInspector";
import { attributePath } from "@/components/workplane/evaluateDesign";
import { libraryShapeAssets, shapeAssetDefaultDimensions, shapeAssetSpecialDefaults } from "@/lib/shapeCatalog";
import { DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import type { ShapeKind, WorkplaneShape } from "@/types/layerling";

// Every field a formula can read has a readable name grouped by what it belongs to: `taper.top_length`, never `topLength`.
const READABLE = /^[a-z][a-z_]*(\.[a-z][a-z0-9_]*)+$/;

function shapeOf(kind: ShapeKind, overrides: Partial<WorkplaneShape> = {}): WorkplaneShape {
  const dimensions = shapeAssetDefaultDimensions(kind);
  return {
    id: kind, name: kind, kind, color: "#fff", x: 0, z: 0, elevation: 0, size: dimensions.width, ...dimensions,
    rotation: 0, rotationX: 0, rotationZ: 0, ...shapeAssetSpecialDefaults(kind), rotationPivot: [1, 0, 0], ...overrides,
  } as WorkplaneShape;
}

const kinds = [...new Set(libraryShapeAssets.map((asset) => (asset as { kind?: ShapeKind }).kind ?? (asset.id as ShapeKind)))]
  // A text needs its fonts loaded to show its fields; its names are in the table all the same.
  .filter((kind) => kind !== "text");
const variants: Array<[string, WorkplaneShape]> = [
  ...kinds.map((kind): [string, WorkplaneShape] => [kind, shapeOf(kind)]),
  ["gear, simple teeth", shapeOf("gear", { gearProfile: "simple" } as Partial<WorkplaneShape>)],
  ["gear, helical", shapeOf("gear", { gearType: "helical" } as Partial<WorkplaneShape>)],
  ["thread, nut", shapeOf("thread", { threadRole: "nut" } as Partial<WorkplaneShape>)],
  ["thread, screw", shapeOf("thread", { threadRole: "screw" } as Partial<WorkplaneShape>)],
  ["gridfinity baseplate", shapeOf("gridfinity", { gridfinityType: "baseplate" } as Partial<WorkplaneShape>)],
];

describe("the names formulas read fields by", () => {
  it.each(variants)("are readable and grouped for every field of a %s", (_label, shape) => {
    const paths = shapeNumberFields(shape, () => undefined, DEFAULT_WORKPLANE_WORKSPACE).map((field) => attributePath(field.id));
    for (const path of paths) expect(path, path).toMatch(READABLE);
    expect(new Set(paths).size, paths.join(" ")).toBe(paths.length);
  });

  it("names the taper, twist, slope, narrow and vase fields by their group", () => {
    expect(["topLength", "bottomWidth", "extrudeTwist", "extrudeTopOffsetX", "sides", "teeth", "vaseFloor.rubberFeet", "vase.swayAngle"].map(attributePath))
      .toEqual(["taper.top_length", "taper.bottom_width", "twist.angle", "twist.offset_width", "detail.sides", "gear.teeth", "vase.floor.rubber_feet", "vase.sway_angle"]);
    expect(["slopeEnd", "slopeAngle", "narrowEnd", "narrowStart"].map(attributePath)).toEqual(["slope.end_height", "slope.angle", "narrow.end_width", "narrow.start"]);
    // A field the table does not know yet takes its kind's group from its id.
    expect(attributePath("gridfinityPaddingBack")).toBe("gridfinity.padding_back");
    expect(attributePath("hingeSomethingNew")).toBe("hinge.something_new");
  });
});
