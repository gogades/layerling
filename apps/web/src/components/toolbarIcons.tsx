import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * The Layerling toolbar set. Every mark is drawn from the same parts: a 2.6
 * outline in `currentColor` so a tool takes the colour of the group it sits in,
 * and a faint fill of the same colour where a shape needs body. The PNG set this
 * replaced could only ever be grey.
 */
function ToolbarVectorIcon({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={["toolbar-vector-art-icon", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </svg>
  );
}

const SOLID = { fill: "currentColor", opacity: 0.14, stroke: "none" } as const;

export function ToolbarHomeIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M9 22 24 10l15 12v15a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2Z" {...SOLID} />
      <path d="M9 22 24 10l15 12v15a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2Z" />
      <path d="M20 39V28h8v11" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarCopyIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <rect x="17" y="8" width="21" height="26" rx="3" {...SOLID} />
      <rect x="17" y="8" width="21" height="26" rx="3" />
      <path d="M31 40H13a3 3 0 0 1-3-3V16" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarPasteIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M14 11h20a2 2 0 0 1 2 2v25a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2Z" {...SOLID} />
      <path d="M14 11h20a2 2 0 0 1 2 2v25a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2Z" />
      <path d="M19 11V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2Z" />
      <path d="M19 24h10M19 31h10" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarDuplicateIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <rect x="8" y="8" width="20" height="20" rx="3" />
      <rect x="20" y="20" width="20" height="20" rx="3" {...SOLID} />
      <rect x="20" y="20" width="20" height="20" rx="3" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarTrashIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M12 15h24l-2 23a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3Z" {...SOLID} />
      <path d="M12 15h24l-2 23a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3Z" />
      <path d="M19 15v-4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4M21 23v11M27 23v11" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarUndoIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M13 21h17a9 9 0 0 1 0 18h-9" />
      <path d="M19 14l-7 7 7 7" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarRedoIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M35 21H18a9 9 0 0 0 0 18h9" />
      <path d="M29 14l7 7-7 7" />
    </ToolbarVectorIcon>
  );
}

/**
 * Die Notiz: ein Zettel mit umgeschlagener Ecke und zwei Zeilen darauf. Die
 * Ecke ist das, was ihn von jedem anderen Rechteck im Satz unterscheidet.
 */
export function ToolbarNoteIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M11 10h17l9 9v19a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3Z" {...SOLID} />
      <path d="M11 10h17l9 9v19a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3Z" />
      <path d="M28 10v9h9" />
      <path d="M15 27h15M15 33h10" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarImportIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M10 29v7a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3v-7" {...SOLID} />
      <path d="M10 29v7a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3v-7" />
      <path d="M24 8v20M17 21l7 7 7-7" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarVectorExportIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M10 29v7a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3v-7" {...SOLID} />
      <path d="M10 29v7a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3v-7" />
      <path d="M24 28V8M17 15l7-7 7 7" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarExportIcon(props: IconProps) {
  return <ToolbarVectorExportIcon {...props} />;
}

/**
 * A cog with eight short, wide teeth on a solid body. The first draft put thin
 * rays around a circle, which reads as a sun rather than a setting.
 */
const GEAR_BODY = "M20.67 5.09 A19.2 19.2 0 0 1 27.33 5.09 L26.54 9.62 A14.6 14.6 0 0 1 32.37 12.04 L35.01 8.27 A19.2 19.2 0 0 1 39.73 12.99 L35.96 15.63 A14.6 14.6 0 0 1 38.38 21.46 L42.91 20.67 A19.2 19.2 0 0 1 42.91 27.33 L38.38 26.54 A14.6 14.6 0 0 1 35.96 32.37 L39.73 35.01 A19.2 19.2 0 0 1 35.01 39.73 L32.37 35.96 A14.6 14.6 0 0 1 26.54 38.38 L27.33 42.91 A19.2 19.2 0 0 1 20.67 42.91 L21.46 38.38 A14.6 14.6 0 0 1 15.63 35.96 L12.99 39.73 A19.2 19.2 0 0 1 8.27 35.01 L12.04 32.37 A14.6 14.6 0 0 1 9.62 26.54 L5.09 27.33 A19.2 19.2 0 0 1 5.09 20.67 L9.62 21.46 A14.6 14.6 0 0 1 12.04 15.63 L8.27 12.99 A19.2 19.2 0 0 1 12.99 8.27 L15.63 12.04 A14.6 14.6 0 0 1 21.46 9.62 L20.67 5.09 Z";

export function ToolbarSettingsIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d={GEAR_BODY} {...SOLID} />
      <path d={GEAR_BODY} strokeLinejoin="round" />
      <circle cx="24" cy="24" r="5.4" />
    </ToolbarVectorIcon>
  );
}

/** A key cap row and a space bar - the same 2.6 outline as the rest of the set. */
export function ToolbarKeyboardIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <rect x="5" y="12" width="38" height="24" rx="4" {...SOLID} />
      <rect x="5" y="12" width="38" height="24" rx="4" />
      <path d="M12 19h2M20 19h2M28 19h2M36 19h2M12 25h2M20 25h2M28 25h2M36 25h2M17 31h14" />
    </ToolbarVectorIcon>
  );
}

/** An open book: the short manual, drawn in the same 2.6 outline as the rest. */
export function ToolbarGuideIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M24 15c-3-2.4-7-3.6-11-3.6H7v22h6c4 0 8 1.2 11 3.6 3-2.4 7-3.6 11-3.6h6v-22h-6c-4 0-8 1.2-11 3.6Z" {...SOLID} />
      <path d="M24 15c-3-2.4-7-3.6-11-3.6H7v22h6c4 0 8 1.2 11 3.6 3-2.4 7-3.6 11-3.6h6v-22h-6c-4 0-8 1.2-11 3.6Z" />
      <path d="M24 15v21.4" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarGroupIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <rect x="7" y="7" width="34" height="34" rx="4" strokeDasharray="5 4" />
      <rect x="13" y="13" width="10" height="10" rx="2" {...SOLID} />
      <rect x="13" y="13" width="10" height="10" rx="2" />
      <rect x="25" y="25" width="10" height="10" rx="2" {...SOLID} />
      <rect x="25" y="25" width="10" height="10" rx="2" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarUngroupIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <rect x="6" y="6" width="17" height="17" rx="3" {...SOLID} />
      <rect x="6" y="6" width="17" height="17" rx="3" />
      <rect x="25" y="25" width="17" height="17" rx="3" />
      <path d="M28 12h12M34 6v12" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarMirrorIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M24 6v36" strokeDasharray="5 4" />
      <path d="M19 13 8 24l11 11Z" {...SOLID} />
      <path d="M19 13 8 24l11 11Z" />
      <path d="M29 13 40 24 29 35Z" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarChamferIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M10 38V18L22 8h16v30Z" {...SOLID} />
      <path d="M10 38V18L22 8h16v30Z" />
      <path d="M10 18 22 8" strokeWidth="4" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarFilletIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M10 38V26C10 16 16 8 28 8h10v30Z" {...SOLID} />
      <path d="M10 38V26C10 16 16 8 28 8h10v30Z" />
      <path d="M10 26C10 16 17 8 28 8" strokeWidth="4" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarSnapGridIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M9 18h30M9 30h30M18 9v30M30 9v30" />
      <circle cx="24" cy="24" r="4.5" {...SOLID} />
      <circle cx="24" cy="24" r="4.5" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarWorkplaneIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M24 12 44 24 24 36 4 24Z" {...SOLID} />
      <path d="M24 12 44 24 24 36 4 24Z" />
      <path d="M14 18 34 30M34 18 14 30" strokeWidth="1.8" opacity="0.6" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarDropToWorkplaneIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <path d="M24 30 40 38 24 44 8 38Z" {...SOLID} />
      <path d="M24 30 40 38 24 44 8 38Z" />
      <path d="M24 4v18M17 16l7 7 7-7" />
      <rect x="16" y="4" width="16" height="9" rx="2" />
    </ToolbarVectorIcon>
  );
}

export function ToolbarCenterOnWorkplaneIcon(props: IconProps) {
  return (
    <ToolbarVectorIcon {...props}>
      <rect x="5" y="5" width="38" height="38" rx="4" {...SOLID} />
      <rect x="5" y="5" width="38" height="38" rx="4" />
      <rect x="18" y="18" width="12" height="12" rx="2" />
      <path d="M20 9h8l-4 5Z M20 39h8l-4-5Z M9 20v8l5-4Z M39 20v8l-5-4Z" fill="currentColor" stroke="none" />
    </ToolbarVectorIcon>
  );
}

/*
 * Zwei Formen fuer das Skizzenmenue, die es bei lucide nicht gibt. Sie sind
 * bewusst in dessen Masszahlen gezeichnet - 24er Feld, Strichstaerke 2, runde
 * Enden -, damit sie neben Rechteck, Kreis und Dreieck nicht auffallen.
 */
function SketchShapeIcon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SketchEllipseIcon(props: IconProps) {
  return (
    <SketchShapeIcon {...props}>
      <ellipse cx="12" cy="12" rx="9" ry="5.5" />
    </SketchShapeIcon>
  );
}

export function SketchHalfCircleIcon(props: IconProps) {
  return (
    <SketchShapeIcon {...props}>
      {/* Bogen von links nach rechts, die Sehne schliesst ihn - genau der
          Umriss, den die Form in der Skizze bekommt. */}
      <path d="M3 15a9 9 0 0 1 18 0Z" />
    </SketchShapeIcon>
  );
}
