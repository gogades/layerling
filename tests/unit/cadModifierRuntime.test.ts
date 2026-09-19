import { describe, expect, it } from "vitest";
import {
  CAD_MODIFIER_MAX_SHARP_ANGLE,
  CAD_MODIFIER_MAX_PREPARE_TIMEOUT_MS,
  CAD_MODIFIER_REQUEST_TIMEOUT_MS,
  CAD_MODIFIER_RUNTIME_BASE,
  cadModifierPrepareTimeoutMs,
  cadModifierTopologyEdgeIsSelectable,
  cadTransformRequiresGeneralTransform,
  cadModifierTimeoutMessage,
  defaultCadModifierTangentChain,
  edgeModifierSelectionStatus,
  isCadModifierKernelExhausted,
  rescueSharpAngleForEdges,
  isCadModifierWasmMemoryFault,
  selectableCadModifierEdge,
  CAD_MODIFIER_KERNEL_RESTART_MESSAGE,
} from "@/lib/cadModifierRuntime";

describe("CAD modifier runtime state", () => {
  it("uses the build-managed OCCT runtime", () => {
    expect(CAD_MODIFIER_RUNTIME_BASE).toBe("/occt");
  });

  it("does not report zero edges before preparation finishes", () => {
    expect(edgeModifierSelectionStatus(false, 0, 0)).toBe("Preparing edges\u2026");
    expect(edgeModifierSelectionStatus(true, 0, 0)).toBe("0 of 0 sharp edges selected");
    expect(edgeModifierSelectionStatus(true, 2, 12)).toBe("2 of 12 sharp edges selected");
  });

  it("keeps exact CAD preparation short and gives imported meshes a bounded triangle-aware budget", () => {
    expect(CAD_MODIFIER_REQUEST_TIMEOUT_MS).toBeGreaterThanOrEqual(20_000);
    expect(CAD_MODIFIER_REQUEST_TIMEOUT_MS).toBeLessThanOrEqual(60_000);
    expect(cadModifierPrepareTimeoutMs(0)).toBe(CAD_MODIFIER_REQUEST_TIMEOUT_MS);
    expect(cadModifierPrepareTimeoutMs(Number.NaN)).toBe(CAD_MODIFIER_REQUEST_TIMEOUT_MS);
    expect(cadModifierPrepareTimeoutMs(10_000)).toBe(60_000);
    expect(cadModifierPrepareTimeoutMs(100_000)).toBe(120_000);
    expect(cadModifierPrepareTimeoutMs(180_000)).toBe(CAD_MODIFIER_MAX_PREPARE_TIMEOUT_MS);
    expect(cadModifierTimeoutMessage("prepare")).toContain("lower-detail STL");
    expect(cadModifierTimeoutMessage("prepare")).not.toContain("Firefox");
  });

  it("does not expose thresholds above the worker's folded edge-angle range", () => {
    expect(CAD_MODIFIER_MAX_SHARP_ANGLE).toBe(90);
  });

  it("recognizes browser-specific WebAssembly memory fault messages", () => {
    expect(isCadModifierWasmMemoryFault("toBREP: memory access out of bounds")).toBe(true);
    expect(isCadModifierWasmMemoryFault("toBREP: Out of bounds memory access (evaluating 'func(...args)')")).toBe(true);
    expect(isCadModifierWasmMemoryFault("Unreachable code reached", "RuntimeError")).toBe(true);
    expect(isCadModifierWasmMemoryFault("The selected edges cannot be filleted together", "Error")).toBe(false);
    expect(isCadModifierWasmMemoryFault("fillet: [object WebAssembly.Exception]", "OcctError")).toBe(false);
    expect(isCadModifierWasmMemoryFault("fillet: wasm exception", "OcctError")).toBe(false);
  });

  it("routes rotated non-uniform resize transforms through OCCT's general transform", () => {
    const angle = Math.PI / 4;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const rotatedNonUniformResize = [
      2 * cosine, 0, 2 * sine, 12,
      0, 1, 0, 4,
      -sine, 0, cosine, -8,
    ];
    const rigidRotation = [
      cosine, 0, sine, 12,
      0, 1, 0, 4,
      -sine, 0, cosine, -8,
    ];

    expect(cadTransformRequiresGeneralTransform(rotatedNonUniformResize)).toBe(true);
    expect(cadTransformRequiresGeneralTransform(rigidRotation)).toBe(false);
  });

  it("does not auto-chain newly created edges after an applied edge treatment", () => {
    expect(defaultCadModifierTangentChain(0)).toBe(true);
    expect(defaultCadModifierTangentChain(1)).toBe(false);
    expect(defaultCadModifierTangentChain(2)).toBe(false);
  });

  it("keeps valid post-treatment edges selectable when normal outline display suppresses them", () => {
    const hiddenDetailEdge = {
      display: false,
      selectable: true,
      manifold: true,
      boundary: false,
      angle: 45,
      points: [0, 0, 0, 1, 0, 0],
    };

    expect(cadModifierTopologyEdgeIsSelectable(hiddenDetailEdge)).toBe(true);
    expect(selectableCadModifierEdge(hiddenDetailEdge, 25)).toBe(true);
    expect(selectableCadModifierEdge(hiddenDetailEdge, 60)).toBe(false);
  });
});

/*
 * Der Unterschied, um den es hier geht: "dieser Radius passt an dieser Kante
 * nicht" ist eine Aussage ueber das Bauteil - der Kernel arbeitet weiter. Eine
 * Ausnahme aus dem WebAssembly heraus ist eine Aussage ueber den Kernel, und
 * dann muss er abgebaut werden, sonst scheitert ab da alles.
 */
describe("Kernel am Ende oder nur die Aufgabe?", () => {
  it("erkennt eine Ausnahme aus dem WebAssembly als Kernel-Ende", () => {
    expect(isCadModifierKernelExhausted("fromBREP: [object WebAssembly.Exception]")).toBe(true);
  });

  it("erkennt auch den Speicherfehler weiterhin", () => {
    expect(isCadModifierKernelExhausted("memory access out of bounds")).toBe(true);
    expect(isCadModifierKernelExhausted("etwas ganz anderes", "RuntimeError")).toBe(true);
  });

  it("laesst eine gescheiterte Verrundung den Kernel nicht kosten", () => {
    expect(isCadModifierKernelExhausted("The chosen size creates invalid or overlapping edge geometry")).toBe(false);
    expect(isCadModifierKernelExhausted("The group has no solid body to modify")).toBe(false);
    expect(isCadModifierKernelExhausted("")).toBe(false);
  });

  it("meldet den Neustart mit einem Satz, der den Anwender nicht ratlos laesst", () => {
    expect(CAD_MODIFIER_KERNEL_RESTART_MESSAGE).toContain("restarted");
    expect(isCadModifierKernelExhausted(CAD_MODIFIER_KERNEL_RESTART_MESSAGE)).toBe(false);
  });
});

/*
 * Wer ein Bauteil mit lauter flachen Uebergaengen oeffnet, sieht bei 25 Grad
 * nichts hervorgehoben und denkt, das Werkzeug koenne nur rechte Winkel. Die
 * Schwelle soll dann dorthin rutschen, wo die schaerfste Kante wirklich liegt.
 */
describe("Rettungsschwelle fuer flache Kanten", () => {
  const kante = (angle: number, extra: Partial<{ manifold: boolean; boundary: boolean; selectable: boolean }> = {}) => ({
    angle,
    manifold: true,
    boundary: false,
    selectable: true,
    ...extra,
  });

  it("laesst die Schwelle stehen, wenn ohnehin etwas waehlbar ist", () => {
    expect(rescueSharpAngleForEdges([kante(90), kante(12)], 25)).toBeNull();
  });

  it("rutscht auf die schaerfste vorhandene Kante", () => {
    expect(rescueSharpAngleForEdges([kante(12.7), kante(8), kante(3)], 25)).toBe(12);
  });

  it("zaehlt nur Kanten, die ueberhaupt bearbeitbar sind", () => {
    const kanten = [kante(20, { manifold: false }), kante(18, { boundary: true }), kante(15, { selectable: false }), kante(6)];
    expect(rescueSharpAngleForEdges(kanten, 25)).toBe(6);
  });

  it("rettet nichts, wo nur tangentiale Uebergaenge sind", () => {
    expect(rescueSharpAngleForEdges([kante(0.2), kante(0)], 25)).toBeNull();
    expect(rescueSharpAngleForEdges([], 25)).toBeNull();
  });
});
