"use client";

import { Check, X } from "lucide-react";
import { EdgeModifierSlider } from "@/components/workplane/EdgeModifierPanel";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";
import { ARRAY_MAX_COUNT, ARRAY_MIN_COUNT, type ArrayDirection, type ArrayMode, type ArraySettings } from "@/lib/shapeArray";
import type { WorkplaneWorkspaceSettings } from "@/types/layerling";

const ARRAY_MODES: readonly ArrayMode[] = ["row", "circle"];
const ARRAY_DIRECTIONS: readonly ArrayDirection[] = ["x", "y", "z"];
const MAX_SPACING = 300;

/**
 * Repeating the selection n times in a row or around a circle. The copies
 * show on the workplane while the numbers change and only land in the design
 * with "Create".
 */
export function ArrayPanel({
  targetName,
  settings,
  workspace,
  pivotSet,
  onChange,
  onApply,
  onCancel,
}: {
  targetName: string;
  settings: ArraySettings;
  workspace: WorkplaneWorkspaceSettings;
  /** A rotation pivot is set - the circle centre was taken from it. */
  pivotSet: boolean;
  onChange: (patch: Partial<ArraySettings>) => void;
  onApply: () => void;
  onCancel: () => void;
}) {
  useLanguage();
  const title = t("array.title");
  const halfPlate = Math.max(workspace.width, workspace.depth) / 2;
  return (
    <aside className="edge-modifier-panel shell-panel array-panel" aria-label={title}>
      <div className="edge-modifier-header">
        <div>
          <strong>{title}</strong>
          <span>{t("array.subtitle")}</span>
        </div>
        <button type="button" aria-label={t("array.cancel")} onClick={onCancel}><X size={20} /></button>
      </div>

      <div className="edge-modifier-target">
        <strong>{targetName}</strong>
        <span>{t(settings.mode === "row" ? "array.helpRow" : pivotSet ? "array.helpCirclePivot" : "array.helpCircle")}</span>
      </div>

      <div className="edge-modifier-field shell-openings" role="radiogroup" aria-label={t("array.mode")}>
        <span>{t("array.mode")}</span>
        <div className="shell-opening-options">
          {ARRAY_MODES.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={settings.mode === option}
              className={settings.mode === option ? "active" : ""}
              onClick={() => onChange({ mode: option })}
            >
              {t(`array.mode.${option}`)}
            </button>
          ))}
        </div>
      </div>

      <EdgeModifierSlider
        label={t("array.count")}
        value={settings.count}
        min={ARRAY_MIN_COUNT}
        max={ARRAY_MAX_COUNT}
        step={1}
        workspace={workspace}
        onChange={(value) => onChange({ count: Math.round(value) })}
      />

      {settings.mode === "row" ? (
        <>
          <div className="edge-modifier-field shell-openings" role="radiogroup" aria-label={t("array.direction")}>
            <span>{t("array.direction")}</span>
            <div className="shell-opening-options">
              {ARRAY_DIRECTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={settings.direction === option}
                  className={settings.direction === option ? "active" : ""}
                  onClick={() => onChange({ direction: option })}
                >
                  {t(`array.direction.${option}`)}
                </button>
              ))}
            </div>
          </div>
          <EdgeModifierSlider
            label={t("array.spacing")}
            value={settings.spacing}
            min={-MAX_SPACING}
            max={MAX_SPACING}
            step={0.5}
            workspace={workspace}
            length
            onChange={(value) => onChange({ spacing: value })}
          />
        </>
      ) : (
        <>
          <EdgeModifierSlider
            label={t("array.angle")}
            value={settings.angle}
            min={-360}
            max={360}
            step={1}
            unit="°"
            workspace={workspace}
            onChange={(value) => onChange({ angle: value })}
          />
          <EdgeModifierSlider
            label={t("array.centerX")}
            value={settings.centerX}
            min={-halfPlate}
            max={halfPlate}
            step={0.5}
            workspace={workspace}
            length
            onChange={(value) => onChange({ centerX: value })}
          />
          <EdgeModifierSlider
            label={t("array.centerY")}
            value={settings.centerY}
            min={-halfPlate}
            max={halfPlate}
            step={0.5}
            workspace={workspace}
            length
            onChange={(value) => onChange({ centerY: value })}
          />
          <div className="edge-modifier-field shell-openings" role="radiogroup" aria-label={t("array.rotateCopies")}>
            <span>{t("array.rotateCopies")}</span>
            <div className="shell-opening-options">
              {[true, false].map((option) => (
                <button
                  key={String(option)}
                  type="button"
                  role="radio"
                  aria-checked={settings.rotateCopies === option}
                  className={settings.rotateCopies === option ? "active" : ""}
                  onClick={() => onChange({ rotateCopies: option })}
                >
                  {t(option ? "array.rotateCopies.yes" : "array.rotateCopies.no")}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="edge-modifier-footer">
        <button type="button" className="secondary" onClick={onCancel}>{t("common.cancel")}</button>
        <button type="button" className="primary" onClick={onApply}>
          <Check size={17} />
          {t("array.apply")}
        </button>
      </div>
    </aside>
  );
}
