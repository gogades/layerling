import { describe, expect, it } from "vitest";
import { designAfterEdit, designNameTaken, designUsesFormulas, evaluateDesign, formulasAfterEdit, withRenamedReference } from "@/components/workplane/evaluateDesign";
import type { DesignVariable } from "@/lib/designVariables";
import { groupedShape, restoreGroupedChildren } from "@/lib/editorBooleans";
import { groupWithPartsChanged } from "@/lib/regroup";
import { DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import type { WorkplaneShape } from "@/types/layerling";

const box = (id: string, overrides: Partial<WorkplaneShape> = {}): WorkplaneShape => ({
  id, name: id, kind: "box", color: "#12a4cc", x: 0, z: 0, elevation: 0,
  size: 20, width: 20, depth: 20, height: 20, rotation: 0, rotationX: 0, rotationZ: 0, locked: false, hidden: false,
  ...overrides,
});
const workspace = DEFAULT_WORKPLANE_WORKSPACE;
const apply = (shape: WorkplaneShape, patch: Partial<WorkplaneShape>) => ({ ...shape, ...patch });
const wall = (formula: string): DesignVariable => ({ name: "wall", formula, value: Number(formula) });

/** A body and a hole put together as a bundle, which builds without the kernel; the hole's width follows $wall. */
function plate(holeOverrides: Partial<WorkplaneShape> = {}) {
  const group = groupedShape([box("body", { x: 0, width: 60 }), box("hole", { x: 10, hole: true, variableName: "hole", formulas: { width: "$wall * 10" }, ...holeOverrides })]);
  return { ...(group as WorkplaneShape), id: "plate", groupOperation: "bundle" as const };
}
const holeIn = (group: WorkplaneShape) => group.groupedShapes?.find((part) => part.hole) as WorkplaneShape;

describe("formulas of parts inside a closed group (advanced mode)", () => {
  it("works a part's formula out and hands the change to its group's build", () => {
    const group = plate();
    const result = evaluateDesign([group], [wall("3")], workspace);
    expect(result.patches.size).toBe(0);
    expect(result.groups.get("plate")?.get(holeIn(group).id)).toMatchObject({ width: 30 });
    expect(designUsesFormulas([group], [])).toBe(true);
  });

  it("reads a part where opening its group puts it, and holds a part of a locked group", () => {
    const moved = { ...plate(), x: 100 };
    const reader = box("reader", { formulas: { positionX: "$hole.position.x" } });
    expect(evaluateDesign([moved, reader], [wall("2")], workspace).patches.get("reader")?.x).toBeCloseTo(restoreGroupedChildren(moved).find((part) => part.hole)?.x as number, 6);
    const locked = evaluateDesign([{ ...plate(), locked: true }], [wall("3")], workspace);
    expect(locked.groups.size).toBe(0);
    expect([...locked.errors.values()]).toEqual([{ kind: "locked" }]);
  });

  it("asks for no build when the part already has its value", () => {
    expect(evaluateDesign([plate()], [wall("2")], workspace).groups.size).toBe(0);
  });

  it("builds the group again with the part changed, staying the same group", async () => {
    const group = { ...plate(), variableName: "plate", name: "Plate" };
    const stale = evaluateDesign([group], [wall("3")], workspace).groups.get("plate") as Map<string, Partial<WorkplaneShape>>;
    const rebuilt = (await groupWithPartsChanged(group, stale, apply, 1e6)).group as WorkplaneShape;
    expect(rebuilt).toMatchObject({ id: "plate", name: "Plate", variableName: "plate", groupOperation: "bundle" });
    expect(holeIn(rebuilt).width).toBeCloseTo(30, 6);
    expect(holeIn(rebuilt).formulas?.width).toBe("$wall * 10");
    // Built, the group asks for nothing more.
    expect(evaluateDesign([rebuilt], [wall("3")], workspace).groups.size).toBe(0);
  });

  it("writes a group's move onto its parts' formulas, or drops them outside the advanced mode", () => {
    const group = plate({ formulas: { width: "$wall * 10", positionX: "$wall * 5" } });
    const moved = { ...group, x: group.x + 7 };
    const shifted = formulasAfterEdit([group], [moved], [wall("2")], workspace, true);
    expect(holeIn(shifted[0]).formulas).toEqual({ width: "$wall * 10", positionX: "$wall * 5 + 7" });
    expect(evaluateDesign(shifted, [wall("2")], workspace).groups.size).toBe(0);
    expect(holeIn(formulasAfterEdit([group], [moved], [wall("2")], workspace, false)[0]).formulas).toEqual({ width: "$wall * 10" });
  });

  it("renames, checks and takes away names of parts inside groups too", () => {
    const group = plate();
    const reader = box("reader", { formulas: { height: "$hole.size.width" } });
    expect(designNameTaken([group], [], "HOLE")).toBe(true);
    expect(designNameTaken([group], [], "hole", { shapeId: holeIn(group).id })).toBe(false);
    const renamed = withRenamedReference([{ ...group, groupedShapes: group.groupedShapes?.map((part) => ({ ...part, formulas: part.hole ? { width: "$hole.size.height" } : undefined })) }, reader], [], "hole", "bore");
    expect(holeIn(renamed.shapes[0]).formulas?.width).toBe("$bore.size.height");
    expect(renamed.shapes[1].formulas?.height).toBe("$bore.size.width");
    // A pasted copy of the group gives up its part's name.
    const copy = { ...group, id: "copy" };
    const settled = designAfterEdit([group], [group, copy], [wall("2")], workspace, true, apply);
    expect(settled.blanked).toEqual(["hole"]);
    expect(holeIn(settled.shapes[1]).variableName).toBeUndefined();
    expect(holeIn(settled.shapes[0]).variableName).toBe("hole");
  });
});
