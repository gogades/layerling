---
title: Erweiterter Modus und Formeln
summary: Formeln in Zahlenfeldern, Variablen, Körper, die anderen Körpern folgen, die Variablentabelle und der Formeleditor - alles eingeschaltet mit dem erweiterten Modus.
---

## Den erweiterten Modus einschalten

Manche Designs sind einfacher, wenn ein Wert andere bestimmt: ein Deckel, der immer 0,4 mm kleiner ist als seine Dose, Löcher im Abstand derselben Wandstärke, ein Teil, das neben einem anderen sitzt, wohin das auch geht. Der erweiterte Modus bringt dafür Formeln und Variablen. Schalte {{ui:workspace.advancedMode}} unter {{ui:editor.workspaceSettings}} ein, im Reiter {{ui:workspace.appearance}}. Sonst begegnet niemandem etwas davon: Im normalen und im einfachen Modus bleiben die Felder, der Inspektor und die Leiste, wie sie sind.

Ein Design mit Formeln öffnet sich auch ohne den erweiterten Modus. Es zeigt die letzten Werte seiner Formeln, und ein Hinweis sagt, dass es Formeln verwendet, mit {{ui:advanced.switchOn}}. Ein Wert, den du dort änderst, ist danach eine einfache Zahl: Seine Formel fällt weg, sodass das Zurückschalten deine Änderung nie rückgängig macht.

## Formeln in Zahlenfeldern

Im erweiterten Modus nimmt jedes Zahlenfeld des Inspektors eine Formel an. Tippe sie wie eine Rechnung:

| Schreibe | Bedeutung |
| --- | --- |
| `$wall * 2` | das Doppelte der Variable `wall` aus der Variablentabelle |
| `$lid.size.width - 0.4` | die Breite des Körpers namens `lid`, weniger 0,4 |
| `$lid.position.x + 30` | 30 rechts von `lid` |
| `$self.size.width / 2` | die Hälfte der eigenen Breite dieses Körpers |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | runden (Hälften von null weg), Quadratwurzel, Sinus und Kosinus in Grad, Pi |

Namen beginnen mit `$`. Groß- und Kleinschreibung spielt keine Rolle: `$Wall` und `$wall` sind dasselbe. Zahlen stehen in der Einheit, in der das Design seine Felder zeigt; in einer Formel gibt es keine Einheiten.

Ein Feld, das eine Formel bestimmt, ist getönt und mit *fx* markiert. Klicke hinein, und die Formel kommt zum Ändern zurück. Eine Formel, die sich nicht ausrechnen lässt - ein Name, den es nicht gibt, eine Division durch null, zwei Formeln, die voneinander abhängen - färbt das Feld rot, und sein Tooltip sagt, warum. Das Feld behält solange seinen letzten Wert. Eine einfache Zahl ins Feld getippt nimmt die Formel wieder weg.

## Einem Körper einen Variablennamen geben

Eine Formel kann jedes Feld eines Körpers lesen, der einen Variablennamen hat. Gib ihm einen unter {{ui:formula.variableName}}, ganz oben im Inspektor: Buchstaben, Ziffern und `_`, nicht mit einer Ziffer beginnend und nicht gleich wie ein anderer Körper oder eine Variable. Seine Felder heißen dann so:

| Feld | In einer Formel |
| --- | --- |
| Breite, Länge, Höhe, Durchmesser | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; bei einem runden Körper sind Breite und Länge sein Durchmesser |
| Position X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Drehung X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Drehpunkt X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Verjüngung, Verdrehung und die eigenen Einstellungen der Form | nach Zugehörigkeit gruppiert, zum Beispiel `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; nach `$name.` listet der Formeleditor alle auf |

Wird der Körper umbenannt, ändert sich der Name in jeder Formel, die ihn verwendet. Eine Kopie eines benannten Körpers - eingefügt, dupliziert oder importiert - behält den Namen nicht, da zwei Körper keinen gemeinsamen haben können; eine kurze Meldung sagt das.

## Die Variablentabelle

{{ui:variables.title}} öffnet sich mit ihrem Knopf in der Leiste oder mit [[Strg]]+[[Umschalt]]+[[V]]. Jede Zeile hat einen Namen, einen Wert oder eine Formel, ihr Ergebnis und eine kurze Beschreibung. {{ui:variables.add}} fügt eine Zeile hinzu; der Papierkorb entfernt eine. Eine Änderung zählt, sobald du [[Enter]] drückst oder die Zelle verlässt, und [[Strg]]+[[Z]] nimmt sie zurück wie jeden anderen Schritt. Ein Ergebnis, das sich nicht ausrechnen lässt, zeigt ein rotes Zeichen; sein Tooltip sagt, warum. Wird eine Zeile umbenannt, ändert sich der Name in jeder Formel. Unter der Tabelle siehst du, welche Körper einen Variablennamen haben. Das Fenster lässt sich an seinem Titel verschieben und an seiner rechten unteren Ecke vergrößern.

## Der Formeleditor

Eine längere Formel schreibt sich leichter im Formeleditor: Klicke in ein Feld und dann auf den kleinen Knopf *fx* an seinem Ende. Er zeigt das Ergebnis, während du tippst, oder warum es keines gibt. Nach `$` listet er die Variablen und benannten Körper auf, nach `$name.` die Felder dieses Körpers, jedes mit seinem Wert; die Pfeiltasten und [[Enter]] oder [[Tab]] übernehmen einen Eintrag. [[Enter]] übernimmt dann die Formel, [[Umschalt]]+[[Enter]] beginnt eine neue Zeile, damit eine lange Formel lesbar bleibt, und [[Esc]] schließt den Editor ohne Änderung. Er lässt sich an seinem Titel verschieben.

## Wenn sich Werte bewegen

Alles, was von einem geänderten Wert abhängt, folgt ihm sofort, als ein Schritt des Verlaufs: Ein Körper, der `lid` folgt, bewegt sich, wenn `lid` wächst. Ein paar Dinge sind gut zu wissen:

- **Ein Feld mit Formel ziehen** behält die Formel und rechnet den Unterschied dazu: `$wall * 2` um 5 mm weiter gezogen wird zu `$wall * 2 + 5`. Wird ein Körper zusammen mit dem Körper verschoben, dem er folgt, ändert sich an seiner Formel nichts.
- **Ein gesperrter Körper** folgt seinen Formeln nicht; sein Feld sagt es.
- **Teile in einer Gruppe** behalten ihre Formeln und Variablennamen, wenn die Gruppe geschlossen ist, und Formeln können sie lesen. Ändert sich ein Wert, von dem sie abhängen, wird die Gruppe einen Moment nach dem Rest neu aufgebaut, im selben Schritt des Verlaufs. Wird die Gruppe verschoben oder gestreckt, kommt der Unterschied auf die Formeln ihrer Teile, wie beim Ziehen. Eine Gruppe mit eigenen Rundungen oder Fasen wird nicht neu aufgebaut; öffne sie mit {{ui:group.edit}}, um sie zu aktualisieren.
