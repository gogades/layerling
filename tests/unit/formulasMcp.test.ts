import { beforeEach, describe, expect, it } from "vitest";
import { designAfterEdit, withRenamedReference } from "@/components/workplane/evaluateDesign";
import { formulasMcpCommand } from "@/components/workplane/formulasMcp";
import type { DesignVariable } from "@/lib/designVariables";
import { setAdvancedMode } from "@/lib/simpleMode";
import { DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import type { WorkplaneShape } from "@/types/layerling";

const box = (id: string, overrides: Partial<WorkplaneShape> = {}): WorkplaneShape => ({
  id, name: id, kind: "box", color: "#12a4cc", x: 0, z: 0, elevation: 0,
  size: 20, width: 20, depth: 20, height: 20, rotation: 0, rotationX: 0, rotationZ: 0, locked: false, hidden: false,
  ...overrides,
});

// The editor in miniature: a commit settles the design the way commitShapes does, the table goes through it too.
let shapes: WorkplaneShape[] = [];
let variables: DesignVariable[] = [];
let steps = 0;
const commit = (next: WorkplaneShape[]) => {
  const settled = designAfterEdit(shapes, next, variables, DEFAULT_WORKPLANE_WORKSPACE, true, (shape, patch) => ({ ...shape, ...patch }));
  shapes = settled.shapes;
  variables = settled.variables;
  steps += 1;
};
const deps = {
  shapes: () => shapes,
  variables: () => variables,
  workspace: () => DEFAULT_WORKPLANE_WORKSPACE,
  commit,
  setTable: (rows: DesignVariable[], rename?: { from: string; to: string }) => {
    const renamed = rename ? withRenamedReference(shapes, rows, rename.from, rename.to) : { shapes, rows };
    variables = renamed.rows;
    commit(renamed.shapes);
  },
};
const run = (action: string, params: Record<string, unknown> = {}) => formulasMcpCommand(action, params, deps) as Record<string, unknown>;

describe("formulas and variables through MCP", () => {
  beforeEach(() => {
    setAdvancedMode(true);
    shapes = [box("lid"), box("follower")];
    variables = [];
    steps = 0;
  });

  it("reads and switches the advanced mode", () => {
    expect(run("advanced_mode")).toEqual({ mode: "advanced" });
    expect(run("advanced_mode", { enabled: false })).toEqual({ mode: "normal" });
    expect(() => run("variables", { set: [{ name: "wall", formula: "2" }] })).toThrow(/advanced mode/);
    expect(run("variables")).toMatchObject({ mode: "normal", variables: [] });
    expect(() => run("advanced_mode", { enabled: "yes" })).toThrow(/true or false/);
  });

  it("sets, renames and removes rows of the table, each change one step", () => {
    const set = run("variables", { set: [{ name: "wall", formula: "2", description: "Wall" }, { name: "double", formula: "$wall * 2" }] });
    expect(set.variables).toEqual([
      { name: "wall", formula: "2", description: "Wall", value: 2 },
      { name: "double", formula: "$wall * 2", value: 4 },
    ]);
    expect(steps).toBe(1);
    const renamed = run("variables", { rename: { from: "WALL", to: "thickness" } });
    expect(renamed.variables).toMatchObject([{ name: "thickness" }, { name: "double", formula: "$thickness * 2", value: 4 }]);
    const removed = run("variables", { remove: ["thickness"] });
    expect(removed.variables).toMatchObject([{ name: "double", error: { kind: "unknown" } }]);
    expect(() => run("variables", { set: [{ name: "2bad", formula: "1" }] })).toThrow(/not a variable name/);
    expect(() => run("variables", { set: [{ name: "x", formula: "2 +" }] })).toThrow(/cannot be read/);
    expect(() => run("variables", { remove: ["nothing"] })).toThrow(/no variable/);
  });

  it("gives a body a variable name and formulas by their readable field names", () => {
    run("variables", { set: [{ name: "wall", formula: "3" }] });
    const lid = run("object_formulas", { id: "lid", variableName: "lid", formulas: { "size.width": "$wall * 10" } });
    expect(lid).toMatchObject({ id: "lid", variableName: "lid", formulas: [{ field: "size.width", formula: "$wall * 10", value: 30 }] });
    expect((lid.attributes as Array<{ field: string }>).map((attribute) => attribute.field)).toEqual(expect.arrayContaining(["size.width", "position.x", "rotation.z", "taper.top_length", "twist.angle"]));
    const follower = run("object_formulas", { id: "follower", formulas: { "Position.X": "$lid.size.width + 5" } });
    expect(follower).toMatchObject({ formulas: [{ field: "position.x", value: 35 }] });
    expect(shapes.find((shape) => shape.id === "follower")?.x).toBe(35);
    // Renaming the body rewrites the formulas that use it.
    run("object_formulas", { id: "lid", variableName: "cap" });
    expect(run("object_formulas", { id: "follower" })).toMatchObject({ formulas: [{ formula: "$cap.size.width + 5", value: 35 }] });
    // null removes a formula and keeps the value.
    expect(run("object_formulas", { id: "follower", formulas: { "position.x": null } })).toMatchObject({ formulas: [] });
    expect(shapes.find((shape) => shape.id === "follower")?.x).toBe(35);
  });

  it("refuses what the panel refuses", () => {
    run("object_formulas", { id: "lid", variableName: "lid" });
    expect(() => run("object_formulas", { id: "follower", variableName: "LID" })).toThrow(/already used/);
    expect(() => run("object_formulas", { id: "lid", formulas: { "size.nothing": "1" } })).toThrow(/no field size.nothing/);
    expect(() => run("object_formulas", { id: "missing" })).toThrow(/no object/);
    shapes = shapes.map((shape) => (shape.id === "lid" ? { ...shape, locked: true } : shape));
    expect(() => run("object_formulas", { id: "lid", formulas: { "size.width": "5" } })).toThrow(/locked/);
  });

  it("works a formula out without changing anything", () => {
    shapes = [box("lid", { variableName: "lid", width: 30 })];
    expect(run("evaluate_formula", { formula: "$lid.size.width / 2" })).toEqual({ ok: true, value: 15 });
    expect(run("evaluate_formula", { formula: "$self.size.width + 1", id: "lid" })).toEqual({ ok: true, value: 31 });
    expect(run("evaluate_formula", { formula: "$nobody" })).toMatchObject({ ok: false, error: { kind: "unknown" } });
    expect(steps).toBe(0);
    expect(formulasMcpCommand("list_objects", {}, deps)).toBeUndefined();
  });
});
