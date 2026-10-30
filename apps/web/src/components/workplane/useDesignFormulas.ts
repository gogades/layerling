"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { designAfterEdit, designNameTaken, formulaPreview, formulaSuggestions, withRenamedReference, type DesignFormulaError, type SettledDesign } from "@/components/workplane/evaluateDesign";
import type { DesignFormulas } from "@/components/workplane/designFormulasContext";
import type { DesignVariable } from "@/lib/designVariables";
import { t } from "@/lib/i18n";
import { groupWithPartsChanged, type RegroupResult } from "@/lib/regroup";
import { getAdvancedMode } from "@/lib/simpleMode";
import { useAdvancedMode } from "@/lib/useSimpleMode";
import type { WorkplaneShape, WorkplaneWorkspaceSettings } from "@/types/layerling";

const NO_ERRORS: ReadonlyMap<string, DesignFormulaError> = new Map();
// Builds of groups in a row, each asked for by the one before: past this, formulas of a group and of its parts fight.
const MAX_REBUILDS = 3;

/** The editor's commit; `amend` makes the change part of the step the editor is on instead of a step of its own. */
type Commit = (next: WorkplaneShape[], selection: string[], message?: string, keyRunKey?: string, amend?: boolean) => void;

/**
 * The editor's side of the advanced mode's formulas: `settle` turns an edit into what the formulas make of it (and keeps
 * the table's values and the errors), `recalculate` works everything out again as one step of the history when that moves
 * anything - on switching into the mode and on opening a design in it - `setTable` takes a change of the variables table
 * as one step (a renamed row taking its references along), and `context` is what the inspector reads. The editor hands
 * its commit in through `commitRef` once it has one; `notify` says when a copy's variable name had to go.
 *
 * A closed group holds a built mesh, so a part inside it that a formula changed waits for its group to be built again:
 * off the page, after the edit, and then folded into the edit's own step of the history - unless the design has moved
 * on meanwhile, whose own settling then finds the group still to build.
 */
export function useDesignFormulas(
  shapesRef: MutableRefObject<WorkplaneShape[]>,
  selectedIdsRef: MutableRefObject<string[]>,
  variablesRef: MutableRefObject<DesignVariable[]>,
  workspaceRef: MutableRefObject<WorkplaneWorkspaceSettings>,
  apply: (shape: WorkplaneShape, patch: Partial<WorkplaneShape>) => WorkplaneShape,
  notify: (message: string) => void,
) {
  const advanced = useAdvancedMode();
  const [errors, setErrors] = useState(NO_ERRORS);
  const commitRef = useRef<Commit>(() => undefined);
  // How many builds in a row led to the settling going on now: set by a build's commit, read by the settle inside it.
  const rebuildDepthRef = useRef(0);

  const rebuildGroups = useCallback(async (stale: SettledDesign["stale"], depth: number, amend: boolean) => {
    const start = shapesRef.current;
    const results = await Promise.all([...stale].map(([groupId, patches]): Promise<RegroupResult> | RegroupResult => {
      const group = start.find((shape) => shape.id === groupId);
      return group
        ? groupWithPartsChanged(group, patches, apply, workspaceRef.current.booleanTriangleLimit).catch((error: unknown) => ({ group: null, failureNotice: error instanceof Error ? error.message : undefined }))
        : { group: null };
    }));
    if (shapesRef.current !== start) return;
    const failed = results.find((result) => !result.group && result.failureNotice);
    if (failed?.failureNotice) notify(failed.failureNotice);
    const rebuilt = new Map(results.flatMap((result) => (result.group ? [[result.group.id, result.group] as const] : [])));
    if (!rebuilt.size) return;
    rebuildDepthRef.current = depth;
    commitRef.current(start.map((shape) => rebuilt.get(shape.id) ?? shape), selectedIdsRef.current, undefined, undefined, amend);
  }, [apply, notify, selectedIdsRef, shapesRef, workspaceRef]);

  /** The groups `stale` names built again once the edit going on now is in, if builds in a row have not gone round too often. */
  const scheduleRebuild = useCallback((stale: SettledDesign["stale"], depth: number, amend: boolean) => {
    if (!stale.size) return;
    if (depth >= MAX_REBUILDS) notify(t("formula.errorConflict"));
    else queueMicrotask(() => void rebuildGroups(stale, depth + 1, amend));
  }, [notify, rebuildGroups]);

  const settle = useCallback((before: WorkplaneShape[], after: WorkplaneShape[]) => {
    const depth = rebuildDepthRef.current;
    rebuildDepthRef.current = 0;
    const inMode = getAdvancedMode();
    const settled = designAfterEdit(before, after, variablesRef.current, workspaceRef.current, inMode, apply);
    variablesRef.current = settled.variables;
    setErrors((current) => (current.size === 0 && settled.errors.size === 0 ? current : settled.errors));
    if (inMode && settled.blanked.length) notify(t("formula.namesBlanked", { names: settled.blanked.map((name) => `$${name}`).join(", ") }));
    scheduleRebuild(settled.stale, depth, true);
    return settled.shapes;
  }, [apply, notify, scheduleRebuild, variablesRef, workspaceRef]);

  const setTable = useCallback((rows: DesignVariable[], rename?: { from: string; to: string }) => {
    const renamed = rename ? withRenamedReference(shapesRef.current, rows, rename.from, rename.to) : { shapes: shapesRef.current, rows };
    variablesRef.current = renamed.rows;
    commitRef.current(renamed.shapes, selectedIdsRef.current);
  }, [selectedIdsRef, shapesRef, variablesRef]);

  const recalculate = useCallback(() => {
    const current = shapesRef.current;
    const table = variablesRef.current;
    const settled = designAfterEdit(current, current, table, workspaceRef.current, true, apply);
    setErrors(settled.errors);
    // The commit settles again and builds the groups itself; with nothing else to change they get a step of their own.
    if (settled.shapes !== current || settled.variables !== table) commitRef.current(current, selectedIdsRef.current);
    else scheduleRebuild(settled.stale, 0, false);
  }, [apply, scheduleRebuild, selectedIdsRef, shapesRef, variablesRef, workspaceRef]);

  useEffect(() => {
    if (advanced) recalculate();
    else setErrors(NO_ERRORS);
  }, [advanced, recalculate]);

  const context = useMemo<DesignFormulas>(() => ({
    errors,
    nameTaken: (name, shapeId) => designNameTaken(shapesRef.current, variablesRef.current, name, { shapeId }),
    preview: (text, shapeId) => formulaPreview(shapesRef.current, variablesRef.current, workspaceRef.current, shapeId, text),
    suggest: (before, shapeId) => formulaSuggestions(shapesRef.current, variablesRef.current, workspaceRef.current, shapeId, before),
  }), [errors, shapesRef, variablesRef, workspaceRef]);

  return { settle, recalculate, setTable, context, commitRef };
}
