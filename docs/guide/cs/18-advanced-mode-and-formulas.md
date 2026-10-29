---
title: Pokročilý režim a vzorce
summary: Vzorce v číselných polích, proměnné, tělesa, která následují jiná tělesa, tabulka proměnných a editor vzorců - to vše zapíná pokročilý režim.
---

## Zapnutí pokročilého režimu

Některé návrhy jsou jednodušší, když jedna hodnota určuje další: víko vždy o 0,4 mm menší než jeho krabička, otvory ve vzdálenosti stejné tloušťky stěny, díl, který stojí vedle jiného, ať se ten přesune kamkoli. Pokročilý režim k tomu přidává vzorce a proměnné. Zapněte {{ui:workspace.advancedMode}} v okně {{ui:editor.workspaceSettings}}, na kartě {{ui:workspace.appearance}}. Nikdo jiný se s tím nesetká: v běžném a jednoduchém režimu zůstávají pole, inspektor i pás karet beze změny.

Návrh se vzorci se otevře i bez pokročilého režimu. Ukazuje poslední hodnoty svých vzorců a upozornění říká, že vzorce používá, s tlačítkem {{ui:advanced.switchOn}}. Hodnota, kterou tam změníte, je pak obyčejné číslo: její vzorec zmizí, takže přepnutí zpět vaši změnu nikdy nevrátí.

## Vzorce v číselných polích

V pokročilém režimu přijme každé číselné pole inspektoru vzorec. Napište ho jako výpočet:

| Zápis | Význam |
| --- | --- |
| `$wall * 2` | dvojnásobek proměnné `wall` z tabulky proměnných |
| `$lid.size.width - 0.4` | šířka tělesa jménem `lid` minus 0,4 |
| `$lid.position.x + 30` | o 30 vpravo od `lid` |
| `$self.size.width / 2` | polovina vlastní šířky tohoto tělesa |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | zaokrouhlení (poloviny od nuly), druhá odmocnina, sinus a kosinus ve stupních, pí |

Jména začínají znakem `$`. Velká a malá písmena nehrají roli: `$Wall` a `$wall` jsou totéž. Čísla jsou v jednotce, ve které návrh zobrazuje svá pole; uvnitř vzorce žádné jednotky nejsou.

Pole, které určuje vzorec, je podbarvené a označené *fx*. Klikněte do něj a vzorec se vrátí k úpravě. Vzorec, který nejde spočítat - jméno, které neexistuje, dělení nulou, dva vzorce závislé na sobě -, obarví pole červeně a jeho popisek řekne proč. Pole si zatím ponechá poslední hodnotu. Napsáním obyčejného čísla do pole se vzorec opět odstraní.

## Pojmenování tělesa proměnnou

Vzorec může číst libovolné pole tělesa, které má název proměnné. Zadejte ho v poli {{ui:formula.variableName}} úplně nahoře v inspektoru: písmena, číslice a `_`, nesmí začínat číslicí a nesmí být stejný jako jiné těleso nebo proměnná. Jeho pole se pak jmenují takto:

| Pole | Ve vzorci |
| --- | --- |
| Šířka, délka, výška, průměr | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter` |
| Poloha X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Otočení X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Bod otáčení X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Jakékoli jiné pole | jeho vlastní název, například `$gear.teeth` nebo `$tube.thickness` |

Přejmenováním tělesa se název změní ve všech vzorcích, které ho používají. Kopie pojmenovaného tělesa - vložená, duplikovaná nebo importovaná - název neponechá, protože dvě tělesa nemohou mít stejný; krátká zpráva to oznámí.

## Tabulka proměnných

{{ui:variables.title}} se otevře tlačítkem na pásu karet nebo zkratkou [[Ctrl]]+[[Shift]]+[[V]]. Každý řádek má název, hodnotu nebo vzorec, jeho výsledek a krátký popis. {{ui:variables.add}} přidá řádek; koš ho odstraní. Změna platí, jakmile stisknete [[Enter]] nebo opustíte buňku, a [[Ctrl]]+[[Z]] ji vrátí jako každý jiný krok. Výsledek, který nejde spočítat, ukazuje červenou značku; její popisek řekne proč. Přejmenováním řádku se název změní ve všech vzorcích. Pod tabulkou vidíte, která tělesa mají název proměnné. Okno lze posunout za titulek a zvětšit za pravý dolní roh.

## Editor vzorců

Delší vzorec se lépe píše v editoru vzorců: klikněte do pole a pak na malé tlačítko *fx* na jeho konci. Ukazuje výsledek už při psaní, nebo proč žádný není. Po `$` nabídne proměnné a pojmenovaná tělesa, po `$name.` pole tohoto tělesa, každé s jeho hodnotou; šipky a [[Enter]] nebo [[Tab]] jednu položku vyberou. [[Enter]] pak vzorec použije, [[Shift]]+[[Enter]] začne nový řádek, aby dlouhý vzorec zůstal čitelný, a [[Esc]] editor zavře beze změny. Lze ho posunout za titulek.

## Když se hodnoty pohnou

Vše, co závisí na změněné hodnotě, ji hned následuje, jako jeden krok historie: těleso, které následuje `lid`, se posune, když `lid` naroste. Pár věcí je dobré vědět:

- **Tažení pole se vzorcem** vzorec ponechá a přičte rozdíl: `$wall * 2` posunuté o 5 mm dál se změní na `$wall * 2 + 5`. Posunutí tělesa spolu s tělesem, které následuje, na jeho vzorci nic nezmění.
- **Zamčené těleso** své vzorce nenásleduje; jeho pole to řekne.
- **Díly uvnitř skupiny** zatím vzorce číst nemohou; vzorce pracují s tělesy přímo na pracovní rovině.
