/*
 * Fonts installed on the computer. Web pages cannot read them by themselves; Chrome and Edge on
 * a desktop computer (and the installed layerling app there) have the Local Font Access API,
 * which asks once for permission and then hands over the font files. Firefox and Safari do not
 * have it - there the font file is chosen like any other file (on Windows from C:\Windows\Fonts).
 */

export type SystemFont = { family: string; fullName: string; style: string; postscriptName: string; blob: () => Promise<Blob> };

type LocalFontWindow = Window & { queryLocalFonts?: () => Promise<SystemFont[]> };

export function systemFontsSupported() {
  return typeof window !== "undefined" && typeof (window as LocalFontWindow).queryLocalFonts === "function";
}

/** Thrown when the browser was not allowed to read the installed fonts. */
export class SystemFontsDeniedError extends Error {}

/**
 * The installed fonts, each once by its full name, sorted. Must run in answer to a click: the
 * browser asks for permission the first time.
 */
export async function listSystemFonts(): Promise<SystemFont[]> {
  const query = (window as LocalFontWindow).queryLocalFonts;
  if (!query) return [];
  let fonts: SystemFont[];
  try {
    fonts = await query.call(window);
  } catch (error) {
    if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) throw new SystemFontsDeniedError();
    throw error;
  }
  const byName = new Map<string, SystemFont>();
  fonts.forEach((font) => {
    if (!byName.has(font.fullName)) byName.set(font.fullName, font);
  });
  return [...byName.values()].sort((a, b) => a.fullName.localeCompare(b.fullName));
}
