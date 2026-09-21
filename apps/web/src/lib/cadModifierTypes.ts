export type CadModifierKind = "chamfer" | "fillet";

export type CadModifierEdge = {
  id: number;
  owner?: number;
  points: number[];
  display: boolean;
  selectable: boolean;
  angle: number;
  boundary: boolean;
  manifold: boolean;
};

export type CadModifierQuality = "draft" | "standard" | "fine";

export type CadModifierDisplayEdge = {
  points: number[];
};

export type CadModifierPrimitivePart = {
  kind: "box";
  width: number;
  depth: number;
  height: number;
  transform?: number[];
};

export type CadModifierMeshPart = {
  positions?: Float32Array;
  indices?: Uint32Array;
  brep?: string;
  brepTransform?: number[];
  primitive?: CadModifierPrimitivePart;
  hole: boolean;
};

export type CadModifierComponentMesh = {
  owner: number;
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  triangleCount: number;
  brep: string;
  displayEdges: CadModifierDisplayEdge[];
};

export type CadModifierDeflection = { linear: number; angular: number };

export type CadModifierWorkerRequest =
  | { type: "prepare"; requestId: number; parts: CadModifierMeshPart[]; sharpAngle: number; suppressTreatmentDetailEdges?: boolean }
  | {
      type: "preview";
      requestId: number;
      kind: CadModifierKind;
      edgeIds: number[];
      amount: number;
      quality: CadModifierQuality;
      chamferAngle: number;
      // The finest deflection the shape's edge-treatment history has needed
      // so far, if any - a floor beneath this operation's own deflection.
      minDeflection?: CadModifierDeflection;
    }
  | { type: "dispose"; requestId: number };

export type CadModifierWorkerResponse =
  | { type: "ready"; requestId: number; edges: CadModifierEdge[]; selectableEdgeIds: number[]; sourceType: string }
  | {
      type: "preview";
      requestId: number;
      positions: Float32Array;
      normals: Float32Array;
      indices: Uint32Array;
      triangleCount: number;
      brep: string;
      displayEdges: CadModifierDisplayEdge[];
      components?: CadModifierComponentMesh[];
      // The deflection actually used for this operation - request.minDeflection
      // folded in, so the caller can carry it forward as the new floor.
      deflection: CadModifierDeflection;
    }
  | { type: "disposed"; requestId: number }
  | { type: "error"; requestId: number; message: string; resetSession?: boolean };
