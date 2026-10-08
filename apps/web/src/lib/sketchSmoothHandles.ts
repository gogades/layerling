import type { SketchPoint, SketchProfile } from "@/types/layerling";

export function cloneSketchProfile(profile: SketchProfile): SketchProfile {
  return {
    points: profile.points.map((point) => ({
      ...point,
      handleIn: point.handleIn ? { ...point.handleIn } : undefined,
      handleOut: point.handleOut ? { ...point.handleOut } : undefined,
    })),
    segments: profile.segments.map((segment) => ({ ...segment })),
    images: (profile.images ?? []).map((image) => ({ ...image })),
  };
}

export type OrderedSketchStep = { segment: SketchProfile["segments"][number]; from: SketchPoint; to: SketchPoint };
export type OrderedSketchPath = { points: SketchPoint[]; steps: OrderedSketchStep[]; closed: boolean };

export function orderedSketchPaths(profile: SketchProfile): OrderedSketchPath[] {
  const pointById = new Map(profile.points.map((point) => [point.id, point]));
  const adjacency = new Map<string, Array<{ pointId: string; segment: SketchProfile["segments"][number] }>>();
  profile.points.forEach((point) => adjacency.set(point.id, []));
  const validSegments = profile.segments.filter((segment) => {
    if (!pointById.has(segment.startId) || !pointById.has(segment.endId) || segment.startId === segment.endId) return;
    adjacency.get(segment.startId)?.push({ pointId: segment.endId, segment });
    adjacency.get(segment.endId)?.push({ pointId: segment.startId, segment });
    return true;
  });
  const unvisited = new Set(validSegments.map((segment) => segment.id));
  const paths: OrderedSketchPath[] = [];
  while (unvisited.size > 0) {
    const seedId = unvisited.values().next().value as string | undefined;
    const seed = validSegments.find((segment) => segment.id === seedId);
    if (!seed) break;
    const componentIds = new Set<string>();
    const queue = [seed.startId, seed.endId];
    while (queue.length > 0) {
      const id = queue.pop();
      if (!id || componentIds.has(id)) continue;
      componentIds.add(id);
      adjacency.get(id)?.forEach((entry) => queue.push(entry.pointId));
    }
    const startId = [...componentIds].find((id) => (adjacency.get(id)?.filter((entry) => unvisited.has(entry.segment.id)).length ?? 0) === 1) ?? seed.startId;
    const first = pointById.get(startId);
    if (!first) {
      unvisited.delete(seed.id);
      continue;
    }
    const points = [first];
    const steps: OrderedSketchStep[] = [];
    let currentId = startId;
    for (let guard = 0; guard <= validSegments.length; guard += 1) {
      const edge = adjacency.get(currentId)?.find((entry) => unvisited.has(entry.segment.id));
      if (!edge) break;
      const from = pointById.get(currentId);
      const to = pointById.get(edge.pointId);
      if (!from || !to) break;
      unvisited.delete(edge.segment.id);
      steps.push({ segment: edge.segment, from, to });
      currentId = to.id;
      if (currentId === startId) break;
      points.push(to);
    }
    paths.push({ points, steps, closed: currentId === startId && steps.length >= 3 });
  }
  return paths;
}

/**
 * Lays the handles of every point that sits on a smooth curve through its neighbours. Points
 * that only touch lines and Bezier curves keep what they have: a circle, an arc or a line
 * drawn earlier must not change when another smooth curve is added elsewhere.
 */
export function withSmoothSketchHandles(profile: SketchProfile) {
  const next = cloneSketchProfile(profile);
  const points = new Map(next.points.map((point) => [point.id, point]));
  orderedSketchPaths(next).forEach((path) => {
    const smoothPointIds = new Set<string>();
    path.steps.forEach((step) => {
      if (step.segment.kind !== "smooth") return;
      smoothPointIds.add(step.from.id);
      smoothPointIds.add(step.to.id);
    });
    path.points.forEach((sourcePoint, index) => {
      if (!smoothPointIds.has(sourcePoint.id)) return;
      const point = points.get(sourcePoint.id);
      if (!point) return;
      const previous = path.closed ? path.points[(index - 1 + path.points.length) % path.points.length] : path.points[Math.max(0, index - 1)];
      const following = path.closed ? path.points[(index + 1) % path.points.length] : path.points[Math.min(path.points.length - 1, index + 1)];
      const tangentX = (following.x - previous.x) / 6;
      const tangentZ = (following.z - previous.z) / 6;
      point.handleIn = { x: point.x - tangentX, z: point.z - tangentZ };
      point.handleOut = { x: point.x + tangentX, z: point.z + tangentZ };
      point.mode = "smooth";
    });
  });
  return next;
}
