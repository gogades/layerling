"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { designAfterEdit, type DesignFormulaError } from "@/components/workplane/evaluateDesign";
import type { DesignFormulas } from "@/components/workplane/designFormulasContext";
import type { DesignVariable } from "@/lib/designVariables";
import { getAdvancedMode } from "@/lib/simpleMode";
import { useAdvancedMode } from "@/lib/useSimpleMode";
import type { WorkplaneShape, WorkplaneWorkspaceSettings } from "@/types/layerling";

const NO_ERRORS: ReadonlyMap<string, DesignFormulaError> = new Map();

type Commit = (next: WorkplaneShape[], selection: string[]) => void;

/**
 * The editor's side of the advanced mode's formulas: `settle` turns an edit into what the formulas make of it (and keeps
 * the table's values and the errors), `recalculate` works everything out again as one step of the history when that moves
 * anything - on switching into the mode and on opening a design in it - and `context` is what the inspector reads.
 * The editor hands its commit in through `commitRef` once it has one.
 */
export function useDesignFormulas(
  shapesRef: MutableRefObject<WorkplaneShape[]>,
  selectedIdsRef: MutableRefObject<string[]>,
  variablesRef: MutableRefObject<DesignVariable[]>,
  workspaceRef: MutableRefObject<WorkplaneWorkspaceSettings>,
  apply: (shape: WorkplaneShape, patch: Partial<WorkplaneShape>) => WorkplaneShape,
) {
  const advanced = useAdvancedMode();
  const [errors, setErrors] = useState(NO_ERRORS);
  const commitRef = useRef<Commit>(() => undefined);

  const settle = useCallback((before: WorkplaneShape[], after: WorkplaneShape[]) => {
    const settled = designAfterEdit(before, after, variablesRef.current, workspaceRef.current, getAdvancedMode(), apply);
    variablesRef.current = settled.variables;
    setErrors((current) => (current.size === 0 && settled.errors.size === 0 ? current : settled.errors));
    return settled.shapes;
  }, [apply, variablesRef, workspaceRef]);

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
  }), [errors, shapesRef, variablesRef]);

  return { settle, recalculate, context, commitRef };
}
