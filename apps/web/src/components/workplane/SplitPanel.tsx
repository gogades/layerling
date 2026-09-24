"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { displayStepFromMillimeters, displayToMillimeters, formatMeasurementNumber, lengthDisplayUnit, millimetersToDisplay, parseMeasurementInput } from "@/lib/measurementUnits";
import { splitRotationAxis } from "@/lib/modelSplit";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";
import { selectWholeValue } from "@/lib/numberField";
import type { AlignAxis, WorkplaneWorkspaceSettings } from "@/types/layerling";

export function SplitPanel({
  axis,
  rotation,
  position,
  min,
  max,
  targetCount,
  workspace,
  busy,
  error,
  onAxisChange,
  onRotationChange,
  onPositionChange,
  onApply,
  onCancel,
}: {
  axis: AlignAxis;
  rotation: number;
  position: number;
  min: number;
  max: number;
  targetCount: number;
  workspace: WorkplaneWorkspaceSettings;
  busy: boolean;
  error: string | null;
  onAxisChange: (axis: AlignAxis) => void;
  onRotationChange: (rotation: number) => void;
  onPositionChange: (position: number) => void;
  onApply: () => void;
  onCancel: () => void;
}) {
  useLanguage();
  const panelRef = useRef<HTMLElement | null>(null);
  const displayPosition = millimetersToDisplay(position, workspace);
  const displayMin = millimetersToDisplay(min, workspace);
  const displayMax = millimetersToDisplay(max, workspace);
  const displayStep = displayStepFromMillimeters(0.1, workspace);
  const unit = lengthDisplayUnit(workspace).label;
  const formattedPosition = formatMeasurementNumber(displayPosition, workspace.accuracy, displayStep);
  const formattedRotation = String(Number(rotation.toFixed(2)));
  const rotationAxis = splitRotationAxis(axis).toUpperCase();
  const [positionEditing, setPositionEditing] = useState(false);
  const [positionDraft, setPositionDraft] = useState(formattedPosition);
  const [rotationEditing, setRotationEditing] = useState(false);
  const [rotationDraft, setRotationDraft] = useState(formattedRotation);
  const applyDisplayPosition = (value: number) => {
    if (Number.isFinite(value)) onPositionChange(displayToMillimeters(value, workspace));
  };
  useEffect(() => {
    if (!positionEditing) setPositionDraft(formattedPosition);
  }, [formattedPosition, positionEditing]);
  useEffect(() => {
    if (!rotationEditing) setRotationDraft(formattedRotation);
  }, [formattedRotation, rotationEditing]);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  const commitPositionDraft = () => {
    const value = parseMeasurementInput(positionDraft);
    if (Number.isFinite(value)) applyDisplayPosition(value);
    setPositionEditing(false);
  };
  const commitRotationDraft = () => {
    const value = parseMeasurementInput(rotationDraft);
    if (Number.isFinite(value)) onRotationChange(value);
    setRotationEditing(false);
  };

  return (
    <aside className="split-panel" ref={panelRef} tabIndex={-1} aria-labelledby="split-panel-title">
      <div className="split-panel-header">
        <div>
          <strong id="split-panel-title">{t("split.title")}</strong>
          <span>{t("split.subtitle")}</span>
        </div>
        <button type="button" aria-label={t("split.cancelAria")} onClick={onCancel}><X size={20} /></button>
      </div>

      <div className="split-panel-target">
        <strong>{targetCount === 1 ? t("split.targetOne") : t("split.targetMany", { count: targetCount })}</strong>
        <span>{t("split.targetHint")}</span>
      </div>

      <fieldset className="split-axis-control" disabled={busy}>
        <legend>{t("split.orientation")}</legend>
        <div>
          {(["x", "y", "z"] as AlignAxis[]).map((candidate) => (
            <button
              type="button"
              className={axis === candidate ? "active" : ""}
              aria-pressed={axis === candidate}
              key={candidate}
              onClick={() => onAxisChange(candidate)}
            >
              {candidate.toUpperCase()}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="split-position-control split-rotation-control">
        <span>
          <strong>{t("split.rotation", { axis: rotationAxis })}</strong>
          <span className="split-position-value">
            <input
              type="text"
              inputMode="decimal"
              value={rotationEditing ? rotationDraft : formattedRotation}
              aria-label={t("split.rotationAria", { axis: rotationAxis })}
              aria-describedby="split-rotation-unit"
              disabled={busy}
              onFocus={(event) => {
                setRotationDraft(formattedRotation);
                setRotationEditing(true);
                selectWholeValue(event.currentTarget);
              }}
              onChange={(event) => setRotationDraft(event.currentTarget.value)}
              onBlur={commitRotationDraft}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.blur();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  setRotationDraft(formattedRotation);
                  setRotationEditing(false);
                }
              }}
            />
            <small id="split-rotation-unit">{t("split.degrees")}</small>
          </span>
        </span>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={rotation}
          aria-label={t("split.rotationSliderAria", { axis: rotationAxis })}
          aria-valuetext={t("split.rotationValue", { value: formattedRotation, axis: rotationAxis })}
          disabled={busy}
          onChange={(event) => onRotationChange(event.currentTarget.valueAsNumber)}
        />
      </div>

      <div className="split-position-control">
        <span>
          <strong>{t("split.position")}</strong>
          <span className="split-position-value">
            <input
              type="text"
              inputMode="decimal"
              value={positionEditing ? positionDraft : formattedPosition}
              aria-label={t("split.positionAria")}
              aria-describedby="split-position-unit"
              disabled={busy}
              onFocus={(event) => {
                setPositionDraft(formattedPosition);
                setPositionEditing(true);
                selectWholeValue(event.currentTarget);
              }}
              onChange={(event) => setPositionDraft(event.currentTarget.value)}
              onBlur={commitPositionDraft}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.blur();
                } else if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  setPositionDraft(formattedPosition);
                  setPositionEditing(false);
                }
              }}
            />
            <small id="split-position-unit">{unit}</small>
          </span>
        </span>
        <input
          type="range"
          min={displayMin}
          max={displayMax}
          step={displayStep}
          value={displayPosition}
          aria-label={t("split.positionSliderAria")}
          aria-valuetext={t("split.positionValue", { value: formattedPosition, unit })}
          disabled={busy}
          onChange={(event) => applyDisplayPosition(event.currentTarget.valueAsNumber)}
        />
      </div>

      <p className="split-panel-help">{t("split.help")}</p>
      {error ? <div className="split-panel-error" role="alert">{error}</div> : null}

      <div className="split-panel-footer">
        <button type="button" className="secondary" disabled={busy} onClick={onCancel}>{t("common.cancel")}</button>
        <button type="button" className="primary" disabled={busy || max - min <= 0.0001} onClick={onApply}>
          {busy ? <LoaderCircle className="split-panel-spinner" size={17} /> : <Check size={17} />}
          {busy ? t("split.applying") : t("split.apply")}
        </button>
      </div>
    </aside>
  );
}
