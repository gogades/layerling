# Notizen für Claude

Gemeinsames Gedächtnis für Claude-Sitzungen an diesem Repository. Kurz halten und
aktuell halten: Was sich ändert, hier nachtragen.

## Zusammenarbeit

- Antworten auf Deutsch, knapp und präzise, nichts erfinden.
- Mergen, Releases und Deploys auf Webserver nur nach ausdrücklichem OK.
- Kein Force-Push, keine umgeschriebene History. Ist der PR eines Branches schon
  gemergt, den Branch neu von `main` aufsetzen und einen neuen PR öffnen.
- Vor neuer Arbeit den aktuellen Stand von `origin/main` holen – der Nutzer
  arbeitet parallel in anderen Sitzungen.
- Deutsche und englische README (`README.de.md`, `README.md`) immer gemeinsam
  ändern; Begriffe wie in der App-Oberfläche (`apps/web/src/lib/messages.de.ts`),
  z. B. „Kanten fasen/verrunden“, „Rohr“, „Aushöhlen“.

## Projekt

- layerling: einfaches 3D-CAD für den 3D-Druck im Browser, Fork von
  SketchForge-3D 1.0.9, AGPL-3.0-only. Gehostet auf https://layerling.com/.
- Next.js 15 / React 19 in `apps/web`, three.js, manifold-3d (Boolesche
  Operationen), occt-wasm (OCCT-CAD-Kern im Worker `cadModifier.worker.ts`).
- Tests: `tests/unit`, `tests/e2e`, `tests/perf` (Vitest).

## Befehle

- `npm run typecheck`, `npm run test`, `npm run test:e2e`
- `npm run dev` (Port 3000), `npm run build`, `npm run export` (statischer Export)
- `npm run theme:graphite` nach jeder Änderung an `globals.css` – ein Test prüft,
  dass das Graphite-Theme dazu passt.
- `npm run printers:update` erzeugt `printerPresets.generated.ts` aus den
  OrcaSlicer-Profilen (54 Drucker, Liste in `scripts/generate-printer-presets.mjs`).

## Release

- Version steht dreimal und muss gleich sein: `package.json`,
  `package-lock.json`, `LYL_CREATED_WITH_VERSION` in `apps/web/src/lib/lylProject.ts`.
- Abschnitt `## X.Y.Z` in `docs/CHANGELOG.md` wird zum Release-Text.
- Veröffentlicht wird über den Workflow `.github/workflows/release.yml`
  (`workflow_dispatch`); Claude kann selbst keine Tags pushen (403).

## Bekannte Stolpersteine

- Statischer Export braucht die Auslieferung unter `/` (`/_next/` absolut),
  `file://` geht nicht.
- `pkill -f` nie mit einem Muster, das auf die eigene Shell-Zeile passt – das
  beendet die eigene Shell. Prozesse lieber per PID beenden.
- `npm audit fix` bricht mit `edgesOut` ab; Pakete gezielt mit `npm install` heben.
- OCCT: `surfaceNormal` ist schon orientiert; `orientedFaceNormal` im Worker
  dreht dadurch doppelt (bekannt, noch nicht behoben).
- Editor über `/?editor=1` ohne `project=`: Umbenennen erreicht die
  Arbeitsflächen-Beschriftung nicht. Für Tests einen Entwurf über die Startseite
  anlegen.

## MCP und Screenshots

- MCP-Brücke nur im Dev-Server: `GET /api/layerling-mcp` listet Editoren,
  `POST {type:"command", editorNumber, action, params}` führt Befehle aus.
- README-Screenshots (`docs/media/screenshot-{en,de}.png`, 770 × 685 px) sind
  per MCP gebaut: Schreibtisch-Organizer auf Bambu Lab A1 mini, Entwurf
  „layerling Demo“, helles Theme. Farben aus dem Logo: Becher rot `#ff5a47`,
  Schale gelb `#ffc93c`, Zahnrad orange `#ff9e2c`, Platte `#4b5565`,
  Schraube/Mutter `#8e98a3`, Schriftzug `#d8c9ae` (2 mm hoch).
  Chromium für Playwright liegt unter `/opt/pw-browsers/chromium`.
