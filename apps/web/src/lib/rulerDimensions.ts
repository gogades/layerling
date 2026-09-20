import * as THREE from "three";
import { quaternionForShape } from "@/lib/geometryRotation";

/** Lage und Masse des Lineal-Koerpers, so wie sie auf der Arbeitsebene stehen. */
export type RulerPose = {
  x: number;
  z: number;
  rotation: number;
  /** Laenge - das ist am Lineal-Koerper das Feld `width`. */
  length: number;
  /** Kreuzbreite quer zur Laenge - am Lineal-Koerper das Feld `depth`. */
  crossWidth: number;
};

/** Lage, Drehung und Masse eines Koerpers, der neben dem Lineal liegen koennte. */
export type RulerCandidatePose = {
  x: number;
  z: number;
  rotation: number;
  rotationX?: number;
  rotationZ?: number;
  width: number;
  height: number;
  depth: number;
};

export type RulerDimensionField = "width" | "height" | "depth";

export type RulerDimensionMatch = {
  /** Abstand des Koerpermittelpunkts von der Lineal-Mitte, entlang der Lineal-Achse (mm). */
  alongOffset: number;
  /** Abstand des Koerpermittelpunkts von der Lineal-Mittellinie, quer zur Achse (mm, mit Vorzeichen). */
  acrossOffset: number;
  /** Die volle Ausdehnung des Koerpers entlang der Lineal-Achse (mm). */
  extentAlong: number;
  /**
   * Welches eigene Feld des Koerpers dieser Ausdehnung entspricht - nur gesetzt,
   * wenn eine seiner drei Achsen (innerhalb der Toleranz) parallel zur
   * Lineal-Achse steht. Sonst ist die Ausdehnung eine Diagonale und gehoert zu
   * keiner einzelnen Eigenschaft, also nicht eintippbar.
   */
  alignedField: RulerDimensionField | null;
};

const ALIGNMENT_TOLERANCE_DEGREES = 2;
const ALIGNMENT_COS_TOLERANCE = Math.cos(THREE.MathUtils.degToRad(ALIGNMENT_TOLERANCE_DEGREES));

/**
 * Ob und wie ein Koerper das Band eines Lineals kreuzt. Reine Projektions-
 * rechnung auf der Arbeitsebene (Hoehe/y spielt keine Rolle, ein Lineal liest
 * nur die Grundflaeche) - unabhaengig von Koerperart, damit sie fuer ein
 * Gewinde oder eine Gruppe genauso gilt wie fuer einen Quader.
 */
export function rulerDimensionMatch(ruler: RulerPose, candidate: RulerCandidatePose): RulerDimensionMatch | null {
  const rulerQuaternion = quaternionForShape(ruler);
  const axisAlong = new THREE.Vector3(1, 0, 0).applyQuaternion(rulerQuaternion);
  const axisAcross = new THREE.Vector3(0, 0, 1).applyQuaternion(rulerQuaternion);

  const candidateQuaternion = quaternionForShape(candidate);
  const candidateAxes: Array<{ field: RulerDimensionField; direction: THREE.Vector3; half: number }> = [
    { field: "width", direction: new THREE.Vector3(1, 0, 0).applyQuaternion(candidateQuaternion), half: candidate.width / 2 },
    { field: "height", direction: new THREE.Vector3(0, 1, 0).applyQuaternion(candidateQuaternion), half: candidate.height / 2 },
    { field: "depth", direction: new THREE.Vector3(0, 0, 1).applyQuaternion(candidateQuaternion), half: candidate.depth / 2 },
  ];

  const extentAlongHalf = candidateAxes.reduce((sum, axis) => sum + Math.abs(axis.direction.dot(axisAlong)) * axis.half, 0);
  const extentAcrossHalf = candidateAxes.reduce((sum, axis) => sum + Math.abs(axis.direction.dot(axisAcross)) * axis.half, 0);

  const relative = new THREE.Vector3(candidate.x - ruler.x, 0, candidate.z - ruler.z);
  const acrossOffset = relative.dot(axisAcross);
  if (Math.abs(acrossOffset) > ruler.crossWidth / 2 + extentAcrossHalf) {
    return null;
  }

  const aligned = candidateAxes.find((axis) => Math.abs(axis.direction.dot(axisAlong)) >= ALIGNMENT_COS_TOLERANCE);

  return {
    alongOffset: relative.dot(axisAlong),
    acrossOffset,
    extentAlong: extentAlongHalf * 2,
    alignedField: aligned?.field ?? null,
  };
}

/** Weltkoordinaten (x, z) eines Punkts, der auf der Lineal-Achse im Abstand `alongOffset` von dessen Mitte liegt. */
export function pointAlongRuler(ruler: RulerPose, alongOffset: number): { x: number; z: number } {
  const axisAlong = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternionForShape(ruler));
  return { x: ruler.x + axisAlong.x * alongOffset, z: ruler.z + axisAlong.z * alongOffset };
}
