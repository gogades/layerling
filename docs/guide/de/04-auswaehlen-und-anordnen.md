---
title: Auswählen und Anordnen
summary: Formen auswählen, in der Objektliste finden, ausrichten, spiegeln, drehen, auf eine Fläche legen und in Mustern vervielfachen.
---

## Auswählen

Ein Klick auf eine Form wählt sie aus. Mit [[Umschalt]] nimmst du weitere dazu oder wieder weg. Ein Klick ins Leere hebt die Auswahl auf, ebenso [[Esc]]. Ziehst du auf der leeren Arbeitsebene einen Rahmen auf, wählst du alles aus, was er berührt; mit gehaltenem [[Umschalt]] nimmt der Rahmen dazu, was nicht ausgewählt war, und weg, was es war. Und [[Strg]]+[[A]] wählt alle sichtbaren Körper.

Was du im Weg hast, blendest du aus ({{ui:editor.tool.hideSelected}}, [[Strg]]+[[H]]). Ausgeblendete Formen bleiben im Entwurf, sie sind nur nicht zu sehen und kommen nicht mit in den Export; das Exportfenster sagt vorher, wie viele es sind. Mit [[Strg]]+[[Umschalt]]+[[H]] holst du alle zurück. Was liegen bleiben soll, sperrst du mit dem Schloss oben in den Einstellungen oder mit [[Strg]]+[[L]]. Gesperrte Formen lassen sich weder verschieben noch versehentlich löschen.

## Die Objektliste

Bei vielen Teilen verliert man in der Ansicht leicht den Überblick. Die Objektliste ({{ui:editor.tool.showOutliner}} oder [[Strg]]+[[Umschalt]]+[[O]]) zeigt alle Formen als Liste.

![Die Objektliste: die Gruppe „Gruppe“ mit zwei Teilen und daneben eine Kugel. Ein Ordnersymbol öffnet die Gruppe.](shot:object-list)

- Ein Klick auf einen Eintrag wählt die Form aus, auch die Teile innerhalb einer Gruppe. Mit [[Umschalt]] nimmst du weitere Einträge dazu oder wieder weg, genau wie in der Ansicht. Die Pfeile klappen Gruppen auf und zu.
- Das Etikett zeigt, ob ein Teil {{ui:outliner.solid}} oder {{ui:outliner.hole}} ist.
- Schloss und Auge sperren und verstecken einzelne Teile.
- Über {{ui:outliner.rename}} gibst du einem Teil einen eigenen Namen; der Stift neben dem Namen oben in den Einstellungen macht dasselbe für die ausgewählte Form. Vernünftige Namen helfen bei größeren Entwürfen enorm.
- Das Suchfeld findet Formen nach Namen und nach Art, also auch „Zylinder“ oder „Aussparung“. Es sucht auch in Gruppen, egal wie tief verschachtelt: Eine Gruppe mit einem Treffer bleibt in der Liste und klappt auf, sodass die passenden Teile und die Gruppen auf dem Weg dorthin zu sehen sind. Passt der Name der Gruppe selbst, zeigt sie aufgeklappt alle ihre Teile.
- Der Pfeil ganz links in der Titelleiste klappt die Liste bis auf ihre Titelleiste ein und wieder auf.

Die Liste ist rechts neben dem Ansichtswürfel angedockt. An ihrer Titelleiste ziehst du sie an jede Stelle der Arbeitsfläche; dabei gleitet sie unter dem Ansichtswürfel und der Kameraleiste hindurch. Legst du sie neben dem Ansichtswürfel wieder ab oder doppelklickst auf die Titelleiste, dockt sie wieder an. Wo sie stand und ob sie eingeklappt war, merkt sich der Browser.

## Position eintippen

Die Karte {{ui:inspector.position}} im Eigenschaftenfenster zeigt, wo der ausgewählte Körper steht, und du kannst es eintippen: {{ui:prop.positionX}} und {{ui:prop.positionY}} sind die Mitte seines Rahmens auf der Platte, mit denselben Vorzeichen wie die Abstände auf der Arbeitsfläche, {{ui:prop.positionZ}} ist die Höhe seiner Unterkante. Die Werte gelten in der eingestellten Einheit, und die Regler reichen so weit wie das Ziehen.

## Teile neben der Platte parken

Du kannst eine Form über den Rand der Platte hinausziehen und dort liegen lassen, etwa eine Plattenbreite weit auf jeder Seite, um sie für später aufzuheben. Mit den Pfeiltasten geht es beliebig weit. Ein geparktes Teil gehört weiter zum Entwurf und landet mit im Export. Soll es draußen bleiben, blende es aus oder exportiere nur die Auswahl. Hast du einen Drucker gewählt, warnt layerling beim Export, wenn etwas außerhalb seiner Platte liegt.

## Fangen beim Verschieben

Ziehst du eine Form über die Arbeitsebene, rastet sie an anderen Formen ein: Ihre linke, rechte, vordere oder hintere Kante oder ihre Mitte legt sich genau auf eine Kante oder Mitte einer anderen Form. Eine rosa Hilfslinie zeigt, woran sie gerade hängt. So stellst du zwei Teile bündig nebeneinander oder mittig hintereinander, ohne Zahlen einzutippen. Das gilt auch, wenn das Raster ausgeschaltet ist.

Hältst du beim Ziehen [[Umschalt]] gedrückt, bleibt die Bewegung auf einer Achse: Die Form folgt der Richtung, X oder Y, in die du weiter gezogen hast, und lässt die andere unberührt. Drück [[Umschalt]] am besten erst, wenn du schon ziehst; auf einer Form, die noch nicht ausgewählt ist, nimmt ein Klick mit [[Umschalt]] sie nur zur Auswahl dazu.

Ist [[Alt]] schon gedrückt, wenn das Ziehen beginnt, ziehst du eine Kopie, wie in Tinkercad: Die Form bleibt, wo sie ist, und die Kopie landet dort, wo du loslässt. Drückst du [[Alt]] erst unterwegs, setzt das Fangen aus und die Form folgt nur dem Raster. Auch beim Ziehen einer Kopie fängt sie erst, wenn du [[Alt]] unterwegs loslässt. Ganz abschalten lässt sich das Fangen im Rastermenü unten rechts ({{ui:inspector.objectSnap}}) oder in den Einstellungen. Bisher fängt nur das Verschieben auf der normalen Arbeitsebene, nicht das Anheben und nicht die Größenänderung.

## Ausrichten

Zwei oder mehr ausgewählte Formen richtest du mit {{ui:editor.tool.align}} aneinander aus: Am Rand der Auswahl erscheinen Punkte für links, mittig und rechts, vorn, mittig und hinten sowie oben, mittig und unten. Ein Klick auf einen Punkt schiebt alle Formen dorthin. Klickst du zuerst eine der ausgewählten Formen an, bleibt sie an ihrem Platz und die anderen richten sich nach ihr.

![Das Ausrichten zeigt an den Rändern der Auswahl die möglichen Ziele als Punkte.](shot:align)

Die Taste dafür ist [[L]]. [[Esc]] bricht ab.

## Spiegeln

{{ui:editor.tool.mirror}} ([[M]]) kippt die Auswahl an einer Ebene: {{ui:mirror.leftRight}}, {{ui:mirror.frontBack}} oder {{ui:mirror.topBottom}}. Klicke dazu auf den passenden Achsenpfeil. Das ist praktisch für symmetrische Teile: Baue eine Hälfte, kopiere sie und spiegele die Kopie.

## Drehen und den Drehpunkt setzen

Gedreht wird mit den gebogenen Pfeilen an der Form, mit den Zahlen in den Einstellungen oder mit [[R]] in 45°-Schritten. Normalerweise dreht sich die Auswahl um ihre Mitte. Manchmal soll sie das nicht, etwa wenn ein gekipptes Rohr an seinem Ende weitergedreht werden soll. Dafür gibt es {{ui:editor.tool.rotationPivot}}: Klicke danach auf eine Fläche. Eine ebene Fläche gibt ihren Mittelpunkt vor, zum Beispiel die Achse eines Rohrendes. Die Auswahl dreht sich jetzt um diesen Punkt. Ein zweiter Klick auf das Werkzeug oder eine neue Auswahl hebt ihn wieder auf.

## Auf eine Fläche legen

Ein Teil soll für den Druck auf seiner besten Seite liegen? Wähle es aus, klicke auf {{ui:editor.tool.layFlat}} und dann auf die Fläche, die nach unten soll. Das Teil dreht sich so, dass diese Fläche auf der Arbeitsebene liegt.

Ähnlich einfach sind {{ui:editor.tool.dropToWorkplane}} ([[D]]), das die Auswahl auf die Arbeitsebene absetzt, und {{ui:editor.tool.centerOnWorkplane}}.

## Muster: Reihe und Kreis

Für Lochraster, Lochkreise und Zahnkränze gibt es das {{ui:editor.tool.array}}. Wähle die Formen aus, die vervielfältigt werden sollen, und klicke im Menüband darauf.

![Das Muster im Modus „Kreis“: Die Kopien erscheinen zuerst als Vorschau.](shot:pattern-tool)

- **{{ui:array.mode.row}}:** Die Auswahl wird mit gleichem Abstand wiederholt. Wähle die Richtung (X, Y oder Höhe) und den {{ui:array.spacing}}. Ein negativer Abstand legt die Reihe in die andere Richtung.
- **{{ui:array.mode.circle}}:** Die Auswahl wird um einen Mittelpunkt verteilt. Wie viele Kopien es gibt, stellst du bei {{ui:array.count}} ein, der {{ui:array.angle}} ist für einen vollen Kreis 360°. Stelle ein, ob sich die Kopien mitdrehen sollen.

Tipp: Setze vorher mit {{ui:editor.tool.rotationPivot}} den Drehpunkt auf eine Fläche, dann liegt der Mittelpunkt des Kreises genau dort.

Die Kopien erscheinen zuerst als Vorschau. Erst {{ui:array.apply}} legt sie an. Sind die Kopien Aussparungen, gruppierst du sie danach mit dem Körper, in den sie schneiden sollen.

## Rückgängig machen

{{ui:editor.tool.undo}} ([[Strg]]+[[Z]]) und {{ui:editor.tool.redo}} ([[Strg]]+[[Umschalt]]+[[Z]] oder [[Strg]]+[[Y]]) gehen Schritt für Schritt durch deinen Verlauf. Wie viele Schritte mit dem gespeicherten Entwurf mitreisen, stellst du in den Einstellungen unter {{ui:workspace.history}} ein.
