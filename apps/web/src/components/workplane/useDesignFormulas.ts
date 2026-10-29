"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { designAfterEdit, formulaPreview, formulaSuggestions, withRenamedReference, type DesignFormulaError } from "@/components/workplane/evaluateDesign";
import type { DesignFormulas } from "@/components/workplane/designFormulasContext";
import type { DesignVariable } from "@/lib/designVariables";
import { t } from "@/lib/i18n";
import { getAdvancedMode } from "@/lib/simpleMode";
import { useAdvancedMode } from "@/lib/useSimpleMode";
import type { WorkplaneShape, WorkplaneWorkspaceSettings } from "@/types/layerling";

const NO_ERRORS: ReadonlyMap<string, DesignFormulaError> = new Map();

type Commit = (next: WorkplaneShape[], selection: string[]) => void;

/**
 * The editor's side of the advanced mode's formulas: `settle` turns an edit into what the formulas make of it (and keeps
 * the table's values and the errors), `recalculate` works everything out again as one step of the history when that moves
 * anything - on switching into the mode and on opening a design in it - `setTable` takes a change of the variables table
 * as one step (a renamed row taking its references along), and `context` is what the inspector reads. The editor hands
 * its commit in through `commitRef` once it has one; `notify` says when a copy's variable name had to go.
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

  const settle = useCallback((before: WorkplaneShape[], after: WorkplaneShape[]) => {
    const inMode = getAdvancedMode();
    const settled = designAfterEdit(before, after, variablesRef.current, workspaceRef.current, inMode, apply);
    variablesRef.current = settled.variables;
    setErrors((current) => (current.size === 0 && settled.errors.size === 0 ? current : settled.errors));
    if (inMode && settled.blanked.length) notify(t("formula.namesBlanked", { names: settled.blanked.map((name) => `$${name}`).join(", ") }));
    return settled.shapes;
  }, [apply, notify, variablesRef, workspaceRef]);

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
    if (settled.shapes !== current || settled.variables !== table) commitRef.current(current, selectedIdsRef.current);
  }, [apply, selectedIdsRef, shapesRef, variablesRef, workspaceRef]);

  useEffect(() => {
    if (advanced) recalculate();
    else setErrors(NO_ERRORS);
  }, [advanced, recalculate]);

  const context = useMemo<DesignFormulas>(() => ({
    errors,
    nameTaken: (name, shapeId) => {
      const wanted = name.toLowerCase();
      return shapesRef.current.some((shape) => shape.id !== shapeId && shape.variableName?.toLowerCase() === wanted)
        || variablesRef.current.some((row) => row.name.toLowerCase() === wanted);
    },
    preview: (text, shapeId) => formulaPreview(shapesRef.current, variablesRef.current, workspaceRef.current, shapeId, text),
    suggest: (before, shapeId) => formulaSuggestions(shapesRef.current, variablesRef.current, workspaceRef.current, shapeId, before),
  }), [errors, shapesRef, variablesRef, workspaceRef]);

  return { settle, recalculate, setTable, context, commitRef };
}
