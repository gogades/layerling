---
title: Avancerat läge och formler
summary: Formler i sifferfält, variabler, kroppar som följer andra kroppar, variabeltabellen och formelredigeraren - allt påslaget med avancerat läge.
---

## Slå på avancerat läge

Vissa designer blir enklare när ett värde styr andra: ett lock som alltid är 0,4 mm mindre än sin dosa, hål med samma väggtjocklek emellan, en del som står bredvid en annan var den än flyttas. Avancerat läge lägger till formler och variabler för det. Slå på {{ui:workspace.advancedMode}} i {{ui:editor.workspaceSettings}} på fliken {{ui:workspace.appearance}}. Ingen annan märker något av det: i normalt och enkelt läge förblir fälten, egenskapspanelen och verktygsfältet som de är.

En design med formler öppnas även utan avancerat läge. Den visar de senaste värdena från sina formler, och ett meddelande säger att den använder formler, med {{ui:advanced.switchOn}}. Ett värde som du ändrar där blir sedan ett vanligt tal: dess formel försvinner, så att ett byte tillbaka aldrig ångrar din ändring.

## Formler i sifferfält

I avancerat läge tar varje sifferfält i egenskapspanelen en formel. Skriv den som en uträkning:

| Skriv | Betyder |
| --- | --- |
| `$wall * 2` | dubbla variabeln `wall` från variabeltabellen |
| `$lid.size.width - 0.4` | bredden på kroppen som heter `lid`, minus 0,4 |
| `$lid.position.x + 30` | 30 till höger om `lid` |
| `$self.size.width / 2` | halva den här kroppens egen bredd |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | avrundning (halvor bort från noll), kvadratrot, sinus och cosinus i grader, pi |

Namn börjar med `$`. Stora och små bokstäver spelar ingen roll: `$Wall` och `$wall` är samma sak. Tal står i den enhet som designen visar sina fält i; det finns inga enheter i en formel.

Ett fält som en formel styr är färgat och märkt *fx*. Klicka i det så kommer formeln tillbaka, och du kan ändra den. En formel som inte går att räkna ut - ett namn som inte finns, en division med noll, två formler som beror på varandra - färgar fältet rött, och dess verktygstips säger varför. Fältet behåller under tiden sitt senaste värde. Skriver du ett vanligt tal i fältet försvinner formeln igen. Måttrutorna på arbetsplanet gör likadant: en bredd, längd, höjd eller höjd över plattan som en formel styr visar *fx* i sin ruta, och ett klick öppnar rutan med formeln, med *fx* framför, som öppnar formelredigeraren.

## Ge en kropp ett variabelnamn

En formel kan läsa vilket fält som helst från en kropp med ett variabelnamn. Ge den ett i {{ui:formula.variableName}} överst i egenskapspanelen: bokstäver, siffror och `_`, inte med en siffra först och inte samma som en annan kropp eller variabel. Dess fält heter då:

| Fält | I en formel |
| --- | --- |
| Bredd, längd, höjd, diameter | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; på en rund kropp är bredd och längd dess diameter |
| Position X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Rotation X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Vridpunkt X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Avsmalning, vridning och formens egna inställningar | grupperade efter vad de hör till, till exempel `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; efter `$name.` visar formelredigeraren alla |

Byter du namn på kroppen ändras namnet i varje formel som använder det. En kopia av en namngiven kropp - inklistrad, duplicerad eller importerad - behåller inte namnet, eftersom två kroppar inte kan dela det; ett kort meddelande säger det.

## Variabeltabellen

{{ui:variables.title}} öppnas med sin knapp bredvid {{ui:editor.tool.note}} längst ned till vänster eller med [[Ctrl]]+[[Shift]]+[[V]]. Varje rad har ett namn, ett värde eller en formel, dess resultat och en kort beskrivning. {{ui:variables.add}} lägger till en rad; papperskorgen tar bort en. En ändring gäller så snart du trycker [[Enter]] eller lämnar cellen, och [[Ctrl]]+[[Z]] ångrar den som vilket annat steg som helst. Ett resultat som inte går att räkna ut visar ett rött märke; dess verktygstips säger varför. Byter du namn på en rad ändras namnet i varje formel. Under tabellen ser du vilka kroppar som har ett variabelnamn. Fönstret kan flyttas i sin titel och göras större i sitt nedre högra hörn.

## Formelredigeraren

En längre formel är lättare att skriva i formelredigeraren: klicka på *fx* i början av ett fält som en formel styr, eller klicka i vilket fält som helst och sedan på det *fx* som dyker upp i början av det. Den visar resultatet medan du skriver, eller varför det inte finns något. Efter `$` visar den variablerna och de namngivna kropparna, efter `$name.` den kroppens fält, var och ett med sitt värde; piltangenterna och [[Enter]] eller [[Tab]] väljer ett. [[Enter]] tillämpar sedan formeln, [[Shift]]+[[Enter]] börjar en ny rad så att en lång formel förblir läsbar, och [[Esc]] stänger redigeraren utan ändring. Den kan flyttas i sin titel.

## När värden flyttar sig

Allt som beror på ett ändrat värde följer med direkt, som ett steg i historiken: en kropp som följer `lid` flyttar sig när `lid` växer. Några saker är bra att veta:

- **Att dra ett fält med en formel** behåller formeln och lägger till skillnaden: `$wall * 2` dragen 5 mm längre blir `$wall * 2 + 5`. Att flytta en kropp tillsammans med kroppen den följer ändrar inget i dess formel.
- **En låst kropp** följer inte sina formler; dess fält säger det.
- **Delar inuti en grupp** behåller sina formler och variabelnamn när gruppen är stängd, och formler kan läsa dem. När ett värde som de beror på ändras byggs gruppen om ett ögonblick efter resten, i samma steg i historiken. Flyttas eller sträcks gruppen skrivs skillnaden in i dess delars formler, som när du drar. En grupp med egna avrundningar eller fasningar byggs inte om; öppna den med {{ui:group.edit}} för att uppdatera den.
