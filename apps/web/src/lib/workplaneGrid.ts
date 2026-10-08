import type { AppThemePalette, ResolvedAppTheme } from "@/lib/appTheme";

const WORKPLANE_BOUNDARY_EPSILON = 0.0001;

export const WORKPLANE_LINE_ELEVATION = 0;
export const WORKPLANE_MAJOR_GRID_INTERVAL = 5;
export const DEFAULT_WORKPLANE_GRID_COLOR = "#c08a12";
/** The light theme's work-area background and workplane surface, which can be changed in the settings. */
export const DEFAULT_WORKPLANE_BACKGROUND = "#fbf8f0";
export const DEFAULT_WORKPLANE_SURFACE_COLOR = "#fdf4dd";
/** The sketch view's background and grid colour in the light theme, which can be changed in the settings. */
export const DEFAULT_SKETCH_BACKGROUND = "#fcfbf8";
export const DEFAULT_SKETCH_GRID_COLOR = "#d9822b";
/** Edge lines on every body, when switched on: black like in Tinkercad. */
export const DEFAULT_EDGE_LINE_COLOR = "#000000";

/** Width to height of the label texture, and so of the mesh that carries it. */
export const WORKPLANE_LABEL_ASPECT = 4;
const WORKPLANE_LABEL_MIN_HEIGHT = 3;
const WORKPLANE_LABEL_MAX_HEIGHT = 26;
const WORKPLANE_LABEL_HEIGHT_RATIO = 0.085;
const WORKPLANE_LABEL_MAX_WIDTH_RATIO = 0.62;
/**
 * Gap between the plane edge and the nearest edge of the text, as a share of
 * the text height. The same on both axes, so the label sits squarely in the
 * corner rather than closer to one edge than the other.
 *
 * Kept small: the texture carries padding of its own, so the gap that reads on
 * screen is already wider than this, and a caption that drifts away from its
 * corner wastes the plane it is supposed to leave free.
 */
const WORKPLANE_LABEL_INSET_RATIO = 0.05;

export type WorkplaneLabelLayout = {
  width: number;
  height: number;
  /** Distance in front of the plane centre, towards the near edge. */
  depthOffset: number;
  /** Distance from the plane centre towards the left edge, so negative. */
  lateralOffset: number;
};

/**
 * Size and placement of the workplane label, in workspace units.
 *
 * It sits in the near left corner rather than centred on the front edge, so it
 * reads as a caption for the plane and leaves the middle of the workspace free.
 * It scales with the plane so it stays legible on a small workspace without
 * dominating a large one, and never reaches the edges it sits between.
 */
export function workplaneLabelLayout(width: number, depth: number): WorkplaneLabelLayout {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
  const safeDepth = Number.isFinite(depth) && depth > 0 ? depth : 0;
  if (safeWidth <= 0 || safeDepth <= 0) {
    return { width: 0, height: 0, depthOffset: 0, lateralOffset: 0 };
  }

  const preferredHeight = Math.min(safeWidth, safeDepth) * WORKPLANE_LABEL_HEIGHT_RATIO;
  const clampedHeight = Math.min(
    Math.max(preferredHeight, WORKPLANE_LABEL_MIN_HEIGHT),
    WORKPLANE_LABEL_MAX_HEIGHT,
  );
  const maxLabelWidth = safeWidth * WORKPLANE_LABEL_MAX_WIDTH_RATIO;
  const labelWidth = Math.min(clampedHeight * WORKPLANE_LABEL_ASPECT, maxLabelWidth);
  const labelHeight = labelWidth / WORKPLANE_LABEL_ASPECT;
  const inset = labelHeight * WORKPLANE_LABEL_INSET_RATIO;
  return {
    width: labelWidth,
    height: labelHeight,
    depthOffset: Math.max(0, safeDepth / 2 - inset - labelHeight / 2),
    lateralOffset: Math.min(0, -safeWidth / 2 + inset + labelWidth / 2),
  };
}

export type WorkplaneGridCoordinate = {
  coordinate: number;
  index: number;
};

export type WorkplaneGridPalette = {
  minor: { color: string; opacity: number };
  major: { color: string; opacity: number };
  axis: { color: string; opacity: number };
  border: { color: string; opacity: number };
};

export type WorkplaneThemePalette = {
  sceneBackground: string;
  surface: { color: string; opacity: number };
  grid: WorkplaneGridPalette;
};

export function workplaneGridPalette(
  theme: ResolvedAppTheme = "light",
  configuredColor: string = DEFAULT_WORKPLANE_GRID_COLOR,
  palette: AppThemePalette = "default",
): WorkplaneGridPalette {
  if (configuredColor.toLowerCase() !== DEFAULT_WORKPLANE_GRID_COLOR) {
    return {
      minor: { color: configuredColor, opacity: theme === "dark" ? 0.42 : 0.38 },
      major: { color: configuredColor, opacity: theme === "dark" ? 0.7 : 0.68 },
      axis: { color: configuredColor, opacity: 0.94 },
      border: { color: configuredColor, opacity: 0.9 },
    };
  }
  if (theme === "dark" && palette === "graphite") {
    // Light grey lines on a neutral ground, no yellow cast.
    return {
      minor: { color: "#8c8c8c", opacity: 0.45 },
      major: { color: "#b4b4b4", opacity: 0.7 },
      axis: { color: "#dcdcdc", opacity: 0.92 },
      border: { color: "#c8c8c8", opacity: 0.88 },
    };
  }
  if (theme === "dark") {
    return {
      minor: { color: "#6b5a2a", opacity: 0.5 },
      major: { color: "#8f7526", opacity: 0.72 },
      axis: { color: "#c9a23c", opacity: 0.92 },
      border: { color: "#b08f2f", opacity: 0.88 },
    };
  }
  return {
    minor: { color: "#e0c377", opacity: 0.55 },
    major: { color: "#c08a12", opacity: 0.7 },
    axis: { color: "#9c720c", opacity: 0.88 },
    border: { color: "#b8830f", opacity: 0.9 },
  };
}

export function workplaneThemePalette(
  theme: ResolvedAppTheme,
  configuredBackground: string,
  configuredGridColor: string = DEFAULT_WORKPLANE_GRID_COLOR,
  palette: AppThemePalette = "default",
  configuredSurface: string = DEFAULT_WORKPLANE_SURFACE_COLOR,
): WorkplaneThemePalette {
  // The background and the surface colour belong to the light theme; the dark
  // themes keep their own, so a light choice cannot spoil them.
  if (theme === "dark" && palette === "graphite") {
    return {
      sceneBackground: "#1e1e1e",
      surface: { color: "#343434", opacity: 0.9 },
      grid: workplaneGridPalette("dark", configuredGridColor, "graphite"),
    };
  }
  return theme === "dark"
    ? {
        sceneBackground: "#141210",
        surface: { color: "#332b16", opacity: 0.9 },
        grid: workplaneGridPalette("dark", configuredGridColor),
      }
    : {
        sceneBackground: configuredBackground,
        surface: { color: configuredSurface, opacity: 0.68 },
        grid: workplaneGridPalette("light", configuredGridColor),
      };
}

/** Grid sizes offered with Imperial units; the line spacing in millimetres follows from the name. */
export const IMPERIAL_GRID_BLOCK_PRESETS = ["1/8 in", "1/4 in", "1/2 in", "1 in"] as const;
export const DEFAULT_IMPERIAL_GRID_BLOCK_PRESET = "1/4 in";
export const DEFAULT_METRIC_GRID_BLOCK_PRESET = "5 mm";
const MM_PER_INCH = 25.4;

/** Millimetres of an inch grid preset such as "1/4 in", or null for anything else. */
export function inchGridPresetMm(preset: string): number | null {
  const match = /^(\d+)(?:\/(\d+))? in$/.exec(preset);
  if (!match) return null;
  const value = Number(match[1]) / (match[2] ? Number(match[2]) : 1);
  return value > 0 ? value * MM_PER_INCH : null;
}

export type WorkplaneGridLayout = {
  step: number;
  /** Every how many lines a stronger one is drawn. */
  majorInterval: number;
};

/**
 * How the plate's grid is laid out. Lines always run through the origin, so
 * the stronger lines meet the axes whatever the plate measures. Millimetre
 * grids draw a stronger line every fifth, inch grids on every whole inch.
 */
export function workplaneGridLayout(workspace: { gridBlockSize: number; gridBlockPreset?: string; units?: string }): WorkplaneGridLayout {
  const step = Math.min(200, Math.max(1, workspace.gridBlockSize));
  const inches = inchGridPresetMm(workspace.gridBlockPreset ?? "") !== null || workspace.units === "Imperial";
  if (!inches) return { step, majorInterval: WORKPLANE_MAJOR_GRID_INTERVAL };
  const perInch = Math.round(MM_PER_INCH / step);
  const majorInterval = Math.abs(perInch * step - MM_PER_INCH) < 1e-6 && perInch >= 2 ? perInch : step >= MM_PER_INCH - 1e-6 ? 12 : WORKPLANE_MAJOR_GRID_INTERVAL;
  return { step, majorInterval };
}

/** Lines through the origin at whole steps, inside the plate; `index` counts from the origin (negative to the left). */
export function centeredWorkplaneGridCoordinates(span: number, step: number): WorkplaneGridCoordinate[] {
  if (!Number.isFinite(span) || !Number.isFinite(step) || span <= 0 || step <= 0) return [];
  const halfSpan = span / 2;
  const last = Math.floor((halfSpan - WORKPLANE_BOUNDARY_EPSILON) / step);
  const coordinates: WorkplaneGridCoordinate[] = [];
  for (let index = -last; index <= last; index += 1) {
    const coordinate = index === 0 ? 0 : index * step;
    if (Math.abs(Math.abs(coordinate) - halfSpan) < WORKPLANE_BOUNDARY_EPSILON) continue;
    coordinates.push({ coordinate, index });
  }
  return coordinates;
}

/** The grid lines across `span` for a layout, each marked as the axis, a major or a minor line. */
export function workplaneGridLines(span: number, layout: WorkplaneGridLayout) {
  const coordinates = centeredWorkplaneGridCoordinates(span, layout.step);
  return coordinates.map(({ coordinate, index }) => ({
    coordinate,
    kind: coordinate === 0 ? "axis" as const : index % layout.majorInterval === 0 ? "major" as const : "minor" as const,
  }));
}

/**
 * Light levels of the scene: ambient (hemisphere), the key light that casts the shadows and
 * the fill light. Contrast moves light from the even ambient to the key light, so shaded
 * sides get darker and the shadows show more; 0 is the original balance.
 */
export function sceneLightLevels(contrast: number) {
  const c = Math.max(-100, Math.min(100, Number.isFinite(contrast) ? contrast : 0)) / 100;
  return { ambient: 2.1 * (1 - 0.5 * c), key: 3.1 * (1 + 0.5 * c), fill: 1.2 };
}

/** The colours of the axis arrows, as in Bambu Studio and OrcaSlicer: X red, Y green, Z blue. */
export const AXIS_ARROW_COLORS = { x: "#e5484d", y: "#3fae5a", z: "#3b82f6" } as const;

/**
 * Where the axis arrows stand and how long they are: at the far left corner of the plate, where
 * they stay out of the way, long enough to read at a glance and never longer than a fifth of the
 * smaller side. The arrows point along the numbers' directions: X to the right, Y towards the
 * front (the way the Y field counts) and Z up.
 */
export function axisArrowLayout(width: number, depth: number) {
  const smaller = Math.max(1, Math.min(width, depth));
  const length = Math.max(6, Math.min(24, smaller * 0.12, smaller * 0.2));
  return { x: -width / 2, z: -depth / 2, length };
}
