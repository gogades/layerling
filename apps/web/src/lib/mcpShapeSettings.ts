import type { WorkplaneShape } from "@/types/layerling";

/**
 * Die formeigenen Werte, die eine Zusammenfassung sonst verschweigt: Ohne sie
 * liest ein Client zwar die Masse einer Schraube, sieht aber nicht, ob M4 oder
 * M5 darauf steht - und die rohe Form dafuer zu holen, laedt das halbe Projekt
 * mit. **Eine neue Form traegt ihre Felder hier nach**, sonst ist sie fuer eine
 * KI eine namenlose Kiste. Die Liste ist bewusst eine Erlaubnisliste: `cadBrep`
 * ist auch nur eine Zeichenkette, aber eine megabytegrosse.
 *
 * Sie steht in einer eigenen Datei, weil `tests/unit/layerlingMcpTools.test.ts`
 * sie gegen das Schema der Bruecke haelt: **Was hier herausgeht, muss dort
 * hineingehen duerfen.** Genau daran ist es schon zweimal auseinandergelaufen -
 * bei den Formvorgaben fuer Gewinde und Feder (behoben mit 1.2.1) und bei der
 * Verjuengung, die zu lesen war, aber nicht zu setzen.
 *
 * Nicht dabei ist `radius`, die Rundung eines Quaders: Sie steht zwar im
 * Format und wird auch gezeichnet, aber kein Regler und kein Befehl setzt sie,
 * also ist sie an jedem Koerper dieses Editors 0. Ein Wert, den niemand aendern
 * kann, gehoert in keine Auskunft.
 */
export const MCP_SHAPE_SETTING_KEYS = [
  "steps", "sides", "bevel", "segments",
  "topRadius", "baseRadius", "topWidth", "topDepth",
  "taperTopWidth", "taperTopDepth", "taperBottomWidth", "taperBottomDepth",
  "extrudeTwist", "extrudeTopOffsetX", "extrudeTopOffsetZ",
  "teeth", "toothSize", "toothWidth", "centerHoleSize", "gearType", "helixAngle", "helixQuality",
  "threadRole", "threadHead", "threadHand", "threadProfile", "threadDiameter", "threadPitch",
  "threadClearance", "threadQuality", "threadHeadHeight", "threadChamfer",
  "threadHeadChamfer",
  "springTurns", "springWire", "springQuality",
  "text", "font",
] as const satisfies readonly (keyof WorkplaneShape)[];
