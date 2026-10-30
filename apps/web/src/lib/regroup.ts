import { buildHullShapeFromSelection, buildIntersectionShapeFromSelection, groupedShape, restoreGroupedChildren } from "@/lib/editorBooleans";
import { buildGroupedShapeOffThread } from "@/lib/geometryWorker";
import { canPaintShape } from "@/lib/paint";
import { rebasePaintStrokes } from "@/lib/paintMesh";
import { carryShapePivot } from "@/lib/rotationPivot";
import { buildSketchLoftFromSelection } from "@/lib/sketchLoft";
import { canonicalizeShape, withHoleMode } from "@/lib/workplaneShapes";
import type { WorkplaneShape } from "@/types/layerling";

export type RegroupResult = { group: WorkplaneShape | null; failureNotice?: string; mergeWarning?: string };

/**
 * A group built again from `parts` the way it was put together (group, intersection, hull, bundle, loft) and still the
 * same group: its id stays, so anything holding that id (MCP, the object list, the level around it) still finds it, and
 * so do its name, solid or hole, see-through, hidden, lock, resize mode (Discussion #526), colours, variable name and formulas - and its colour, if it
 * had been given one apart from its first part. Its pivot stays on the same spot however the parts moved (#807).
 * What Done does for an opened group, and the advanced mode's formulas for a closed one.
 */
export async function regroupParts(original: WorkplaneShape, parts: WorkplaneShape[], triangleLimit: number, signal?: AbortSignal): Promise<RegroupResult> {
  const operation = original.groupOperation === "intersection" || original.groupOperation === "hull" || original.groupOperation === "bundle" || original.groupOperation === "loft" ? original.groupOperation : "group";
  const result = operation === "intersection"
    ? await buildIntersectionShapeFromSelection(parts, triangleLimit)
    : operation === "hull"
      ? await buildHullShapeFromSelection(parts, triangleLimit, { keepHoles: Boolean(original.hullKeepHoles) })
      : operation === "loft"
        ? await buildSketchLoftFromSelection(parts)
        : operation === "bundle"
          ? { group: groupedShape(parts) }
          : await buildGroupedShapeOffThread(parts, triangleLimit, signal);
  if (!result.group) return { group: null, failureNotice: "failureNotice" in result && result.failureNotice ? result.failureNotice : undefined };
  const firstSolid = original.groupedShapes?.find((child) => !child.hole) ?? original.groupedShapes?.[0];
  const ownColour = Boolean(firstSolid && firstSolid.color !== original.color);
  const rebuilt = canonicalizeShape({ ...result.group, groupOperation: operation });
  const group = canonicalizeShape(carryShapePivot(original, withHoleMode({
    ...rebuilt,
    id: original.id,
    name: original.name,
    color: ownColour ? original.color : rebuilt.color,
    transparent: original.transparent,
    hidden: original.hidden,
    groupResize: original.groupResize,
    locked: original.locked,
    // Multicolor switched on or off stays so after Done; a group cut into one body lost it and turned one colour (#1323).
    ...(typeof original.multicolor === "boolean" ? { multicolor: original.multicolor } : {}),
    variableName: original.variableName,
    formulas: original.formulas,
  }, Boolean(original.hole))));
  // The group's own paint (paint.ts) goes over to the group built again, where it lay in the world.
  if (original.paint?.length && canPaintShape(group)) group.paint = rebasePaintStrokes(original.paint, original, group);
  return { group, mergeWarning: "mergeWarning" in result && typeof result.mergeWarning === "string" ? result.mergeWarning : undefined };
}

/** Whether `shape` or a part inside it, at any depth, has its id in `ids`. */
function holdsAny(shape: WorkplaneShape, ids: ReadonlyMap<string, unknown>): boolean {
  return ids.has(shape.id) || Boolean(shape.groupedShapes?.some((part) => holdsAny(part, ids)));
}

/**
 * A closed group with some of its parts changed - by the id they have in the group, at any depth - and built again from
 * the inside out. Each part is changed where opening the group puts it, with `apply`, as typing into its field would.
 */
export async function groupWithPartsChanged(
  group: WorkplaneShape,
  patches: ReadonlyMap<string, Partial<WorkplaneShape>>,
  apply: (shape: WorkplaneShape, patch: Partial<WorkplaneShape>) => WorkplaneShape,
  triangleLimit: number,
): Promise<RegroupResult> {
  const stored = group.groupedShapes ?? [];
  const built = await Promise.all(restoreGroupedChildren(group).map(async (restored, index): Promise<RegroupResult> => {
    const own = stored[index];
    const patch = patches.get(own.id);
    const part = patch ? apply({ ...restored, id: own.id }, patch) : { ...restored, id: own.id };
    return part.groupedShapes?.length && own.groupedShapes?.some((inner) => holdsAny(inner, patches))
      ? groupWithPartsChanged(part, patches, apply, triangleLimit)
      : { group: part };
  }));
  const failed = built.find((result) => !result.group);
  if (failed) return failed;
  return regroupParts(group, built.map((result) => result.group as WorkplaneShape), triangleLimit);
}
