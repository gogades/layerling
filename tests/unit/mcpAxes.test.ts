import { describe, expect, it } from "vitest";
import { objectAttributes, evaluateDesign } from "@/components/workplane/evaluateDesign";
import { mcpShapeSummary } from "@/lib/editorMcpSummary";
import { mcpAnswerOut, mcpCommandParamsIn, mcpParamsIn } from "@/lib/mcpAxes";
import { DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import type { WorkplaneShape } from "@/types/layerling";

const box = (overrides: Partial<WorkplaneShape> = {}): WorkplaneShape => ({
  id: "box", name: "Box", kind: "box", color: "#12a4cc", x: 0, z: 0, elevation: 0,
  size: 30, width: 30, depth: 20, height: 10, rotation: 0, rotationX: 0, rotationZ: 0, locked: false, hidden: false,
  ...overrides,
});

describe("MCP names as the inspector shows them", () => {
  it("reports a body with X right, Y back, Z up and width, length, height", () => {
    const summary = mcpShapeSummary(box({ x: 5, z: -12, elevation: 3, rotation: 30, rotationX: 10, rotationZ: 20, mirrorY: true }));
    expect(summary.position).toEqual({ x: 5, y: 12, z: 3 });
    expect(summary.dimensions).toEqual({ width: 30, length: 20, height: 10, size: 30 });
    expect(summary.rotation).toEqual({ x: 10, y: -20, z: 30 });
    expect(summary.mirror).toEqual({ x: false, y: false, z: true });
  });

  it("takes the inspector's names and the earlier ones that cannot be mistaken", () => {
    expect(mcpParamsIn({ x: 5, y: 12, z: 3, length: 20, rotationY: -20, rotationZ: 30, rotationPivot: { x: 1, y: 2, z: 3 } })).toEqual({
      x: 5, z: -12, elevation: 3, depth: 20, rotationZ: 20, rotation: 30, rotationPivot: { x: 1, z: -2, elevation: 3 },
    });
    expect(mcpParamsIn({ elevation: 3, depth: 20, rotation: 30, rotationPivot: null })).toEqual({ elevation: 3, depth: 20, rotation: 30, rotationPivot: null });
    expect(() => mcpParamsIn({ z: 3, elevation: 3 })).toThrow(/z or elevation/);
    expect(() => mcpParamsIn({ rotationZ: 3, rotation: 3 })).toThrow(/rotationZ or rotation/);
  });

  it("lets formulas read a round body's size as width and length too", () => {
    const cylinder: WorkplaneShape = { ...box({ id: "can", kind: "cylinder", width: 20, depth: 20, variableName: "can" }) };
    const fields = objectAttributes(cylinder, DEFAULT_WORKPLANE_WORKSPACE).map((attribute) => attribute.field);
    expect(fields).toEqual(expect.arrayContaining(["size.diameter", "size.width", "size.length"]));
    const reader = box({ id: "reader", formulas: { height: "$can.size.length + $can.size.width" } });
    expect(evaluateDesign([cylinder, reader], [], DEFAULT_WORKPLANE_WORKSPACE).patches.get("reader")?.height).toBe(40);
  });

  const noSection = { sectionAxis: () => undefined };

  it("turns points, normals and mesh positions both ways", () => {
    // Up is [0, 0, 1] for the tools and [0, 1, 0] inside; the back is +Y outside and -z inside.
    expect(mcpCommandParamsIn("lay_flat", { normal: [0, 0, -1] }, noSection)).toEqual({ normal: [0, -1, 0] });
    expect(mcpCommandParamsIn("create_sbc_board", { x: 1, y: 2 }, noSection)).toEqual({ x: 1, z: -2 });
    expect(mcpCommandParamsIn("make_cable_channel", { entry: { x: 1, y: 2, z: 3 } }, noSection).entry).toEqual({ x: 1, y: 3, z: -2 });
    expect(mcpAnswerOut("make_cable_channel", { channel: { entry: { x: 1, y: 3, z: -2 }, length: 5 } }, {})).toEqual({ channel: { entry: { x: 1, y: 2, z: 3 }, length: 5 } });
    expect(mcpCommandParamsIn("measure_angle", { points: [[1, 2, 3], [7, 8, 9], [4, 5, 6]] }, noSection).points).toEqual([[1, 3, -2], [7, 9, -8], [4, 6, -5]]);
    expect(mcpCommandParamsIn("add_note", { text: "a", at: { x: 1, y: 2, z: 3 } }, noSection).at).toEqual({ x: 1, z: -2, elevation: 3 });
    expect(mcpCommandParamsIn("place_on_face", { point: [1, 2, 3], normal: [0, 1, 0] }, noSection)).toEqual({ point: [1, 3, -2], normal: [0, 0, -1] });
    expect(mcpCommandParamsIn("import_mesh", { positions: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, noSection).positions).toEqual([1, 3, -2, 4, 6, -5, 7, 9, -8]);
    expect(mcpCommandParamsIn("mate_faces", { facePoint: { x: 1, y: 2, z: 3 } }, noSection).facePoint).toEqual({ x: 1, z: -2, elevation: 3 });
    expect(mcpCommandParamsIn("sweep_sketch", { path: [[0, 0], [10, 5], { x: 1, y: 2 }] }, noSection).path).toEqual([[0, 0], [10, -5], { x: 1, z: -2 }]);
    expect(mcpAnswerOut("list_faces", { object: { position: { x: 0, y: 0, z: 0 } }, faces: [{ id: 1, center: [1, 3, -2], normal: [0, 1, 0] }] }, {})).toEqual({
      object: { position: { x: 0, y: 0, z: 0 } }, faces: [{ id: 1, center: [1, 2, 3], normal: [0, 0, 1] }],
    });
    expect(mcpAnswerOut("list_reference_points", { points: [{ id: "a", x: 1, z: -2, elevation: 3 }] }, {})).toEqual({ points: [{ id: "a", x: 1, y: 2, z: 3 }] });
    expect(mcpAnswerOut("list_notes", { notes: [{ id: "n", object: null, x: 1, z: -2, elevation: 3 }] }, {})).toEqual({ notes: [{ id: "n", object: null, x: 1, y: 2, z: 3 }] });
    expect(mcpAnswerOut("list_edges", { edges: [{ id: 1, points: [1, 3, -2, 4, 6, -5] }] }, {})).toEqual({ edges: [{ id: 1, points: [1, 2, 3, 4, 5, 6] }] });
  });

  it("names axes x, y, z with Y towards the back for alignment, sections and splits", () => {
    expect(mcpCommandParamsIn("align_objects", { axis: "y", target: "max" }, noSection)).toEqual({ axis: "z", target: "min" });
    expect(mcpCommandParamsIn("align_objects", { axis: "z", target: "max" }, noSection)).toEqual({ axis: "y", target: "max" });
    expect(mcpCommandParamsIn("measurements", { id: "m1", length: 20, axis: "y" }, noSection)).toEqual({ id: "m1", length: 20, axis: "z" });
    expect(mcpCommandParamsIn("measurements", { id: "m1", length: 20, axis: "z" }, noSection)).toEqual({ id: "m1", length: 20, axis: "y" });
    expect(mcpCommandParamsIn("measurements", { visible: true }, noSection)).toEqual({ visible: true });
    // The print check's thin places stand where the inspector shows them.
    expect(mcpAnswerOut("check_print", { thinWalls: { places: [{ id: "a", at: { x: 1, z: 2, elevation: 3 } }] } }, {})).toEqual({ thinWalls: { places: [{ id: "a", at: { x: 1, y: -2, z: 3 } }] } });
    expect(mcpCommandParamsIn("set_section_view", { axis: "y", offset: 12, flipped: false }, noSection)).toEqual({ axis: "z", offset: -12, flipped: true });
    expect(mcpCommandParamsIn("set_section_view", { offset: 12 }, { sectionAxis: () => "z" })).toEqual({ offset: -12 });
    const view = mcpAnswerOut("set_section_view", { settings: { enabled: true, axis: "z", offset: -12, flipped: true, showPlane: true }, bounds: { min: -30, max: 10, center: -10, step: 1 } }, {});
    expect(view).toEqual({ settings: { enabled: true, axis: "y", offset: 12, flipped: false, showPlane: true, frame: undefined }, bounds: { min: -10, max: 30, center: 10, step: 1 } });
    expect(mcpCommandParamsIn("split_objects", { axis: "y", position: 5, rotationY: 10 }, noSection)).toEqual({ axis: "y", position: -5, rotationY: -10 });
    expect(mcpAnswerOut("split_objects", { axis: "y", position: -5, min: -20, max: 4, rotationY: -10 }, {})).toEqual({ axis: "y", position: 5, min: -4, max: 20, rotationY: 10 });
    expect(mcpCommandParamsIn("sketch_from_section", { axis: "y", offset: 12, flipped: false, height: 3 }, noSection)).toEqual({ axis: "z", offset: -12, flipped: true, height: 3 });
    expect(mcpAnswerOut("sketch_from_section", { axis: "z", offset: -12, flipped: true, outlines: 2 }, {})).toEqual({ axis: "y", offset: 12, flipped: false, outlines: 2 });
    const measured = mcpAnswerOut("measure_section", { axis: "y", offset: 2, from: { x: 0, z: 0, elevation: 2, snap: "free" }, distance: 5, deltaX: 3, deltaZ: -4, deltaElevation: 0 }, {});
    expect(measured).toEqual({ axis: "z", offset: 2, from: { x: 0, y: 0, z: 2, snap: "free" }, distance: 5, deltaX: 3, deltaY: 4, deltaZ: 0 });
  });

  it("names front-to-back settings by length, as the inspector and the formulas do, and still takes the older names", () => {
    const tapered = mcpShapeSummary(box({ taperTopWidth: 12, taperTopDepth: 8, extrudeTopOffsetZ: 3 }));
    expect(tapered.settings).toMatchObject({ taperTopWidth: 12, taperTopLength: 8, extrudeTopOffsetLength: 3 });
    expect(tapered.settings).not.toHaveProperty("taperTopDepth");
    expect(mcpParamsIn({ taperTopLength: 8, loftTiltY: 10, gridfinityDividerPositionsY: [20] })).toEqual({ taperTopDepth: 8, loftTiltZ: 10, gridfinityDividerPositionsZ: [20] });
    expect(mcpParamsIn({ loftOffsetZ: 4 })).toEqual({ loftOffsetZ: 4 });
    expect(() => mcpParamsIn({ loftOffsetLength: 4, loftOffsetZ: 4 })).toThrow(/loftOffsetLength or loftOffsetZ/);
  });
});

