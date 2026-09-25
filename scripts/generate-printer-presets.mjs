import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Builds apps/web/src/lib/printerPresets.generated.ts - the build plates the
 * workspace settings offer - from OrcaSlicer's printer profiles.
 *
 * OrcaSlicer ships a profile for nearly every current FDM printer, maintained
 * together with the vendors, and the numbers in it are the ones a design is
 * later sliced with. Only the printers in PRINTERS below are taken over: the
 * list is meant to cover the machines people actually own, not every variant.
 *
 *   node scripts/generate-printer-presets.mjs [path/to/OrcaSlicer]
 *
 * Without a path the script fetches the profiles itself (a sparse clone of
 * resources/profiles only). OrcaSlicer is AGPL-3.0, like layerling.
 */

const ORCA_REPOSITORY = "https://github.com/SoftFever/OrcaSlicer.git";
const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(repositoryRoot, "apps/web/src/lib/printerPresets.generated.ts");

/** [OrcaSlicer vendor folder, printer_model]. The order is the order in the menu. */
const PRINTERS = [
  ["BBL", "Bambu Lab A1 mini"],
  ["BBL", "Bambu Lab A1"],
  ["BBL", "Bambu Lab P1P"],
  ["BBL", "Bambu Lab P1S"],
  ["BBL", "Bambu Lab P2S"],
  ["BBL", "Bambu Lab X1 Carbon"],
  ["BBL", "Bambu Lab X1E"],
  ["BBL", "Bambu Lab H2S"],
  ["BBL", "Bambu Lab H2D"],
  ["Prusa", "Prusa MINI"],
  ["Prusa", "Prusa MK3S"],
  ["Prusa", "Prusa MK3.5"],
  ["Prusa", "Prusa MK4"],
  ["Prusa", "Prusa MK4S"],
  ["Prusa", "Prusa CORE One"],
  ["Prusa", "Prusa XL"],
  ["Creality", "Creality Ender-3"],
  ["Creality", "Creality Ender-3 V2"],
  ["Creality", "Creality Ender-3 S1"],
  ["Creality", "Creality Ender-3 V3 SE"],
  ["Creality", "Creality Ender-3 V3 KE"],
  ["Creality", "Creality Ender-3 V3"],
  ["Creality", "Creality Ender-5 S1"],
  ["Creality", "Creality CR-10"],
  ["Creality", "Creality K1"],
  ["Creality", "Creality K1C"],
  ["Creality", "Creality K1 Max"],
  ["Creality", "Creality K2 Plus"],
  ["Elegoo", "Elegoo Neptune 3 Pro"],
  ["Elegoo", "Elegoo Neptune 4"],
  ["Elegoo", "Elegoo Neptune 4 Pro"],
  ["Elegoo", "Elegoo Neptune 4 Plus"],
  ["Elegoo", "Elegoo Neptune 4 Max"],
  ["Elegoo", "Elegoo Centauri Carbon"],
  ["Anycubic", "Anycubic Kobra 2 Neo"],
  ["Anycubic", "Anycubic Kobra 3"],
  ["Anycubic", "Anycubic Kobra S1"],
  ["Anycubic", "Anycubic Vyper"],
  ["Qidi", "Qidi Q1 Pro"],
  ["Qidi", "Qidi X-Plus 3"],
  ["Qidi", "Qidi X-Plus 4"],
  ["Qidi", "Qidi X-Max 3"],
  ["Sovol", "Sovol SV06"],
  ["Sovol", "Sovol SV06 Plus"],
  ["Sovol", "Sovol SV07"],
  ["Sovol", "Sovol SV08"],
  ["Flashforge", "Flashforge Adventurer 5M"],
  ["Flashforge", "Flashforge Adventurer 5M Pro"],
  ["Flashforge", "Flashforge AD5X"],
  ["Artillery", "Artillery Sidewinder X2"],
  ["Artillery", "Artillery Genius Pro"],
  ["Anker", "Anker M5"],
  ["Voron", "Voron 2.4 300"],
  ["Voron", "Voron Trident 300"],
];

/** How the vendor is written in the menu. */
const VENDOR_LABELS = { BBL: "Bambu Lab" };

function orcaCheckout() {
  const given = process.argv[2];
  if (given) return { root: given, cleanup: () => {} };
  const work = mkdtempSync(join(tmpdir(), "orca-profiles-"));
  const run = (args, cwd) => {
    const result = spawnSync("git", args, { cwd, stdio: "inherit" });
    if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed`);
  };
  run(["clone", "--depth", "1", "--filter=blob:none", "--sparse", ORCA_REPOSITORY, work]);
  run(["sparse-checkout", "set", "resources/profiles"], work);
  return { root: work, cleanup: () => rmSync(work, { recursive: true, force: true }) };
}

function listJson(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listJson(path);
    return entry.name.endsWith(".json") ? [path] : [];
  });
}

/** Every machine profile of one vendor, by name, with `inherits` resolved. */
function vendorMachines(profilesRoot, vendor) {
  const byName = new Map();
  for (const file of listJson(join(profilesRoot, vendor, "machine"))) {
    const profile = JSON.parse(readFileSync(file, "utf8"));
    if (profile.name) byName.set(profile.name, profile);
  }
  const resolved = new Map();
  const resolve = (name, trail = []) => {
    if (resolved.has(name)) return resolved.get(name);
    const own = byName.get(name);
    if (!own) throw new Error(`${vendor}: profile "${name}" not found (${trail.join(" <- ")})`);
    const parent = own.inherits ? resolve(own.inherits, [...trail, name]) : {};
    const merged = { ...parent, ...own };
    resolved.set(name, merged);
    return merged;
  };
  return [...byName.keys()].map((name) => resolve(name));
}

function bedFromArea(area, label) {
  // Most profiles list the corners, some write them as one comma separated string.
  const corners = Array.isArray(area) ? area : String(area).split(",");
  const points = corners.map((point) => String(point).trim().split("x").map(Number));
  if (points.some((point) => point.length !== 2 || point.some((value) => !Number.isFinite(value)))) {
    throw new Error(`${label}: unreadable printable_area ${JSON.stringify(area)}`);
  }
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const width = Math.max(...xs) - Math.min(...xs);
  const depth = Math.max(...ys) - Math.min(...ys);
  const rectangle = points.length === 4 && points.every(([x, y]) =>
    (x === Math.min(...xs) || x === Math.max(...xs)) && (y === Math.min(...ys) || y === Math.max(...ys)));
  if (!rectangle) throw new Error(`${label}: only rectangular beds are supported, got ${JSON.stringify(area)}`);
  return { width, depth };
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const { root, cleanup } = orcaCheckout();
try {
  const profilesRoot = join(root, "resources", "profiles");
  const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).stdout.trim() || "unknown";
  const machinesByVendor = new Map();
  const presets = PRINTERS.map(([vendor, model]) => {
    if (!machinesByVendor.has(vendor)) machinesByVendor.set(vendor, vendorMachines(profilesRoot, vendor));
    const candidates = machinesByVendor.get(vendor).filter((profile) =>
      profile.printer_model === model && String(profile.instantiation ?? "true").toLowerCase() === "true");
    // The standard 0.4 mm nozzle; a profile without a variant is the only one.
    const profile = candidates.find((candidate) => String(candidate.printer_variant) === "0.4")
      ?? candidates.find((candidate) => candidate.printer_variant === undefined);
    if (!profile) throw new Error(`${model}: no 0.4 mm profile in OrcaSlicer's ${vendor} folder`);
    const { width, depth } = bedFromArea(profile.printable_area ?? [], model);
    const height = Number(profile.printable_height);
    if (!Number.isFinite(height) || height <= 0) throw new Error(`${model}: no printable_height`);
    const vendorLabel = VENDOR_LABELS[vendor] ?? vendor;
    return {
      id: slug(model),
      vendor: vendorLabel,
      model: model.startsWith(`${vendorLabel} `) ? model.slice(vendorLabel.length + 1) : model,
      width,
      depth,
      height,
    };
  });

  const lines = presets.map((preset) => `  ${JSON.stringify(preset)},`);
  const source = `// Generated by scripts/generate-printer-presets.mjs - do not edit by hand.
// Source: OrcaSlicer resources/profiles (AGPL-3.0), commit ${commit}.
// Build plate width x depth and maximum print height in millimetres, for the
// printer's standard 0.4 mm nozzle profile.

export type PrinterPreset = {
  id: string;
  vendor: string;
  model: string;
  width: number;
  depth: number;
  height: number;
};

export const PRINTER_PRESETS_SOURCE = ${JSON.stringify(`OrcaSlicer ${commit.slice(0, 7)}`)};

export const PRINTER_PRESETS: readonly PrinterPreset[] = [
${lines.join("\n")}
];
`;
  writeFileSync(OUT, source);
  console.log(`[printers] ${presets.length} printers written to ${relative(repositoryRoot, OUT)}`);
} finally {
  cleanup();
}
