// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { ShapeInspector } from "@/components/workplane/ShapeInspector";
import { setAdvancedMode } from "@/lib/simpleMode";
import { DEFAULT_SNAP_GRID, DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import { canonicalizeShape } from "@/lib/workplaneShapes";
import type { WorkplaneShape } from "@/types/layerling";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  Element.prototype.scrollTo ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  setAdvancedMode(false);
  act(() => root?.unmount());
  container?.remove();
  container = null;
  root = null;
});

const box = (extra: Partial<WorkplaneShape> = {}) => canonicalizeShape({ id: "b1", name: "Box", kind: "box", color: "#d41721", x: 0, z: 0, elevation: 0, rotation: 0, width: 77, depth: 33, height: 11, size: 77, ...extra });

function mount(shape: WorkplaneShape) {
  const updates: Array<Partial<WorkplaneShape>> = [];
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(createElement(ShapeInspector, {
      shape,
      snap: DEFAULT_SNAP_GRID,
      snapOpen: false,
      workspace: DEFAULT_WORKPLANE_WORKSPACE,
      onUpdate: (patch: Partial<WorkplaneShape>) => updates.push(patch),
      onSnapChange: () => {},
      onSnapOpenChange: () => {},
    }));
  });
  return { panel: container, updates };
}

const control = (panel: HTMLElement, name: string) => [...panel.querySelectorAll<HTMLLabelElement>("label.range-property")]
  .find((row) => row.querySelector(".range-property-name")?.textContent === name)!
  .querySelector<HTMLElement>(".range-value-control")!;

/**
 * A click that lands on a field's row but not on the field - its words, or a click whose press and release fell on
 * different parts of the row, as when the fx button shows up and pushes the field aside - goes to the field. It went to
 * the row's first button, the reset arrow, and set the value back to its default (a formula then kept the difference).
 */
describe("a click on a field's row in the shape's settings", () => {
  it("does not reset the value", () => {
    const { panel, updates } = mount(box());
    const rows = [...panel.querySelectorAll<HTMLLabelElement>("label.range-property")].filter((row) => row.querySelector(".property-reset"));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      act(() => row.querySelector<HTMLElement>(".range-property-name")!.click());
      act(() => row.querySelector<HTMLElement>(".range-value-control")!.click());
    }
    expect(updates).toEqual([]);
  });
});

/** The advanced mode's fx mark at the start of a field is the button that opens the formula editor. */
describe("the fx mark of a field", () => {
  it("opens the formula editor on a field a formula drives, without entering the field first", () => {
    setAdvancedMode(true);
    const { panel, updates } = mount(box({ formulas: { width: "$self.size.height * 7" } }));
    const width = control(panel, "Width");
    // Before the number, so its coming and going never moves the number.
    expect(width.firstElementChild?.className).toBe("formula-open");
    act(() => width.querySelector<HTMLButtonElement>(".formula-open")!.click());
    expect(document.querySelector<HTMLTextAreaElement>(".formula-editor textarea")?.value).toBe("$self.size.height * 7");
    expect(updates).toEqual([]);
  });

  it("comes with the focus on a field without a formula, at its start", () => {
    setAdvancedMode(true);
    const { panel } = mount(box());
    const height = control(panel, "Height");
    expect(height.querySelector(".formula-open")).toBeNull();
    act(() => height.querySelector<HTMLInputElement>("input")!.focus());
    expect(height.firstElementChild?.className).toBe("formula-open");
  });
});
