import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ThreadHand, ThreadHead, ThreadProfile, ThreadRole } from "@/types/layerling";

export const DEFAULT_THREAD_ROLE: ThreadRole = "rod";
export const DEFAULT_THREAD_HEAD: ThreadHead = "cylinder";
export const DEFAULT_THREAD_HAND: ThreadHand = "right";
export const DEFAULT_THREAD_PROFILE: ThreadProfile = "v";
export const DEFAULT_THREAD_DIAMETER = 6;
export const DEFAULT_THREAD_PITCH = 1;
export const DEFAULT_THREAD_CLEARANCE = 0.2;
export const DEFAULT_THREAD_QUALITY = 48;

export const MIN_THREAD_DIAMETER = 1;
export const MAX_THREAD_DIAMETER = 160;
export const MIN_THREAD_PITCH = 0.2;
export const MAX_THREAD_PITCH = 12;
export const MIN_THREAD_CLEARANCE = 0;
export const MAX_THREAD_CLEARANCE = 1.5;
export const MIN_THREAD_QUALITY = 12;
export const MAX_THREAD_QUALITY = 96;

/**
 * Ein Gewinde kann viele Gaenge haben, und jeder Gang kostet vier Reihen
 * Punkte. Ohne Deckel liefe ein M2 ueber 100 mm in die Hunderttausende, also
 * wird die Zahl der Spalten gesenkt, bevor die Punktzahl entgleist.
 */
const MAX_THREAD_VERTICES = 140000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function finite(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? (value as number) : fallback;
}

/** Wie weit Durchmesser und Steigung von der Norm abweichen duerfen und trotzdem als Normgroesse gelten. */
const SIZE_MATCH_TOLERANCE = 0.001;

export type ThreadSystem = "metric" | "inch";

export type ThreadSizeSpec = {
  /** Bleibt unuebersetzt: "M6" heisst in jeder Sprache M6. */
  id: string;
  system: ThreadSystem;
  diameter: number;
  pitch: number;
  /** Schluesselweite des Innensechskants. */
  socket: number;
  /** Zylinderkopf nach ISO 4762. */
  headDiameter: number;
  headHeight: number;
  /** Schluesselweite von Sechskantkopf und Mutter. */
  acrossFlats: number;
  nutHeight: number;
  /** Kopfdurchmesser des 90-Grad-Senkkopfs nach ISO 7046. */
  countersunkDiameter: number;
};

/**
 * Die metrischen Regelgewinde, mit denen man beim Drucken tatsaechlich zu tun
 * hat. Die Kopfmasse stammen aus ISO 4762, 4032 und 7046, damit eine M6 hier
 * auch zu einer gekauften M6 passt; fuer freie Durchmesser rechnet
 * `derivedSizeSpec` dieselben Verhaeltnisse nach.
 */
const METRIC_SIZES: readonly ThreadSizeSpec[] = [
  { id: "M2", system: "metric", diameter: 2, pitch: 0.4, socket: 1.5, headDiameter: 3.8, headHeight: 2, acrossFlats: 4, nutHeight: 1.6, countersunkDiameter: 3.8 },
  { id: "M2.5", system: "metric", diameter: 2.5, pitch: 0.45, socket: 2, headDiameter: 4.5, headHeight: 2.5, acrossFlats: 5, nutHeight: 2, countersunkDiameter: 4.7 },
  { id: "M3", system: "metric", diameter: 3, pitch: 0.5, socket: 2.5, headDiameter: 5.5, headHeight: 3, acrossFlats: 5.5, nutHeight: 2.4, countersunkDiameter: 6 },
  { id: "M4", system: "metric", diameter: 4, pitch: 0.7, socket: 3, headDiameter: 7, headHeight: 4, acrossFlats: 7, nutHeight: 3.2, countersunkDiameter: 8 },
  { id: "M5", system: "metric", diameter: 5, pitch: 0.8, socket: 4, headDiameter: 8.5, headHeight: 5, acrossFlats: 8, nutHeight: 4, countersunkDiameter: 10 },
  { id: "M6", system: "metric", diameter: 6, pitch: 1, socket: 5, headDiameter: 10, headHeight: 6, acrossFlats: 10, nutHeight: 5, countersunkDiameter: 12 },
  { id: "M8", system: "metric", diameter: 8, pitch: 1.25, socket: 6, headDiameter: 13, headHeight: 8, acrossFlats: 13, nutHeight: 6.5, countersunkDiameter: 16 },
  { id: "M10", system: "metric", diameter: 10, pitch: 1.5, socket: 8, headDiameter: 16, headHeight: 10, acrossFlats: 16, nutHeight: 8, countersunkDiameter: 20 },
  { id: "M12", system: "metric", diameter: 12, pitch: 1.75, socket: 10, headDiameter: 18, headHeight: 12, acrossFlats: 18, nutHeight: 10, countersunkDiameter: 24 },
];

const MILLIMETRES_PER_INCH = 25.4;

/**
 * Zollgewinde in Grob (UNC) und Fein (UNF). Beide haben denselben
 * Flankenwinkel und dieselben Abflachungen wie das metrische ISO-Gewinde, also
 * baut sie derselbe Geometriezweig - es aendern sich nur Durchmesser und
 * Steigung. Die Masse stehen hier in Zoll, wie in den Normen ASME B18.3 und
 * B18.2.2, und werden beim Aufbau der Liste umgerechnet.
 *
 * Eine Abweichung ist bewusst: der Senkkopf bleibt auch hier ein 90-Grad-Kegel
 * wie beim metrischen Gewinde, waehrend die Zollnorm 82 Grad vorsieht. Der
 * Kopfdurchmesser stimmt, die Hoehe faellt dadurch etwas flacher aus und laesst
 * sich von Hand nachstellen.
 */
type InchSizeRow = {
  label: string;
  diameter: number;
  coarse: number;
  fine: number;
  headDiameter: number;
  headHeight: number;
  socket: number;
  acrossFlats: number;
  nutHeight: number;
  countersunkDiameter: number;
};

const INCH_ROWS: readonly InchSizeRow[] = [
  { label: "#4", diameter: 0.112, coarse: 40, fine: 48, headDiameter: 0.183, headHeight: 0.112, socket: 0.0938, acrossFlats: 0.25, nutHeight: 0.094, countersunkDiameter: 0.225 },
  { label: "#6", diameter: 0.138, coarse: 32, fine: 40, headDiameter: 0.226, headHeight: 0.138, socket: 0.1094, acrossFlats: 0.3125, nutHeight: 0.109, countersunkDiameter: 0.279 },
  { label: "#8", diameter: 0.164, coarse: 32, fine: 36, headDiameter: 0.27, headHeight: 0.164, socket: 0.1406, acrossFlats: 0.34375, nutHeight: 0.125, countersunkDiameter: 0.332 },
  { label: "#10", diameter: 0.19, coarse: 24, fine: 32, headDiameter: 0.312, headHeight: 0.19, socket: 0.1563, acrossFlats: 0.375, nutHeight: 0.125, countersunkDiameter: 0.385 },
  { label: "1/4\"", diameter: 0.25, coarse: 20, fine: 28, headDiameter: 0.375, headHeight: 0.25, socket: 0.1875, acrossFlats: 0.4375, nutHeight: 0.219, countersunkDiameter: 0.507 },
  { label: "5/16\"", diameter: 0.3125, coarse: 18, fine: 24, headDiameter: 0.469, headHeight: 0.3125, socket: 0.25, acrossFlats: 0.5, nutHeight: 0.266, countersunkDiameter: 0.635 },
  { label: "3/8\"", diameter: 0.375, coarse: 16, fine: 24, headDiameter: 0.562, headHeight: 0.375, socket: 0.3125, acrossFlats: 0.5625, nutHeight: 0.328, countersunkDiameter: 0.762 },
  { label: "7/16\"", diameter: 0.4375, coarse: 14, fine: 20, headDiameter: 0.656, headHeight: 0.4375, socket: 0.375, acrossFlats: 0.6875, nutHeight: 0.375, countersunkDiameter: 0.812 },
  { label: "1/2\"", diameter: 0.5, coarse: 13, fine: 20, headDiameter: 0.75, headHeight: 0.5, socket: 0.375, acrossFlats: 0.75, nutHeight: 0.4375, countersunkDiameter: 0.875 },
  { label: "5/8\"", diameter: 0.625, coarse: 11, fine: 18, headDiameter: 0.938, headHeight: 0.625, socket: 0.5, acrossFlats: 0.9375, nutHeight: 0.547, countersunkDiameter: 1 },
  { label: "3/4\"", diameter: 0.75, coarse: 10, fine: 16, headDiameter: 1.125, headHeight: 0.75, socket: 0.625, acrossFlats: 1.125, nutHeight: 0.641, countersunkDiameter: 1.25 },
  { label: "1\"", diameter: 1, coarse: 8, fine: 12, headDiameter: 1.5, headHeight: 1, socket: 0.75, acrossFlats: 1.5, nutHeight: 0.859, countersunkDiameter: 1.5 },
];

function inchSpec(row: InchSizeRow, threadsPerInch: number, series: "UNC" | "UNF"): ThreadSizeSpec {
  const inches = (value: number) => value * MILLIMETRES_PER_INCH;
  return {
    id: `${row.label}-${threadsPerInch} ${series}`,
    system: "inch",
    diameter: inches(row.diameter),
    pitch: MILLIMETRES_PER_INCH / threadsPerInch,
    socket: inches(row.socket),
    headDiameter: inches(row.headDiameter),
    headHeight: inches(row.headHeight),
    acrossFlats: inches(row.acrossFlats),
    nutHeight: inches(row.nutHeight),
    countersunkDiameter: inches(row.countersunkDiameter),
  };
}

const INCH_COARSE_SIZES: readonly ThreadSizeSpec[] = INCH_ROWS.map((row) => inchSpec(row, row.coarse, "UNC"));
const INCH_FINE_SIZES: readonly ThreadSizeSpec[] = INCH_ROWS.map((row) => inchSpec(row, row.fine, "UNF"));

export const THREAD_SIZE_GROUPS: ReadonlyArray<{ series: string; sizes: readonly ThreadSizeSpec[] }> = [
  { series: "metric", sizes: METRIC_SIZES },
  { series: "UNC", sizes: INCH_COARSE_SIZES },
  { series: "UNF", sizes: INCH_FINE_SIZES },
];

export const THREAD_SIZES: readonly ThreadSizeSpec[] = THREAD_SIZE_GROUPS.flatMap((group) => group.sizes);

/**
 * Ob die Steigung als Gaenge je Zoll abgefragt wird. Entschieden wird das am
 * Durchmesser, nicht an der gewaehlten Groesse: so bleibt das Feld stehen,
 * waehrend man die Gangzahl von einem Normwert wegdreht.
 */
export function threadUsesInchPitch(diameter: number) {
  return INCH_ROWS.some((row) => Math.abs(row.diameter * MILLIMETRES_PER_INCH - diameter) < SIZE_MATCH_TOLERANCE);
}

/** Aus Millimetern Steigung werden Gaenge je Zoll - und zurueck. */
export function pitchToThreadsPerInch(pitch: number) {
  return MILLIMETRES_PER_INCH / Math.max(1e-6, pitch);
}

export function threadsPerInchToPitch(threadsPerInch: number) {
  return MILLIMETRES_PER_INCH / Math.max(0.25, threadsPerInch);
}

function derivedSizeSpec(diameter: number): ThreadSizeSpec {
  return {
    id: "",
    system: threadUsesInchPitch(diameter) ? "inch" : "metric",
    diameter,
    pitch: defaultThreadPitch(diameter),
    socket: diameter * 0.55,
    headDiameter: diameter * 1.6,
    headHeight: diameter,
    acrossFlats: diameter * 1.6,
    nutHeight: diameter * 0.85,
    countersunkDiameter: diameter * 2,
  };
}

/** Die Normgroesse zu Durchmesser und Steigung, oder nichts bei freien Werten. */
export function threadSizeFor(diameter: number, pitch: number): ThreadSizeSpec | null {
  return THREAD_SIZES.find((size) => (
    Math.abs(size.diameter - diameter) < SIZE_MATCH_TOLERANCE && Math.abs(size.pitch - pitch) < SIZE_MATCH_TOLERANCE
  )) ?? null;
}

/** Kopf- und Mutternmasse: aus der Norm, wo der Durchmesser eine ist, sonst gerechnet. */
export function threadSizeSpec(diameter: number, pitch: number): ThreadSizeSpec {
  return threadSizeFor(diameter, pitch) ?? derivedSizeSpec(diameter);
}

/** Die Regelsteigung des naechstgelegenen Normdurchmessers. */
export function defaultThreadPitch(diameter: number) {
  let nearest = THREAD_SIZES[0];
  for (const size of THREAD_SIZES) {
    if (Math.abs(size.diameter - diameter) < Math.abs(nearest.diameter - diameter)) nearest = size;
  }
  return nearest.pitch;
}

export function normalizeThreadRole(value?: string): ThreadRole {
  return value === "screw" || value === "nut" || value === "bore" ? value : DEFAULT_THREAD_ROLE;
}

export function normalizeThreadHead(value?: string): ThreadHead {
  return value === "countersunk" || value === "hex" ? value : DEFAULT_THREAD_HEAD;
}

export function normalizeThreadHand(value?: string): ThreadHand {
  return value === "left" ? "left" : DEFAULT_THREAD_HAND;
}

export function normalizeThreadProfile(value?: string): ThreadProfile {
  return value === "trapezoidal" || value === "round" ? value : DEFAULT_THREAD_PROFILE;
}

export function normalizeThreadDiameter(value?: number) {
  return clamp(finite(value, DEFAULT_THREAD_DIAMETER), MIN_THREAD_DIAMETER, MAX_THREAD_DIAMETER);
}

/**
 * Die Gewindetiefe waechst mit der Steigung. Waere die Steigung zu gross fuer
 * den Durchmesser, faellt der Kernquerschnitt auf null und der Koerper hat
 * keine Mitte mehr - deshalb die obere Grenze am Durchmesser.
 */
export function threadPitchLimits(diameter: number) {
  const normalizedDiameter = normalizeThreadDiameter(diameter);
  return { min: MIN_THREAD_PITCH, max: Math.min(MAX_THREAD_PITCH, normalizedDiameter * 0.75) };
}

export function normalizeThreadPitch(value: number | undefined, diameter: number) {
  const limits = threadPitchLimits(diameter);
  return clamp(finite(value, defaultThreadPitch(normalizeThreadDiameter(diameter))), limits.min, limits.max);
}

export function normalizeThreadClearance(value?: number) {
  return clamp(finite(value, DEFAULT_THREAD_CLEARANCE), MIN_THREAD_CLEARANCE, MAX_THREAD_CLEARANCE);
}

/**
 * Die Fase an den Enden. Bei einem Innengewinde (Mutter, Gewindeloch) reicht
 * genau die Gewindetiefe: der Kegel laeuft unter 45 Grad bis auf den Kern
 * hinunter und entgratet die Muendung, ohne mehr vom Gewinde zu opfern als
 * noetig. Ein freies Gewindeende (Stange, Schraubenspitze) braucht mehr, um
 * beim Einfaedeln in ein Gegengewinde wirklich zu fuehren statt nur die
 * Kante zu brechen - eine volle Steigung, angelehnt an genormte
 * Schraubenspitzen (z. B. ISO 4753), reicht spuerbar unter den Kern und
 * druckt sich damit auch als richtiger Kegel statt als Messerkante.
 */
export function defaultThreadChamfer(pitch: number, profile: ThreadProfile = DEFAULT_THREAD_PROFILE, role: ThreadRole = DEFAULT_THREAD_ROLE) {
  if (role === "nut" || role === "bore") return pitch * threadProfileSpec(profile).depthPerPitch;
  return pitch;
}

export function threadChamferLimits(settings: Pick<ThreadSettings, "role" | "diameter" | "pitch">) {
  if (settings.role === "nut") {
    const spec = threadSizeSpec(settings.diameter, settings.pitch);
    // Die Ansenkung darf die Schluesselflaeche nicht durchbrechen.
    const room = Math.max(0, spec.acrossFlats / 2 - settings.diameter / 2) * 0.7;
    return { min: 0, max: Math.max(0.05, Math.min(settings.pitch * 3, room)) };
  }
  return { min: 0, max: Math.max(0.05, Math.min(settings.pitch * 3, settings.diameter / 3)) };
}

export function normalizeThreadChamfer(value: number | undefined, settings: Pick<ThreadSettings, "role" | "diameter" | "pitch" | "profile">) {
  const limits = threadChamferLimits(settings);
  return clamp(finite(value, defaultThreadChamfer(settings.pitch, settings.profile, settings.role)), limits.min, limits.max);
}

/**
 * Die Spaltenzahl bleibt durch sechs teilbar, damit die Ecken von
 * Sechskantkopf, Mutter und Innensechskant auf Stuetzpunkte fallen und die
 * Flaechen dazwischen wirklich eben sind.
 */
export function normalizeThreadQuality(value?: number) {
  const rounded = Math.round(clamp(finite(value, DEFAULT_THREAD_QUALITY), MIN_THREAD_QUALITY, MAX_THREAD_QUALITY) / 6) * 6;
  return clamp(rounded, MIN_THREAD_QUALITY, MAX_THREAD_QUALITY);
}

export type ThreadShapeFields = {
  threadRole?: ThreadRole;
  threadHead?: ThreadHead;
  threadHand?: ThreadHand;
  threadProfile?: ThreadProfile;
  threadDiameter?: number;
  threadPitch?: number;
  threadClearance?: number;
  threadQuality?: number;
  threadHeadHeight?: number;
  threadChamfer?: number;
  threadHeadChamfer?: number;
};

export type ThreadSettings = {
  role: ThreadRole;
  head: ThreadHead;
  hand: ThreadHand;
  profile: ThreadProfile;
  diameter: number;
  pitch: number;
  clearance: number;
  quality: number;
  headHeight: number;
  chamfer: number;
  headChamfer: number;
};

export function threadSettings(shape: ThreadShapeFields): ThreadSettings {
  const diameter = normalizeThreadDiameter(shape.threadDiameter);
  const head: HeadShape = {
    role: normalizeThreadRole(shape.threadRole),
    head: normalizeThreadHead(shape.threadHead),
    diameter,
    pitch: normalizeThreadPitch(shape.threadPitch, diameter),
  };
  const profile = normalizeThreadProfile(shape.threadProfile);
  const headHeight = normalizeThreadHeadHeight(shape.threadHeadHeight, head);
  const chamfer = normalizeThreadChamfer(shape.threadChamfer, { role: head.role, diameter: head.diameter, pitch: head.pitch, profile });
  return {
    ...head,
    hand: normalizeThreadHand(shape.threadHand),
    profile,
    clearance: normalizeThreadClearance(shape.threadClearance),
    quality: normalizeThreadQuality(shape.threadQuality),
    headHeight,
    chamfer,
    // Die Aussenfase kennt ihre Grenze erst, wenn Kopfhoehe und Ansenkung
    // feststehen - bei der Mutter frisst die Ansenkung von innen mit.
    headChamfer: normalizeThreadHeadChamfer(shape.threadHeadChamfer, { ...head, headHeight, chamfer, profile }),
  };
}

/** Nur Innengewinde bekommen Spiel: aussen wuerde es den Bolzen duenner machen. */
function radialAllowance(role: ThreadRole, clearance: number) {
  return role === "bore" || role === "nut" ? clearance / 2 : 0;
}

type HeadShape = Pick<ThreadSettings, "role" | "head" | "diameter" | "pitch">;

/** Die Kopfhoehe nach Norm, gemessen von der Aufstandsflaeche bis zum Schaftbeginn. */
export function defaultThreadHeadHeight(settings: HeadShape) {
  if (settings.role !== "screw") return 0;
  const spec = threadSizeSpec(settings.diameter, settings.pitch);
  if (settings.head === "countersunk") return (spec.countersunkDiameter - settings.diameter) / 2;
  if (settings.head === "hex") return spec.headHeight * 0.7;
  return spec.headHeight;
}

export function threadHeadHeightLimits(settings: HeadShape) {
  return { min: 0.2, max: Math.max(1, settings.diameter * 3) };
}

export function normalizeThreadHeadHeight(value: number | undefined, settings: HeadShape) {
  if (settings.role !== "screw") return 0;
  const limits = threadHeadHeightLimits(settings);
  return clamp(finite(value, defaultThreadHeadHeight(settings)), limits.min, limits.max);
}

/**
 * Der Senkkopf ist ein 90-Grad-Kegel, also haengen Durchmesser und Hoehe
 * aneinander: wer den Kopf flacher zieht, macht ihn zwangslaeufig kleiner.
 * Zylinder- und Sechskantkopf behalten ihren Durchmesser.
 */
export function threadHeadDiameter(settings: Pick<ThreadSettings, "role" | "head" | "diameter" | "pitch" | "headHeight">) {
  const spec = threadSizeSpec(settings.diameter, settings.pitch);
  if (settings.head === "countersunk") return settings.diameter + settings.headHeight * 2;
  return spec.headDiameter;
}

type HeadChamferShape = Pick<ThreadSettings, "role" | "head" | "diameter" | "pitch" | "headHeight" | "profile"> & { chamfer?: number };

/**
 * Der Kopf steht auf seinem freien Ende. `inscribed` ist der kleinste Radius
 * seines Querschnitts - beim Sechskant die Schluesselflaeche -, `circumscribed`
 * der groesste. Beide Masse brauchen die Fase und ihre Grenze.
 */
function headRingRadii(settings: Pick<ThreadSettings, "role" | "head" | "diameter" | "pitch">) {
  const spec = threadSizeSpec(settings.diameter, settings.pitch);
  // Eine Mutter ist immer sechskantig - ihre Kopfform steht auf gar nichts.
  if (settings.role === "nut" || settings.head === "hex") {
    return { inscribed: spec.acrossFlats / 2, circumscribed: spec.acrossFlats / Math.sqrt(3) };
  }
  return { inscribed: spec.headDiameter / 2, circumscribed: spec.headDiameter / 2 };
}

/**
 * Die Hoehe, in der die beiden Fasenkegel Platz finden muessen. Beim
 * Schraubenkopf ist das seine eigene Hoehe, bei der Mutter die ganze - sie
 * *ist* ihr Kopf. Genommen wird das Normmass, nicht die eingestellte Hoehe:
 * `threadSettings` kennt die Hoehe des Koerpers nicht, und ein Regler, dessen
 * Hoechstwert die Pruefung danach doch wieder einfaengt, springt zurueck.
 */
function chamferRimHeight(settings: HeadChamferShape) {
  if (settings.role === "nut") return threadSizeSpec(settings.diameter, settings.pitch).nutHeight;
  return settings.headHeight;
}

/**
 * Die Fase am Schraubenkopf ist ein Kegel um die Achse: er beginnt an der
 * Kopfflaeche als Kreis und trifft die Flanke erst weiter innen. Beim
 * Sechskant faellt dieser Schnitt an den Ecken tiefer aus als an den
 * Schluesselflaechen - genau so sieht eine gedrehte Kopffase aus.
 *
 * **Gebrochen werden beide Kopfkanten**, die freie Flaeche und der Uebergang
 * zum Schaft. Nur die untere zu brechen hatte einen offensichtlichen Haken:
 * der Koerper steht auf seinem Kopf, also sieht man von der Fase nichts, und
 * ein Regler, der nichts sichtbar tut, gilt zu Recht als kaputt.
 *
 * Der Senkkopf bekommt keine: sein Kegel ist die Fase.
 */
export function threadHeadChamferLimits(settings: HeadChamferShape) {
  const gilt = settings.role === "nut" || (settings.role === "screw" && settings.head !== "countersunk");
  if (!gilt) return { min: 0, max: 0 };
  const spec = threadSizeSpec(settings.diameter, settings.pitch);
  const { inscribed, circumscribed } = headRingRadii(settings);
  // Was stehen bleiben muss: das Loch in der Mitte - beim Kopf der
  // Innensechskant und der Kragen um den Schaft, bei der Mutter ihre
  // Bohrung samt Ansenkung - und ein Rest Flanke zwischen den beiden Kegeln.
  const socketCorner = spec.socket / Math.sqrt(3);
  const innen = settings.role === "nut"
    ? settings.diameter / 2 + normalizeThreadChamfer(settings.chamfer, settings)
    : Math.max(socketCorner, settings.diameter / 2);
  const roomToBore = Math.max(0, inscribed - innen - 0.2);
  const roomToHeight = Math.max(0, chamferRimHeight(settings) * 0.35 - (circumscribed - inscribed));
  return { min: 0, max: Math.max(0, Math.min(inscribed * 0.4, roomToBore, roomToHeight)) };
}

export function normalizeThreadHeadChamfer(value: number | undefined, settings: HeadChamferShape) {
  const limits = threadHeadChamferLimits(settings);
  // Ohne Angabe bleibt der Kopf scharfkantig - ein gespeichertes Projekt darf
  // sich beim Oeffnen nicht von selbst veraendern.
  return clamp(finite(value, 0), limits.min, limits.max);
}

/** Die Hoehe, mit der ein frisch gewaehlter Gewindetyp auf die Ebene kommt. */
export function threadNaturalHeight(settings: Pick<ThreadSettings, "role" | "head" | "diameter" | "pitch" | "headHeight">) {
  if (settings.role === "nut") return threadSizeSpec(settings.diameter, settings.pitch).nutHeight;
  if (settings.role === "screw") return settings.headHeight + settings.diameter * 4;
  if (settings.role === "bore") return settings.diameter * 3;
  return settings.diameter * 5;
}

/**
 * Der Platz, den der Koerper von oben einnimmt. Ein Sechskant ist nie
 * quadratisch: ueber die Ecken misst er mehr als ueber die Schluesselflaechen,
 * und genau das muss der Auswahlrahmen zeigen.
 */
export function threadNaturalFootprint(settings: ThreadSettings) {
  const spec = threadSizeSpec(settings.diameter, settings.pitch);
  const allowance = radialAllowance(settings.role, settings.clearance);
  if (settings.role === "nut") {
    return { width: spec.acrossFlats / Math.cos(Math.PI / 6), depth: spec.acrossFlats };
  }
  if (settings.role === "screw") {
    if (settings.head === "hex") {
      return { width: spec.acrossFlats / Math.cos(Math.PI / 6), depth: spec.acrossFlats };
    }
    const diameter = Math.max(settings.diameter, threadHeadDiameter(settings));
    return { width: diameter, depth: diameter };
  }
  // Beim Gewindeloch weitet die Fase das Schneidwerkzeug am Mund auf; der
  // Rahmen muss diese Ansenkung mitzaehlen, sonst steht er im Koerper.
  const flare = settings.role === "bore" ? settings.chamfer * 2 : 0;
  const diameter = settings.diameter + allowance * 2 + flare;
  return { width: diameter, depth: diameter };
}

/**
 * Jedes Profil ist eine Punktfolge ueber eine Steigung: `u` in [0,1) ist die
 * axiale Lage, `level` 1 = Aussendurchmesser (Kuppe), 0 = Kerndurchmesser
 * (Grund). Zwischen den Punkten wird linear interpoliert, nach dem letzten
 * Punkt zurueck auf den ersten bei u=1 - das gilt fuer alle drei Profile,
 * weil jedes bei u=0 an der Kuppe beginnt.
 */
type ThreadProfilePoint = { u: number; level: number };
type ThreadProfileSpecification = {
  /** Gewindetiefe (Aussen- minus Kernradius) als Bruchteil der Steigung. */
  depthPerPitch: number;
  points: readonly ThreadProfilePoint[];
};

/** Wie fein das Profil dort abgetastet wird, wo der Fasenkegel es beschneidet. */
const CHAMFER_SUBDIVISIONS = 4;

// Ein metrisches Spitzgewinde ist ein gleichseitiges Dreieck mit der Steigung
// als Grundlinie, oben um H/8 und unten um H/4 gekappt. Ueber eine Steigung
// verteilt sich das auf Kuppenbreite P/8, Flanke 5P/16, Grundbreite P/4,
// Flanke 5P/16 - zusammen genau P. Tiefe: 5/8 der Dreieckshoehe H = P mal
// Wurzel(3)/2.
const V_PROFILE: ThreadProfileSpecification = {
  depthPerPitch: (5 / 8) * (Math.sqrt(3) / 2),
  points: [
    { u: 0, level: 1 },
    { u: 1 / 8, level: 1 },
    { u: 7 / 16, level: 0 },
    { u: 11 / 16, level: 0 },
  ],
};

// Trapezgewinde, an DIN 103 angenaehert: 30 Grad Flankenwinkel statt 60, dafuer
// eine ebene Kuppe und ein ebener Grund statt einer Spitze - genau das macht
// die Flanke fuer den 3D-Druck brauchbar, wie im Forum angemerkt. Tiefe knapp
// unter der halben Steigung, wie beim echten Trapezgewinde.
const TRAPEZOIDAL_PROFILE: ThreadProfileSpecification = {
  depthPerPitch: 0.4815,
  points: [
    { u: 0, level: 1 },
    { u: 0.366, level: 1 },
    { u: 0.5, level: 0 },
    { u: 0.866, level: 0 },
  ],
};

// Rundgewinde, an DIN 405 angenaehert: keine Flanke und keine Kante mehr,
// sondern eine Kosinuskurve ueber die ganze Steigung - an zwoelf Punkten
// abgetastet, genau wie ein Vieleck anderswo im Code einen Kreis annaehert.
// Die Tiefe bleibt bewusst flacher als bei den beiden anderen Profilen, weil
// die Rundung selbst schon Platz braucht.
const ROUND_PROFILE_SEGMENTS = 12;
const ROUND_PROFILE: ThreadProfileSpecification = {
  depthPerPitch: 0.3,
  points: Array.from({ length: ROUND_PROFILE_SEGMENTS }, (_, index) => {
    const u = index / ROUND_PROFILE_SEGMENTS;
    return { u, level: (1 + Math.cos(2 * Math.PI * u)) / 2 };
  }),
};

function threadProfileSpec(profile: ThreadProfile): ThreadProfileSpecification {
  if (profile === "trapezoidal") return TRAPEZOIDAL_PROFILE;
  if (profile === "round") return ROUND_PROFILE;
  return V_PROFILE;
}

function wrapUnit(value: number) {
  return ((value % 1) + 1) % 1;
}

function profileRadius(u: number, major: number, minor: number, points: readonly ThreadProfilePoint[]) {
  const phase = wrapUnit(u);
  for (let index = 0; index < points.length; index += 1) {
    const start = points[index];
    const end = index + 1 < points.length ? points[index + 1] : { u: 1, level: points[0].level };
    if (phase <= end.u) {
      const span = end.u - start.u;
      const fraction = span > 0 ? (phase - start.u) / span : 0;
      const level = start.level + (end.level - start.level) * fraction;
      return minor + (major - minor) * level;
    }
  }
  return major;
}

/** Der Radius eines Sechskants unter dem Winkel, Ecken auf Vielfachen von 60 Grad. */
function hexRadius(angle: number, acrossFlats: number) {
  const apothem = acrossFlats / 2;
  const sector = Math.PI / 3;
  return apothem / Math.cos(wrapUnit(angle / sector) * sector - sector / 2);
}

type Builder = { positions: number[]; indices: number[] };

function pushVertex(builder: Builder, angle: number, radius: number, y: number) {
  const index = builder.positions.length / 3;
  builder.positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  return index;
}

function pushCenter(builder: Builder, y: number) {
  const index = builder.positions.length / 3;
  builder.positions.push(0, y, 0);
  return index;
}

/** Entartete Dreiecke entstehen dort, wo das Gewinde an den Deckel stoesst; sie fliegen hier raus. */
function triangle(builder: Builder, a: number, b: number, c: number) {
  if (a === b || b === c || a === c) return;
  builder.indices.push(a, b, c);
}

function quad(builder: Builder, a: number, b: number, c: number, d: number) {
  triangle(builder, a, b, c);
  triangle(builder, a, c, d);
}

function ring(builder: Builder, angles: readonly number[], radiusAt: (angle: number, index: number) => number, y: number) {
  return angles.map((angle, index) => pushVertex(builder, angle, radiusAt(angle, index), y));
}

/** Mantelflaeche zwischen zwei Ringen; `inward` dreht die Sichtseite nach innen. */
function wall(builder: Builder, lower: readonly number[], upper: readonly number[], inward = false) {
  for (let index = 0; index < lower.length - 1; index += 1) {
    if (inward) quad(builder, lower[index], lower[index + 1], upper[index + 1], upper[index]);
    else quad(builder, lower[index], upper[index], upper[index + 1], lower[index + 1]);
  }
}

function capFan(builder: Builder, edge: readonly number[], y: number, up: boolean) {
  const center = pushCenter(builder, y);
  for (let index = 0; index < edge.length - 1; index += 1) {
    if (up) triangle(builder, center, edge[index + 1], edge[index]);
    else triangle(builder, center, edge[index], edge[index + 1]);
  }
}

function capRing(builder: Builder, inner: readonly number[], outer: readonly number[], up: boolean) {
  for (let index = 0; index < inner.length - 1; index += 1) {
    if (up) {
      triangle(builder, inner[index], outer[index + 1], outer[index]);
      triangle(builder, inner[index], inner[index + 1], outer[index + 1]);
    } else {
      triangle(builder, inner[index], outer[index], outer[index + 1]);
      triangle(builder, inner[index], outer[index + 1], inner[index + 1]);
    }
  }
}

/**
 * Die Gewindeflaeche selbst. Jede Spalte traegt dieselbe Folge von
 * Profilpunkten, nur um den Vorschub einer Teilumdrehung in der Hoehe
 * versetzt - dadurch verbindet Reihe zu Reihe genau die Wendel, und die Naht
 * bei 360 Grad faellt wieder auf den Anfang. Was ueber die Enden hinausragt,
 * faellt auf den Randpunkt derselben Spalte zusammen; die Deckel bleiben eben.
 */
function threadWall(
  builder: Builder,
  angles: readonly number[],
  bottomY: number,
  topY: number,
  major: number,
  minor: number,
  pitch: number,
  handSign: number,
  inward: boolean,
  limitRadius: (y: number, radius: number) => number,
  subdivisions: number,
  bandHeight: number,
  profilePoints: readonly ThreadProfilePoint[],
) {
  const profileRadii = profilePoints.map((point) => minor + (major - minor) * point.level);
  const turns = (topY - bottomY) / pitch;
  const firstTurn = -2;
  const lastTurn = Math.ceil(turns) + 1;
  const columns: number[][] = [];
  const bottomEdge: number[] = [];
  const topEdge: number[] = [];

  for (let column = 0; column < angles.length; column += 1) {
    const angle = angles[column];
    const advance = handSign * (column / (angles.length - 1)) * pitch;
    const bottomRadius = limitRadius(bottomY, profileRadius(-advance / pitch, major, minor, profilePoints));
    const topRadius = limitRadius(topY, profileRadius((topY - bottomY - advance) / pitch, major, minor, profilePoints));
    const bottomVertex = pushVertex(builder, angle, bottomRadius, bottomY);
    const topVertex = pushVertex(builder, angle, topRadius, topY);
    const rows: number[] = [bottomVertex];
    for (let turn = firstTurn; turn <= lastTurn; turn += 1) {
      for (let step = 0; step < profilePoints.length; step += 1) {
        const nextIndex = step + 1;
        const uStart = profilePoints[step].u;
        const uEnd = nextIndex < profilePoints.length ? profilePoints[nextIndex].u : 1;
        const rStart = profileRadii[step];
        const rEnd = nextIndex < profilePoints.length ? profileRadii[nextIndex] : major;
        const segmentY = bottomY + advance + (turn + uStart) * pitch;
        /*
         * Feiner abgetastet wird nur dort, wo der Fasenkegel das Profil
         * beschneidet. Entschieden wird das an der Hoehe des Abschnitts, nicht
         * an der Nummer des Gangs: die Naht bei 360 Grad trifft denselben
         * Abschnitt einen Gang weiter oben, und nur ueber die Hoehe faellt
         * dort dieselbe Entscheidung. Ausserhalb des Bandes wird derselbe
         * Punkt mehrfach eingetragen, damit jede Spalte gleich viele Reihen
         * behaelt - die entarteten Dreiecke daraus fallen beim Verbinden raus.
         */
        const dense = bandHeight > 0 && (segmentY < bottomY + bandHeight || segmentY > topY - bandHeight);
        let firstOfSegment = -1;
        for (let sub = 0; sub < subdivisions; sub += 1) {
          if (!dense && sub > 0) {
            rows.push(firstOfSegment);
            continue;
          }
          const fraction = sub / subdivisions;
          const y = bottomY + advance + (turn + uStart + (uEnd - uStart) * fraction) * pitch;
          const vertex = y <= bottomY
            ? bottomVertex
            : y >= topY
              ? topVertex
              : pushVertex(builder, angle, limitRadius(y, rStart + (rEnd - rStart) * fraction), y);
          if (sub === 0) firstOfSegment = vertex;
          rows.push(vertex);
        }
      }
    }
    rows.push(topVertex);
    columns.push(rows);
    bottomEdge.push(bottomVertex);
    topEdge.push(topVertex);
  }

  for (let column = 0; column < columns.length - 1; column += 1) {
    const here = columns[column];
    const next = columns[column + 1];
    for (let row = 0; row < here.length - 1; row += 1) {
      if (inward) quad(builder, here[row], next[row], next[row + 1], here[row + 1]);
      else quad(builder, here[row], here[row + 1], next[row + 1], next[row]);
    }
  }

  return { bottomEdge, topEdge };
}

export type ThreadFootprintPatch = ThreadShapeFields & { width: number; depth: number };

/**
 * Breite und Tiefe gehoeren beim Gewinde dem Durchmesser, nicht umgekehrt. Ein
 * Zug am Anfasser im Arbeitsbereich schreibt aber direkt in Breite und Tiefe -
 * deshalb wird er hier in einen gleichmaessigen Massstab zurueckgerechnet und
 * wandert in Durchmesser, Steigung und Kopfhoehe. So bleibt das Gewinde rund,
 * ein ovales kann gar nicht erst entstehen, und der Auswahlrahmen sitzt wieder
 * genau auf dem Koerper.
 */
export function threadFootprintPatch(shape: ThreadShapeFields & { width?: number; depth?: number }): ThreadFootprintPatch {
  const settings = threadSettings(shape);
  const natural = threadNaturalFootprint(settings);
  const widthFactor = Number.isFinite(shape.width) && (shape.width as number) > 0 ? (shape.width as number) / natural.width : 1;
  const depthFactor = Number.isFinite(shape.depth) && (shape.depth as number) > 0 ? (shape.depth as number) / natural.depth : 1;
  const drift = Math.max(Math.abs(widthFactor - 1), Math.abs(depthFactor - 1));
  const scaled = drift < 1e-6 ? settings : (() => {
    const factor = Math.max(0.01, (widthFactor + depthFactor) / 2);
    const diameter = normalizeThreadDiameter(settings.diameter * factor);
    const pitch = normalizeThreadPitch(settings.pitch * factor, diameter);
    const head: HeadShape = { role: settings.role, head: settings.head, diameter, pitch };
    const headHeight = normalizeThreadHeadHeight(settings.headHeight * factor, head);
    const chamfer = normalizeThreadChamfer(settings.chamfer * factor, { role: head.role, diameter: head.diameter, pitch: head.pitch, profile: settings.profile });
    return {
      ...settings,
      diameter,
      pitch,
      headHeight,
      chamfer,
      headChamfer: normalizeThreadHeadChamfer(settings.headChamfer * factor, { ...head, headHeight, chamfer, profile: settings.profile }),
    };
  })();
  const footprint = drift < 1e-6 ? natural : threadNaturalFootprint(scaled);
  return {
    width: footprint.width,
    depth: footprint.depth,
    threadRole: scaled.role,
    threadHead: scaled.head,
    threadHand: scaled.hand,
    threadProfile: scaled.profile,
    threadDiameter: scaled.diameter,
    threadPitch: scaled.pitch,
    threadClearance: scaled.clearance,
    threadQuality: scaled.quality,
    threadHeadHeight: scaled.headHeight,
    threadChamfer: scaled.chamfer,
    threadHeadChamfer: scaled.headChamfer,
  };
}

export type ThreadGeometryOptions = ThreadShapeFields & {
  width: number;
  depth: number;
  height: number;
};

export function createThreadGeometry(options: ThreadGeometryOptions) {
  const settings = threadSettings(options);
  const height = Math.max(0.05, options.height);
  const spec = threadSizeSpec(settings.diameter, settings.pitch);
  const allowance = radialAllowance(settings.role, settings.clearance);
  const profile = threadProfileSpec(settings.profile);
  const major = settings.diameter / 2 + allowance;
  const minor = Math.max(0.02, major - settings.pitch * profile.depthPerPitch);
  const handSign = settings.hand === "left" ? -1 : 1;

  const headHeight = Math.min(height * 0.9, settings.headHeight);
  const shaftBottom = settings.role === "screw" ? headHeight : 0;
  const chamfer = Math.min(settings.chamfer, (height - shaftBottom) * 0.45);
  // Am Schraubenkopf gibt es nichts zu brechen; dort sitzt der Kopf.
  const chamferBottom = settings.role !== "screw";
  // Nach innen geschnittene Gewinde bekommen die Fase andersherum: dort muss
  // der Werkzeugkoerper weiter werden, nicht schmaler.
  const inward = settings.role === "bore" || settings.role === "nut";
  const limitRadius = chamfer <= 0.001
    ? (_y: number, radius: number) => radius
    : (y: number, radius: number) => {
      const fromBottom = chamferBottom ? chamfer - (y - shaftBottom) : 0;
      const fromTop = chamfer - (height - y);
      const cut = Math.max(0, fromBottom, fromTop);
      if (cut <= 0) return radius;
      return inward ? Math.max(radius, major + cut) : Math.min(radius, Math.max(0.05, major - cut));
    };
  const spanTurns = Math.ceil((height - shaftBottom) / settings.pitch) + 4;
  const bandHeight = chamfer <= 0.001 ? 0 : chamfer + settings.pitch;
  const subdivisions = bandHeight > 0 ? CHAMFER_SUBDIVISIONS : 1;
  const denseSpan = Math.min(spanTurns, Math.ceil(bandHeight / settings.pitch) * 2 + 2);
  const pointsPerTurn = profile.points.length;
  const rows = ((spanTurns - denseSpan) * pointsPerTurn + denseSpan * pointsPerTurn * subdivisions) + 2;
  const requested = normalizeThreadQuality(settings.quality);
  const affordable = Math.floor(MAX_THREAD_VERTICES / Math.max(1, rows) / 6) * 6;
  const segments = clamp(Math.min(requested, affordable), MIN_THREAD_QUALITY, MAX_THREAD_QUALITY);
  // Die letzte Spalte liegt wieder bei null statt bei zwei Pi: sonst weicht
  // ihr Sinus um ein Rechenkorn ab und die Naht klafft, wenn auch nur um
  // ein Zehnbillionstel Millimeter.
  const angles = Array.from({ length: segments + 1 }, (_, index) => ((index % segments) / segments) * Math.PI * 2);

  const builder: Builder = { positions: [], indices: [] };

  /*
   * Die Aussenfase: zwei Kegel um die Achse, einer an jedem Ende. Jeder
   * beginnt an der Stirnflaeche als Kreis vom Radius `faceRadius` und geht mit
   * 45 Grad auf, bis er die Flanke trifft - beim Sechskant an den Ecken tiefer
   * als an den Schluesselflaechen, genau wie eine gedrehte Fase. Die Grenze
   * rechnet mit dem Normmass; hier steht die wirkliche Hoehe, also wird noch
   * einmal nachgeschnitten, falls jemand den Koerper flacher gezogen hat.
   */
  const rimRadii = headRingRadii(settings);
  const rimRoom = Math.max(0, height * 0.35 - (rimRadii.circumscribed - rimRadii.inscribed));
  const rimChamfer = Math.min(settings.headChamfer, rimRoom);
  const rimBroken = rimChamfer > 0.001;
  const rimFaceRadius = rimRadii.inscribed - rimChamfer;

  if (settings.role === "nut") {
    const outerRadiusAt = (angle: number) => hexRadius(angle, spec.acrossFlats);
    const outerBottom = rimBroken
      ? ring(builder, angles, () => rimFaceRadius, 0)
      : ring(builder, angles, outerRadiusAt, 0);
    const outerTop = rimBroken
      ? ring(builder, angles, () => rimFaceRadius, height)
      : ring(builder, angles, outerRadiusAt, height);
    if (rimBroken) {
      const flankeUnten = angles.map((angle) => pushVertex(builder, angle, outerRadiusAt(angle), outerRadiusAt(angle) - rimFaceRadius));
      const flankeOben = angles.map((angle) => pushVertex(builder, angle, outerRadiusAt(angle), height - (outerRadiusAt(angle) - rimFaceRadius)));
      wall(builder, outerBottom, flankeUnten);
      wall(builder, flankeUnten, flankeOben);
      wall(builder, flankeOben, outerTop);
    } else {
      wall(builder, outerBottom, outerTop);
    }
    const bore = threadWall(builder, angles, 0, height, major, minor, settings.pitch, handSign, true, limitRadius, subdivisions, bandHeight, profile.points);
    capRing(builder, bore.bottomEdge, outerBottom, false);
    capRing(builder, bore.topEdge, outerTop, true);
  } else if (settings.role === "screw") {
    const shaft = threadWall(builder, angles, shaftBottom, height, major, minor, settings.pitch, handSign, false, limitRadius, subdivisions, bandHeight, profile.points);
    capFan(builder, shaft.topEdge, height, true);

    const headRadiusAt = (angle: number, y: number) => {
      if (settings.head === "hex") return hexRadius(angle, spec.acrossFlats);
      if (settings.head === "countersunk") {
        const progress = headHeight > 0 ? y / headHeight : 1;
        const crown = threadHeadDiameter(settings) / 2;
        return crown + (settings.diameter / 2 - crown) * progress;
      }
      return spec.headDiameter / 2;
    };
    // Dieselbe Fase wie an der Mutter, nur in der Hoehe des Kopfes.
    const headRoom = Math.max(0, headHeight * 0.35 - (rimRadii.circumscribed - rimRadii.inscribed));
    const headChamfer = Math.min(settings.headChamfer, headRoom);
    const gebrochen = headChamfer > 0.001;
    const faceRadius = rimRadii.inscribed - headChamfer;
    const headBottom = gebrochen
      ? ring(builder, angles, () => faceRadius, 0)
      : ring(builder, angles, (angle) => headRadiusAt(angle, 0), 0);
    const headTop = gebrochen
      ? ring(builder, angles, () => faceRadius, headHeight)
      : ring(builder, angles, (angle) => headRadiusAt(angle, headHeight), headHeight);
    if (gebrochen) {
      const flankeUnten = angles.map((angle) => {
        const flankRadius = headRadiusAt(angle, 0);
        return pushVertex(builder, angle, flankRadius, flankRadius - faceRadius);
      });
      const flankeOben = angles.map((angle) => {
        const flankRadius = headRadiusAt(angle, headHeight);
        return pushVertex(builder, angle, flankRadius, headHeight - (flankRadius - faceRadius));
      });
      wall(builder, headBottom, flankeUnten);
      wall(builder, flankeUnten, flankeOben);
      wall(builder, flankeOben, headTop);
    } else {
      wall(builder, headBottom, headTop);
    }
    capRing(builder, shaft.bottomEdge, headTop, true);

    // Der Innensechskant sitzt in der freien Kopfflaeche. Der Sechskantkopf
    // bekommt keinen: den fasst man von aussen an.
    const socketDepth = settings.head === "hex" ? 0 : Math.min(headHeight * 0.6, settings.diameter * 0.55);
    if (socketDepth > 0.05) {
      const socketMouth = ring(builder, angles, (angle) => hexRadius(angle, spec.socket), 0);
      const socketFloor = ring(builder, angles, (angle) => hexRadius(angle, spec.socket), socketDepth);
      capRing(builder, socketMouth, headBottom, false);
      wall(builder, socketMouth, socketFloor, true);
      capFan(builder, socketFloor, socketDepth, false);
    } else {
      capFan(builder, headBottom, 0, false);
    }
  } else {
    const rod = threadWall(builder, angles, 0, height, major, minor, settings.pitch, handSign, false, limitRadius, subdivisions, bandHeight, profile.points);
    capFan(builder, rod.bottomEdge, 0, false);
    capFan(builder, rod.topEdge, height, true);
  }

  const natural = threadNaturalFootprint(settings);
  const scaleX = Math.max(0.01, options.width) / Math.max(Number.EPSILON, natural.width);
  const scaleZ = Math.max(0.01, options.depth) / Math.max(Number.EPSILON, natural.depth);
  if (scaleX !== 1 || scaleZ !== 1) {
    for (let offset = 0; offset < builder.positions.length; offset += 3) {
      builder.positions[offset] *= scaleX;
      builder.positions[offset + 2] *= scaleZ;
    }
  }

  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute("position", new THREE.Float32BufferAttribute(builder.positions, 3));
  indexed.setIndex(builder.indices);
  const geometry = toCreasedNormals(indexed, THREE.MathUtils.degToRad(20));
  indexed.dispose();
  geometry.computeBoundingBox();
  return geometry;
}
