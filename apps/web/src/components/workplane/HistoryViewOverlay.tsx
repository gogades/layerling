"use client";

import { ChevronLeft, ChevronRight, Download, FilePlus2, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import { GuideHelpLink } from "@/components/GuideHelpLink";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";

/**
 * Wann ein Stand entstanden ist, in der Sprache der Oberflaeche. Staende aus
 * Projekten von vor dieser Angabe haben keine Zeit; dann steht hier nichts.
 */
export function formatHistoryStateTime(at: number | undefined, language: string) {
  if (typeof at !== "number" || !Number.isFinite(at)) return null;
  try {
    return new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(at));
  } catch {
    return new Date(at).toLocaleString();
  }
}

/**
 * Der Zusatz, den ein Projekt oder eine Datei aus einem frueheren Stand im
 * Namen traegt: die Zeit des Standes, lesbar und ohne Zeichen, die ein
 * Dateiname nicht mag. Ohne Zeit gibt es keinen Zusatz - dann heisst die
 * Kopie wie jede andere Kopie.
 */
export function historyStateNameSuffix(at: number | undefined) {
  if (typeof at !== "number" || !Number.isFinite(at)) return null;
  const date = new Date(at);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}.${pad(date.getMinutes())}`;
}

/**
 * Die Leiste des Verlaufsblicks. Sie liegt unten ueber der Arbeitsflaeche, die
 * derweil den gewaehlten Stand zeigt; der Schieber geht durch alle Staende, die
 * Rueckgaengig und Wiederherstellen erreichen. Nichts hier aendert das Projekt:
 * Was man mitnehmen will, wird ein neues Projekt oder ein Export.
 */
export function HistoryViewOverlay({
  index,
  count,
  liveIndex,
  recordedAt,
  objectCount,
  creating,
  canCreateProject,
  onIndexChange,
  onExport,
  onCreateProject,
  onClose,
}: {
  /** Der gezeigte Stand, 0 ist der aelteste. */
  index: number;
  count: number;
  /** Der Stand, an dem das Projekt wirklich steht. */
  liveIndex: number;
  recordedAt?: number;
  objectCount: number;
  creating: boolean;
  canCreateProject: boolean;
  onIndexChange: (index: number) => void;
  onExport: () => void;
  onCreateProject: () => void;
  onClose: () => void;
}) {
  const language = useLanguage();
  const sliderRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    sliderRef.current?.focus({ preventScroll: true });
  }, []);
  const max = Math.max(0, count - 1);
  const position = max > 0 ? `${(index / max) * 100}%` : "100%";
  const time = formatHistoryStateTime(recordedAt, language);
  const distance = index - liveIndex;
  const relation = distance === 0
    ? t("historyView.atCurrent")
    : distance < 0
      ? (distance === -1 ? t("historyView.stepsBackOne") : t("historyView.stepsBackMany", { count: -distance }))
      : (distance === 1 ? t("historyView.stepsAheadOne") : t("historyView.stepsAheadMany", { count: distance }));

  return (
    <aside className="history-view-bar" role="region" aria-label={t("historyView.title")} data-testid="history-view">
      <div className="history-view-head">
        <div className="history-view-heading">
          <strong>{t("historyView.title")}</strong>
          <span>{t("historyView.subtitle")}</span>
        </div>
        <div className="panel-header-actions">
          <GuideHelpLink section="historyView" />
          <button type="button" aria-label={t("historyView.close")} title={t("historyView.close")} onClick={onClose}><X size={20} /></button>
        </div>
      </div>

      <div className="history-view-slider">
        <button type="button" aria-label={t("historyView.earlier")} title={t("historyView.earlier")} disabled={index <= 0} onClick={() => onIndexChange(index - 1)}>
          <ChevronLeft size={18} />
        </button>
        <div className="range-control" style={{ "--slider-pos": position } as CSSProperties}>
          <input
            ref={sliderRef}
            type="range"
            min={0}
            max={max}
            step={1}
            value={index}
            aria-label={t("historyView.slider")}
            aria-valuetext={t("historyView.position", { index: index + 1, count })}
            onChange={(event) => onIndexChange(Number(event.currentTarget.value))}
          />
        </div>
        <button type="button" aria-label={t("historyView.later")} title={t("historyView.later")} disabled={index >= max} onClick={() => onIndexChange(index + 1)}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="history-view-state">
        <strong>{t("historyView.position", { index: index + 1, count })}</strong>
        <span className="history-view-facts">
          {time ? <span>{time}</span> : null}
          <span>{objectCount === 1 ? t("historyView.objectsOne") : t("historyView.objectsMany", { count: objectCount })}</span>
          <span className={distance === 0 ? "current" : ""}>{relation}</span>
        </span>
      </div>

      <div className="history-view-actions">
        <button type="button" className="secondary" onClick={onExport}>
          <Download size={16} aria-hidden="true" />
          {t("historyView.export")}
        </button>
        <button type="button" className="primary" disabled={creating || !canCreateProject} title={canCreateProject ? undefined : t("status.historyProjectUnavailable")} onClick={onCreateProject}>
          {creating ? <LoaderCircle size={16} className="history-view-spinner" aria-hidden="true" /> : <FilePlus2 size={16} aria-hidden="true" />}
          {t("historyView.createProject")}
        </button>
      </div>
    </aside>
  );
}
