---
title: Avanceret tilstand og formler
summary: Formler i talfelter, variabler, legemer der følger andre legemer, variabeltabellen og formeleditoren - alt slået til med avanceret tilstand.
---

## Slå avanceret tilstand til

Nogle designs er lettere, når én værdi styrer andre: et låg, der altid er 0,4 mm mindre end sin æske, huller med samme vægtykkelse imellem, en del, der står ved siden af en anden, uanset hvor den flytter hen. Avanceret tilstand tilføjer formler og variabler til det. Slå {{ui:workspace.advancedMode}} til i {{ui:editor.workspaceSettings}} på fanen {{ui:workspace.appearance}}. Ingen andre møder noget af det: i normal og enkel tilstand forbliver felterne, inspektøren og båndet, som de er.

Et design med formler åbner også uden avanceret tilstand. Det viser de seneste værdier fra sine formler, og en besked siger, at det bruger formler, med {{ui:advanced.switchOn}}. En værdi, du ændrer der, er derefter et almindeligt tal: dens formel forsvinder, så det at skifte tilbage aldrig fortryder din ændring.

## Formler i talfelter

I avanceret tilstand tager hvert talfelt i inspektøren en formel. Skriv den som en udregning:

| Skriv | Betydning |
| --- | --- |
| `$wall * 2` | det dobbelte af variablen `wall` fra variabeltabellen |
| `$lid.size.width - 0.4` | bredden af legemet med navnet `lid`, minus 0,4 |
| `$lid.position.x + 30` | 30 til højre for `lid` |
| `$self.size.width / 2` | halvdelen af dette legemes egen bredde |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | afrunding (halve væk fra nul), kvadratrod, sinus og cosinus i grader, pi |

Navne begynder med `$`. Store og små bogstaver betyder ikke noget: `$Wall` og `$wall` er det samme. Tal står i den enhed, designet viser sine felter i; der er ingen enheder i en formel.

Et felt, som en formel styrer, er farvet og mærket *fx*. Klik i det, og formlen kommer tilbage, så du kan ændre den. En formel, der ikke kan regnes ud - et navn, der ikke findes, en division med nul, to formler, der afhænger af hinanden - farver feltet rødt, og dets værktøjstip siger hvorfor. Feltet beholder imens sin seneste værdi. Skriver du et almindeligt tal i feltet, forsvinder formlen igen. Målfelterne på arbejdsfladen gør det samme: en bredde, længde, højde eller højde over pladen, som en formel styrer, viser *fx* i sit felt, og et klik åbner feltet med formlen, med *fx* foran, som åbner formeleditoren.

## Giv et legeme et variabelnavn

En formel kan læse ethvert felt fra et legeme med et variabelnavn. Giv det et i {{ui:formula.variableName}} øverst i inspektøren: bogstaver, cifre og `_`, ikke med et ciffer først og ikke det samme som et andet legeme eller en variabel. Dets felter hedder så:

| Felt | I en formel |
| --- | --- |
| Bredde, længde, højde, diameter | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; på et rundt legeme er bredde og længde dets diameter |
| Position X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Rotation X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Drejepunkt X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Tilspidsning, vridning og formens egne indstillinger | grupperet efter, hvad de hører til, for eksempel `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; efter `$name.` viser formeleditoren dem alle |

Omdøber du legemet, ændres navnet i hver formel, der bruger det. En kopi af et navngivet legeme - indsat, duplikeret eller importeret - beholder ikke navnet, da to legemer ikke kan dele det; en kort besked siger det.

## Variabeltabellen

{{ui:variables.title}} åbner med sin knap i båndet eller med [[Ctrl]]+[[Shift]]+[[V]]. Hver række har et navn, en værdi eller formel, dens resultat og en kort beskrivelse. {{ui:variables.add}} tilføjer en række; skraldespanden fjerner en. En ændring tæller, så snart du trykker [[Enter]] eller forlader cellen, og [[Ctrl]]+[[Z]] fortryder den som ethvert andet trin. Et resultat, der ikke kan regnes ud, viser et rødt mærke; dets værktøjstip siger hvorfor. Omdøber du en række, ændres navnet i hver formel. Under tabellen ser du, hvilke legemer der har et variabelnavn. Vinduet kan flyttes i sin titel og gøres større i sit nederste højre hjørne.

## Formeleditoren

En længere formel er lettere at skrive i formeleditoren: klik på *fx* i starten af et felt, som en formel styrer, eller klik i et hvilket som helst felt og derefter på det *fx*, der dukker op i starten af det. Den viser resultatet, mens du skriver, eller hvorfor der ikke er noget. Efter `$` viser den variablerne og de navngivne legemer, efter `$name.` det legemes felter, hver med sin værdi; piletasterne og [[Enter]] eller [[Tab]] vælger et. [[Enter]] anvender derefter formlen, [[Shift]]+[[Enter]] starter en ny linje, så en lang formel forbliver læselig, og [[Esc]] lukker editoren uden ændring. Den kan flyttes i sin titel.

## Når værdier flytter sig

Alt, hvad der afhænger af en ændret værdi, følger med med det samme, som ét trin i historikken: et legeme, der følger `lid`, flytter sig, når `lid` vokser. Et par ting er gode at vide:

- **At trække et felt med en formel** beholder formlen og lægger forskellen til: `$wall * 2` trukket 5 mm længere bliver til `$wall * 2 + 5`. At flytte et legeme sammen med det legeme, det følger, ændrer intet i dets formel.
- **Et låst legeme** følger ikke sine formler; dets felt siger det.
- **Dele inde i en gruppe** beholder deres formler og variabelnavne, når gruppen er lukket, og formler kan læse dem. Når en værdi, de afhænger af, ændres, bygges gruppen igen et øjeblik efter resten, i samme trin i historikken. Flyttes eller strækkes gruppen, skrives forskellen på dens deles formler, som når du trækker. En gruppe med egne afrundinger eller affasninger bygges ikke igen; åbn den med {{ui:group.edit}} for at opdatere den.
