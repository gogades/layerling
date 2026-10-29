"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { formulaErrorText, type FormulaSuggestion } from "@/components/workplane/evaluateDesign";
import { MAX_FIELD_FORMULA_LENGTH } from "@/lib/fieldFormulas";
import { evaluateFormula, type FormulaResult } from "@/lib/formula";
import { t } from "@/lib/i18n";

const WIDTH = 380;

/**
 * The advanced mode's formula editor, opened from a field's fx button: room to write, the result worked out as it is
 * typed (or why not), and after `$` or `$name.` the names that can follow. Enter applies (or takes the marked
 * suggestion), Shift+Enter starts a new line, Esc cancels. A formula is kept on one line; the new lines are for writing.
 * Its title bar moves it, inside the window; it opens by its field again each time.
 */
export function FormulaEditor({ anchor, title, unit, initial, preview, suggest, onApply, onCancel }: {
  /** The field it belongs to: the editor opens below it, kept inside the window. */
  anchor: HTMLElement;
  title: string;
  unit: string | null;
  initial: string;
  preview: (text: string) => FormulaResult;
  suggest: (before: string) => { start: number; items: FormulaSuggestion[] } | null;
  onApply: (formula: string) => void;
  onCancel: () => void;
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(initial);
  const [caret, setCaret] = useState(initial.length);
  const [marked, setMarked] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragFrom = useRef<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const field = textRef.current;
    field?.focus();
    field?.setSelectionRange(initial.length, initial.length);
  }, [initial]);

  // Opened below its field, right-aligned with it; then wherever its title bar was dragged, its title kept in the window.
  const rect = anchor.getBoundingClientRect();
  const openLeft = Math.max(8, Math.min(rect.right - WIDTH, window.innerWidth - WIDTH - 8));
  const openTop = Math.min(rect.bottom + 6, window.innerHeight - 260);
  const left = Math.max(0, Math.min(openLeft + offset.x, window.innerWidth - WIDTH));
  const top = Math.max(0, Math.min(openTop + offset.y, window.innerHeight - 40));
  const formula = text.replace(/\s*\n\s*/g, " ").trim();
  const result = formula ? preview(formula) : null;
  const syntax = evaluateFormula(formula, () => 1);
  const applicable = formula.length > 0 && formula.length <= MAX_FIELD_FORMULA_LENGTH && (syntax.ok || syntax.error.kind !== "syntax");
  const suggestions = dismissed ? null : suggest(text.slice(0, caret));
  const items = suggestions?.items ?? [];
  const markedIndex = Math.min(marked, Math.max(0, items.length - 1));
  // The list scrolls; the entry the arrow keys mark is kept in view.
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    listRef.current?.children[markedIndex]?.scrollIntoView({ block: "nearest" });
  }, [markedIndex, items.length]);

  const update = (next: string, at: number) => {
    setText(next);
    setCaret(at);
    setMarked(0);
    setDismissed(false);
  };
  const take = (item: FormulaSuggestion) => {
    if (!suggestions) return;
    const next = `${text.slice(0, suggestions.start)}${item.insert}${text.slice(caret)}`;
    const at = suggestions.start + item.insert.length;
    update(next, at);
    requestAnimationFrame(() => textRef.current?.setSelectionRange(at, at));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (items.length && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      setMarked((markedIndex + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length);
    } else if (items.length && (event.key === "Tab" || (event.key === "Enter" && !event.shiftKey))) {
      event.preventDefault();
      take(items[markedIndex]);
    } else if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (applicable) onApply(formula);
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (items.length) setDismissed(true);
      else onCancel();
    }
  };

  return createPortal(
    <div className="formula-editor" role="dialog" aria-label={title} style={{ left, top, width: WIDTH }} onPointerDown={(event) => event.stopPropagation()}>
      <div
        className="formula-editor-title"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          dragFrom.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const from = dragFrom.current;
          if (from) setOffset({ x: event.clientX - from.x, y: event.clientY - from.y });
        }}
        onPointerUp={() => {
          dragFrom.current = null;
          // The press on the title bar took the focus; typing goes on in the text box.
          textRef.current?.focus();
        }}
        // A drag the browser takes away (a gesture, a system popup) ends here, or the window would follow the mouse.
        onPointerCancel={() => {
          dragFrom.current = null;
        }}
      >
        <strong>{title}</strong>
        <button type="button" aria-label={t("common.cancel")} onClick={onCancel}><X size={16} /></button>
      </div>
      <textarea
        ref={textRef}
        value={text}
        rows={3}
        spellCheck={false}
        onChange={(event) => update(event.currentTarget.value, event.currentTarget.selectionStart)}
        onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
        onKeyDown={onKeyDown}
      />
      {items.length ? (
        <ul ref={listRef} className="formula-editor-suggestions" role="listbox">
          {items.map((item, index) => (
            <li key={item.insert} role="option" aria-selected={index === markedIndex}>
              {/* Taken on the press, before the text box loses its focus. */}
              <button type="button" onPointerDown={(event) => { event.preventDefault(); take(item); }}>
                <code>{item.label}</code>
                <span>{item.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p className={result && !result.ok ? "formula-editor-result error" : "formula-editor-result"}>
        {!result ? t("formula.editorHint") : result.ok ? `= ${Number(result.value.toFixed(4))}${unit ? ` ${unit}` : ""}` : formulaErrorText(result.error)}
      </p>
      <div className="formula-editor-actions">
        <button type="button" className="secondary" onClick={onCancel}>{t("common.cancel")}</button>
        <button type="button" className="primary" disabled={!applicable} onClick={() => onApply(formula)}><Check size={15} />{t("formula.apply")}</button>
      </div>
    </div>,
    document.body,
  );
}
