import { describe, expect, it } from "vitest";
import { attributePath, designAfterEdit, designUsesFormulas, evaluateDesign, formulasAfterEdit, variableKey } from "@/components/workplane/evaluateDesign";
import type { DesignVariable } from "@/lib/designVariables";
import { formulaReferences, shiftFormula } from "@/lib/formula";
import { DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import type { WorkplaneShape } from "@/types/layerling";

const box = (id: string, overrides: Partial<WorkplaneShape> = {}): WorkplaneShape => ({
  id, name: id, kind: "box", color: "#12a4cc", x: 0, z: 0, elevation: 0,
  size: 20, width: 20, depth: 20, height: 20, rotation: 0, rotationX: 0, rotationZ: 0, locked: false, hidden: false,
  ...overrides,
});
const row = (name: string, formula: string, value = 0): DesignVariable => ({ name, formula, value });
const run = (shapes: WorkplaneShape[], variables: DesignVariable[] = [], workspace = DEFAULT_WORKPLANE_WORKSPACE) => evaluateDesign(shapes, variables, workspace);

describe("recalculating a design (advanced mode)", () => {
  it("lists the references a formula reads", () => {
    expect(formulaReferences("$a * 2 + sqrt($box.size.width) - $a")).toEqual(["a", "box.size.width", "a"]);
    expect(attributePath("positionX")).toBe("position.x");
    expect(attributePath("width")).toBe("size.width");
    expect(attributePath("teeth")).toBe("teeth");
  });

  it("works a chain out in dependency order, whatever order it stands in", () => {
    const follower = box("follower", { variableName: "follower", formulas: { positionX: "$lid.size.width + $gap" } });
    const lid = box("lid", { variableName: "lid", formulas: { width: "$wall * 10" } });
    const result = run([follower, lid], [row("gap", "$wall / 2"), row("wall", "3")]);
    expect(result.errors.size).toBe(0);
    expect(result.variables.map((variable) => variable.value)).toEqual([1.5, 3]);
    expect(result.patches.get("lid")?.width).toBe(30);
    expect(result.patches.get("follower")?.x).toBe(31.5);
  });

  it("reads names and attributes in any case", () => {
    const shapes = [box("a", { variableName: "Lid" }), box("b", { formulas: { height: "$LID.Size.Width + $WALL" } })];
    expect(run(shapes, [row("wall", "1")]).patches.get("b")?.height).toBe(21);
  });

  it("reads the body's own fields as $self", () => {
    expect(run([box("a", { formulas: { height: "$self.size.width * 2" } })]).patches.get("a")?.height).toBe(40);
  });

  it("marks a loop and leaves it where it stands", () => {
    const result = run([box("a", { variableName: "a", formulas: { width: "$a.size.height", height: "$a.size.width" } })], [row("p", "$q", 7), row("q", "$p", 8)]);
    expect(result.errors.get(variableKey("p"))).toEqual({ kind: "cycle" });
    expect(result.errors.get("a/width")).toEqual({ kind: "cycle" });
    expect(result.errors.get("a/height")).toEqual({ kind: "cycle" });
    expect(result.variables.map((variable) => variable.value)).toEqual([7, 8]);
    expect(result.patches.size).toBe(0);
  });

  it("keeps the last value when a name is gone", () => {
    const result = run([box("a", { formulas: { width: "$missing.size.width" } })]);
    expect(result.errors.get("a/width")).toEqual({ kind: "unknown", name: "missing.size.width" });
    expect(result.patches.size).toBe(0);
  });

  it("leaves a remembered calculation (#180) and a locked body alone, and says why for the locked one", () => {
    const stale = box("stale", { width: 30, formulas: { width: "(10+2)" } });
    const locked = box("locked", { locked: true, formulas: { width: "$wall" } });
    const result = run([stale, locked], [row("wall", "5")]);
    expect(result.patches.size).toBe(0);
    expect(result.errors.get("stale/width")).toBeUndefined();
    expect(result.errors.get("locked/width")).toEqual({ kind: "locked" });
    // A locked body whose formula already holds has nothing to say.
    expect(run([locked], [row("wall", "20")]).errors.size).toBe(0);
  });

  it("settles fields that move each other, and finds nothing to do the second time", () => {
    // Turning about an off-centre pivot moves the position, which its own formula then puts back.
    const turned = box("turned", { rotationPivot: [10, 0, 0], formulas: { positionX: "$px", rotateZ: "$angle" } });
    const table = [row("px", "5"), row("angle", "90")];
    const first = run([turned], table);
    expect(first.errors.size).toBe(0);
    const after = { ...turned, ...first.patches.get("turned") };
    expect(after.rotation).toBe(90);
    expect(after.x).toBeCloseTo(5);
    expect(run([after], table).patches.size).toBe(0);
  });

  it("gives no change for a value held at its limit", () => {
    const shrunk = run([box("a", { formulas: { width: "$wall - 50" } })], [row("wall", "5")]);
    const held = { ...box("a", { formulas: { width: "$wall - 50" } }), ...shrunk.patches.get("a") };
    expect(held.width).toBeGreaterThan(0);
    expect(run([held], [row("wall", "5")]).patches.size).toBe(0);
  });

  it("works in the unit the fields show", () => {
    const imperial = { ...DEFAULT_WORKPLANE_WORKSPACE, units: "Imperial" };
    const result = run([box("a", { formulas: { width: "$wall * 2" } })], [row("wall", "0.5")], imperial);
    expect(result.patches.get("a")?.width).toBeCloseTo(25.4);
  });

  it("writes a moved field's change onto its formula", () => {
    expect(shiftFormula("$a * 2", 5)).toBe("$a * 2 + 5");
    expect(shiftFormula("$a + 1", 4)).toBe("$a + 5");
    expect(shiftFormula("$a + 1", -1)).toBe("$a");
    expect(shiftFormula("$box.position.x - 3", 1)).toBe("$box.position.x - 2");
    expect(shiftFormula("$a * -3", 2)).toBe("$a * -3 + 2");
    expect(shiftFormula("($a + 1) * 2", 0.5)).toBe("($a + 1) * 2 + 0.5");
  });

  it("shifts a dragged field's formula in the advanced mode and drops it outside, leaving plain arithmetic alone", () => {
    const before = box("a", { formulas: { width: "$wall * 2", height: "(10+10)", positionX: "$wall" } });
    const dragged = { ...before, width: 25, height: 30 };
    expect(formulasAfterEdit([before], [dragged], [row("wall", "10", 10)], DEFAULT_WORKPLANE_WORKSPACE, true)[0].formulas).toEqual({ width: "$wall * 2 + 5", height: "(10+10)", positionX: "$wall" });
    expect(formulasAfterEdit([before], [dragged], [row("wall", "10", 10)], DEFAULT_WORKPLANE_WORKSPACE, false)[0].formulas).toEqual({ height: "(10+10)", positionX: "$wall" });
  });

  it("keeps the formula of a body moved together with the one it follows", () => {
    const leader = box("leader", { variableName: "leader", x: 0 });
    const follower = box("follower", { x: 10, formulas: { positionX: "$leader.position.x + 10" } });
    const moved = [{ ...leader, x: 5 }, { ...follower, x: 15 }];
    expect(formulasAfterEdit([leader, follower], moved, [], DEFAULT_WORKPLANE_WORKSPACE, true)).toBe(moved);
    const settled = designAfterEdit([leader, follower], moved, [], DEFAULT_WORKPLANE_WORKSPACE, true, (shape, patch) => ({ ...shape, ...patch }));
    expect(settled.shapes[1].x).toBe(15);
  });

  it("does not shift a formula that was typed in the same edit", () => {
    const before = box("a", { formulas: { width: "$wall" } });
    const typed = { ...before, formulas: { width: "$wall * 3" } };
    const after = [typed];
    expect(formulasAfterEdit([before], after, [], DEFAULT_WORKPLANE_WORKSPACE, true)).toBe(after);
  });

  it("settles an edit: the dragged formula shifts, the follower follows, the table keeps its array when nothing changed", () => {
    const table = [row("wall", "10", 10)];
    const lid = box("lid", { variableName: "lid", width: 10, formulas: { width: "$wall" } });
    const follower = box("follower", { formulas: { positionX: "$lid.size.width" }, x: 10 });
    const apply = (shape: WorkplaneShape, patch: Partial<WorkplaneShape>) => ({ ...shape, ...patch });
    const settled = designAfterEdit([lid, follower], [{ ...lid, width: 14 }, follower], table, DEFAULT_WORKPLANE_WORKSPACE, true, apply);
    expect(settled.shapes[0].formulas?.width).toBe("$wall + 4");
    expect(settled.shapes[0].width).toBe(14);
    expect(settled.shapes[1].x).toBe(14);
    expect(settled.variables).toBe(table);
    expect(designAfterEdit([lid], [lid], table, DEFAULT_WORKPLANE_WORKSPACE, false, apply).shapes).toEqual([lid]);
  });

  it("knows whether a design uses the advanced mode at all", () => {
    expect(designUsesFormulas([box("a", { formulas: { width: "(1+2)" } })], [])).toBe(false);
    expect(designUsesFormulas([box("a", { formulas: { width: "$w" } })], [])).toBe(true);
    expect(designUsesFormulas([box("a", { variableName: "a" })], [])).toBe(true);
    expect(designUsesFormulas([box("a")], [row("w", "1")])).toBe(true);
  });
});
