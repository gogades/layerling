import { describe, expect, it } from "vitest";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { normalizeDesignVariables, type DesignVariable } from "@/lib/designVariables";
import { editorHistoryEntry, hydrateEditorHistoryState, projectSceneFingerprint, variablesForHistoryIndex } from "@/lib/editorHistory";
import { exportLylProject, importLylProject, type LylProjectDocumentV1, type LylProjectExportInput } from "@/lib/lylProject";
import { DEFAULT_SNAP_GRID, DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import type { WorkplaneShape } from "@/types/layerling";

const box = (overrides: Partial<WorkplaneShape> = {}): WorkplaneShape => ({
  id: "box-1", name: "Box", kind: "box", color: "#12a4cc", x: 0, z: 0, elevation: 0,
  size: 20, width: 20, depth: 20, height: 20, rotation: 0, rotationX: 0, rotationZ: 0, locked: false, hidden: false,
  ...overrides,
});
const wall: DesignVariable = { name: "Wall", formula: "2", description: "Wall thickness", value: 2 };
const lid: DesignVariable = { name: "lid_gap", formula: "$wall / 4", value: 0.5 };

function input(shapes: WorkplaneShape[], overrides: Partial<LylProjectExportInput> = {}): LylProjectExportInput {
  return {
    projectId: "variables", projectName: "Variables", createdAt: 1, modifiedAt: 2, shapes,
    history: [editorHistoryEntry(shapes, [])], historyIndex: 0, assets: [],
    workspace: DEFAULT_WORKPLANE_WORKSPACE, snapGrid: DEFAULT_SNAP_GRID, placementElevation: 0,
    ...overrides,
  };
}

describe("the variables table and variable names (advanced mode)", () => {
  it("keeps the rows that make sense, with names unique in any case", () => {
    const rows = normalizeDesignVariables([
      wall, lid,
      { name: "WALL", formula: "3", value: 3 },
      { name: "2wide", formula: "1", value: 1 },
      { name: "self", formula: "1", value: 1 },
      { name: "has space", formula: "1", value: 1 },
      { name: "loose", formula: 7, value: "x", description: 9 },
      null, 42,
    ]);
    expect(rows).toEqual([wall, lid, { name: "loose", formula: "", value: 0 }]);
    expect(normalizeDesignVariables("nope")).toEqual([]);
  });

  it("makes a table edit a step of the history of its own", () => {
    const shapes = [box()];
    const without = editorHistoryEntry(shapes, []);
    const withTable = editorHistoryEntry(shapes, [], [], undefined, [wall]);
    expect(withTable.fingerprint).not.toBe(without.fingerprint);
    expect(editorHistoryEntry(shapes, [], [], undefined, [{ ...wall, value: 3 }]).fingerprint).not.toBe(withTable.fingerprint);
    expect(without).not.toHaveProperty("variables");
    expect(projectSceneFingerprint(shapes, [], undefined, [wall])).toBe(withTable.fingerprint);
  });

  it("keeps the history when a caller does not hand in the table", () => {
    const shapes = [box()];
    const entries = [editorHistoryEntry(shapes, []), editorHistoryEntry(shapes, [], [], undefined, [wall, lid])];
    const hydrated = hydrateEditorHistoryState(shapes, entries, 1);
    expect(hydrated.entries).toHaveLength(2);
    expect(variablesForHistoryIndex(hydrated.entries, hydrated.index)).toEqual([wall, lid]);
    expect(variablesForHistoryIndex(hydrated.entries, 0)).toEqual([]);
  });

  it("saves the table per state and the variable names in a .lyl file", async () => {
    const shapes = [box({ variableName: "lid", formulas: { width: "$wall * 2 + $lid_gap".padEnd(120, " ") } })];
    const first = editorHistoryEntry(shapes, []);
    const second = editorHistoryEntry(shapes, [], [], undefined, [wall, lid]);
    const exported = await exportLylProject(input(shapes, { history: [first, second], historyIndex: 1 }));

    const document = JSON.parse(strFromU8(unzipSync(exported)["project.json"])) as LylProjectDocumentV1;
    expect(document.states).toHaveLength(2);
    const restored = await importLylProject(exported);
    expect(restored.history).toHaveLength(2);
    expect(variablesForHistoryIndex(restored.history, 0)).toEqual([]);
    expect(variablesForHistoryIndex(restored.history, restored.historyIndex)).toEqual([wall, lid]);
    expect(restored.shapes[0].variableName).toBe("lid");
    expect(restored.shapes[0].formulas?.width).toHaveLength(120);
  });

  it("refuses a file whose variable name is not a name", async () => {
    const exported = await exportLylProject(input([box({ variableName: "lid" })]));
    const files = unzipSync(exported);
    const document = JSON.parse(strFromU8(files["project.json"])) as LylProjectDocumentV1;
    document.states[0].nodes[0].definition.variableName = "my lid";
    files["project.json"] = strToU8(JSON.stringify(document));
    await expect(importLylProject(zipSync(files))).rejects.toThrow("variableName");
  });
});
