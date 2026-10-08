import { describe, expect, it } from "vitest";
import { sceneLightLevels } from "@/lib/workplaneGrid";
import { DEFAULT_WORKPLANE_WORKSPACE, normalizeWorkspaceSettings } from "@/lib/workplaneSettings";

describe("shading contrast and shadow strength", () => {
  it("start as the lighting layerling always had", () => {
    expect(DEFAULT_WORKPLANE_WORKSPACE.shadeContrast).toBe(0);
    expect(DEFAULT_WORKPLANE_WORKSPACE.shadowStrength).toBe(100);
    expect(sceneLightLevels(0)).toEqual({ ambient: 2.1, key: 3.1, fill: 1.2 });
  });

  it("moves light from the even ambient to the key light for more contrast, and back for less", () => {
    const punchy = sceneLightLevels(100);
    const soft = sceneLightLevels(-100);
    expect(punchy.ambient).toBeLessThan(2.1);
    expect(punchy.key).toBeGreaterThan(3.1);
    expect(soft.ambient).toBeGreaterThan(2.1);
    expect(soft.key).toBeLessThan(3.1);
    expect(sceneLightLevels(500)).toEqual(punchy);
    expect(sceneLightLevels(Number.NaN)).toEqual(sceneLightLevels(0));
  });

  it("keeps what was chosen, within range, and takes older settings as the defaults", () => {
    expect(normalizeWorkspaceSettings({ shadeContrast: 40, shadowStrength: 60 })).toMatchObject({ shadeContrast: 40, shadowStrength: 60 });
    expect(normalizeWorkspaceSettings({ shadeContrast: 900, shadowStrength: -5 })).toMatchObject({ shadeContrast: 100, shadowStrength: 0 });
    expect(normalizeWorkspaceSettings({ gridColor: "#c08a12" })).toMatchObject({ shadeContrast: 0, shadowStrength: 100 });
  });
});

describe("sketch colour settings", () => {
  it("start as the sketch always looked, keep a chosen colour and refuse a broken one", () => {
    expect(DEFAULT_WORKPLANE_WORKSPACE.sketchBackground).toBe("#fcfbf8");
    expect(normalizeWorkspaceSettings({ sketchBackground: "#ffffff", sketchGridColor: "#0e69f1" })).toMatchObject({ sketchBackground: "#ffffff", sketchGridColor: "#0e69f1" });
    expect(normalizeWorkspaceSettings({ sketchBackground: "white", sketchGridColor: 3 })).toMatchObject({
      sketchBackground: DEFAULT_WORKPLANE_WORKSPACE.sketchBackground,
      sketchGridColor: DEFAULT_WORKPLANE_WORKSPACE.sketchGridColor,
    });
  });
});
