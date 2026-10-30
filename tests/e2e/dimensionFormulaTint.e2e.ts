// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { DesignFormulasContext } from "@/components/workplane/designFormulasContext";
import { TransformOverlay, type DimensionMark, type TransformOverlayState } from "@/components/workplane/TransformOverlay";
import type { TransformOverlayProps } from "@/components/workplane/transformOverlayTypes";
import { setAdvancedMode } from "@/lib/simpleMode";
import type { WorkplaneShape } from "@/types/layerling";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  setAdvancedMode(false);
  act(() => root?.unmount());
  container?.remove();
  container = null;
  root = null;
});

const mark = (axis: DimensionMark["axis"], label: string): DimensionMark => ({
  key: axis, handleKey: axis, axis, label, x1: 0, y1: 0, x2: 0, y2: 0, e1x1: 0, e1y1: 0, e1x2: 0, e1y2: 0, e2x1: 0, e2y1: 0, e2x2: 0, e2y2: 0, labelX: 100, labelY: 100,
});
const box = {
  width: 800, height: 600, guides: [], handles: [], rotateHandles: [], rotationPlanes: {}, rotationWheels: {},
  dimensions: { width: [mark("width", "40")], height: [mark("height", "20")] }, alwaysVisibleDimensionKeys: ["width", "height"],
} as unknown as TransformOverlayState;
const shape = { id: "b1", formulas: { width: "$wall * 2", height: "(10+10)" } } as unknown as WorkplaneShape;

function mount(props: Partial<TransformOverlayProps>, errors = new Map()) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  const noop = () => {};
  const overlay = createElement(TransformOverlay, new Proxy({ box, measureKey: null, editingDimension: null, editingCorner: null, editingRotation: null, rotationReadout: null, rotationWheelAxis: "z", ...props } as TransformOverlayProps, {
    get: (target, key) => (key in target ? target[key as keyof TransformOverlayProps] : noop),
  }));
  act(() => root!.render(createElement(DesignFormulasContext.Provider, { value: { errors, nameTaken: () => false, preview: () => ({ ok: false, error: { kind: "syntax" } }), suggest: () => null } }, overlay)));
  return (label: string) => [...container!.querySelectorAll<HTMLElement>(".dimension-label")].find((element) => element.textContent === label);
}

describe("a size on the work area that a formula drives", () => {
  it("is marked in the advanced mode, with the formula as its tooltip; a plain calculation (#180) is not", () => {
    setAdvancedMode(true);
    const label = mount({ formulaShape: shape });
    expect(label("40")?.dataset.formula).toBe("driven");
    expect(label("40")?.title).toBe("$wall * 2");
    expect(label("20")?.dataset.formula).toBeUndefined();
  });

  it("turns red where its formula failed, and is not marked outside the advanced mode", () => {
    setAdvancedMode(true);
    expect(mount({ formulaShape: shape }, new Map([["b1/width", { kind: "unknown", name: "wall" }]]))("40")?.dataset.formula).toBe("error");
    act(() => root?.unmount());
    setAdvancedMode(false);
    expect(mount({ formulaShape: shape })("40")?.dataset.formula).toBeUndefined();
  });

  it("keeps the fx mark in front of the open box, which opens the formula editor and applies through the box", () => {
    setAdvancedMode(true);
    const commits: unknown[][] = [];
    const editing = { key: "height", axis: "height" as const, x: 100, y: 100, value: "20", original: "20" };
    mount({ formulaShape: shape, editingDimension: editing, onCommitDimensionEdit: (...args) => { commits.push(args); } });
    const fx = container!.querySelector<HTMLButtonElement>(".dimension-edit .formula-open");
    expect(fx?.nextElementSibling?.classList.contains("dimension-input")).toBe(true);
    act(() => fx!.click());
    const textarea = document.querySelector<HTMLTextAreaElement>(".formula-editor textarea");
    expect(textarea?.value).toBe("20");
    // The box gives up its focus to the editor without committing.
    act(() => container!.querySelector<HTMLInputElement>(".dimension-input")!.dispatchEvent(new FocusEvent("focusout", { bubbles: true })));
    expect(commits).toEqual([]);
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(textarea, "$wall * 3");
      textarea!.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => document.querySelector<HTMLButtonElement>(".formula-editor-actions .primary")!.click());
    expect(commits).toEqual([[false, false, "$wall * 3"]]);
  });

  it("has no fx mark outside the advanced mode", () => {
    mount({ formulaShape: shape, editingDimension: { key: "height", axis: "height", x: 100, y: 100, value: "20", original: "20" } });
    expect(container!.querySelector(".formula-open")).toBeNull();
    expect(container!.querySelector(".dimension-input")).not.toBeNull();
  });

  it("opens on the formula with its tint", () => {
    setAdvancedMode(true);
    mount({ formulaShape: shape, editingDimension: { key: "width", axis: "width", x: 100, y: 100, value: "$wall * 2", original: "$wall * 2" } });
    const input = container!.querySelector<HTMLInputElement>(".dimension-input");
    expect(input?.value).toBe("$wall * 2");
    expect(input?.dataset.formula).toBe("driven");
  });
});
