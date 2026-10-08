import type { SketchProfile } from "@/types/layerling";

export type SketchCadBuildRequest = {
  type: "build";
  requestId: number;
  profile: SketchProfile;
  height: number;
  /** Set for a revolve: the sketch is turned about the vertical axis instead of pulled up by `height`. */
  revolve?: { startAngle: number; sweepAngle: number };
};

export type SketchCadBuildResponse =
  | {
      type: "built";
      requestId: number;
      positions: Float32Array;
      normals: Float32Array;
      indices: Uint32Array;
      triangleCount: number;
      brep: string;
    }
  | { type: "error"; requestId: number; message: string };
