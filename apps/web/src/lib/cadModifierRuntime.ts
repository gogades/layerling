import { t } from "@/lib/i18n";
import type { CadModifierEdge } from "@/lib/cadModifierTypes";

export const CAD_MODIFIER_RUNTIME_BASE = "/occt";
export const CAD_MODIFIER_REQUEST_TIMEOUT_MS = 30_000;
export const CAD_MODIFIER_MAX_PREPARE_TIMEOUT_MS = 180_000;
export const CAD_MODIFIER_MAX_SHARP_ANGLE = 90;

export type CadModifierRequestPhase = "prepare" | "preview";

export function cadTransformRequiresGeneralTransform(transform: number[]) {
  if (transform.length !== 12 || !transform.every(Number.isFinite)) {
    return false;
  }

  const x = [transform[0], transform[4], transform[8]];
  const y = [transform[1], transform[5], transform[9]];
  const z = [transform[2], transform[6], transform[10]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const xLengthSquared = dot(x, x);
  const yLengthSquared = dot(y, y);
  const zLengthSquared = dot(z, z);
  const scaleSquared = Math.max(xLengthSquared, yLengthSquared, zLengthSquared);
  if (scaleSquared <= 1e-18) {
    return true;
  }

  const tolerance = scaleSquared * 1e-9;
  return (
    Math.abs(dot(x, y)) > tolerance ||
    Math.abs(dot(x, z)) > tolerance ||
    Math.abs(dot(y, z)) > tolerance ||
    Math.abs(xLengthSquared - yLengthSquared) > tolerance ||
    Math.abs(xLengthSquared - zLengthSquared) > tolerance ||
    Math.abs(yLengthSquared - zLengthSquared) > tolerance
  );
}

/**
 * Nach genug Kantenarbeit in einer Sitzung weigert sich der Kernel, ein
 * gespeichertes B-Rep noch einmal zu lesen - dieselbe Zeichenkette, die er eben
 * noch verstanden hat. Der Arbeiter baut ihn dann ab; der naechste Anlauf
 * bekommt einen frischen und kommt durch. Diese Meldung ist das Signal dafuer.
 */
export const CAD_MODIFIER_KERNEL_RESTART_MESSAGE =
  "The CAD kernel ran out of room and was restarted. Wait a moment, then start the edge tool again; no page refresh is needed.";

/**
 * Eine Ausnahme aus dem WebAssembly heraus heisst: nicht dieser eine Aufruf ist
 * schiefgegangen, sondern der Kernel selbst kann nicht mehr. Ein gescheitertes
 * Verrunden - "dieser Radius passt hier nicht" - kommt dagegen als gewoehnliche
 * Meldung und darf den Kernel nicht kosten.
 */
export function isCadModifierKernelExhausted(message: string, errorName = "") {
  return message.includes("WebAssembly.Exception") || isCadModifierWasmMemoryFault(message, errorName);
}

export function isCadModifierWasmMemoryFault(message: string, errorName = "") {
  return (
    /memory access out of bounds|out of bounds memory access|\babort(?:ed)?\b/i.test(message) ||
    /^(?:WebAssembly\.)?RuntimeError$/i.test(errorName)
  );
}

/**
 * Jede Kante bringt ihren Winkel mit; die Schwelle filtert erst im Browser.
 * Bleibt bei der Voreinstellung nichts uebrig, steht der Anwender vor einem
 * Werkzeug, das nichts hervorhebt und nichts sagt - dabei ist bekannt, wie
 * scharf die schaerfste Kante hier ueberhaupt ist. Genau dorthin darf die
 * Schwelle rutschen. Nur eine tangentiale Kante (fast 0 Grad) ist keine Kante
 * mehr, die man verrunden will.
 */
export function rescueSharpAngleForEdges(
  edges: Pick<CadModifierEdge, "angle" | "manifold" | "boundary" | "selectable">[],
  sharpAngle: number,
) {
  const brauchbar = edges.filter((edge) => edge.selectable && edge.manifold && !edge.boundary);
  if (brauchbar.some((edge) => edge.angle + 1e-3 >= sharpAngle)) return null;
  const schaerfste = brauchbar.reduce((groesster, edge) => Math.max(groesster, edge.angle), 0);
  if (schaerfste < 1) return null;
  return Math.max(1, Math.floor(schaerfste));
}

export function defaultCadModifierTangentChain(appliedFeatureCount: number) {
  return appliedFeatureCount === 0;
}

export function cadModifierTopologyEdgeIsSelectable(
  edge: Pick<CadModifierEdge, "manifold" | "boundary" | "points">,
) {
  return edge.manifold && !edge.boundary && edge.points.length >= 6;
}

export function selectableCadModifierEdge(
  edge: Pick<CadModifierEdge, "display" | "selectable" | "manifold" | "boundary" | "angle">,
  sharpAngle: number,
) {
  return edge.selectable && edge.manifold && !edge.boundary && edge.angle + 1e-3 >= sharpAngle;
}

export function edgeModifierSelectionStatus(prepared: boolean, selectedCount: number, availableCount: number) {
  return prepared
    ? t("edge.selectionStatus", { selected: selectedCount, available: availableCount })
    : t("edge.preparing");
}

export function cadModifierPrepareTimeoutMs(meshTriangleCount: number) {
  if (!Number.isFinite(meshTriangleCount) || meshTriangleCount <= 0) {
    return CAD_MODIFIER_REQUEST_TIMEOUT_MS;
  }
  const normalizedTriangleCount = Math.max(0, Math.floor(meshTriangleCount));
  const meshPreparationBudget = 45_000 + normalizedTriangleCount * 0.75;
  return Math.min(
    CAD_MODIFIER_MAX_PREPARE_TIMEOUT_MS,
    Math.max(60_000, Math.ceil(meshPreparationBudget)),
  );
}

export function cadModifierTimeoutMessage(phase: CadModifierRequestPhase) {
  if (phase === "preview") {
    return "The edge preview timed out. Cancel the tool and try again.";
  }
  return "Edge preparation timed out. This mesh needs more CAD processing than the interactive limit allows. Try a repaired or lower-detail STL.";
}

export function cadModifierWorkerFailureMessage() {
  return "The CAD worker could not start. Update to Firefox 121+, Chrome/Brave 114+, or Safari 17.2+, then try again.";
}
