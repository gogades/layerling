---
title: Skizzen: vom Umriss zum Körper
summary: Einen flachen Umriss zeichnen, Ecken runden oder fasen und daraus einen Körper ziehen oder drehen.
---

Nicht alles lässt sich aus Grundformen zusammensetzen. Für Teile mit eigener Kontur, etwa einen Halter, ein Zahnprofil oder eine Vase, zeichnest du zuerst den **Umriss** und machst dann einen Körper daraus. Dafür gibt es den Skizzenmodus.

## Eine Skizze beginnen

Wechsle oben von {{ui:editor.modeGeometry}} auf {{ui:editor.modeSketch}}. Klicke im Menüband auf {{ui:sketch.to3d}} und wähle, was aus dem Umriss werden soll:

- **{{ui:sketch.extrude}}:** Der Umriss wird in die Höhe gezogen, wie eine Ausstechform.
- **{{ui:sketch.revolve}}:** Der Umriss wird um eine Achse gedreht, wie bei einer Drehbank. So entstehen Vasen, Becher, Kegel und alles, was rund ist.

Danach zeigt der Editor ein Blatt mit Gitter. Das ist deine Zeichenfläche.

## Zeichnen

Das Menüband des Skizzenmodus ist in Bereiche geteilt:

- **Zeichnen:** {{ui:sketch.line}} setzt gerade Abschnitte: Punkte nacheinander anklicken. Die {{ui:sketch.bezier}} spannst du an ihren Griffen: Punkt anklicken und ziehen. Die {{ui:sketch.smooth}} legt einen fließenden Verlauf durch die Punkte, die du anklickst. Um den Umriss zu schließen, klickst du am Ende wieder auf den ersten Punkt.
- **Formen:** {{ui:sketch.addShape}} bietet fertige Umrisse: {{ui:sketch.rectangle}}, {{ui:sketch.circle}}, {{ui:sketch.ellipse}}, {{ui:sketch.halfCircle}}, {{ui:sketch.pieSlice}}, {{ui:sketch.boltCircle}} (eine Scheibe mit Bohrungen), {{ui:sketch.triangle}} und {{ui:sketch.hexagon}}. Wähle eine aus und ziehe einen Rahmen auf.
- **Auswahl:** {{ui:sketch.select}} verschiebt Punkte und Linien. Ein Klick in einen geschlossenen Umriss wählt den ganzen Umriss, so dass du ihn gleich verschieben oder skalieren kannst; in einem Loch wird das Loch gewählt. Mit [[Umschalt]] nimmst du per Klick weitere Punkte und Linien dazu oder wieder weg, so dass du mehrere auf einmal verschieben kannst. Ein Rahmen über freier Fläche wählt alles darin. {{ui:sketch.refine}}: Ein Klick auf einen Abschnitt setzt einen Punkt, ein Klick auf einen Punkt entfernt ihn. Dazu kommen {{ui:sketch.erase}} und das Einfügen eines Vorlagenbilds ({{ui:sketch.addImage}}).
- **Zwischenablage:** {{ui:editor.tool.copy}}, {{ui:editor.tool.paste}}, {{ui:editor.tool.duplicate}} und {{ui:editor.tool.delete}} wirken auf die gewählten Punkte, Linien und Bilder, wie im 3D-Editor; [[Strg]]+[[X]] schneidet aus. Eingefügtes und Dupliziertes landet mit 10 mm Abstand neben dem Original, an einer freien Stelle, an der es keine vorhandene Linie berührt, so dass es nie mit dem Bestehenden verbunden wird. Es bleibt ausgewählt, so dass du es gleich an seinen Platz ziehen kannst.
- **Verlauf:** {{ui:sketch.undo}} und {{ui:sketch.redo}}.
- **Ansicht:** [[F]] holt die ganze Skizze ins Bild, [[Umschalt]]+[[F]] zoomt auf die Auswahl, wie im 3D-Editor. Das {{ui:camera.tapeTools}} in der Seitenleiste misst den Abstand zwischen zwei Punkten. Außerdem zeigt die Skizze Maße, sobald du etwas anklickst: bei einer Linie ihre Länge, bei einem Punkt die Längen der Linien, die dort zusammentreffen. Bei einer geraden Linie kannst du die Maßblase anklicken und die Länge in Millimetern eintippen; [[Enter]] übernimmt sie, [[Esc]] bricht ab. Die Linie behält ihre Richtung, ihr Anfangspunkt bleibt stehen, und die Linien am anderen Ende gehen mit. Ist ein Endpunkt markiert, wandert dieser. Mit [[Alt]]+[[Enter]] wächst die Linie zu beiden Seiten und behält ihre Mitte. Bei Kurven zeigt die Blase nur die Länge.

Ein Körper entsteht nur aus einem **geschlossenen** Umriss.

![Ein L-förmiger Umriss. Am gewählten Eckpunkt oben links stehen die Längen der beiden Linien in Millimetern.](shot:sketch-outline)

## Ecken runden oder fasen

Klicke auf einen Eckpunkt und wähle {{ui:sketch.filletCorner}} oder {{ui:sketch.chamferCorner}}. Es erscheint ein kleines Feld für den {{ui:sketch.filletRadius}} beziehungsweise den {{ui:sketch.chamferDistance}}. Trage das Maß ein und bestätige mit dem Haken. Das geht für Ecken zwischen zwei geraden Linien.

![Die Ecke oben links wird mit 12 mm Radius verrundet.](shot:sketch-fillet)

## Ein Körper daraus machen

Klicke auf {{ui:sketch.finishSketch}}. Der Umriss steht als Körper auf der Arbeitsebene und trägt den Namen „Skizzenkörper“. In seinen Einstellungen änderst du die Höhe, die Farbe und alles Weitere wie bei jeder anderen Form. Änderst du seine Größe, baut layerling ihn kurz danach aus der Skizze neu auf, und die Skizze wächst mit. So bleibt er ein exakter Körper, an dem Fase und Rundung gehen, und beim nächsten Bearbeiten hat die Skizze die Größe, die der Körper hat.

Liegt die Arbeitsebene auf einer Seite eines Körpers, zeichnest du so, wie du auf diese Seite schaust: Oben in der Skizze ist auch am fertigen Körper oben. Der blasse Umriss des Körpers in der Skizzenansicht zeigt, wo er steht.

![Aus dem Umriss ist ein Körper geworden. Die Ecke ist gerundet.](shot:sketch-result)

Mit {{ui:inspector.editSketch}} kehrst du jederzeit in die Skizze zurück, um sie zu ändern. Kantenbearbeitungen, die du an dem Körper schon gemacht hast, gehen dabei allerdings verloren, weil die Kanten neu entstehen.

### Rotieren

Beim Rotieren zeichnest du den halben Querschnitt **links von der Achse**, die in der Skizze eingezeichnet ist. Daneben siehst du eine 3D-Vorschau der Drehung. Sie zeigt sofort, wie der Körper aussieht. Der Umriss muss geschlossen sein. Zum Schluss klickst du auf {{ui:sketch.finishRevolve}}.

## Ein Bild als Vorlage

Mit {{ui:sketch.addImage}} legst du ein Foto oder eine Zeichnung unter die Skizze und zeichnest sie nach. Du kannst die Größe, die Deckkraft und die Lage einstellen. Sobald das Bild richtig liegt, sperrst du es mit [[L]], damit du es beim Zeichnen nicht versehentlich verschiebst. Verdecken seine Einstellungen am rechten Rand das Bild, ziehst du sie an ihrer Titelleiste weg; ein Doppelklick darauf dockt sie wieder an.

## Tasten im Skizzenmodus

| Taste | Wirkung |
| --- | --- |
| [[Esc]] | Linienzug beenden, Auswahl aufheben |
| [[Entf]] | gewähltes Element löschen |
| [[Strg]]+[[C]] | Auswahl kopieren |
| [[Strg]]+[[X]] | Auswahl ausschneiden |
| [[Strg]]+[[V]] | einfügen |
| [[Strg]]+[[D]] | Auswahl duplizieren |
| [[Strg]]+[[Z]] | rückgängig |
| [[R]] | geschlossene Skizze um 45° drehen |
| [[L]] | Vorlagenbild sperren oder entsperren |

> **Tipp:** Zeichne so wenig Punkte wie nötig. Ein Umriss mit wenigen, sauber gesetzten Punkten ergibt einen glatteren Körper als ein Gewirr aus vielen.
