import { createContext } from "react";
import type { DesignFormulaError } from "@/components/workplane/evaluateDesign";

/**
 * What the inspector needs from the editor about the advanced mode's formulas: what failed, by `<body id>/<field id>`,
 * and whether a variable name is already taken by another body or a row of the table (in any case).
 */
export type DesignFormulas = { errors: ReadonlyMap<string, DesignFormulaError>; nameTaken: (name: string, shapeId: string) => boolean };

export const DesignFormulasContext = createContext<DesignFormulas>({ errors: new Map(), nameTaken: () => false });
