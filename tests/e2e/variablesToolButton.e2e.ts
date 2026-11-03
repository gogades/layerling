// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it } from "vitest";
import { VariablesToolButton } from "@/components/workplane/VariablesPanel";
import { setAdvancedMode } from "@/lib/simpleMode";

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

function mount() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root!.render(createElement(VariablesToolButton)));
  return container.querySelector("button");
}

it("shows the variables button beside the notes only in the advanced mode", () => {
  expect(mount()).toBeNull();
});

it("opens and closes the variables table", () => {
  setAdvancedMode(true);
  const button = mount()!;
  expect(button.getAttribute("aria-pressed")).toBe("false");
  act(() => button.click());
  expect(button.getAttribute("aria-pressed")).toBe("true");
  act(() => button.click());
  expect(button.getAttribute("aria-pressed")).toBe("false");
});
