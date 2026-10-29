import { createContext } from "react";
import type { DesignFormulaError, FormulaSuggestion } from "@/components/workplane/evaluateDesign";
import type { FormulaResult } from "@/lib/formula";

/**
 * What the inspector needs from the editor about the advanced mode's formulas: what failed, by `<body id>/<field id>`,
 * whether a variable name is already taken by another body or a row of the table (in any case), and what the formula
 * editor shows while one is typed.
 */
export type DesignFormulas = {
  errors: ReadonlyMap<string, DesignFormulaError>;
  nameTaken: (name: string, shapeId: string) => boolean;
  /** The formula editor's live result and its suggestions, for a field of `shapeId`. */
  preview: (text: string, shapeId: string) => FormulaResult;
  suggest: (before: string, shapeId: string) => { start: number; items: FormulaSuggestion[] } | null;
};

export const DesignFormulasContext = createContext<DesignFormulas>({
  errors: new Map(),
  nameTaken: () => false,
  preview: () => ({ ok: false, error: { kind: "syntax" } }),
  suggest: () => null,
});
