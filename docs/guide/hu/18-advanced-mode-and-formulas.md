---
title: Haladó mód és képletek
summary: Képletek a számmezőkben, változók, más testeket követő testek, a változótábla és a képletszerkesztő - mindezt a haladó mód kapcsolja be.
---

## A haladó mód bekapcsolása

Egyes tervek egyszerűbbek, ha egy érték irányít másokat: egy fedél mindig 0,4 mm-rel kisebb a dobozánál, lyukak ugyanakkora falvastagságnyi távolságban, egy alkatrész, amely egy másik mellett marad, akárhová kerül az. A haladó mód ehhez képleteket és változókat ad. Kapcsold be a(z) {{ui:workspace.advancedMode}} beállítást itt: {{ui:editor.workspaceSettings}}, a(z) {{ui:workspace.appearance}} lapon. Más ebből semmit sem lát: normál és egyszerű módban a mezők, az inspektor és a szalag változatlanok maradnak.

A képleteket használó terv haladó mód nélkül is megnyílik. A képletek utolsó értékeit mutatja, és egy értesítés jelzi, hogy képleteket használ, a(z) {{ui:advanced.switchOn}} gombbal. Az ott módosított érték ezután egyszerű szám: a képlete eltűnik, így a visszakapcsolás soha nem vonja vissza a módosításodat.

## Képletek a számmezőkben

Haladó módban az inspektor minden számmezője elfogad egy képletet. Írd be úgy, mint egy számítást:

| Írás | Jelentés |
| --- | --- |
| `$wall * 2` | a változótábla `wall` változójának kétszerese |
| `$lid.size.width - 0.4` | a `lid` nevű test szélessége mínusz 0,4 |
| `$lid.position.x + 30` | 30-cal jobbra a `lid`-től |
| `$self.size.width / 2` | ennek a testnek a saját szélessége felezve |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | kerekítés (a felek nullától távolodva), négyzetgyök, szinusz és koszinusz fokban, pí |

A nevek `$` jellel kezdődnek. A kis- és nagybetű nem számít: `$Wall` és `$wall` ugyanaz. A számok abban a mértékegységben vannak, amelyben a terv a mezőit mutatja; a képletben nincsenek mértékegységek.

Egy képlet által irányított mező színezett és *fx* jelölésű. Kattints bele, és a képlet visszajön szerkesztésre. Egy ki nem számítható képlet - nem létező név, nullával való osztás, két egymástól függő képlet - pirosra színezi a mezőt, és az elemleírás megmondja, miért. A mező addig megtartja az utolsó értékét. Ha egyszerű számot írsz a mezőbe, a képlet ismét eltűnik. A munkaterület méretmezői ugyanígy működnek: a képlet által irányított szélesség, hosszúság, magasság vagy lap feletti magasság *fx* jelet mutat a mezőjében, és egy kattintás a képlettel nyitja meg a mezőt, előtte az *fx*, amely megnyitja a képletszerkesztőt.

## Változónév adása egy testnek

Egy képlet bármelyik mezőt olvashatja egy olyan testből, amelynek változóneve van. Adj neki egyet a(z) {{ui:formula.variableName}} mezőben az inspektor tetején: betűk, számjegyek és `_`, nem kezdődhet számjeggyel, és nem egyezhet más test vagy változó nevével. A mezői ekkor így hívhatók:

| Mező | Képletben |
| --- | --- |
| Szélesség, hosszúság, magasság, átmérő | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; kerek testnél a szélesség és a hosszúság is az átmérője |
| Pozíció X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Elforgatás X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Forgáspont X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Elvékonyodás, csavarás és az alakzat saját beállításai | aszerint csoportosítva, amihez tartoznak, például `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; a `$name.` után a képletszerkesztő mindet felsorolja |

A test átnevezése minden olyan képletben átnevezi, amely használja. Egy elnevezett test másolata - beillesztve, duplikálva vagy importálva - nem tartja meg a nevet, mert két test nem osztozhat rajta; egy rövid üzenet jelzi ezt.

## A változótábla

A(z) {{ui:variables.title}} ablak a szalagon lévő gombjával vagy a [[Ctrl]]+[[Shift]]+[[V]] billentyűkkel nyílik meg. Minden sorban van egy név, egy érték vagy képlet, annak eredménye és egy rövid leírás. A(z) {{ui:variables.add}} hozzáad egy sort; a kuka eltávolít egyet. Egy módosítás akkor számít, amikor megnyomod az [[Enter]] billentyűt vagy elhagyod a cellát, és a [[Ctrl]]+[[Z]] visszavonja, mint bármely más lépést. Egy ki nem számítható eredmény piros jelet mutat; az elemleírás megmondja, miért. Egy sor átnevezése minden képletben átnevezi. A tábla alatt látod, mely testeknek van változóneve. Az ablak a címénél mozgatható, és a jobb alsó sarkánál nagyítható.

## A képletszerkesztő

Egy hosszabb képletet könnyebb a képletszerkesztőben írni: kattints a képlet által vezérelt mező elején lévő *fx*-re, vagy kattints bármelyik mezőbe, majd az elején megjelenő *fx*-re. Gépelés közben mutatja az eredményt, vagy azt, hogy miért nincs. A `$` után felsorolja a változókat és az elnevezett testeket, a `$name.` után annak a testnek a mezőit, mindegyiket az értékével; a nyilak és az [[Enter]] vagy [[Tab]] kiválaszt egyet. Az [[Enter]] ezután alkalmazza a képletet, a [[Shift]]+[[Enter]] új sort kezd, hogy egy hosszú képlet olvasható maradjon, az [[Esc]] pedig változtatás nélkül bezárja a szerkesztőt. A címénél mozgatható.

## Amikor az értékek elmozdulnak

Minden, ami egy megváltozott értéktől függ, azonnal követi, az előzmények egyetlen lépéseként: egy test, amely a `lid`-et követi, elmozdul, amikor a `lid` nő. Néhány dolgot jó tudni:

- **Egy képletes mező húzása** megtartja a képletet, és hozzáadja a különbséget: a 5 mm-rel tovább húzott `$wall * 2` így lesz `$wall * 2 + 5`. Ha egy testet együtt mozgatsz azzal a testtel, amelyet követ, a képletében semmi sem változik.
- **Egy zárolt test** nem követi a képleteit; a mezője jelzi ezt.
- **Egy csoporton belüli részek** zárt csoportban is megtartják a képleteiket és a változóneveiket, és a képletek olvashatják őket. Ha megváltozik egy érték, amelytől függenek, a csoport egy pillanattal a többi után újraépül, az előzmények ugyanazon lépésében. A csoport mozgatása vagy nyújtása a különbséget a részei képleteihez írja, ahogy a húzás is. A saját lekerekítéssel vagy letöréssel rendelkező csoport nem épül újra; a frissítéshez nyisd meg a {{ui:group.edit}} gombbal.
