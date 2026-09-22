import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { roundSideCount } from "@/lib/roundSideCount";
import type { WorkplaneShape } from "@/types/layerling";

export const DEFAULT_SLOT_WIDTH = 40;
export const DEFAULT_SLOT_DEPTH = 20;
export const DEFAULT_SLOT_HEIGHT = 20;

export type SlotGeometryOptions = {
  width: number;
  depth: number;
  height: number;
  sides?: number;
};

type Point2D = { x: number; y: number };

/**
 * Erzeugt die geschlossene 2D-Kontur eines Langlochs / einer Kapsel
 * (zwei parallele Geraden mit zwei tangentialen Halbkreisbögen an den Enden).
 * Füllt die Bounding-Box [-width/2, width/2] x [-depth/2, depth/2] exakt aus.
 */
export function buildSlotContourPoints(
  width: number,
  depth: number,
  sides?: number,
): Point2D[] {
  const safeW = Math.max(0.01, width);
  const safeD = Math.max(0.01, depth);
  const minDim = Math.min(safeW, safeD);
  const effectiveSides = roundSideCount(sides, minDim, minDim);
  const arcSteps = Math.max(4, Math.round(effectiveSides / 2));
  const pts: Point2D[] = [];

  if (safeW >= safeD) {
    // Horizontales Langloch entlang der X-Achse
    const R = safeD / 2;
    const hx = (safeW - safeD) / 2;

    if (hx > 1e-4) {
      pts.push({ x: -hx, y: -R });
      pts.push({ x: hx, y: -R });
    } else {
      pts.push({ x: 0, y: -R });
    }

    // Rechter Halbkreis von -PI/2 bis +PI/2
    for (let i = 1; i <= arcSteps; i += 1) {
      const phi = -Math.PI / 2 + (i / arcSteps) * Math.PI;
      pts.push({ x: hx + R * Math.cos(phi), y: R * Math.sin(phi) });
    }

    // Untere Gerade nach links
    if (hx > 1e-4) {
      pts.push({ x: -hx, y: R });
    }

    // Linker Halbkreis von +PI/2 bis +3PI/2
    for (let i = 1; i < arcSteps; i += 1) {
      const phi = Math.PI / 2 + (i / arcSteps) * Math.PI;
      pts.push({ x: -hx + R * Math.cos(phi), y: R * Math.sin(phi) });
    }
  } else {
    // Vertikales Langloch entlang der Z-Achse (Tiefe)
    const R = safeW / 2;
    const hz = (safeD - safeW) / 2;

    if (hz > 1e-4) {
      pts.push({ x: R, y: -hz });
      pts.push({ x: R, y: hz });
    } else {
      pts.push({ x: R, y: 0 });
    }

    // Hinterer / unterer Halbkreis von 0 bis PI
    for (let i = 1; i <= arcSteps; i += 1) {
      const phi = (i / arcSteps) * Math.PI;
      pts.push({ x: R * Math.cos(phi), y: hz + R * Math.sin(phi) });
    }

    // Linke Gerade nach oben
    if (hz > 1e-4) {
      pts.push({ x: -R, y: -hz });
    }

    // Vorderer / oberer Halbkreis von PI bis 2PI
    for (let i = 1; i < arcSteps; i += 1) {
      const phi = Math.PI + (i / arcSteps) * Math.PI;
      pts.push({ x: R * Math.cos(phi), y: -hz + R * Math.sin(phi) });
    }
  }

  return pts;
}

/**
 * Erzeugt einen geschlossenen, wasserdichten 3D-Langlochkörper (2-Mannigfaltigkeit).
 */
export function createSlotGeometry({
  width,
  depth,
  height,
  sides,
}: SlotGeometryOptions): THREE.BufferGeometry {
  const safeWidth = Math.max(0.01, width);
  const safeDepth = Math.max(0.01, depth);
  const safeHeight = Math.max(0.01, height);

  const minDim = Math.min(safeWidth, safeDepth);
  const effectiveSides = roundSideCount(sides, minDim, minDim);
  const contour2D = buildSlotContourPoints(safeWidth, safeDepth, effectiveSides);
  const M = contour2D.length;

  const positions: number[] = [];
  const indices: number[] = [];

  // Punkte erzeugen (0 .. M-1: Boden y=0; M .. 2M-1: Deckel y=safeHeight)
  for (let i = 0; i < M; i += 1) {
    const p = contour2D[i];
    positions.push(p.x, 0, p.y);
  }
  for (let i = 0; i < M; i += 1) {
    const p = contour2D[i];
    positions.push(p.x, safeHeight, p.y);
  }

  // 1. Deckel- und Bodentriangulierung
  const triPoints = contour2D.map((p) => new THREE.Vector2(p.x, p.y));
  const isClockwise = THREE.ShapeUtils.isClockWise(triPoints);
  const faces2D = THREE.ShapeUtils.triangulateShape(triPoints, []);

  faces2D.forEach(([a, b, c]) => {
    if (isClockwise) {
      indices.push(M + a, M + b, M + c);
      indices.push(a, c, b);
    } else {
      indices.push(M + a, M + c, M + b);
      indices.push(a, b, c);
    }
  });

  // 2. Seitenwand-Quads
  for (let i = 0; i < M; i += 1) {
    const next = (i + 1) % M;
    const bi = i;
    const bNext = next;
    const ti = M + i;
    const tNext = M + next;

    if (isClockwise) {
      indices.push(bi, bNext, tNext);
      indices.push(bi, tNext, ti);
    } else {
      indices.push(bi, tNext, bNext);
      indices.push(bi, ti, tNext);
    }
  }

  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  indexed.setIndex(indices);

  const geometry = toCreasedNormals(indexed, THREE.MathUtils.degToRad(30));
  indexed.dispose();
  geometry.computeBoundingBox();

  return geometry;
}
