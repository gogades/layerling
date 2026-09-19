"use client";

import { X } from "lucide-react";
import { Fragment, useEffect, useRef } from "react";
import { t, type MessageKey } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";

/**
 * One shortcut: the keys stay literal in both languages, only the sentence
 * beside them is translated. `combos` holds the alternatives - "F or Home" -
 * and a combo spells its keys with "+", the way the toolbar hints already do.
 * A slash inside one key means "any of these", as with the arrow keys.
 */
type Shortcut = { combos: string[]; label: MessageKey };
/**
 * Sketch mode replaces the whole workspace, so its keys and the ones for solid
 * bodies never apply at the same time. Each group says where it belongs and the
 * dialog only lists what the current mode actually listens for.
 */
type ShortcutGroup = { title: MessageKey; mode: "geometry" | "sketch"; shortcuts: Shortcut[] };

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "shortcuts.group.selection",
    mode: "geometry",
    shortcuts: [
      { combos: ["Esc"], label: "shortcuts.clearSelection" },
      { combos: ["Delete", "Backspace"], label: "shortcuts.delete" },
      { combos: ["Ctrl+A"], label: "shortcuts.selectAll" },
    ],
  },
  {
    title: "shortcuts.group.clipboard",
    mode: "geometry",
    shortcuts: [
      { combos: ["Ctrl+C"], label: "shortcuts.copy" },
      { combos: ["Ctrl+X"], label: "shortcuts.cut" },
      { combos: ["Ctrl+V"], label: "shortcuts.paste" },
      { combos: ["Ctrl+D"], label: "shortcuts.duplicate" },
    ],
  },
  {
    title: "shortcuts.group.history",
    mode: "geometry",
    shortcuts: [
      { combos: ["Ctrl+Z"], label: "shortcuts.undo" },
      { combos: ["Ctrl+Shift+Z", "Ctrl+Y"], label: "shortcuts.redo" },
    ],
  },
  {
    title: "shortcuts.group.organise",
    mode: "geometry",
    shortcuts: [
      { combos: ["Ctrl+G"], label: "shortcuts.group" },
      { combos: ["Ctrl+Shift+G"], label: "shortcuts.ungroup" },
      { combos: ["Ctrl+L"], label: "shortcuts.lock" },
      { combos: ["Ctrl+H"], label: "shortcuts.hide" },
      { combos: ["Ctrl+Shift+H"], label: "shortcuts.showHidden" },
    ],
  },
  {
    title: "shortcuts.group.shape",
    mode: "geometry",
    shortcuts: [
      { combos: ["H"], label: "shortcuts.hole" },
      { combos: ["S"], label: "shortcuts.solid" },
      { combos: ["M"], label: "shortcuts.mirror" },
      { combos: ["D"], label: "shortcuts.dropToWorkplane" },
    ],
  },
  {
    title: "shortcuts.group.transform",
    mode: "geometry",
    shortcuts: [
      { combos: ["← / → / ↑ / ↓"], label: "shortcuts.nudge" },
      { combos: ["Shift+← / → / ↑ / ↓"], label: "shortcuts.nudgeCoarse" },
      { combos: ["Ctrl+↑ / ↓"], label: "shortcuts.raise" },
      { combos: ["R"], label: "shortcuts.rotate" },
      { combos: ["Shift+R"], label: "shortcuts.rotateFine" },
    ],
  },
  {
    title: "shortcuts.group.view",
    mode: "geometry",
    shortcuts: [
      { combos: ["1 – 6"], label: "shortcuts.views" },
      { combos: ["F", "Home"], label: "shortcuts.resetView" },
      { combos: ["Shift+F"], label: "shortcuts.focusSelection" },
      { combos: ["O"], label: "shortcuts.projection" },
      { combos: ["+", "−"], label: "shortcuts.zoom" },
      { combos: ["W"], label: "shortcuts.placeWorkplane" },
      { combos: ["Shift+W"], label: "shortcuts.placeWorkplaneOnSelection" },
      { combos: ["Shift"], label: "shortcuts.reverseWorkplane" },
      { combos: ["Esc"], label: "shortcuts.leaveMode" },
    ],
  },
  {
    title: "shortcuts.group.sketch",
    mode: "sketch",
    shortcuts: [
      { combos: ["Esc"], label: "shortcuts.sketchEscape" },
      { combos: ["Delete", "Backspace"], label: "shortcuts.sketchDelete" },
      { combos: ["Ctrl+Z"], label: "shortcuts.undo" },
      { combos: ["Ctrl+Shift+Z", "Ctrl+Y"], label: "shortcuts.redo" },
      { combos: ["R"], label: "shortcuts.sketchRotate" },
      { combos: ["L"], label: "shortcuts.sketchLockImage" },
    ],
  },
  {
    title: "shortcuts.group.edgeModifier",
    mode: "geometry",
    shortcuts: [
      { combos: ["Enter"], label: "shortcuts.edgeApply" },
      { combos: ["Esc"], label: "shortcuts.edgeCancel" },
    ],
  },
];

/** Splits a combo into its keys - and leaves the "+" of the zoom key alone. */
function comboKeys(combo: string) {
  const parts = combo.split("+").map((part) => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [combo];
}

function ShortcutKeys({ combos }: { combos: string[] }) {
  return (
    <>
      {combos.map((combo, comboIndex) => (
        <Fragment key={combo}>
          {comboIndex > 0 ? <span className="shortcuts-or">{t("shortcuts.or")}</span> : null}
          <span className="shortcuts-combo">
            {comboKeys(combo).map((key, keyIndex) => (
              <Fragment key={key}>
                {keyIndex > 0 ? <span className="shortcuts-plus" aria-hidden="true">+</span> : null}
                <kbd>{key}</kbd>
              </Fragment>
            ))}
          </span>
        </Fragment>
      ))}
    </>
  );
}

export function ShortcutsModal({ sketchMode, onClose }: { sketchMode: boolean; onClose: () => void }) {
  useLanguage();
  const groups = SHORTCUT_GROUPS.filter((group) => (group.mode === "sketch") === sketchMode);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  return (
    <div
      className="workspace-modal shortcuts-modal"
      data-compact={groups.length <= 2 ? "true" : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={t("shortcuts.title")}
      // The editor and the viewport both listen for keys on the window. While
      // this dialog is open every key it sees stops here, so reading about a
      // shortcut never triggers it.
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="workspace-modal-card shortcuts-modal-card" ref={cardRef} tabIndex={-1} onPointerDown={(event) => event.stopPropagation()}>
        <header className="workspace-modal-header">
          <strong>{t("shortcuts.title")}</strong>
          <button aria-label={t("shortcuts.close")} onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="workspace-modal-content">
          <div className="workspace-modal-body shortcuts-modal-body">
            <p className="shortcuts-intro">{t("shortcuts.intro")}</p>
            <div className="shortcuts-groups">
              {groups.map((group) => (
                <section className="shortcuts-group" key={group.title}>
                  <h3>{t(group.title)}</h3>
                  <dl>
                    {group.shortcuts.map((shortcut) => (
                      <div className="shortcuts-row" key={`${group.title}:${shortcut.label}`}>
                        <dt>{t(shortcut.label)}</dt>
                        <dd>
                          <ShortcutKeys combos={shortcut.combos} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
          <div className="workspace-modal-footer">
            <span>{t("shortcuts.footer")}</span>
          </div>
        </div>
      </div>
      <button className="workspace-modal-backdrop" aria-label={t("shortcuts.close")} onClick={onClose} />
    </div>
  );
}
