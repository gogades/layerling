---
title: Geavanceerde modus en formules
summary: Formules in getalvelden, variabelen, lichamen die andere lichamen volgen, de variabelentabel en de formule-editor - allemaal aangezet met de geavanceerde modus.
---

## De geavanceerde modus aanzetten

Sommige ontwerpen zijn eenvoudiger als één waarde andere bepaalt: een deksel dat altijd 0,4 mm kleiner is dan zijn doos, gaten op afstand van dezelfde wanddikte, een onderdeel dat naast een ander staat, waar dat ook heen gaat. De geavanceerde modus voegt daarvoor formules en variabelen toe. Zet {{ui:workspace.advancedMode}} aan in {{ui:editor.workspaceSettings}}, op het tabblad {{ui:workspace.appearance}}. Verder komt niemand er iets van tegen: in de normale en de eenvoudige modus blijven de velden, de inspector en het lint zoals ze zijn.

Een ontwerp met formules opent ook zonder de geavanceerde modus. Het toont de laatste waarden van zijn formules, en een melding zegt dat het formules gebruikt, met {{ui:advanced.switchOn}}. Een waarde die je daar verandert, is daarna een gewoon getal: de formule vervalt, zodat terugschakelen je wijziging nooit ongedaan maakt.

## Formules in getalvelden

In de geavanceerde modus neemt elk getalveld van de inspector een formule aan. Typ die zoals een berekening:

| Schrijf | Betekenis |
| --- | --- |
| `$wall * 2` | twee keer de variabele `wall` uit de variabelentabel |
| `$lid.size.width - 0.4` | de breedte van het lichaam `lid`, min 0,4 |
| `$lid.position.x + 30` | 30 rechts van `lid` |
| `$self.size.width / 2` | de helft van de eigen breedte van dit lichaam |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | afronden (helften van nul af), vierkantswortel, sinus en cosinus in graden, pi |

Namen beginnen met `$`. Hoofdletters en kleine letters maken niet uit: `$Wall` en `$wall` zijn hetzelfde. Getallen staan in de eenheid waarin het ontwerp zijn velden toont; in een formule staan geen eenheden.

Een veld dat een formule bepaalt, is getint en gemarkeerd met *fx*. Klik erin en de formule komt terug om te wijzigen. Een formule die niet uit te rekenen is - een naam die niet bestaat, een deling door nul, twee formules die van elkaar afhangen - kleurt het veld rood, en de tooltip zegt waarom. Het veld houdt zolang zijn laatste waarde. Een gewoon getal in het veld typen haalt de formule weer weg. De maatvakjes op het werkvlak doen hetzelfde: een breedte, lengte, hoogte of hoogte boven de plaat die een formule bepaalt, toont *fx* in zijn vakje, en een klik opent het vakje met de formule, met de *fx* ervoor die de formule-editor opent.

## Een lichaam een variabelenaam geven

Een formule kan elk veld lezen van een lichaam dat een variabelenaam heeft. Geef het er een in {{ui:formula.variableName}}, bovenaan in de inspector: letters, cijfers en `_`, niet beginnend met een cijfer en niet gelijk aan een ander lichaam of een variabele. De velden heten dan zo:

| Veld | In een formule |
| --- | --- |
| Breedte, lengte, hoogte, diameter | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; bij een rond lichaam zijn breedte en lengte de diameter |
| Positie X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Rotatie X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Draaipunt X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Taps, draaiing en de eigen instellingen van de vorm | gegroepeerd naar waar ze bij horen, bijvoorbeeld `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; na `$name.` toont de formule-editor ze allemaal |

Als je het lichaam hernoemt, verandert de naam in elke formule die hem gebruikt. Een kopie van een lichaam met een naam - geplakt, gedupliceerd of ingevoegd - houdt de naam niet, want twee lichamen kunnen er geen delen; een korte melding zegt dat.

## De variabelentabel

{{ui:variables.title}} opent met de knop in het lint of met [[Ctrl]]+[[Shift]]+[[V]]. Elke rij heeft een naam, een waarde of formule, het resultaat en een korte beschrijving. {{ui:variables.add}} voegt een rij toe; de prullenbak verwijdert er een. Een wijziging telt zodra je op [[Enter]] drukt of de cel verlaat, en [[Ctrl]]+[[Z]] neemt haar terug zoals elke andere stap. Een resultaat dat niet uit te rekenen is, toont een rood teken; de tooltip zegt waarom. Als je een rij hernoemt, verandert de naam in elke formule. Onder de tabel zie je welke lichamen een variabelenaam hebben. Het venster kun je aan zijn titel verplaatsen en aan de hoek rechtsonder groter maken.

## De formule-editor

Een langere formule schrijf je makkelijker in de formule-editor: klik op de *fx* aan het begin van een veld dat een formule stuurt, of klik in een willekeurig veld en dan op de *fx* die aan het begin verschijnt. Die toont het resultaat terwijl je typt, of waarom er geen is. Na `$` toont hij de variabelen en de lichamen met een naam, na `$name.` de velden van dat lichaam, elk met zijn waarde; met de pijltoetsen en [[Enter]] of [[Tab]] kies je er een. [[Enter]] past daarna de formule toe, [[Shift]]+[[Enter]] begint een nieuwe regel om een lange formule leesbaar te houden, en [[Esc]] sluit de editor zonder wijziging. Je kunt hem aan zijn titel verplaatsen.

## Als waarden bewegen

Alles wat van een gewijzigde waarde afhangt, volgt meteen, als één stap in de geschiedenis: een lichaam dat `lid` volgt, beweegt als `lid` groeit. Een paar dingen zijn goed om te weten:

- **Een veld met een formule slepen** houdt de formule en telt het verschil erbij op: `$wall * 2` 5 mm verder gesleept wordt `$wall * 2 + 5`. Een lichaam samen verplaatsen met het lichaam dat het volgt, verandert niets aan de formule.
- **Een vergrendeld lichaam** volgt zijn formules niet; het veld zegt het.
- **Onderdelen in een groep** houden hun formules en variabelenamen als de groep gesloten is, en formules kunnen ze lezen. Verandert een waarde waarvan ze afhangen, dan wordt de groep een moment na de rest opnieuw opgebouwd, in dezelfde stap van de geschiedenis. Verplaats of rek je de groep, dan komt het verschil op de formules van zijn onderdelen, zoals bij slepen. Een groep met eigen afrondingen of afschuiningen wordt niet opnieuw opgebouwd; open hem met {{ui:group.edit}} om hem bij te werken.
