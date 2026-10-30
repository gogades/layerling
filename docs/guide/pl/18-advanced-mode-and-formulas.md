---
title: Tryb zaawansowany i formuły
summary: Formuły w polach liczbowych, zmienne, bryły, które podążają za innymi bryłami, tabela zmiennych i edytor formuł - wszystko włączane trybem zaawansowanym.
---

## Włączanie trybu zaawansowanego

Niektóre projekty są prostsze, gdy jedna wartość wyznacza inne: pokrywka zawsze 0,4 mm mniejsza od swojego pudełka, otwory rozstawione o tę samą grubość ścianki, część, która stoi obok innej, dokądkolwiek tamta się przesunie. Tryb zaawansowany dodaje do tego formuły i zmienne. Włącz {{ui:workspace.advancedMode}} w oknie {{ui:editor.workspaceSettings}}, na karcie {{ui:workspace.appearance}}. Nikt inny się z tym nie zetknie: w trybie normalnym i prostym pola, inspektor i wstążka pozostają bez zmian.

Projekt z formułami otwiera się także bez trybu zaawansowanego. Pokazuje ostatnie wartości swoich formuł, a komunikat mówi, że używa formuł, z przyciskiem {{ui:advanced.switchOn}}. Wartość, którą tam zmienisz, staje się zwykłą liczbą: jej formuła znika, więc powrót do trybu zaawansowanego nigdy nie cofnie twojej zmiany.

## Formuły w polach liczbowych

W trybie zaawansowanym każde pole liczbowe inspektora przyjmuje formułę. Wpisz ją jak obliczenie:

| Zapis | Znaczenie |
| --- | --- |
| `$wall * 2` | dwukrotność zmiennej `wall` z tabeli zmiennych |
| `$lid.size.width - 0.4` | szerokość bryły o nazwie `lid` minus 0,4 |
| `$lid.position.x + 30` | 30 na prawo od `lid` |
| `$self.size.width / 2` | połowa własnej szerokości tej bryły |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | zaokrąglanie (połówki od zera), pierwiastek kwadratowy, sinus i cosinus w stopniach, pi |

Nazwy zaczynają się od `$`. Wielkość liter nie ma znaczenia: `$Wall` i `$wall` to to samo. Liczby są w jednostce, w której projekt pokazuje swoje pola; w formule nie ma jednostek.

Pole wyznaczane przez formułę jest zabarwione i oznaczone *fx*. Kliknij w nie, a formuła wróci do edycji. Formuła, której nie da się obliczyć - nazwa, która nie istnieje, dzielenie przez zero, dwie formuły zależne od siebie - barwi pole na czerwono, a podpowiedź mówi dlaczego. Pole zachowuje tymczasem ostatnią wartość. Wpisanie w pole zwykłej liczby usuwa formułę.

## Nazwa zmiennej dla bryły

Formuła może czytać każde pole bryły, która ma nazwę zmiennej. Nadaj ją w polu {{ui:formula.variableName}} na samej górze inspektora: litery, cyfry i `_`, bez cyfry na początku i różna od innych brył i zmiennych. Jej pola nazywają się wtedy tak:

| Pole | W formule |
| --- | --- |
| Szerokość, długość, wysokość, średnica | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; w okrągłej bryle szerokość i długość to jej średnica |
| Położenie X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Obrót X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Punkt obrotu X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Zwężenie, skręcenie i własne ustawienia kształtu | pogrupowane według tego, do czego należą, na przykład `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; po `$name.` edytor formuł wymienia je wszystkie |

Zmiana nazwy bryły zmienia ją w każdej formule, która jej używa. Kopia nazwanej bryły - wklejona, zduplikowana albo wstawiona - nie zachowuje nazwy, bo dwie bryły nie mogą mieć wspólnej; mówi o tym krótki komunikat.

## Tabela zmiennych

{{ui:variables.title}} otwiera się przyciskiem na wstążce albo skrótem [[Ctrl]]+[[Shift]]+[[V]]. Każdy wiersz ma nazwę, wartość lub formułę, jej wynik i krótki opis. {{ui:variables.add}} dodaje wiersz; kosz go usuwa. Zmiana obowiązuje, gdy naciśniesz [[Enter]] albo opuścisz komórkę, a [[Ctrl]]+[[Z]] cofa ją jak każdy inny krok. Wynik, którego nie da się obliczyć, ma czerwony znak; podpowiedź mówi dlaczego. Zmiana nazwy wiersza zmienia ją w każdej formule. Pod tabelą widać, które bryły mają nazwę zmiennej. Okno można przesuwać za tytuł i powiększać za prawy dolny róg.

## Edytor formuł

Dłuższą formułę łatwiej napisać w edytorze formuł: kliknij w pole, a potem w mały przycisk *fx* na jego końcu. Pokazuje wynik w trakcie pisania albo powód, dla którego go nie ma. Po `$` wymienia zmienne i nazwane bryły, po `$name.` pola tej bryły, każde z jego wartością; strzałki i [[Enter]] lub [[Tab]] wybierają jedno. [[Enter]] stosuje potem formułę, [[Shift]]+[[Enter]] zaczyna nowy wiersz, by długa formuła była czytelna, a [[Esc]] zamyka edytor bez zmian. Można go przesuwać za tytuł.

## Gdy wartości się zmieniają

Wszystko, co zależy od zmienionej wartości, od razu za nią podąża, jako jeden krok historii: bryła, która podąża za `lid`, przesuwa się, gdy `lid` rośnie. Kilka rzeczy warto wiedzieć:

- **Przeciąganie pola z formułą** zachowuje formułę i dodaje różnicę: `$wall * 2` przeciągnięte o 5 mm dalej staje się `$wall * 2 + 5`. Przesunięcie bryły razem z bryłą, za którą podąża, niczego w jej formule nie zmienia.
- **Zablokowana bryła** nie podąża za swoimi formułami; jej pole o tym mówi.
- **Części wewnątrz grupy** zachowują swoje formuły i nazwy zmiennych, gdy grupa jest zamknięta, a formuły mogą je czytać. Gdy zmieni się wartość, od której zależą, grupa jest budowana od nowa chwilę po reszcie, w tym samym kroku historii. Przesunięcie lub rozciągnięcie grupy dopisuje różnicę do formuł jej części, tak jak przeciąganie. Grupa z własnymi zaokrągleniami lub fazami nie jest budowana od nowa; otwórz ją przez {{ui:group.edit}}, aby ją zaktualizować.
