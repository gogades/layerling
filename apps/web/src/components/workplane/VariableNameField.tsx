"use client";

import { useState } from "react";
import { isVariableName } from "@/lib/designVariables";
import { t } from "@/lib/i18n";

/**
 * The advanced mode's name for a body, so formulas can read its fields as `$name.size.width`. Letters, digits and `_`,
 * unique in the design in any case, never `self`. Taken on Enter or when the field is left; empty takes the name away.
 */
export function VariableNameField({ value, disabled, isTaken, onCommit }: {
  value: string | undefined;
  disabled?: boolean;
  isTaken: (name: string) => boolean;
  onCommit: (name: string | undefined) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const name = draft.trim();
    if (name && !isVariableName(name)) return setError(t("formula.nameInvalid"));
    if (name && name.toLowerCase() !== value?.toLowerCase() && isTaken(name)) return setError(t("formula.nameTaken", { name }));
    setDraft(null);
    setError(null);
    if (name !== (value ?? "")) onCommit(name || undefined);
  };

  return (
    <label className="variable-name-field" data-invalid={error ? "true" : undefined}>
      <span>{t("formula.variableName")}</span>
      <input
        type="text"
        value={draft ?? value ?? ""}
        disabled={disabled}
        maxLength={32}
        spellCheck={false}
        autoComplete="off"
        placeholder={t("formula.variableNamePlaceholder")}
        onChange={(event) => {
          // A space never belongs in a name, so it is not even typed.
          setDraft(event.currentTarget.value.replace(/\s/g, ""));
          setError(null);
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          else if (event.key === "Escape") {
            setDraft(null);
            setError(null);
          }
        }}
      />
      {error ? <small role="alert">{error}</small> : value ? <small>{`$${value}.size.width, $${value}.position.x, …`}</small> : null}
    </label>
  );
}
