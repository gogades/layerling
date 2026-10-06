import { unzipSync } from "fflate";
import { t } from "@/lib/i18n";
import { importExtensionSupported } from "@/lib/importExtensions";
import { importedShapesFromObj } from "@/lib/objImport";
import { attachProjectAsset, projectAssetFromBytes, sourceFormatForFileName } from "@/lib/projectAssets";
import { importedShapeFromStl } from "@/lib/stlImport";
import { importedShapeFromSvg } from "@/lib/svgImport";
import { importedShapesFrom3mf } from "@/lib/threemfImport";
import type { ProjectAsset, WorkplaneShape } from "@/types/layerling";

/**
 * Der Import von Modelldateien, fuer das Importfenster im Editor, die MCP-
 * Aktion und die Entwurfsuebersicht gleichermassen - frueher stand er zweimal
 * da, und nur einer kannte die Farben.
 */

export type ImportFailure = { fileName: string; reason: string };

/**
 * Was zum Import ausgewaehlt wurde, zurechtgelegt: ein ZIP (so liefert
 * Tinkercad seine OBJ, mit der .mtl daneben) wird ausgepackt, und .mtl-Dateien
 * sind keine eigenen Teile, sondern die Farben fuer die OBJ daneben.
 */
async function prepareImportFiles(files: readonly File[]) {
  const expanded: File[] = [];
  const failures: ImportFailure[] = [];
  for (const file of files) {
    if (!/\.zip$/i.test(file.name)) {
      expanded.push(file);
      continue;
    }
    try {
      const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
        filter: (entry) => !entry.name.endsWith("/") && /\.(obj|mtl|stl|3mf|svg|step|stp)$/i.test(entry.name) && !/(^|\/)__MACOSX\//.test(entry.name),
      });
      const inside = Object.entries(entries).map(([name, bytes]) => new File([bytes as BlobPart], name.split("/").pop() || name));
      if (!inside.some((entry) => !/\.mtl$/i.test(entry.name))) {
        failures.push({ fileName: file.name, reason: t("status.importZipEmpty") });
        continue;
      }
      expanded.push(...inside);
    } catch {
      failures.push({ fileName: file.name, reason: t("status.importZipUnreadable") });
    }
  }
  const mtlFiles = expanded.filter((file) => /\.mtl$/i.test(file.name));
  const mtlSources = await Promise.all(mtlFiles.map((file) => file.text()));
  return { files: expanded.filter((file) => !/\.mtl$/i.test(file.name)), mtlSources, failures };
}

export type ModelImportResult = {
  shapes: WorkplaneShape[];
  assets: ProjectAsset[];
  /** Die Modelldateien, die tatsaechlich gelesen wurden (ein ZIP ist ausgepackt). */
  files: File[];
  /** Davon die, aus denen etwas wurde. */
  importedFileNames: string[];
  failures: ImportFailure[];
  /** Saetze fuer die Meldung: wie viele Farben, was fehlt. */
  notes: string[];
  /** Nur eine .mtl ausgewaehlt - es gibt nichts zu importieren. */
  mtlOnly: boolean;
};

export async function importModelFiles(
  selected: readonly File[],
  options: { onProgress?: (index: number, total: number, file: File, isStep: boolean) => void; cancelled?: () => boolean } = {},
): Promise<ModelImportResult | null> {
  const prepared = await prepareImportFiles(selected);
  const files = prepared.files;
  const result: ModelImportResult = {
    shapes: [],
    assets: [],
    files,
    importedFileNames: [],
    failures: [...prepared.failures],
    notes: [],
    mtlOnly: !files.length && prepared.mtlSources.length > 0 && !prepared.failures.length,
  };
  if (result.mtlOnly) {
    result.failures.push({ fileName: selected[0]?.name ?? ".mtl", reason: t("status.importMtlAlone") });
    return result;
  }

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (options.cancelled?.()) return null;

    const sourceFormat = sourceFormatForFileName(file.name) ?? (file.type === "image/svg+xml" ? "svg" : null);
    const isStep = sourceFormat === "step";
    const isObj = sourceFormat === "obj";
    const isSvg = sourceFormat === "svg";
    const is3mf = sourceFormat === "3mf";
    if (!sourceFormat || (!isStep && !isSvg && !importExtensionSupported(file.name))) {
      result.failures.push({ fileName: file.name, reason: t("status.importUnsupported") });
      continue;
    }

    options.onProgress?.(index, files.length, file, isStep);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      let shape: WorkplaneShape;
      // Eine farbige OBJ oder 3MF wird zu einem Koerper je Farbe, eine 3MF mit
      // mehreren Objekten zu einem je Objekt. Die tragen ihr Netz dann selbst;
      // die Datei als Ganzes bauen sie nicht nach.
      if (isObj || is3mf) {
        const colored = isObj
          ? importedShapesFromObj(file.name, new TextDecoder().decode(bytes), prepared.mtlSources)
          : importedShapesFrom3mf(file.name, buffer);
        if ("missingMaterialColors" in colored && colored.missingMaterialColors) result.notes.push(t("status.importObjNoMtl", { name: file.name }));
        if ("painted" in colored && colored.painted > 0) result.notes.push(t("status.import3mfPainted", { name: file.name }));
        if (colored.split) {
          result.shapes.push(...colored.shapes);
          result.importedFileNames.push(file.name);
          const objects = "objects" in colored ? colored.objects : 1;
          result.notes.push(t(objects > 1 ? "status.importObjectParts" : "status.importColoredParts", { name: file.name, count: colored.shapes.length, objects }));
          continue;
        }
        shape = colored.shapes[0];
      } else if (isStep) {
        const { importedShapeFromStep } = await import("@/lib/stepImport");
        shape = await importedShapeFromStep(file.name, buffer);
      } else if (isSvg) {
        shape = importedShapeFromSvg(file.name, new TextDecoder().decode(bytes));
      } else {
        shape = importedShapeFromStl(file.name, buffer);
      }
      // Eine eigene OBJ traegt ihr Netz selbst ("json") und braucht die Datei nicht.
      if (shape.importedMesh?.sourceFormat === "json") {
        result.shapes.push(shape);
      } else {
        const asset = await projectAssetFromBytes(file.name, sourceFormat, bytes, file.type);
        result.shapes.push(attachProjectAsset(shape, asset.id));
        result.assets.push(asset);
      }
      result.importedFileNames.push(file.name);
    } catch (error) {
      result.failures.push({
        fileName: file.name,
        reason: error instanceof Error ? error.message : t("status.importUnreadable"),
      });
    }
  }
  return options.cancelled?.() ? null : result;
}

/** Die Fehlerzeile unter einer Importmeldung, oder nichts. */
export function importFailureSummary(failures: readonly ImportFailure[]) {
  if (!failures.length) return "";
  const details = failures.slice(0, 3).map((failure) => `${failure.fileName}: ${failure.reason}`).join("; ");
  const more = failures.length > 3 ? t("status.importFailedMore", { count: failures.length - 3 }) : "";
  return " " + t("status.importFailedList", { details, more });
}
