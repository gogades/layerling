---
title: Napredni način in formule
summary: Formule v številskih poljih, spremenljivke, telesa, ki sledijo drugim telesom, tabela spremenljivk in urejevalnik formul - vse to vklopi napredni način.
---

## Vklop naprednega načina

Nekateri modeli so preprostejši, kadar ena vrednost določa druge: pokrov, ki je vedno 0,4 mm manjši od svoje škatle, luknje v razmiku enake debeline stene, del, ki stoji ob drugem, kamorkoli se ta premakne. Napredni način za to doda formule in spremenljivke. Vklopite {{ui:workspace.advancedMode}} v oknu {{ui:editor.workspaceSettings}}, na zavihku {{ui:workspace.appearance}}. Nihče drug se s tem ne sreča: v običajnem in preprostem načinu ostanejo polja, inšpektor in trak takšni, kot so.

Model s formulami se odpre tudi brez naprednega načina. Pokaže zadnje vrednosti svojih formul, obvestilo pa pove, da uporablja formule, z gumbom {{ui:advanced.switchOn}}. Vrednost, ki jo tam spremenite, je odslej navadno število: njena formula odpade, zato vrnitev nikoli ne razveljavi vaše spremembe.

## Formule v številskih poljih

V naprednem načinu vsako številsko polje inšpektorja sprejme formulo. Vnesite jo kot izračun:

| Zapis | Pomen |
| --- | --- |
| `$wall * 2` | dvakratnik spremenljivke `wall` iz tabele spremenljivk |
| `$lid.size.width - 0.4` | širina telesa z imenom `lid`, manj 0,4 |
| `$lid.position.x + 30` | 30 desno od `lid` |
| `$self.size.width / 2` | polovica lastne širine tega telesa |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | zaokroževanje (polovice stran od nič), kvadratni koren, sinus in kosinus v stopinjah, pi |

Imena se začnejo z `$`. Velike in male črke niso pomembne: `$Wall` in `$wall` sta isto. Števila so v enoti, v kateri model prikazuje svoja polja; enot v formuli ni.

Polje, ki ga določa formula, je obarvano in označeno z *fx*. Kliknite vanj in formula se vrne za urejanje. Formula, ki je ni mogoče izračunati - ime, ki ne obstaja, deljenje z nič, dve formuli, odvisni druga od druge -, obarva polje rdeče, opis orodja pa pove zakaj. Polje medtem obdrži zadnjo vrednost. Če v polje vnesete navadno število, formula spet izgine.

## Ime spremenljivke za telo

Formula lahko bere katerokoli polje telesa, ki ima ime spremenljivke. Dodelite ga v polju {{ui:formula.variableName}} na vrhu inšpektorja: črke, števke in `_`, ne sme se začeti s števko in ne sme biti enako drugemu telesu ali spremenljivki. Njegova polja se potem imenujejo takole:

| Polje | V formuli |
| --- | --- |
| Širina, dolžina, višina, premer | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; pri okroglem telesu sta širina in dolžina njegov premer |
| Položaj X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Zasuk X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Vrtišče X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Zožitev, zasuk in lastne nastavitve oblike | razvrščene po tem, kamor spadajo, na primer `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; po `$name.` jih urejevalnik formul našteje vse |

Če telo preimenujete, se ime spremeni v vsaki formuli, ki ga uporablja. Kopija poimenovanega telesa - prilepljena, podvojena ali vstavljena - imena ne obdrži, saj dve telesi ne moreta imeti istega; kratko sporočilo to pove.

## Tabela spremenljivk

{{ui:variables.title}} se odpre z gumbom na traku ali s [[Ctrl]]+[[Shift]]+[[V]]. Vsaka vrstica ima ime, vrednost ali formulo, njen rezultat in kratek opis. {{ui:variables.add}} doda vrstico; koš jo odstrani. Sprememba velja, ko pritisnete [[Enter]] ali zapustite celico, [[Ctrl]]+[[Z]] pa jo razveljavi kot vsak drug korak. Rezultat, ki ga ni mogoče izračunati, pokaže rdečo oznako; opis orodja pove zakaj. Če vrstico preimenujete, se ime spremeni v vsaki formuli. Pod tabelo vidite, katera telesa imajo ime spremenljivke. Okno lahko premaknete za naslov in povečate za spodnji desni kot.

## Urejevalnik formul

Daljšo formulo je lažje pisati v urejevalniku formul: kliknite v polje in nato na majhen gumb *fx* na njegovem koncu. Med tipkanjem kaže rezultat ali razlog, zakaj ga ni. Po `$` našteje spremenljivke in poimenovana telesa, po `$name.` polja tega telesa, vsako z njegovo vrednostjo; s puščicami in [[Enter]] ali [[Tab]] izberete eno. [[Enter]] nato uporabi formulo, [[Shift]]+[[Enter]] začne novo vrstico, da dolga formula ostane berljiva, [[Esc]] pa zapre urejevalnik brez spremembe. Premaknete ga lahko za naslov.

## Ko se vrednosti premaknejo

Vse, kar je odvisno od spremenjene vrednosti, ji takoj sledi, kot en korak zgodovine: telo, ki sledi `lid`, se premakne, ko `lid` zraste. Nekaj stvari je dobro vedeti:

- **Vlečenje polja s formulo** formulo obdrži in prišteje razliko: `$wall * 2`, povlečen 5 mm dlje, postane `$wall * 2 + 5`. Premik telesa skupaj s telesom, ki mu sledi, njegove formule ne spremeni.
- **Zaklenjeno telo** ne sledi svojim formulam; njegovo polje to pove.
- **Deli znotraj skupine** ob zaprti skupini obdržijo svoje formule in imena spremenljivk, formule pa jih lahko berejo. Ko se spremeni vrednost, od katere so odvisni, se skupina zgradi znova trenutek za ostalim, v istem koraku zgodovine. Premik ali raztegnitev skupine prišteje razliko formulam njenih delov, tako kot vlečenje. Skupina z lastnimi zaokrožitvami ali posnetji se ne zgradi znova; odpri jo z {{ui:group.edit}}, da jo posodobiš.
