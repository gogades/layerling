import { JoinType, type OcctKernel, type ShapeHandle } from "occt-wasm";
import { shellOpenSides } from "@/lib/shellLimits";
import type { ShellEdges, ShellOpenings, ShellSide } from "@/types/layerling";

// Hollowing ("shell") for the CAD modifier worker. It lives outside the worker
// so the end-to-end tests can run it against the real OCCT kernel.

export function orientedFaceNormal(cad: OcctKernel, face: ShapeHandle, point: { x: number; y: number; z: number }) {
  const uv = cad.uvFromPoint(face, point);
  // surfaceNormal already honours the face orientation (see shellOpeningFaces);
  // flipping a reversed face again turned its normal inward.
  const normal = cad.surfaceNormal(face, uv.u, uv.v);
  const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
  return { x: normal.x / length, y: normal.y / length, z: normal.z / length };
}

function shapeIsValid(cad: OcctKernel, shape: ShapeHandle) {
  try {
    return Boolean(cad.isValid(shape));
  } catch {
    return false;
  }
}

function releaseAll(cad: OcctKernel, handles: ShapeHandle[]) {
  handles.forEach((handle) => {
    try {
      cad.release(handle);
    } catch {
      // already gone
    }
  });
}

const SIDE_AXES: Record<ShellSide, { axis: "x" | "y" | "z"; sign: 1 | -1 }> = {
  top: { axis: "y", sign: 1 },
  bottom: { axis: "y", sign: -1 },
  front: { axis: "z", sign: 1 },
  back: { axis: "z", sign: -1 },
  right: { axis: "x", sign: 1 },
  left: { axis: "x", sign: -1 },
};

/**
 * The planar faces a hollowed body leaves open, grouped by side: on each side
 * the ones that face straight out along that axis and sit at the very edge of
 * the solid - the lid of a box, the end of a cylinder, the front of a drawer
 * slot.
 */
export function shellOpeningFacesBySide(cad: OcctKernel, solid: ShapeHandle, faces: ShapeHandle[], openings: ShellOpenings) {
  const sides = shellOpenSides(openings);
  const found = new Map<ShellSide, ShapeHandle[]>(sides.map((side) => [side, []]));
  if (sides.length === 0) return found;
  const bounds = cad.getBoundingBox(solid, false);
  const extent = { x: [bounds.xmin, bounds.xmax], y: [bounds.ymin, bounds.ymax], z: [bounds.zmin, bounds.zmax] } as const;
  faces.forEach((face) => {
    if (cad.surfaceType(face) !== "plane") return;
    const center = cad.getSurfaceCenterOfMass(face);
    // surfaceNormal already honours the face orientation here, so it points
    // out of the solid as it is (checked against a box in cadShell.e2e.ts).
    const uv = cad.uvFromPoint(face, center);
    const raw = cad.surfaceNormal(face, uv.u, uv.v);
    const length = Math.hypot(raw.x, raw.y, raw.z) || 1;
    sides.forEach((side) => {
      const { axis, sign } = SIDE_AXES[side];
      const [min, max] = extent[axis];
      const tolerance = Math.max(1e-4, (max - min) * 1e-4);
      const facesOut = (raw[axis] / length) * sign > 0.999;
      const atEdge = Math.abs(center[axis] - (sign > 0 ? max : min)) <= tolerance;
      if (facesOut && atEdge) found.get(side)?.push(face);
    });
  });
  return found;
}

/** All the faces a hollowed body leaves open. */
export function shellOpeningFaces(cad: OcctKernel, solid: ShapeHandle, faces: ShapeHandle[], openings: ShellOpenings) {
  return [...shellOpeningFacesBySide(cad, solid, faces, openings).values()].flat();
}

/**
 * An inward offset of a body with an inner corner comes back as a closed shell
 * rather than a solid, and a boolean cut with a bare shell fails. Close it.
 */
function cavityFromOffset(cad: OcctKernel, offset: ShapeHandle) {
  if (cad.getShapeType(offset) !== "shell") return offset;
  try {
    return cad.makeSolid(offset);
  } finally {
    cad.release(offset);
  }
}

/**
 * Hollows one solid to walls of `thickness`, measured inward.
 *
 * With faces to open this is OCCT's thick solid. A body closed on every side
 * has nothing to remove, so its cavity is cut out with an inward offset copy
 * instead. The precise tolerance is tried first; the coarser one survives more
 * curved inputs.
 */
export function shellSolid(cad: OcctKernel, solid: ShapeHandle, thickness: number, openings: ShellOpenings, edges: ShellEdges = "round") {
  const joinType = edges === "sharp" ? JoinType.Intersection : JoinType.Arc;
  const faces = cad.getSubShapes(solid, "face");
  try {
    const bySide = shellOpeningFacesBySide(cad, solid, faces, openings);
    const open = [...bySide.values()].flat();
    // A side asked for by name must be there. The old frame ("top-bottom")
    // was content with either end, so it still is.
    const missing = [...bySide.entries()].find(([, sideFaces]) => sideFaces.length === 0)?.[0];
    if (missing && (Array.isArray(openings) || open.length === 0)) {
      throw new Error(`This body has no flat ${missing} face to leave open`);
    }
    // Past the thickness a body can take, OCCT may hand back the untouched
    // solid as a "valid" result - a hollow body has to lose volume.
    const solidVolume = cad.getVolume(solid);
    let lastError: unknown = null;
    for (const tolerance of [1e-6, 1e-3]) {
      let cavity: ShapeHandle | null = null;
      try {
        const result = open.length > 0
          ? cad.shell(solid, open, thickness, tolerance, joinType)
          : cad.cut(solid, (cavity = cavityFromOffset(cad, cad.offset(solid, -thickness, tolerance, joinType))));
        const volume = shapeIsValid(cad, result) ? cad.getVolume(result) : 0;
        if (volume > 0 && volume < solidVolume * (1 - 1e-6)) return result;
        cad.release(result);
        lastError = new Error("invalid shell");
      } catch (error) {
        // A missing kernel function is not a verdict on the wall thickness.
        if (error instanceof Error && /is not a function/.test(error.message)) throw error;
        lastError = error;
      } finally {
        if (cavity !== null) cad.release(cavity);
      }
    }
    throw lastError instanceof Error && lastError.message.startsWith("This body")
      ? lastError
      : new Error("The walls cannot be this thick for this body. Choose a thinner wall.");
  } finally {
    releaseAll(cad, faces);
  }
}

