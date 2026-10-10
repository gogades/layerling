---
title: Gewinde, Zahnräder und andere Bauteile
summary: Schrauben, Muttern und Gewindelöcher, die zusammenpassen, dazu Zahnrad, Feder, gebogenes Rohr, Wabengitter, Schwalbenschwanz, Tropfenbohrung sowie Stufen- und Senkbohrung.
---

Die Formenbibliothek enthält neben den Grundformen einige Bauteile, die man sonst mühsam zusammensetzen müsste. Alle lassen sich nachträglich in ihren Einstellungen ändern.

## Gewinde

Wähle {{ui:shape.thread}} in der Formenbibliothek. Unter {{ui:inspector.threadRole}} entscheidest du, was es sein soll:

- **{{ui:thread.rod}}:** ein Zylinder mit Gewinde, zum Beispiel eine Schraube ohne Kopf.
- **{{ui:thread.screw}}:** mit Kopf. Die {{ui:inspector.threadHead}} wählst du aus: {{ui:thread.headCylinder}}, {{ui:thread.headCountersunk}} oder {{ui:thread.headHex}}.
- **{{ui:thread.nut}}:** die passende Mutter.
- **{{ui:thread.bore}}:** ein Gewindeloch. Es ist eine Aussparung. Ziehe es in ein Teil, gruppiere beides, und das Teil hat ein Innengewinde.

![Eine Schraube mit Zylinderkopf. Rechts stehen Art und Kopfform, weiter unten Größe, Steigung und Profil.](shot:thread-screw)

Die Größe suchst du bei {{ui:prop.threadSize}} aus einer Liste: metrisch von M2 bis M12, die Zollgrößen UNC und UNF von Nr. 4 bis 1 Zoll und die Rohrgewinde G1/16 bis G4. Wählst du {{ui:thread.customSize}}, bestimmst du {{ui:prop.diameter}} und {{ui:prop.pitch}} selbst. Bei einer Zoll- oder G-Größe fragt das Feld nach {{ui:prop.threadsPerInch}} statt nach der Steigung in Millimetern.

Die Liste ordnet die Größen nach Reihen, und eine Zeile unter dem Feld nennt die Reihe der gewählten Größe, mit Beispielen aus dem Alltag:

- **M, Regelgewinde:** das metrische ISO-Regelgewinde nach ISO 261, wie bei Normschrauben und -muttern.
- **UNC, US-Zoll grob:** Die Kamera- und Stativschraube ist 1/4"-20 UNC (ISO 1222), größere Stativköpfe nehmen 3/8"-16 UNC.
- **UNF, US-Zoll fein:** dieselben Durchmesser wie UNC mit feinerer Steigung (ASME B1.1).
- **G, Rohrgewinde:** Ein Duschschlauch wird mit G1/2 angeschlossen, ein Waschmaschinen-Zulaufschlauch mit G3/4. Ein Gartenwasserhahn endet in G3/4, kleinere Hähne in G1/2; dort wird der Hahnverbinder eines Schlauch-Stecksystems aufgeschraubt.

Die G-Größen sind die zylindrischen Whitworth-Rohrgewinde nach ISO 228-1, wie sie an Fittings für Wasser, Gas, Hydraulik und Pneumatik sitzen. Die Größe nennt das Rohr, nicht das Gewinde: Ein G1 misst über das Gewinde 33,249 mm. Wählst du eine G-Größe, wechselt das Profil auf {{ui:thread.profileWhitworth}}, eine metrische oder Zollgröße stellt es wieder auf {{ui:thread.profileV}}. Ein {{ui:thread.profileTrapezoidal}} oder {{ui:thread.profileRound}}, das du selbst gewählt hast, bleibt. Die Norm legt nur das Gewinde fest; Schraubenkopf und Mutter bekommen bei einer G-Größe dieselben Verhältnisse wie bei einem selbst gewählten Durchmesser. Die kegeligen Rohrgewinde R, Rc und Rp sind nicht dabei.

Weitere Einstellungen:

- **{{ui:prop.threadHand}}:** {{ui:thread.right}} oder {{ui:thread.left}}.
- **{{ui:prop.threadProfile}}:** {{ui:thread.profileV}} ist das genormte Profil der metrischen und Zollgewinde, {{ui:thread.profileWhitworth}} das der G-Rohrgewinde: 55° mit gerundeten Spitzen und Tälern. {{ui:thread.profileTrapezoidal}} und {{ui:thread.profileRound}} haben flache Spitzen und Täler. Das druckt sich meist zuverlässiger, weil keine dünnen Spitzen entstehen.
- **{{ui:prop.clearance}}:** Bei Mutter und Gewindeloch der Spielraum, der dafür sorgt, dass ein gedrucktes Paar sich wirklich dreht. Je gröber dein Drucker arbeitet, desto mehr Spiel braucht das Paar. Bei Gewindestange und Schraube steht hier ein eigenes Spiel, das den Bolzen im Durchmesser um diesen Wert dünner macht. Es ist auf 0 gestellt. Brauchst du es, weil ein gedruckter Bolzen in eine Mutter aus Metall soll, die selbst kein Spiel hat, sind 0,2 bis 0,3 mm ein guter Anfang.
- **{{ui:prop.chamfer}}, {{ui:prop.headChamfer}} und {{ui:prop.rimChamfer}}:** Fasen an den Enden, damit das Gewinde sauber anläuft und der Kopf keine scharfe Kante hat.
- **{{ui:prop.quality}}:** Wie fein das Gewinde berechnet wird. Höher ist genauer, aber langsamer.

Gedruckte Gewinde sind eine Sache für sich. Stelle die Pärchen aus Schraube und Mutter zuerst als Test her, bevor du ein großes Teil druckst, und passe das Spiel an deinen Drucker an.

Das Kantenwerkzeug nimmt ein Gewinde als exakten Körper. Du kannst das Teil, in dem es sitzt, mit dem Gewinde darin fasen oder verrunden, ebenso die Kanten eines Schraubenkopfs, siehe [Kanten brechen und Körper aushöhlen](chapter:kanten-und-aushoehlen). Die Kanten eines Gewindes zu ermitteln dauert etwas: ein paar Sekunden bei M6, etwa eine halbe Minute bei einem G1/2-Rohrgewinde. Am schnellsten brichst du die Kante eines Schraubenkopfs aber weiterhin mit der Kopffase in den Eigenschaften.

## Zahnräder

{{ui:shape.gear}} gibt es als {{ui:gear.spur}}, {{ui:gear.helical}} und {{ui:gear.bevel}}. Neue Zahnräder haben unter {{ui:prop.gearProfile}} die {{ui:gear.profileInvolute}}: Zähne mit Evolventenflanken, wie sie Zahnradgeneratoren und der Maschinenbau verwenden. Solche Zähne rollen sauber aufeinander ab. Du stellst die Zahl der {{ui:prop.teeth}} und den {{ui:prop.gearModule}} ein, daraus folgt die Größe: Der Außendurchmesser ist Modul × (Zähne + 2), der Teilkreis Modul × Zähne. Neue Räder starten mit Modul 2. Zwei Räder greifen ineinander, wenn sie denselben Modul und denselben {{ui:prop.gearPressureAngle}} haben (meist 20°) und ihre Mitten (Zähne + Zähne) × Modul / 2 auseinanderstehen. Wählst du beide Räder aus, nennt das Eigenschaftenfeld diesen Achsabstand und wie weit die Mitten gerade auseinanderstehen. Steht dabei Zahn auf Zahn statt Zahn in Lücke, drehst du eines der Räder um einen halben Zahn, also um 180° geteilt durch seine Zähnezahl. {{ui:prop.gearBacklash}} nimmt den Zähnen etwas Dicke, damit ein gedrucktes Paar nicht klemmt. Der Wert gilt für das Paar, jedes Rad nimmt die Hälfte davon; 0,2 mm ist ein guter Anfang, 0 ergibt das genaue Rad. Unter dem Grundkreis läuft die Flanke gerade zum Fuß hinunter und wird nicht hinterschnitten wie beim Fräsen. Zum Drucken passt das, ein sehr kleines Ritzel unter etwa 17 Zähnen kann am Fuß aber leicht streifen.

Beim Schrägrad kommt der {{ui:prop.helixAngle}} dazu. Bei Evolventenzähnen ist das der echte Schrägungswinkel am Teilkreis: Zwei Schrägräder greifen ineinander, wenn sie denselben Modul und denselben Winkel haben, das eine positiv und das andere negativ. Das Kegelrad nimmt die Evolventenzähne und lässt sie zur Oberseite hin kleiner werden. Das ist eine Näherung, kein genau berechnetes Kegelradpaar.

{{ui:gear.profileRound}} sind runde Zähne aus Kreisbögen, wie beim „Useful gear“ in Tinkercad: Zahnkopf und Zahnlücke gehen ohne Ecke ineinander über. Kleine Zahnräder lassen sich so gutmütiger drucken und laufen leichter, und an einem Drehknopf ergibt die Zahnform einen angenehmen Griff. Auch runde Zähne stellst du über {{ui:prop.teeth}}, {{ui:prop.gearModule}} und {{ui:prop.gearBacklash}} ein; einen Eingriffswinkel haben sie nicht. Sie stehen niedriger als Evolventenzähne, darum ist der Außendurchmesser Modul × (Zähne + 1,2). Runde Räder mit demselben Modul greifen ineinander, beim selben Achsabstand wie Evolventenräder; mit einem Evolventenrad passen sie nicht zusammen.

{{ui:gear.profileSimple}} sind die geraden Zähne, die alle Zahnräder bisher hatten. Dort stellst du {{ui:prop.toothSize}} und {{ui:prop.toothWidth}} von Hand ein. Ältere Entwürfe behalten sie, bis du die Zahnform umstellst. Die {{ui:prop.centerHole}} gibt es bei allen drei Zahnformen.

Das Kantenwerkzeug und der STEP-Export nehmen jedes Zahnrad als exakten Körper, die Evolventenflanken als glatte Kurven. Ein Schrägrad auf ovaler Grundfläche bleibt ein Dreiecksnetz, ebenso ein Schrägrad mit Evolventenzähnen ab etwa 31 Zähnen. Kleine Zähne begrenzen, wie stark sich Kanten verrunden lassen: Bei einem Rad mit einfachen Zähnen, 30 mm Durchmesser und 12 Zähnen ist die Fläche zwischen zwei Zähnen am Fuß nur etwa 0,65 mm breit, alle Kanten zu verrunden geht deshalb bis etwa 0,5 mm, beim Kegelrad mit seiner kleineren Oberseite bis etwa 0,4 mm. Die Zähne eines Schrägrads stehen schräg, das macht diese Fläche quer zu ihren schrägen Kanten noch schmaler: Je größer der Schrägungswinkel im Verhältnis zur Höhe des Rads, desto kleiner die Rundung, die passt. Beim Schrägrad lassen sich die Kanten der beiden flachen Enden verrunden, nur diese Kanten zu fasen scheitert aber im CAD-Kern; verrunde sie oder fase alle Kanten zusammen mit kleinerem Maß, etwa 0,2 mm.

## Federn

Die {{ui:shape.spring}} hat {{ui:prop.turns}} und eine {{ui:prop.wire}}. Zusammen mit der Höhe bestimmen sie, wie weich die Feder wird. Unter {{ui:prop.springHand}} wählst du, wie herum der Draht läuft: {{ui:spring.right}} wie bei einer üblichen Druckfeder, oder {{ui:spring.left}}.

Das Kantenwerkzeug und der STEP-Export nehmen eine Feder als exakten Körper: ein runder Draht entlang einer Schraubenlinie, an beiden Enden gerade abgeschnitten. Diese beiden Drahtenden kannst du zum Beispiel verrunden oder fasen.

## Gebogene Rohre

Ein {{ui:shape.bentTube}} besteht aus bis zu zwölf Abschnitten: ein gerades Stück, gefolgt von einer Biegung. Für jedes stellst du die {{ui:prop.bentTubeSegmentLength}}, den {{ui:prop.bentTubeBendAngle}}, den {{ui:prop.bentTubeBendRadius}} und den {{ui:prop.bentTubeRoll}} ein. Der Abschnitt, den du gerade bearbeitest, leuchtet auf dem Rohr orange auf, so behältst du die Reihenfolge im Blick. Ein Rollwinkel von 0° biegt in der Ebene der Arbeitsfläche, bei 90° biegt das Rohr nach oben. Das Profil kann rund, quadratisch, sechs- oder achteckig sein, innen ebenso, oder ganz massiv. Läuft das Rohr in sich selbst, warnt dich layerling.

## Übergang

Der {{ui:shape.loft}} verbindet einen Umriss unten mit einem anderen oben, wie ein Loft in Fusion: ein Schlauchadapter von einem Durchmesser auf einen anderen, ein eckiger Lüfter auf ein rundes Rohr, ein Sockel, der nach oben rund wird. Für beide Enden wählst du {{ui:prop.loftBottomOutline}} und {{ui:prop.loftTopOutline}}: {{ui:loft.round}}, {{ui:loft.rectangle}} mit {{ui:prop.loftBottomCorner}} oder {{ui:loft.polygon}} mit seiner Eckenzahl, dazu Breite und Länge jedes Endes und die Höhe. Mit {{ui:prop.loftOffsetX}} und {{ui:prop.loftOffsetZ}} sitzt das obere Ende seitlich versetzt, für einen schrägen Übergang; das untere Ende bleibt dabei stehen.

{{ui:prop.loftWall}} macht aus dem vollen Körper ein Rohr, das oben und unten offen ist. Die Öffnung ist an beiden Enden um die Wandstärke kleiner, waagerecht gemessen; wo die Wand schräg steht, ist sie also etwas dünner. Ziehst du den Rahmen größer, wachsen beide Enden mit, Eckenradius und Wand bleiben gleich.

{{ui:prop.loftTwist}} dreht den Querschnitt auf dem Weg nach oben gleichmäßig um die Hochachse, bis zu 360° in beide Richtungen; die Seiten winden sich dann. {{ui:prop.loftTiltX}} und {{ui:prop.loftTiltZ}} kippen das obere Ende, bis zu 45°: Ein positiver Wert hebt seine Vorderkante beziehungsweise seine rechte Seite. Die Schnitte dazwischen kippen anteilig mit, so dass die Wand weich in die Schräge läuft. Der höchste Punkt bleibt auf der eingestellten Höhe. Wird die Höhe später so klein, dass das schräge Ende unter die Platte reichen würde, gibt die Neigung so weit nach, dass es passt. Einen Bogen entlang eines Pfads, etwa einen Rohrkrümmer, macht der Übergang nicht.

Der Übergang ist ein exakter Körper, auch verdreht und gekippt: Seine Kanten lassen sich fasen und verrunden, und der STEP-Export behält ihn. Einen Flansch mit Schraubenlöchern setzt du wie gewohnt dazu und gruppierst.

## Wabengitter

Das {{ui:shape.honeycomb}} ist eine Platte mit sechseckigen Aussparungen: leicht, stabil und schön anzusehen. Die {{ui:prop.honeycombCellSize}}, die {{ui:prop.honeycombWallThickness}} und die {{ui:prop.honeycombFrameWidth}} legen das Aussehen fest.

## Scharnier

Das {{ui:shape.hinge}} wird in einem Stück gedruckt und bewegt sich danach (print-in-place): zwei Blätter, die aufgeklappt flach auf der Platte liegen, dazwischen abwechselnde Knöchel auf einer Achse. Der Stift gehört zum hinteren Blatt und läuft mit Spiel durch die Knöchel des vorderen. Du stellst die {{ui:prop.hingeLength}}, die {{ui:prop.hingeOpenWidth}} und den {{ui:prop.hingeKnuckleDiameter}} ein, dazu die Zahl der {{ui:prop.hingeKnuckles}} (ungerade, damit der Stift an beiden Enden hält), den {{ui:prop.hingePinDiameter}} und die {{ui:prop.hingeLeafThickness}}.

{{ui:prop.hingeClearance}} ist der Abstand zwischen den beweglichen Teilen: um den Stift, zwischen den Knöcheln und vor den Blättern. Mit 0,4 mm löst sich ein gut eingestellter Drucker meist mit einer kleinen Drehung; verwachsen die Teile, nimm mehr, wackelt es zu sehr, weniger. Drucke das Scharnier liegend, so wie es auf der Platte erscheint, ohne Stützen. Die Blätter kannst du mit Bohrungen versehen oder in ein größeres Teil gruppieren, etwa einen Deckel.

## Rändelung

Die {{ui:shape.knurl}} ist ein runder Griff mit Rillen ringsum, für Drehknöpfe, Stellräder und Werkzeuggriffe. Unter {{ui:prop.knurlPattern}} wählst du {{ui:knurl.straight}}, also Rillen längs der Achse wie an einem Drehknopf, {{ui:knurl.diamond}}: Zwei schräge Rillenreihen kreuzen sich zu kleinen Rauten, oder {{ui:knurl.round}}: Rillen und Rippen längs der Achse als weiche Wellenkante aus Kreisbögen, ein angenehmer Griff ohne scharfe Grate. Die runden Rillen bleiben flacher als eine halbe Teilung, sonst würden die Rippen am Fuß bauchig; eine zu große Tiefe gibt darum nach. Du stellst {{ui:prop.diameter}} und {{ui:prop.height}} ein, die Zahl der {{ui:prop.knurlCount}} und die {{ui:prop.knurlDepth}}; bei der gekreuzten Rändelung dazu den {{ui:prop.knurlAngle}} zur Achse. Die {{ui:prop.knurlChamfer}} bricht beide Enden unter 45°, wie bei einem gedrehten Knopf; 0 lässt sie scharf.

Die gerade und die runde Rändelung sind exakte Körper, ihre Kanten lassen sich brechen und runden. Die gekreuzte bleibt ein Netz, denn als exakter Körper bräuchte sie bei 30 Rillen schon fast eine Minute zum Rechnen. Für einen Knopf auf einer Achse gruppierst du die Rändelung mit einer Bohrung, etwa einem {{ui:shape.thread}} als Gewindeloch. Rillen unter 0,4 mm Tiefe druckt kaum ein Drucker sauber, und enger als 0,8 mm am Umfang lässt layerling die Rillen gar nicht erst stehen: Ein dünner Griff bekommt entsprechend weniger.

## Schwalbenschwanz

Der {{ui:shape.dovetail}} ist die Verbindung, bei der zwei Teile ineinander einrasten und sich nur seitlich zusammenschieben lassen. Du stellst die Breite am breiten Ende, die {{ui:prop.dovetailNeckWidth}} und die Länge des Zapfens ein. Kopiere den Zapfen für die Gegenseite und mache die Kopie zur Aussparung: {{ui:prop.dovetailClearance}} sorgt dann für ein wenig Spiel, damit die Verbindung nach dem Druck nicht klemmt.

> **Tipp:** Ein Gewindeloch schneidet sich beim Gruppieren in das Teil, mit dem es sich überlappt. Setze es also ein Stück in das Material hinein und lasse es nicht nur an der Fläche anliegen.

## Tropfenbohrung

Ein Loch, das waagerecht im Teil liegt, bekommt beim Drucken oben eine Brücke, und die hängt durch. Die {{ui:shape.teardrop}} hat deshalb oben eine Spitze: Jede Schicht liegt auf der darunter, und das Loch wird ohne Stützen rund genug. Stelle den {{ui:prop.teardropDiameter}} auf das Maß des Lochs, etwa 3,4 mm für eine M3-Schraube, und die {{ui:prop.teardropLength}} so lang, dass sie durch das Teil reicht. Der {{ui:prop.teardropTipAngle}} steht auf 90°, die Flanken laufen also unter 45° zusammen. Das druckt bei den meisten Druckern sauber; flachere Spitzen brauchen mehr Höhe, steilere sparen sie.

Mache die Tropfenbohrung zur Aussparung und gruppiere sie mit dem Teil. Sie liegt mit der Länge in Richtung der Tiefe, die Spitze zeigt nach oben. Für ein Loch in der anderen Richtung drehst du sie um 90° um die senkrechte Achse.

## Stufen- und Senkbohrung

Ein Schraubenkopf soll oft nicht überstehen. Die {{ui:shape.counterbore}} schneidet dafür eine runde Tasche für einen Zylinderkopf (DIN 912), die {{ui:shape.countersink}} einen Kegel für eine Senkkopfschraube (DIN 7991). Beide stehen mit dem Kopf nach oben: Der {{ui:prop.screwHoleHead}} ist der Durchmesser der Tasche oder des Kegels, der {{ui:prop.screwHoleShaft}} die Bohrung darunter, die {{ui:prop.screwHoleLength}} die ganze Länge. Bei der Stufenbohrung stellst du die {{ui:prop.screwHoleHeadDepth}} ein, bei der Senkbohrung den {{ui:prop.screwHoleAngle}} (90° passt zu Senkschrauben). Die Vorgaben passen zu einer M3-Schraube.

Mache die Form zur Aussparung und gruppiere sie mit dem Teil. Lass ihre Oberseite ein Stück über der Fläche enden, auf der der Kopf sitzen soll, damit die Tasche sauber offen ist. Für die Tasche einer Sechskantmutter nimmst du einen {{ui:shape.polygon}} mit sechs Seiten als Aussparung.
