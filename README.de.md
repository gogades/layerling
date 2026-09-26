<div align="center">
  <table>
    <tr>
      <td width="145" align="center">
        <img src="apps/web/public/assets/layerling/layerling-logo.svg" width="110" alt="layerling-Logo">
      </td>
      <td>
        <h1 align="right">layerling</h1>
        <h3 align="right">Einfaches 3D-CAD für den 3D-Druck</h3>
        <p align="right">
          Form hinstellen, Aussparung hineinschneiden, Kante brechen, drucken. Im Browser, ohne Konto und ohne CAD-Vorkenntnisse.
        </p>
      </td>
    </tr>
  </table>

  <p>
    <a href="LICENSE"><img alt="GNU-AGPLv3-Lizenz" src="https://img.shields.io/badge/Lizenz-AGPLv3-663399"></a>
    <img alt="Kein Konto nötig" src="https://img.shields.io/badge/ohne%20Konto-nichts%20anzumelden-dd7906">
    <img alt="Für den 3D-Druck gemacht" src="https://img.shields.io/badge/gemacht%20für-3D--Druck-ff9e2c">
    <a href="#layerling-mcp-skill"><img alt="Von einer KI steuerbar" src="https://img.shields.io/badge/KI--steuerbar-MCP--Server-16c0d4"></a>
  </p>

  <p><a href="README.md">English</a> · <strong>Deutsch</strong></p>
</div>

<p align="center">
  <img src="docs/media/screenshot-de.png" width="770" alt="layerling im Browser">
</p>

<p align="center"><em>layerling im Browser</em></p>

## Für wen das gedacht ist

Du hast einen 3D-Drucker. Du willst ein Teil, das passt – keine Laufbahn als CAD-Konstrukteur.

layerling arbeitet so, wie du ohnehin denkst: Form auf die Platte stellen, auf Maß ziehen, eine zweite Form zur Aussparung erklären, beides gruppieren, exportieren, drucken. Es gibt nichts zu lernen, bevor du anfängst, und **nichts anzumelden** – Seite öffnen und bauen. Deine Entwürfe bleiben in deinem eigenen Browser: kein Konto, keine Cloud, nichts wird irgendwohin hochgeladen.

### Von Tinkercad umgestiegen?

Du wirst alles wiedererkennen: die Platte, die Formen, Körper und Aussparung (dort Solid und Hole), Gruppieren und Auflösen. Zwei Dinge warten hier auf dich, die du dort vermisst hast:

- **Kanten fasen und verrunden.** Kante auswählen und brechen oder abrunden – das, wonach am häufigsten gefragt wird, sobald ein gedrucktes Teil fertig aussehen oder irgendwo hineinpassen soll. Bearbeitete Kanten bleiben umkehrbar: Du nimmst Fase oder Rundung jederzeit wieder weg.
- **Echte Geometrie darunter.** layerling führt exakte CAD-Körper mit, nicht nur ein Dreiecksnetz. Eine verrundete Kante bleibt deshalb eine verrundete Kante – bis in eine STEP-Datei für ein vollwertiges CAD.

> **Eine KI kann mitbauen.** layerling bringt einen MCP-Server mit. Ein KI-Client wie Codex oder Claude sieht damit einen
> offenen Editor-Tab und arbeitet darin: Formen anlegen, Maße ändern, gruppieren, schneiden, Kanten verrunden, die Szene
> auslesen, Bilder der Ansicht aufnehmen. Du beschreibst das Teil, die KI baut es, du siehst zu und greifst jederzeit ein.
> Das läuft lokal, ohne dass etwas den Browser verlässt – wie das eingerichtet wird, steht unter
> [layerling-MCP-Skill](#layerling-mcp-skill).

## Was es kann

### Bauen

- **Eine echte Bauplatte** – Raster, Einrasten, Griffe zum Verschieben, Skalieren und Drehen, und ein Feld mit den genauen Zahlen, wenn du sie brauchst.
- **Die Platte deines Druckers** – wähl einen von 54 gängigen Druckern, dann bekommt die Platte seine Größe. Name und Bauraum stehen in der Ecke der Arbeitsfläche, und eine Warnung erscheint, wenn ein Körper über den Rand ragt.
- **Formen-Bibliothek** – Quader, Zylinder, Kugeln, Kegel, Pyramiden, Keile, Text, Dächer, Halbkugeln, Tori, Rohre, Mehrkante von drei bis vierundzwanzig Seiten, Federn und mehr.
- **Gewinde, die passen** – Gewindestangen, Schrauben mit Zylinder-, Senk- oder Sechskantkopf, Sechskantmuttern und Gewindelöcher. M2 bis M12 liegen bereit, dazu UNC und UNF von #4 bis ein Zoll; Durchmesser und Steigung lassen sich auch frei wählen, Linksgewinde ebenso. Bei einer Zollgröße fragt das Feld nach Gängen je Zoll statt nach Millimetern. Die Enden bekommen auf Wunsch eine Fase, und das Gewindeloch ist eine Aussparung: in ein Teil ziehen, gruppieren, fertig.
- **Körper und Aussparungen** – Formen zu Schneidwerkzeugen erklären und zur fertigen Geometrie gruppieren.
- **Schnittmenge** – nur das behalten, wo sich die ausgewählten Körper und Aussparungen überlappen.

### Bearbeiten

- **Kanten fasen und verrunden** – jede Kante eines Körpers brechen oder abrunden und später wieder zurücknehmen.
- **Aushöhlen** – aus einem Körper Wände gleicher Stärke machen, oben, unten oder beidseitig offen oder ganz geschlossen – für Dosen, Becher und Gehäuse.

### Dateien

- **Eigene Modelle mitbringen** – STL, OBJ, 3MF, STEP oder SVG importieren und darum herum konstruieren.
- **Exportieren, was dein Slicer will** – STL, 3MF mit Namen und Farben oder OBJ, für die Auswahl oder die ganze Szene, dazu STEP, wenn der Entwurf in ein vollwertiges CAD weiterreisen soll.
- **Projekte als Datei** – ein ganzes Projekt samt Verlauf, Skizzen und Gruppen als `.lyl` sichern und anderswo weiterbauen. Ältere `.skf`-Dateien aus früheren Fassungen öffnen sich weiterhin; gespeichert wird dann als `.lyl` daneben.
- **Entwürfe, die du wiedererkennst** – alles liegt in deinem eigenen Browser, jeder Entwurf mit Vorschaubild.

### Ansicht

- **Perspektivisch oder gerade von vorn** – zwischen normaler und orthografischer Ansicht wechseln, über den Würfelknopf neben den Zoomtasten oder mit **O**. Blickrichtung und Ausschnitt bleiben erhalten.
- **Auf einem Tablet** – ein Finger arbeitet am Entwurf, genau wie die linke Maustaste: Antippen wählt aus, Ziehen verschiebt, Ziehen auf leerer Fläche spannt den Auswahlrahmen. **Zwei Finger gehören der Ansicht**: Spreizen und Zusammenziehen zoomt, gemeinsames Schieben verschiebt die Arbeitsfläche. Setzt der zweite Finger auf, wird zurückgenommen, was der erste angefangen hatte; ein Zoom verschiebt also nie versehentlich ein Teil. Fürs Drehen gibt es keine eigene Geste, dafür einen Umschalter in der Kameraleiste, der nur auf einem Berührungsbildschirm erscheint: Solange er an ist, dreht ein Finger die Ansicht, statt auszuwählen. Zahlenfelder geben beim Antippen ihren ganzen Wert zum Überschreiben frei – eine Dezimaltastatur hat keine Pfeiltasten, mit denen sich der Schreibzeiger setzen ließe.

## Loslegen

Am schnellsten geht es mit der gehosteten Fassung. Nichts zu installieren, nichts anzumelden – öffnen und bauen:

**https://layerling.com/**

Der Rest dieses Abschnitts handelt davon, eine eigene Instanz zu betreiben: auf deinem Rechner oder auf einem Rechner in
der Werkstatt, den alle im Browser öffnen. Woher die App auch ausgeliefert wird: Die Entwürfe verlassen den Browser nicht,
in dem sie entstanden sind, und Exporte landen direkt auf dem Rechner der jeweiligen Person.

### Schnellstart unter Windows

Noch nie ein Terminal benutzt? Auf einem Windows-11-Rechner (oder aktuellem Windows 10) ohne Vorinstallationen
**PowerShell** öffnen (im Startmenü danach suchen, keine Administratorrechte nötig) und diese eine Zeile einfügen:

```powershell
irm https://raw.githubusercontent.com/henmedia/layerling/main/scripts/windows-quickstart.ps1 | iex
```

Das installiert Git und Node.js, falls sie fehlen, lädt layerling nach `%USERPROFILE%\layerling` herunter und öffnet es
im Browser unter `http://127.0.0.1:3000/`. Lass das PowerShell-Fenster offen, solange du layerling benutzt; `Strg+C` in
diesem Fenster beendet es wieder.

Dieselbe Zeile später noch einmal ausführen **aktualisiert** layerling – das Skript erkennt den vorhandenen Ordner und
holt die neueste Fassung, statt sie erneut komplett herunterzuladen. Das Skript selbst liegt unter
[`scripts/windows-quickstart.ps1`](scripts/windows-quickstart.ps1); du kannst also genau nachlesen, was es tut, bevor
du es ausführst, oder es herunterladen und lokal starten, statt es in PowerShell hineinzuleiten.

#### Später wieder öffnen

Die Zeile von oben legt außerdem eine Verknüpfung namens **„Start layerling“** auf deinem Desktop an. Einfach
doppelklicken, um layerling erneut zu öffnen – kein PowerShell, keine Neuinstallation, kein erneuter Download: Der
Server startet von selbst, und der Browser öffnet sich gleich mit.

Lieber von Hand? PowerShell öffnen und Folgendes eingeben:

```powershell
cd $env:USERPROFILE\layerling
npm run dev
```

Dann selbst `http://127.0.0.1:3000/` öffnen. `Strg+C` in diesem Fenster beendet layerling so oder so wieder.

### Docker

Wer layerling auf einem Rechner, NAS (Synology, Unraid etc.) oder Heimserver ohne Node.js betreiben will, nutzt das
mitgelieferte [`Dockerfile`](docker/Dockerfile) und [`compose.yml`](docker/compose.yml). Die App lauscht auf Port **3000**.

1. **Docker installieren.** Unter Windows oder macOS [Docker Desktop](https://www.docker.com/products/docker-desktop/) installieren und starten. Unter Linux oder auf einem NAS brauchst du Docker mit Compose (`docker compose` oder das eigenständige `docker-compose`).
2. **Dateien holen.** Entweder das Repository als ZIP herunterladen ([Code → Download ZIP](https://github.com/henmedia/layerling/archive/refs/heads/main.zip)) und entpacken oder per Git klonen:
   ```bash
   git clone https://github.com/henmedia/layerling.git
   cd layerling
   ```
3. **Starten.** Im Projektordner ein Terminal öffnen (z. B. PowerShell unter Windows) und ausführen:
   ```bash
   docker compose -f docker/compose.yml up -d --build
   ```
   Mit dem älteren eigenständigen Programm heißt es `docker-compose` statt `docker compose`. Docker baut das Image und startet den Container im Hintergrund (`-d`); beim ersten Mal dauert der Build etwa 2–3 Minuten.
4. **Öffnen.** Auf demselben Rechner unter **`http://localhost:3000/`**, von anderen Geräten im Netz unter **`http://<IP-DEINES-SERVERS>:3000/`**.

Befehle im Alltag:

- **Stoppen:** `docker compose -f docker/compose.yml down`
- **Wieder starten:** `docker compose -f docker/compose.yml up -d`
- **Aktualisieren** (nach `git pull` oder neuem ZIP): `docker compose -f docker/compose.yml up -d --build`

Das Image führt `next start` im Produktionsmodus aus, die MCP-Brücke steht dort also nicht zur Verfügung. Für einen
gemeinsamen Projektordner ein beschreibbares Verzeichnis einbinden und in `compose.yml` `LAYERLING_SHARED_PROJECTS_DIR`
setzen (siehe [Gemeinsame Entwürfe im Netz](#gemeinsame-entwürfe-im-netz)).

### Gemeinsame Entwürfe im Netz

Betreibst du layerling mit `npm run dev` oder `npm run start` auf einem Rechner, den andere im Browser öffnen, kann es
einen gemeinsamen Ordner für `.lyl`-Projekte anbieten. Setze dazu vor dem Start `LAYERLING_SHARED_PROJECTS_DIR` auf ein
Verzeichnis:

```bash
LAYERLING_SHARED_PROJECTS_DIR=/srv/layerling-projekte npm run start
```

Auf der Startseite steht dann neben deinen Browser-Entwürfen der Ordner **Auf dem Server**. Öffnest du ihn, bist du in
diesem Ordner: **Neuer Entwurf** legt einen darin an, **Neuer Ordner** einen Unterordner, und die Pfadzeile unter der
Überschrift sagt, wo du bist. Eine `..`-Kachel führt wieder hinaus. Entwürfe wandern per Ziehen auf einen Ordner, auf
diese Kachel oder auf einen Schritt der Pfadzeile – oder über **Verschieben nach …** in ihrem Menü. Ein Entwurf aus dem
Browser kommt genauso auf den Server: seine Kachel auf den Serverordner ziehen.

Das Suchfeld oben durchsucht den **ganzen** Serverordner, nicht nur den, in dem du gerade stehst. Jeder Treffer sagt,
in welchem Ordner er liegt, und dieser Ordner ist ein Knopf: ein Klick, und du bist dort, die Suche ist beendet.
Ordner werden ebenfalls über ihren Namen gefunden. Solange du suchst, sagt die Serverkachel auf der Startseite, wie
viele Treffer dort drüben liegen.

**Duplizieren** im Menü eines Entwurfs legt eine Kopie an. Auf dem Server wird die Datei selbst kopiert, neben dem
Original und unter einem freien Namen, das Vorschaubild inbegriffen – es wird nichts neu gepackt, die Kopie trägt also
genau die Geometrie des Originals. Im Browser entsteht ein eigener Entwurf mit denselben Formen, demselben Verlauf und
einem eigenen Vorschaubild, und er gehört niemandem auf dem Server.

Ein Entwurf, der auf dem Server liegt, sichert sich von selbst dorthin zurück – fünf Sekunden nach der letzten Änderung
und beim Verlassen des Editors. Vorschaubilder landen daneben in `.thumbnails`. Was nur im Browser liegt, bleibt dort
unberührt.

Wer eine gemeinsame Datei öffnet, erhält eine private lokale Arbeitskopie. Beim Zurückspeichern wird zuerst der Stand auf
dem Server geprüft; hat jemand anderes die Datei inzwischen geändert, verweigert layerling das Überschreiben und bittet
darum, neu zu laden oder unter anderem Namen zu speichern. Das ist gemeinsame Dateiablage, kein gleichzeitiges Bearbeiten.

#### Ohne Node: der Ordner `store`

Wird layerling als statischer Export ausgeliefert – also als reine Dateien auf einem Webserver –, kann es von sich aus
nichts schreiben. Für diesen Fall reist `store.php` mit dem Export. Lege neben `index.html` einen Ordner `store` an, den
der Webserver beschreiben darf, und layerling bietet dieselbe gemeinsame Ablage an wie oben, samt Ordnern. Fehlt der
Ordner, bleibt die Funktion unsichtbar, und die Kurzanleitung im Editor sagt, wie man sie einschaltet. Der Webserver muss
PHP können.

Der Ordner hat **keine Anmeldung**: Wer die Seite erreicht, kann darin lesen, schreiben und löschen. Im Heimnetz oder in
der Werkstatt ist genau das der Zweck; auf einer öffentlich erreichbaren Seite schütze ihn oder lege ihn nicht an.

Beim Ausliefern daran denken: Wer den Export mit einer Option spiegelt, die Überzähliges löscht – `rsync --delete`,
`robocopy /MIR`, WinSCP `-delete` –, muss `store` ausdrücklich ausnehmen. Sonst räumt jedes Update die Projekte weg.

## An layerling arbeiten

Diesen Weg nimmst du, wenn du den Quelltext ändern willst.

### Was du brauchst

- Node.js 20 oder neuer
- npm, in Node.js enthalten

Die Versionen prüfst du mit `node -v` und `npm -v`. Funktionieren die Befehle nicht, installiere Node.js von der
offiziellen Node.js-Seite und öffne das Terminal neu.

### Installieren und starten

```bash
git clone https://github.com/henmedia/layerling.git
cd layerling
npm install
npm run dev
```

Kein Git? Auf der GitHub-Seite den grünen Knopf **Code** drücken, **Download ZIP** wählen, entpacken, im entpackten
Ordner ein Terminal öffnen und mit `npm install` beginnen.

Dann `http://127.0.0.1:3000/` öffnen. Lass das Terminal offen, solange du die App benutzt; `Strg+C` beendet den
Entwicklungsserver.

### Entwickeln in einem Container

Du möchtest Node.js lieber nicht installieren? Entwickle stattdessen in einem Container. Du brauchst eine
Container-Engine mit Compose – `docker compose` oder `podman compose` (auch rootless Podman unter SELinux funktioniert;
das `:z` in der Compose-Datei übernimmt die Dateimarkierungen):

```bash
docker compose -f docker/compose.dev.yml up
```

Öffne `http://127.0.0.1:3000/`. Der erste Start installiert die Abhängigkeiten; bei späteren Starts geht es direkt in
den Entwicklungsserver mit Hot Reload. Zum Beenden `Strg+C` drücken. Wenn du Abhängigkeiten aktualisierst und etwas
veraltet wirkt, lösche `node_modules/` im Projektordner und starte neu.

Betreibst du gleichzeitig den Produktionscontainer aus `docker/compose.yml`? Der benutzt ebenfalls Port 3000 – ändere
den Host-Port bei einem der beiden (z. B. `"3100:3000"`).

### Nützliche Befehle

| Befehl | Was er tut |
| --- | --- |
| `npm run typecheck` | TypeScript prüfen |
| `npm run test` | Unit-Tests |
| `npm run test:e2e` | End-to-End-Tests |
| `npm run build` | Produktions-Build (`npm run start` liefert ihn aus) |
| `npm run export` | Statischer Export für einfaches Webhosting |
| `npm run printers:update` | Druckervorlagen aus den OrcaSlicer-Profilen auffrischen |
| `npm run mcp:layerling` | MCP-Server für KI-Clients starten (siehe unten) |

## layerling-MCP-Skill

layerling bringt einen lokalen MCP-Server für KI-Clients mit, die MCP-Werkzeuge unterstützen. Ein Agent kann damit einen
laufenden Editor-Tab untersuchen und steuern: offene Editoren auflisten, die Szene lesen, Objekte anlegen, ändern und
auswählen, Teile gruppieren, schneiden und trennen, CAD-Kanten-IDs auflisten, Kanten fasen oder verrunden, Körper
aushöhlen, Fehler einsehen und Bilder der Ansicht aufnehmen.

Das funktioniert nur mit einem lokalen Entwicklungsserver: In Produktions-Builds und beim statischen Hosting ist die
MCP-Route abgeschaltet.

1. layerling im Projektordner mit `npm run dev` starten (siehe [Installieren und starten](#installieren-und-starten)).
2. Einen Editor-Tab öffnen, z. B. `http://127.0.0.1:3000/?editor=1`.
3. Den KI-Client wie unten beschrieben anbinden. Er startet den MCP-Server selbst mit
   `node scripts/layerling-mcp-server.mjs`.

Die wichtigsten Werkzeugnamen sind `layerling_list_editors`, `layerling_read_scene`, `layerling_list_objects`,
`layerling_create_shape`, `layerling_update_object`, `layerling_list_edges`, `layerling_apply_edge_treatment`,
`layerling_hollow_object`, `layerling_array_objects` und `layerling_capture_image`.

### Claude Code

Nichts zu installieren: Das Repo bringt bereits `.mcp.json` mit, das den MCP-Server für dieses Projekt einträgt, sowie eine
Kopie des Skills unter `.claude/skills/layerling-mcp-skill` – genau dort sucht Claude Code danach. Öffne den
layerling-Ordner in Claude Code und bitte:

```text
Use the layerling MCP tools to list my open layerling editors and inspect the current scene.
```

### Claude Desktop

Claude Desktop liest weder die `.mcp.json` eines Projekts noch Skill-Dateien, kann aber denselben MCP-Server über seine
eigene Konfiguration nutzen. Trage den Server dort ein; als Vorlage dient
[`docs/mcp/claude-desktop-config.example.json`](docs/mcp/claude-desktop-config.example.json), wobei du den Skriptpfad durch
den absoluten Pfad auf deinem Rechner ersetzt. Nach einem Neustart von Claude Desktop:

```text
Use the layerling MCP tools to list open editors, inspect the scene, and modify the selected object.
```

### Codex

Kopiere den Skill aus `docs/skills/layerling-mcp-skill` in deinen Codex-Skill-Ordner.

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item -Recurse -Force "docs\skills\layerling-mcp-skill" "$env:USERPROFILE\.codex\skills\layerling-mcp-skill"
```

macOS oder Linux:

```bash
mkdir -p ~/.codex/skills
cp -R docs/skills/layerling-mcp-skill ~/.codex/skills/
```

Trage danach einen MCP-Server-Eintrag in deine Codex-Konfiguration ein; als Vorlage dient
[`docs/mcp/codex-config.example.toml`](docs/mcp/codex-config.example.toml), wobei du den Skriptpfad durch den absoluten
Pfad auf deinem Rechner ersetzt. Codex neu starten und bitten:

```text
Use $layerling-mcp-skill to list my open layerling editors and inspect the current scene.
```

## Mitmachen

Beiträge sind willkommen, und du musst kein 3D-Druck-Mensch sein, um zu helfen – ein klarerer Satz in dieser Datei zählt
auch. Gute Anlaufstellen:

- Fehlerbehebungen im Editor
- Testfälle für Geometrie und boolesche Operationen
- Grenzfälle bei Import und Export (STL, OBJ, 3MF, STEP, SVG)
- Feinschliff an der Oberfläche
- Bildschirmfotos und Videos für die Dokumentation
- Barrierefreiheit und Geschwindigkeit

Lies [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md), bevor du einen Pull Request öffnest. Was sich in welcher Version
geändert hat, steht im [Changelog](docs/CHANGELOG.md).

## Sicherheit

Bitte eröffne für sicherheitsrelevante Meldungen keine öffentlichen Issues. Der Meldeweg steht in
[.github/SECURITY.md](.github/SECURITY.md).

## Woher das kommt

layerling ist ein Fork von [SketchForge-3D](https://github.com/Formsmith746/SketchForge-3D) von Formsmith746 und den
SketchForge-Beitragenden. Der Fork begann am 16. September 2026 auf Basis von SketchForge 1.0.9. SketchForge bleibt ein
hervorragendes Projekt und der Grund, warum es dieses hier gibt.

## Lizenz

Copyright (C) 2026 layerling contributors.
Copyright (C) 2026 SketchForge contributors.

layerling ist eine abgewandelte Fassung von SketchForge-3D und steht unter der **GNU Affero General Public License v3.0
only** (`AGPL-3.0-only`) – derselben Lizenz wie das Original. Siehe [LICENSE](LICENSE).

Wenn du layerling änderst und die geänderte Fassung über ein Netz zugänglich machst, verpflichtet dich Abschnitt 13 der
Lizenz, den entsprechenden Quelltext anzubieten. Genau dafür trägt das Dashboard einen **Source**-Verweis: Setze beim
Bauen `NEXT_PUBLIC_SOURCE_CODE_URL` auf die öffentliche Adresse des Quelltextes, aus dem dein Build entstanden ist.
