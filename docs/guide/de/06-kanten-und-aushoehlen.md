---
title: Kanten brechen und Körper aushöhlen
summary: Fase und Verrundung an ausgewählten Kanten, Wände gleicher Stärke für Dosen, Becher und Gehäuse.
---

## Kanten fasen und verrunden

Scharfe Kanten sehen an einem gedruckten Teil selten gut aus, und sie sind auch nicht besonders stabil. Mit einer **Fase** schneidest du die Kante schräg ab, mit einer **Verrundung** rundest du sie ab. Beides wirkt auf die Kanten, die du anklickst.

1. Wähle den Körper aus (oder die Gruppe).
2. Klicke im Menüband auf {{ui:editor.tool.fillet}} oder {{ui:editor.tool.chamfer}}, oder klicke mit der rechten Maustaste auf den Körper und wähle es im Menü.
3. Die Kanten des Körpers werden hervorgehoben. Klicke die an, die betroffen sein sollen. Ein weiterer Klick nimmt sie wieder heraus. Mit [[Umschalt]] fügst du eine einzelne Kante hinzu oder nimmst sie weg.
4. Stelle das Maß ein und bestätige mit {{ui:edge.apply}} oder [[Enter]].

![Das Werkzeug „Kanten verrunden“: alle scharfen Kanten sind ausgewählt, im Bild siehst du die Vorschau mit 4 mm Radius.](shot:fillet-preview)

Das Fenster steht oben rechts. Verdeckt es Kanten, die du anklicken willst, ziehst du es an seiner Titelleiste weg; dort öffnet es sich auch beim nächsten Mal, und das gilt ebenso für {{ui:editor.tool.hollow}} und {{ui:editor.tool.array}}. Ein Doppelklick auf die Titelleiste bringt es zurück.

Im Fenster findest du:

- {{ui:edge.allSharpEdges}} wählt sämtliche Kanten auf einmal, {{ui:edge.clear}} leert die Auswahl.
- **{{ui:edge.radius}}** bei der Verrundung. Bei der Fase stellst du {{ui:edge.distance}} oder {{ui:edge.angle}} ein.
- {{ui:edge.sharpThreshold}} legt fest, welche Kanten überhaupt als scharf gelten. Ein Wert von 25° behandelt nur deutliche Knicke als Kante und lässt flache Übergänge in Ruhe.
- {{ui:edge.tangentChains}} nimmt Kanten mit, die sanft ineinander übergehen, zum Beispiel alle Kanten rund um eine Fläche mit gerundeten Ecken.
- {{ui:edge.keepSize}} hält Fase oder Rundung so groß, wie sie sind, auch wenn du den Körper später skalierst.
- {{ui:edge.previewQuality}} ({{ui:edge.draft}}, {{ui:edge.standard}} oder {{ui:edge.fine}}) bestimmt, wie fein die Vorschau gerechnet wird. Bei schwierigen Teilen ist {{ui:edge.draft}} schneller.

Während du am Maß drehst, rechnet layerling die Vorschau nach. Sie kann einen Moment brauchen. Du darfst weiter einstellen, gerechnet wird immer der zuletzt gewählte Wert.

Wenn das Maß zu groß für die Kante ist, sagt layerling das und schlägt einen kleineren Wert vor. Meist genügt es, ein bis zwei Millimeter weniger zu nehmen. An spitzen Winkeln braucht eine Verrundung mehr Platz, als der Radius vermuten lässt.

### Eine Kantenbearbeitung zurücknehmen

Ein behandelter Körper lässt sich jederzeit noch einmal behandeln. Wähle ihn wieder aus und öffne das Werkzeug: Unter {{ui:edge.featureHistory}} steht, was schon darauf liegt. {{ui:edge.revertAction}} nimmt eine einzelne Bearbeitung zurück. Achtung: Liegen neuere Bearbeitungen darüber, gehen sie mit weg, und das Fenster sagt dir, wie viele.

Bei einer Gruppe, etwa einem Zylinder mit einer Bohrung, gehört die bearbeitete Kante zum fertigen Körper, nicht zu einem einzelnen Teil. Deshalb wird aus der Gruppe dabei ein einziger Körper, und {{ui:editor.tool.ungroup}} steht nicht mehr zur Verfügung. Nimmst du die Bearbeitung wie oben beschrieben zurück, ist die Gruppe mit allen Teilen wieder da. Am einfachsten ist es, Kanten erst ganz am Schluss zu bearbeiten. Das gilt auch für Gewinde: Das Kantenwerkzeug nimmt ein Gewinde als exakten Körper, ein Block mit einer Gewindebohrung bekommt seine Rundungen also mit dem Gewinde darin. Die Kanten eines Gewindes zu ermitteln dauert länger als bei einer einfachen Form, ein paar Sekunden bei M6 und etwa eine halbe Minute bei einem G1/2-Rohrgewinde.

> **Gut zu wissen:** layerling rechnet bei Rundungen und Fasen mit echter CAD-Geometrie, nicht nur mit einem Dreiecksnetz. Deshalb bleibt eine verrundete Kante auch im STEP-Export eine verrundete Kante.

Ein als STEP importiertes Teil behält seine CAD-Geometrie ebenfalls: Fasen, Rundungen und das Aushöhlen arbeiten am Körper aus der Datei, egal wie fein das Teil auf dem Bildschirm gezeichnet ist. STL, OBJ und 3MF bringen nur Dreiecke mit, und ein fein gezeichnetes Teil kann für die Kantenbearbeitung zu dicht sein. Gibt es ein Teil auch als STEP, importiere lieber das.

## Körper aushöhlen

Dosen, Becher, Gehäuse und Abdeckungen haben eines gemeinsam: Sie sind innen leer, mit Wänden gleicher Stärke. Genau das macht {{ui:editor.tool.hollow}}.

1. Wähle den Körper aus und klicke auf {{ui:editor.tool.hollow}}, oder klicke mit der rechten Maustaste auf den Körper und wähle es im Menü.
2. Stelle die {{ui:shell.wall}} ein.
3. Wähle, welche Seite offen bleibt: {{ui:shell.opening.top}}, {{ui:shell.opening.bottom}}, {{ui:shell.opening.top-bottom}} oder {{ui:shell.opening.none}} (ganz geschlossen, mit einem Hohlraum in der Mitte).
4. Entscheide, ob die {{ui:shell.edges}} {{ui:shell.edges.round}} oder {{ui:shell.edges.sharp}} sein sollen.
5. Klicke auf {{ui:shell.apply}}.

![Das Aushöhlen-Fenster mit Wandstärke und offener Seite.](shot:hollow-panel)

Die Wände wachsen nach innen. Außen bleibt alles, wie es ist.

![Das Ergebnis: eine Schale mit 3 mm Wand, oben offen.](shot:hollow-result)

Damit oben oder unten eine Öffnung entstehen kann, braucht der Körper dort eine ebene Fläche. Kugeln und freie Formen lassen sich deshalb so nicht aushöhlen. Wenn die Wand zu dick für den Körper ist, meldet layerling das und bittet um eine dünnere.

Änderst du später die Größe des ausgehöhlten Körpers, höhlt layerling ihn in der neuen Größe gleich noch einmal aus. Die Wand bleibt so dick, wie du sie gewählt hast, auch bei runden Körpern. Ein Zylinder, den du dabei in eine Richtung mehr ziehst als in die andere, wird zur Ellipse.

> **Tipp:** Bei einer 0,4-mm-Düse sind 1,2 bis 2 mm Wandstärke ein guter Anfang: dünn genug, um Material zu sparen, dick genug für ein stabiles Teil.
