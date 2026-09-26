import type { CSSProperties, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
type SpriteRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const toolbarSprite = "assets/editor/toolbar-sprite.svg?v=2";
const vectorToolbarSprite = "assets/editor/vector-toolbar-icons.svg?v=1";

function ToolbarSpriteIcon({ rect, className, style }: IconProps & { rect: SpriteRect }) {
  const size = 35;
  const scale = size / rect.height;

  return (
    <span
      aria-hidden="true"
      className={["toolbar-sprite-icon", className].filter(Boolean).join(" ")}
      style={
        {
          "--sprite-x": `${-rect.x * scale}px`,
          "--sprite-y": `${-rect.y * scale}px`,
          "--sprite-width": `${260 * scale}px`,
          "--sprite-height": `${80 * scale}px`,
          width: `${rect.width * scale}px`,
          height: `${size}px`,
          backgroundImage: `url(${toolbarSprite})`,
          ...(style as CSSProperties),
        } as CSSProperties
      }
    />
  );
}

function VectorToolbarSpriteIcon({ rect, className, style }: IconProps & { rect: SpriteRect }) {
  const size = 35;
  const scale = size / rect.height;

  return (
    <span
      aria-hidden="true"
      className={["vector-toolbar-sprite-icon", className].filter(Boolean).join(" ")}
      style={
        {
          "--vector-sprite-x": `${-rect.x * scale}px`,
          "--vector-sprite-y": `${-rect.y * scale}px`,
          "--vector-sprite-width": `${165 * scale}px`,
          "--vector-sprite-height": `${27 * scale}px`,
          width: `${rect.width * scale}px`,
          height: `${size}px`,
          backgroundImage: `url(${vectorToolbarSprite})`,
          ...(style as CSSProperties),
        } as CSSProperties
      }
    />
  );
}

export function ToolbarShapeAddIcon(props: IconProps) {
  return <VectorToolbarSpriteIcon rect={{ x: 104, y: 0, width: 29, height: 27 }} {...props} />;
}

export function ToolbarHideSelectedIcon(props: IconProps) {
  return <VectorToolbarSpriteIcon rect={{ x: 138, y: 0, width: 27, height: 27 }} {...props} />;
}

export function ToolbarCaretDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path d="m16 19 8 9 8-9z" fill="currentColor" />
    </svg>
  );
}

export function ToolbarIntersectionIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <circle cx="19" cy="24" r="13" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="29" cy="24" r="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeDasharray="4 3" />
      <path d="M24 11.99A13 13 0 0 1 24 36.01A13 13 0 0 1 24 11.99Z" fill="currentColor" opacity="0.82" />
    </svg>
  );
}

export function ToolbarAlignIcon(props: IconProps) {
  return <ToolbarSpriteIcon rect={{ x: 97.3, y: 46.7, width: 29.1, height: 32.5 }} {...props} />;
}

// The drawn PNG set gave way to vectors so tool icons can take their group colour.
export {
  SketchBoltCircleIcon,
  SketchEllipseIcon,
  SketchHalfCircleIcon,
  SketchPieSliceIcon,
  ToolbarCenterOnWorkplaneIcon,
  ToolbarChamferIcon,
  ToolbarCopyIcon,
  ToolbarDropToWorkplaneIcon,
  ToolbarDuplicateIcon,
  ToolbarExportIcon,
  ToolbarFilletIcon,
  ToolbarHollowIcon,
  ToolbarGroupIcon,
  ToolbarGuideIcon,
  ToolbarHomeIcon,
  ToolbarImportIcon,
  ToolbarKeyboardIcon,
  ToolbarMirrorIcon,
  ToolbarRotationPivotIcon,
  ToolbarPatternIcon,
  ToolbarNoteIcon,
  ToolbarPasteIcon,
  ToolbarRedoIcon,
  ToolbarSettingsIcon,
  ToolbarSnapGridIcon,
  ToolbarTrashIcon,
  ToolbarUndoIcon,
  ToolbarUngroupIcon,
  ToolbarVectorExportIcon,
  ToolbarWorkplaneIcon,
} from "@/components/toolbarIcons";
