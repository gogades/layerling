import { describe, expect, it } from "vitest";
import { objectAttributes, evaluateDesign } from "@/components/workplane/evaluateDesign";
import { mcpShapeSummary } from "@/lib/editorMcpSummary";
import { mcpParamsIn } from "@/lib/mcpAxes";
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
});
