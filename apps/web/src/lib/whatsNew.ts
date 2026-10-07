/**
 * "What is new since your last visit": the highlights of each release, written
 * for the people who use layerling, in both languages. The changelog stays the
 * complete (English, technical) record; this list is the short version a
 * returning visitor reads once. It is written by hand with every release: a few
 * lines for what a user can do now that they could not before, and only rarely
 * for a fix.
 */
export type WhatsNewText = { de: string; en: string };
export type WhatsNewItem = { title: WhatsNewText; body: WhatsNewText };
export type WhatsNewEntry = { version: string; items: WhatsNewItem[] };

/** Newest first. An entry shows from the moment the program reaches its version. */
export const WHATS_NEW: readonly WhatsNewEntry[] = [
  {
    version: "1.43.0",
    items: [
      {
        title: { de: "Befehlssuche", en: "Command search" },
        body: {
          de: "Mit Strg+K (oder der Lupe im Bereich „Hilfe“) tippst du den Namen eines Werkzeugs, einer Form oder eines Körpers deines Entwurfs und springst direkt dorthin. Sie versteht deutsche und englische Wörter und zeigt die Tastenkürzel dazu.",
          en: "Press Ctrl+K (or the magnifying glass in the Help area) and type the name of a tool, a shape or a body of your design to jump straight to it. It understands English and German words and shows the keyboard shortcuts.",
        },
      },
      {
        title: { de: "Punktkarte verschiebbar", en: "Movable point card" },
        body: {
          de: "Die Karte eines Bezugspunkts lässt sich an ihrem Titel wegziehen, wenn sie etwas verdeckt. Ein Doppelklick auf den Titel holt sie zurück.",
          en: "The card of a reference point can be dragged away by its title when it covers something. A double-click on the title puts it back.",
        },
      },
      {
        title: { de: "Was ist neu?", en: "What is new?" },
        body: {
          de: "Wenn du layerling nach einer Aktualisierung wieder öffnest, zeigt dir diese Karte, was seitdem dazugekommen ist. Über „Was ist neu?“ in der Fußzeile siehst du sie später noch einmal.",
          en: "When you open layerling again after an update, this card shows what has been added since. \"What is new?\" in the footer shows it again later.",
        },
      },
    ],
  },
  {
    version: "1.42.0",
    items: [
      {
        title: { de: "Bezugspunkte", en: "Reference points" },
        body: {
          de: "Mit der rechten Maustaste auf einen Körper markierst du seine Mitte, Ecken oder Kantenmitten mit Punkten, die nichts druckt. Gezogene Formen rasten daran ein, und die Punkte lassen sich verschieben oder per Koordinate eintippen.",
          en: "Right-click a body to mark its centre, corners or edge middles with points that nothing prints. Dragged shapes snap to them, and the points can be moved or typed in by coordinates.",
        },
      },
      {
        title: { de: "Seitenverhältnis behalten", en: "Keep proportions" },
        body: {
          de: "Ein Schalter oben in den Eigenschaften einer Form hält das Verhältnis, ohne eine Taste zu drücken. Praktisch auf dem Tablet, wo es keine Umschalttaste gibt.",
          en: "A switch at the top of a shape's properties keeps its proportions without holding a key. Handy on a tablet, which has no Shift key.",
        },
      },
      {
        title: { de: "Fläche vor dem Hinlegen sehen", en: "See the face before laying flat" },
        body: {
          de: "Bei „Auf Fläche legen“ leuchtet die Fläche unter dem Mauszeiger auf, bevor du klickst.",
          en: "With \"Lay flat on face\", the face under the pointer lights up before you click.",
        },
      },
      {
        title: { de: "Teilen: Ebene ziehen und Fläche wählen", en: "Split: drag the plane, pick a face" },
        body: {
          de: "Die Schnittebene lässt sich am Pfeil ziehen, und „Fläche wählen“ legt sie auf eine beliebige Fläche. Von @gogades.",
          en: "The split plane can be dragged by its arrow, and \"Pick face\" lays it on any face. By @gogades.",
        },
      },
      {
        title: { de: "Gebogenes Rohr: Segment hervorgehoben", en: "Bent tube: segment highlighted" },
        body: {
          de: "Das Segment, das du in der Liste bearbeitest, leuchtet am Rohr orange auf.",
          en: "The segment you edit in the list lights up in orange on the tube.",
        },
      },
    ],
  },
  {
    version: "1.41.0",
    items: [
      {
        title: { de: "Eigene Raster", en: "Snap grids of your own" },
        body: {
          de: "In den Arbeitsflächen-Einstellungen legst du ein eigenes Rastermaß an, zum Beispiel 2,54 mm für Platinen. Das Einrast-Menü bietet es ganz, halb und viertel an. Von @rmpel.",
          en: "In the workspace settings you can add a snap measure of your own, such as 2.54 mm for circuit boards. The snap menu offers it whole, halved and quartered. By @rmpel.",
        },
      },
      {
        title: { de: "Schatten von Aussparungen flüssig", en: "Smooth shade of holes" },
        body: {
          de: "Der dunkle Schatten, der zeigt, wo eine Aussparung schneidet, wird jetzt von der Grafikkarte gezeichnet. Der Editor hängt mit vielen Löchern nicht mehr, und der Schatten bleibt beim Ziehen sichtbar.",
          en: "The dark shade that shows where a hole will cut is now drawn by the graphics card. The editor no longer freezes with many holes, and the shade stays visible while you drag.",
        },
      },
      {
        title: { de: "Teilen-Fenster verschiebbar", en: "Movable Split window" },
        body: {
          de: "Wie bei Fase, Verrundung und Aushöhlen lässt sich auch das Fenster des Teilen-Werkzeugs an seiner Titelleiste verschieben.",
          en: "Like the chamfer, fillet and hollow windows, the Split window can be moved by its title bar.",
        },
      },
    ],
  },
  {
    version: "1.40.0",
    items: [
      {
        title: { de: "Teilen", en: "Split" },
        body: {
          de: "Ein neues Werkzeug im Bereich „Anpassen“ schneidet einen Körper oder eine Aussparung mit einer Ebene in zwei geschlossene Teile, auch schräg. Praktisch für Teile, die nicht auf die Druckplatte passen.",
          en: "A new tool in the Modify area cuts a body or a hole in two closed pieces with a plane, also at an angle. Handy for parts that do not fit on the print bed.",
        },
      },
      {
        title: { de: "Fase, Verrundung und Aushöhlen im Rechtsklick-Menü", en: "Chamfer, fillet and hollow in the right-click menu" },
        body: {
          de: "Das Menü, das ein Rechtsklick auf einen Körper öffnet, startet jetzt auch diese drei Werkzeuge.",
          en: "The menu a right click on a body opens now also starts these three tools.",
        },
      },
      {
        title: { de: "3MF-Objekte kommen einzeln", en: "3MF objects come in apart" },
        body: {
          de: "Mehrere Objekte in einer 3MF-Datei, etwa ein Bambu-Studio-Projekt mit einem Tablett je Platte, kommen als einzelne Körper herein.",
          en: "Several objects in one 3MF file, such as a Bambu Studio project with one tray per plate, now come in as separate bodies.",
        },
      },
    ],
  },
  {
    version: "1.39.0",
    items: [
      {
        title: { de: "Ansicht als Bild (PNG)", en: "The view as a picture (PNG)" },
        body: {
          de: "Das Exportfenster speichert die Ansicht jetzt als PNG in doppelter Auflösung, ohne Griffe und Hilfslinien, auf Wunsch mit durchsichtigem Hintergrund.",
          en: "The export window now saves the view as a PNG at twice the resolution, without handles and guides, with a transparent background if you like.",
        },
      },
      {
        title: { de: "Rechtsklick-Menü", en: "Right-click menu" },
        body: {
          de: "Ein kurzer Rechtsklick auf einen Körper öffnet ein Menü mit den wichtigsten Befehlen und ihren Kürzeln.",
          en: "A short right click on a body opens a menu with the most used commands and their shortcuts.",
        },
      },
      {
        title: { de: "Verjüngen und Verdrehen bei mehr Formen", en: "Taper and twist on more shapes" },
        body: {
          de: "Kapsel, abgerundeter Quader, Stern, Herz, Mondsichel, Wabengitter und Schwalbenschwanz lassen sich jetzt wie Quader und Zylinder verjüngen, verdrehen und neigen.",
          en: "The capsule, rounded box, star, heart, crescent, honeycomb and dovetail can now be tapered, twisted and leaned like a box or a cylinder.",
        },
      },
      {
        title: { de: "Zuletzt benutzte Farben", en: "Recently used colours" },
        body: {
          de: "Selbst gemischte Farben warten in einer Reihe unter der Palette, die letzten acht.",
          en: "Colours you mix yourself wait in a row below the palette, the last eight.",
        },
      },
    ],
  },
  {
    version: "1.38.0",
    items: [
      {
        title: { de: "Eigene Formen", en: "Custom shapes" },
        body: {
          de: "Körper, die du immer wieder brauchst, speicherst du mit „Auswahl speichern“ oben in der Formenbibliothek und setzt sie mit einem Klick in jeden Entwurf.",
          en: "Bodies you need again and again can be kept at the top of the shape library with \"Save selection\" and inserted into any design with one click.",
        },
      },
    ],
  },
];

/**
 * How many versions at most the card lists. Releases come often, so a visitor
 * who was away for a while should still see all of it; versions without an
 * entry (plain fixes) do not count.
 */
export const WHATS_NEW_MAX_VERSIONS = 20;

/** How many versions "What is new?" lists when opened by hand. */
export const WHATS_NEW_MANUAL_VERSIONS = 5;

/**
 * The version before this feature came with it: a browser that already holds
 * designs but has never seen the card is taken to have last been here then, so
 * the first update after it brings the list.
 */
export const WHATS_NEW_BASELINE = "1.42.0";

export function parseVersion(version: string): [number, number, number] | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version.trim());
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

/** Negative when `a` is older than `b`; 0 when equal or when either is no version number. */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) return 0;
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

/** The entries after `lastSeen` up to and including `current`, newest first, at most `limit`. */
export function whatsNewSince(
  lastSeen: string,
  current: string,
  entries: readonly WhatsNewEntry[] = WHATS_NEW,
  limit = WHATS_NEW_MAX_VERSIONS,
): WhatsNewEntry[] {
  return entries
    .filter((entry) => compareVersions(entry.version, lastSeen) > 0 && compareVersions(entry.version, current) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version))
    .slice(0, limit);
}

/** The newest entries up to `current`, for opening the list again when nothing is new. */
export function latestWhatsNew(current: string, entries: readonly WhatsNewEntry[] = WHATS_NEW, limit = WHATS_NEW_MANUAL_VERSIONS): WhatsNewEntry[] {
  return entries
    .filter((entry) => compareVersions(entry.version, current) <= 0)
    .sort((a, b) => compareVersions(b.version, a.version))
    .slice(0, limit);
}

/**
 * Which version this browser last saw, or null for a visitor who has never been
 * here (who is told nothing and just gets the current version remembered).
 */
export function lastSeenVersion(stored: string | null, hasDesigns: boolean): string | null {
  if (stored && parseVersion(stored)) return stored.trim();
  return hasDesigns ? WHATS_NEW_BASELINE : null;
}
