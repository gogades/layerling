import type { OcctKernel, ShapeHandle } from "occt-wasm";
import type { ShellOpenings } from "@/types/layerling";

// Hollowing ("shell") for the CAD modifier worker. It lives outside the worker
// so the end-to-end tests can run it against the real OCCT kernel.

export function orientedFaceNormal(cad: OcctKernel, face: ShapeHandle, point: { x: number; y: number; z: number }) {
  const uv = cad.uvFromPoint(face, point);
  const normal = cad.surfaceNormal(face, uv.u, uv.v);
  if (cad.shapeOrientation(face) === "reversed") {
    normal.x *= -1;
    normal.y *= -1;
    normal.z *= -1;
  }
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

/**
 * The planar faces a hollowed body leaves open: the ones that face straight up
 * (or down) and sit at the very top (or bottom) of the solid - the lid of a box,
 * the end of a cylinder.
 */
export function shellOpeningFaces(cad: OcctKernel, solid: ShapeHandle, faces: ShapeHandle[], openings: ShellOpenings) {
  if (openings === "none") return [];
  const bounds = cad.getBoundingBox(solid, false);
  const tolerance = Math.max(1e-4, (bounds.ymax - bounds.ymin) * 1e-4);
  return faces.filter((face) => {
    if (cad.surfaceType(face) !== "plane") return false;
    const center = cad.getSurfaceCenterOfMass(face);
    // surfaceNormal already honours the face orientation here, so it points
    // out of the solid as it is (checked against a box in cadShell.e2e.ts).
    const uv = cad.uvFromPoint(face, center);
    const raw = cad.surfaceNormal(face, uv.u, uv.v);
    const normal = { y: raw.y / (Math.hypot(raw.x, raw.y, raw.z) || 1) };
    const top = normal.y > 0.999 && Math.abs(center.y - bounds.ymax) <= tolerance;
    const bottom = normal.y < -0.999 && Math.abs(center.y - bounds.ymin) <= tolerance;
    return (top && openings !== "bottom") || (bottom && openings !== "top");
  });
}

/**
 * Hollows one solid to walls of `thickness`, measured inward.
 *
 * With faces to open this is OCCT's thick solid. A body closed on every side
 * has nothing to remove, so its cavity is cut out with an inward offset copy
 * instead. The precise tolerance is tried first; the coarser one survives more
 * curved inputs.
 */
export function shellSolid(cad: OcctKernel, solid: ShapeHandle, thickness: number, openings: ShellOpenings) {
  const faces = cad.getSubShapes(solid, "face");
  try {
    const open = shellOpeningFaces(cad, solid, faces, openings);
    if (openings !== "none" && open.length === 0) {
      throw new Error(`This body has no flat ${openings === "bottom" ? "bottom" : "top"} face to leave open`);
    }
    // Past the thickness a body can take, OCCT may hand back the untouched
    // solid as a "valid" result - a hollow body has to lose volume.
    const solidVolume = cad.getVolume(solid);
    let lastError: unknown = null;
    for (const tolerance of [1e-6, 1e-3]) {
      let cavity: ShapeHandle | null = null;
      try {
        const result = open.length > 0
          ? cad.shell(solid, open, thickness, tolerance)
          : cad.cut(solid, (cavity = cad.offset(solid, -thickness, tolerance)));
        const volume = shapeIsValid(cad, result) ? cad.getVolume(result) : 0;
        if (volume > 0 && volume < solidVolume * (1 - 1e-6)) return result;
        cad.release(result);
        lastError = new Error("invalid shell");
      } catch (error) {
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

