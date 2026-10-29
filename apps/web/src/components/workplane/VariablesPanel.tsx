"use client";

import { useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { GuideHelpLink } from "@/components/GuideHelpLink";
import { FormulaEditor } from "@/components/workplane/FormulaEditor";
import { MovableToolPanel } from "@/components/workplane/MovableToolPanel";
import type { DesignFormulas } from "@/components/workplane/designFormulasContext";
import { formulaErrorText, variableKey } from "@/components/workplane/evaluateDesign";
import { isVariableName, type DesignVariable } from "@/lib/designVariables";
import { MAX_FIELD_FORMULA_LENGTH } from "@/lib/fieldFormulas";
import { evaluateFormula } from "@/lib/formula";
import { t } from "@/lib/i18n";
import { displayShapeName } from "@/lib/shapeCatalog";
import { useLanguage } from "@/lib/useLanguage";
import { useAdvancedMode } from "@/lib/useSimpleMode";
import type { WorkplaneShape } from "@/types/layerling";

// Open or closed, for the ribbon button and Ctrl+Shift+V alike; a page-wide switch like the panel's own position.
const listeners = new Set<() => void>();
let panelOpen = false;

export function toggleVariablesPanel() {
  panelOpen = !panelOpen;
  listeners.forEach((listener) => listener());
}

export function useVariablesPanelOpen() {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, () => panelOpen, () => false);
}

/** Whether text is a formula the table can keep: it reads (names may still be unknown) and is not too long. */
function readableFormula(text: string) {
  const result = evaluateFormula(text, () => 1);
  return text.length <= MAX_FIELD_FORMULA_LENGTH && (result.ok || result.error.kind !== "syntax");
}

const leaveOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key === "Enter") event.currentTarget.blur();
};

/**
 * The advanced mode's variables table: a name, a value or formula, its result and a short description per row, and below
 * it the bodies that have a variable name. Every committed cell is one step of the history (the editor's onChange); a
 * renamed row takes the formulas that use it along. A formula cell's fx button opens the formula editor, as a field's does.
 * See the design doc "Advanced mode and variables".
 */
export function VariablesPanel({ rows, shapes, formulas, onChange }: {
  rows: DesignVariable[];
  shapes: WorkplaneShape[];
  /** The editor's formulas: what failed, and the formula editor's live result and suggestions. */
  formulas: DesignFormulas;
  onChange: (rows: DesignVariable[], rename?: { from: string; to: string }) => void;
}) {
  useLanguage();
  const open = useVariablesPanelOpen();
  const advanced = useAdvancedMode();
  const [problem, setProblem] = useState<string | null>(null);
  // The row whose formula the formula editor has open, by name (a row deleted above it does not move it), and its cell.
  const [editing, setEditing] = useState<{ name: string; anchor: HTMLElement } | null>(null);
  if (!open || !advanced) return null;
  const { errors } = formulas;

  const taken = (name: string, except: number) => rows.some((row, index) => index !== except && row.name.toLowerCase() === name.toLowerCase())
    || shapes.some((shape) => shape.variableName?.toLowerCase() === name.toLowerCase());
  const replace = (index: number, row: DesignVariable, rename?: { from: string; to: string }) => {
    setProblem(null);
    onChange(rows.map((current, at) => (at === index ? row : current)), rename);
  };
  const commitName = (index: number, input: HTMLInputElement) => {
    const row = rows[index];
    const name = input.value.trim();
    if (name === row.name) return;
    const reason = !isVariableName(name) ? t("formula.nameInvalid") : taken(name, index) ? t("formula.nameTaken", { name }) : null;
    if (reason) {
      input.value = row.name;
      return setProblem(reason);
    }
    replace(index, { ...row, name }, { from: row.name, to: name });
  };
  /** Takes a row's new formula, or says why not and returns false. */
  const setFormula = (index: number, formula: string) => {
    if (formula === rows[index].formula) return true;
    if (!readableFormula(formula)) {
      setProblem(t("variables.formulaInvalid"));
      return false;
    }
    replace(index, { ...rows[index], formula });
    return true;
  };
  const commitFormula = (index: number, input: HTMLInputElement) => {
    if (!setFormula(index, input.value.trim())) input.value = rows[index].formula;
  };
  const editingIndex = editing ? rows.findIndex((row) => row.name === editing.name) : -1;
  const commitDescription = (index: number, input: HTMLInputElement) => {
    const description = input.value.trim().slice(0, 200);
    if (description !== (rows[index].description ?? "")) replace(index, { ...rows[index], description: description || undefined });
  };
  const addRow = () => {
    let number = rows.length + 1;
    while (taken(`var${number}`, -1)) number += 1;
    setProblem(null);
    onChange([...rows, { name: `var${number}`, formula: "0", value: 0 }]);
  };
  const named = shapes.filter((shape) => shape.variableName);

  return (
    <MovableToolPanel className="edge-modifier-panel variables-panel" ariaLabel={t("variables.title")}>
      {(handleProps) => (<>
        <div className="edge-modifier-header movable" title={t("panel.moveHint")} {...handleProps}>
          <div>
            <strong>{t("variables.title")}</strong>
            <span>{t("variables.subtitle")}</span>
          </div>
          <div className="panel-header-actions">
            <GuideHelpLink chapter="advanced" />
            <button type="button" aria-label={t("variables.close")} onClick={toggleVariablesPanel}><X size={20} /></button>
          </div>
        </div>
        <div className="variables-body">
        <table className="variables-table">
          <thead>
            <tr>
              <th>{t("variables.name")}</th>
              <th>{t("variables.formula")}</th>
              <th>{t("variables.result")}</th>
              <th>{t("variables.description")}</th>
              <th aria-label={t("variables.delete")} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const error = errors.get(variableKey(row.name));
              // Keyed by what is stored, so a cell shows the stored text again after undo or a refused change.
              return (
                <tr key={`${index}:${row.name}`}>
                  <td><input key={row.name} defaultValue={row.name} spellCheck={false} aria-label={t("variables.name")} onBlur={(event) => commitName(index, event.currentTarget)} onKeyDown={leaveOnEnter} /></td>
                  <td>
                    <div className="variables-formula-cell">
                      <input key={row.formula} defaultValue={row.formula} spellCheck={false} aria-label={t("variables.formula")} onBlur={(event) => commitFormula(index, event.currentTarget)} onKeyDown={leaveOnEnter} />
                      <button type="button" className="formula-open" aria-label={t("formula.open")} title={t("formula.open")} onClick={(event) => setEditing({ name: row.name, anchor: event.currentTarget.parentElement as HTMLElement })}>fx</button>
                    </div>
                  </td>
                  <td className={error ? "variables-result error" : "variables-result"} title={error ? formulaErrorText(error) : undefined}>
                    {error ? "!" : Number(row.value.toFixed(4))}
                  </td>
                  <td><input key={row.description ?? ""} defaultValue={row.description ?? ""} aria-label={t("variables.description")} onBlur={(event) => commitDescription(index, event.currentTarget)} onKeyDown={leaveOnEnter} /></td>
                  <td>
                    <button type="button" aria-label={t("variables.delete")} title={t("variables.delete")} onClick={() => onChange(rows.filter((_, at) => at !== index))}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {problem ? <p className="variables-problem" role="alert">{problem}</p> : null}
        <button type="button" className="variables-add" onClick={addRow}><Plus size={16} />{t("variables.add")}</button>
        <div className="variables-objects">
          <strong>{t("variables.objects")}</strong>
          {named.length
            ? named.map((shape) => <span key={shape.id}><code>{`$${shape.variableName}`}</code> {displayShapeName(shape)}</span>)
            : <span>{t("variables.noObjects")}</span>}
        </div>
        </div>
        {editing && editingIndex >= 0 ? (
          <FormulaEditor
            anchor={editing.anchor}
            title={t("formula.editorTitle", { field: `$${rows[editingIndex].name}` })}
            unit={null}
            initial={rows[editingIndex].formula}
            // A row is no body: "" leaves `$self` out of the suggestions and unknown to the result.
            preview={(text) => formulas.preview(text, "")}
            suggest={(before) => formulas.suggest(before, "")}
            onApply={(formula) => {
              if (setFormula(editingIndex, formula)) setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </>)}
    </MovableToolPanel>
  );
}
