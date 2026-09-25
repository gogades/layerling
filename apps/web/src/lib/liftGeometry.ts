import * as THREE from "three";
import type { PlacementWorkplane } from "@/lib/placementWorkplane";
import type { WorkplaneShape } from "@/types/layerling";

export type SelectionFrame = {
  ids: string[];
  center: THREE.Vector3;
  quaternion: THREE.Quaternion;
  xAxis: THREE.Vector3;
  yAxis: THREE.Vector3;
  zAxis: THREE.Vector3;
  width: number;
  height: number;
  depth: number;
  min: THREE.Vector3;
  max: THREE.Vector3;
  singleShape: WorkplaneShape | null;
};

export type LiftGeometry = {
  axis: THREE.Vector3;
  low: number;
  high: number;
  height: number;
  elevation: number;
  pointAt: (h: number) => THREE.Vector3;
};

export function liftGeometryForFrame(frame: SelectionFrame, workplane: PlacementWorkplane): LiftGeometry {
  const axis = new THREE.Vector3(workplane.normal.x, workplane.normal.y, workplane.normal.z).normalize();
  const origin = new THREE.Vector3(workplane.origin.x, workplane.origin.y, workplane.origin.z);
  const centerHeight = frame.center.clone().sub(origin).dot(axis);
  const reach = [
    frame.xAxis.clone().normalize().multiplyScalar(frame.width / 2),
    frame.yAxis.clone().normalize().multiplyScalar(frame.height / 2),
    frame.zAxis.clone().normalize().multiplyScalar(frame.depth / 2),
  ].reduce((total, halfSide) => total + Math.abs(halfSide.dot(axis)), 0);
  const low = centerHeight - reach;
  const high = centerHeight + reach;
  return {
    axis,
    low,
    high,
    height: Math.max(0.01, high - low),
    elevation: Math.min(Math.max(0, low), high),
    pointAt: (h: number) => frame.center.clone().addScaledVector(axis, h - centerHeight),
  };
}
