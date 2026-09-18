import { describe, expect, it } from "vitest";
// @ts-expect-error - die Brücke ist einfaches JavaScript und trägt keine Typen.
import { creatableShapeKinds, shapeSettingSchema, tools } from "../../scripts/layerling-mcp-tools.mjs";
import { toolbarShapeAssets } from "@/lib/shapeCatalog";

/*
 * Die Formenliste steht an zwei Stellen: im Katalog, aus dem das Formenmenü und
 * der Editor bauen, und im Schema der MCP-Brücke, das einem KI-Client sagt, was
 * er bestellen darf. Genau hier ist schon einmal etwas auseinandergelaufen -
 * `text` konnte der Editor längst, das Schema bot es nicht an, und gemerkt hat
 * es niemand. Diese Prüfung schlägt fehl, sobald es wieder passiert.
 */

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: { properties?: Record<string, unknown> };
};

const toolList = tools as ToolDefinition[];
const kinds = creatableShapeKinds as string[];
const settingKeys = Object.keys(shapeSettingSchema as Record<string, unknown>);

function toolByName(name: string) {
  const found = toolList.find((tool) => tool.name === name);
  if (!found) throw new Error(`Werkzeug fehlt: ${name}`);
  return found;
}

/** `cube` ist ein Quader mit gleichen Kanten, `sketch` eine ausgezogene Skizze. */
const KINDS_WITHOUT_A_TILE = ["cube", "sketch"];

describe("the shape kinds the MCP bridge offers", () => {
  it("offers every shape the catalogue has a tile for", () => {
    const catalogue = toolbarShapeAssets.map((asset) => asset.kind);
    const missing = catalogue.filter((kind) => !kinds.includes(kind));
    expect(missing).toEqual([]);
  });

  it("offers nothing the editor cannot build", () => {
    const catalogue = new Set<string>(toolbarShapeAssets.map((asset) => asset.kind));
    const unknown = kinds.filter((kind) => !catalogue.has(kind) && !KINDS_WITHOUT_A_TILE.includes(kind));
    expect(unknown).toEqual([]);
  });

  it("lists the kinds in the create tool's enum", () => {
    const schema = toolByName("layerling_create_shape").inputSchema.properties?.kind as { enum?: string[] };
    expect(schema?.enum).toEqual(kinds);
  });
});

describe("the settings both shape tools accept", () => {
  it("lets every setting that can be created be changed again", () => {
    const create = toolByName("layerling_create_shape").inputSchema.properties ?? {};
    const update = toolByName("layerling_update_object").inputSchema.properties ?? {};
    const createMissing = settingKeys.filter((key) => !(key in create));
    const updateMissing = settingKeys.filter((key) => !(key in update));
    expect({ createMissing, updateMissing }).toEqual({ createMissing: [], updateMissing: [] });
  });

  it("describes every setting, because the description is all a client has to go on", () => {
    const undescribed = Object.entries(shapeSettingSchema as Record<string, { description?: string }>)
      .filter(([, value]) => !value.description?.trim())
      .map(([key]) => key);
    expect(undescribed).toEqual([]);
  });

  it("names the shape a setting belongs to", () => {
    // "Thread only", "Gear only", "Cylinder, cone, ..." - ohne diesen Hinweis
    // probiert ein Client die Feder am Quader aus.
    const vague = Object.entries(shapeSettingSchema as Record<string, { description?: string }>)
      .filter(([, value]) => !/(only|Cylinder|Sphere|Tube|Pyramid|Cone|Gear|Thread|Spring|Text)/i.test(value.description ?? ""))
      .map(([key]) => key);
    expect(vague).toEqual([]);
  });
});
