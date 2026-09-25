"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { EdgeModifierSlider } from "@/components/workplane/EdgeModifierPanel";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";
import type { ShellOpenings, WorkplaneWorkspaceSettings } from "@/types/layerling";

const SHELL_OPENINGS: readonly ShellOpenings[] = ["top", "none", "bottom", "top-bottom"];
const MIN_WALL = 0.2;
const WALL_STEP = 0.1;

/**
 * Hollowing a body: one wall thickness and which side stays open. The walls
 * grow inward, so the outside of the body does not move.
 */
export function ShellPanel({
  targetName,
  thickness,
  maxThickness,
  openings,
  workspace,
  busy,
  error,
  onThicknessChange,
  onOpeningsChange,
  onApply,
  onCancel,
}: {
  targetName: string;
  thickness: number;
  maxThickness: number;
  openings: ShellOpenings;
  workspace: WorkplaneWorkspaceSettings;
  busy: boolean;
  error: string | null;
  onThicknessChange: (value: number) => void;
  onOpeningsChange: (value: ShellOpenings) => void;
  onApply: () => void;
  onCancel: () => void;
}) {
  useLanguage();
  const title = t("shell.title");
  return (
    <aside className="edge-modifier-panel shell-panel" aria-label={title}>
      <div className="edge-modifier-header">
        <div>
          <strong>{title}</strong>
          <span>{t("shell.subtitle")}</span>
        </div>
        <button type="button" aria-label={t("shell.cancel")} onClick={onCancel}><X size={20} /></button>
      </div>

      <div className="edge-modifier-target">
        <strong>{targetName}</strong>
        <span>{t("shell.help")}</span>
      </div>

      <EdgeModifierSlider
        label={t("shell.wall")}
        value={thickness}
        min={MIN_WALL}
        max={Math.max(MIN_WALL, maxThickness)}
        step={WALL_STEP}
        workspace={workspace}
        length
        disabled={busy}
        onChange={onThicknessChange}
      />

      <div className="edge-modifier-field shell-openings" role="radiogroup" aria-label={t("shell.openings")}>
        <span>{t("shell.openings")}</span>
        <div className="shell-opening-options">
          {SHELL_OPENINGS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={openings === option}
              className={openings === option ? "active" : ""}
              disabled={busy}
              onClick={() => onOpeningsChange(option)}
            >
              {t(`shell.opening.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="edge-modifier-error" role="alert">{error}</div> : null}
      <div className="edge-modifier-footer">
        <button type="button" className="secondary" onClick={onCancel}>{t("common.cancel")}</button>
        <button type="button" className="primary" disabled={busy} onClick={onApply}>
          {busy ? <LoaderCircle className="edge-modifier-spinner" size={17} /> : <Check size={17} />}
          {busy ? t("shell.working") : t("shell.apply")}
        </button>
      </div>
    </aside>
  );
}
