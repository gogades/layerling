// The few parts of opentype.js 1.x that reading a font for the text shape needs.
declare module "opentype.js" {
  export type PathCommand =
    | { type: "M" | "L"; x: number; y: number }
    | { type: "Q"; x: number; y: number; x1: number; y1: number }
    | { type: "C"; x: number; y: number; x1: number; y1: number; x2: number; y2: number }
    | { type: "Z" };

  export type Glyph = {
    name?: string;
    unicode?: number;
    unicodes: number[];
    advanceWidth?: number;
    xMin?: number;
    xMax?: number;
    path: { commands: PathCommand[] };
  };

  export type Font = {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    names: Record<string, Record<string, string> | undefined>;
    tables: { post?: { underlinePosition?: number; underlineThickness?: number }; head?: { xMin: number; yMin: number; xMax: number; yMax: number } };
    glyphs: { length: number; get(index: number): Glyph };
  };

  export function parse(buffer: ArrayBuffer): Font;
}
