"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { displayStepFromMillimeters, displayToMillimeters, formatMeasurementNumber, lengthDisplayUnit, millimetersToDisplay, parseMeasurementInput } from "@/lib/measurementUnits";
import { SPLIT_AXIS_DISPLAY_ORDER, splitAxisLabel, splitRotationAxes, type SplitRotation } from "@/lib/modelSplit";
import { GuideHelpLink } from "@/components/GuideHelpLink";
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
  rotation: SplitRotation;
  position: number;
  min: number;
  max: number;
  targetCount: number;
  workspace: WorkplaneWorkspaceSettings;
  busy: boolean;
  error: string | null;
  onAxisChange: (axis: AlignAxis) => void;
  onRotationChange: (index: 0 | 1, rotation: number) => void;
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
  const rotationAxes = splitRotationAxes(axis);
  const [positionEditing, setPositionEditing] = useState(false);
  const [positionDraft, setPositionDraft] = useState(formattedPosition);
  const applyDisplayPosition = (value: number) => {
    if (Number.isFinite(value)) onPositionChange(displayToMillimeters(value, workspace));
  };
  useEffect(() => {
    if (!positionEditing) setPositionDraft(formattedPosition);
  }, [formattedPosition, positionEditing]);
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

  return (
    <aside className="split-panel" ref={panelRef} tabIndex={-1} aria-labelledby="split-panel-title">
      <div className="split-panel-header">
        <div>
          <strong id="split-panel-title">{t("split.title")}</strong>
          <span>{t("split.subtitle")}</span>
        </div>
        <div className="panel-header-actions">
          <GuideHelpLink section="splitting" />
          <button type="button" aria-label={t("split.cancelAria")} onClick={onCancel}><X size={20} /></button>
        </div>
      </div>

      <div className="split-panel-target">
        <strong>{targetCount === 1 ? t("split.targetOne") : t("split.targetMany", { count: targetCount })}</strong>
        <span>{t("split.targetHint")}</span>
      </div>

      <fieldset className="split-axis-control" disabled={busy}>
        <legend>{t("split.orientation")}</legend>
        <div>
          {SPLIT_AXIS_DISPLAY_ORDER.map((candidate) => (
            <button
              type="button"
              className={axis === candidate ? "active" : ""}
              aria-pressed={axis === candidate}
              key={candidate}
              onClick={() => onAxisChange(candidate)}
            >
              {splitAxisLabel(candidate)}
            </button>
          ))}
        </div>
      </fieldset>

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

      {rotationAxes.map((rotationAxis, index) => (
        <SplitRotationControl
          key={rotationAxis}
          axisLabel={splitAxisLabel(rotationAxis)}
          rotation={rotation[index]}
          busy={busy}
          onChange={(value) => onRotationChange(index as 0 | 1, value)}
        />
      ))}

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

function SplitRotationControl({
  axisLabel,
  rotation,
  busy,
  onChange,
}: {
  axisLabel: "X" | "Y" | "Z";
  rotation: number;
  busy: boolean;
  onChange: (rotation: number) => void;
}) {
  const formatted = String(Number(rotation.toFixed(2)));
  const unitId = `split-rotation-${axisLabel.toLowerCase()}-unit`;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(formatted);
  useEffect(() => {
    if (!editing) setDraft(formatted);
  }, [formatted, editing]);
  const commitDraft = () => {
    const value = parseMeasurementInput(draft);
    if (Number.isFinite(value)) onChange(value);
    setEditing(false);
  };

  return (
    <div className="split-position-control split-rotation-control">
      <span>
        <strong>{t("split.rotation", { axis: axisLabel })}</strong>
        <span className="split-position-value">
          <input
            type="text"
            inputMode="decimal"
            value={editing ? draft : formatted}
            aria-label={t("split.rotationAria", { axis: axisLabel })}
            aria-describedby={unitId}
            disabled={busy}
            onFocus={(event) => {
              setDraft(formatted);
              setEditing(true);
              selectWholeValue(event.currentTarget);
            }}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.blur();
              } else if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                setDraft(formatted);
                setEditing(false);
              }
            }}
          />
          <small id={unitId}>{t("split.degrees")}</small>
        </span>
      </span>
      <input
        type="range"
        min={-180}
        max={180}
        step={1}
        value={rotation}
        aria-label={t("split.rotationSliderAria", { axis: axisLabel })}
        aria-valuetext={t("split.rotationValue", { value: formatted, axis: axisLabel })}
        disabled={busy}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
    </div>
  );
}
