---
title: Modalità avanzata e formule
summary: Formule nei campi numerici, variabili, corpi che seguono altri corpi, la tabella delle variabili e l'editor di formule - tutto attivato con la modalità avanzata.
---

## Attivare la modalità avanzata

Alcuni progetti sono più semplici quando un valore ne comanda altri: un coperchio sempre 0,4 mm più piccolo della sua scatola, fori distanziati dello stesso spessore di parete, un pezzo che resta accanto a un altro ovunque quello vada. Per questo la modalità avanzata aggiunge formule e variabili. Attiva {{ui:workspace.advancedMode}} in {{ui:editor.workspaceSettings}}, nella scheda {{ui:workspace.appearance}}. Nessun altro ne vede nulla: nella modalità normale e in quella semplice campi, ispettore e barra restano come sono.

Un progetto con formule si apre anche senza la modalità avanzata. Mostra gli ultimi valori delle sue formule, e un avviso dice che usa formule, con {{ui:advanced.switchOn}}. Un valore che cambi lì diventa poi un numero semplice: la sua formula viene tolta, così tornare indietro non annulla mai la tua modifica.

## Formule nei campi numerici

Nella modalità avanzata ogni campo numerico dell'ispettore accetta una formula. Scrivila come un calcolo:

| Scrivi | Significato |
| --- | --- |
| `$wall * 2` | il doppio della variabile `wall` della tabella delle variabili |
| `$lid.size.width - 0.4` | la larghezza del corpo chiamato `lid`, meno 0,4 |
| `$lid.position.x + 30` | 30 a destra di `lid` |
| `$self.size.width / 2` | metà della larghezza di questo stesso corpo |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | arrotondamento (le metà lontano dallo zero), radice quadrata, seno e coseno in gradi, pi greco |

I nomi iniziano con `$`. Maiuscole e minuscole non contano: `$Wall` e `$wall` sono la stessa cosa. I numeri sono nell'unità in cui il progetto mostra i suoi campi; dentro una formula non ci sono unità.

Un campo comandato da una formula è colorato e segnato con *fx*. Facci clic e la formula torna per essere modificata. Una formula che non si può calcolare - un nome che non esiste, una divisione per zero, due formule che dipendono l'una dall'altra - colora il campo di rosso, e il suo suggerimento dice perché. Nel frattempo il campo mantiene il suo ultimo valore. Scrivere un numero semplice nel campo toglie la formula.

## Dare un nome di variabile a un corpo

Una formula può leggere qualsiasi campo di un corpo che ha un nome di variabile. Daglielo in {{ui:formula.variableName}}, in cima all'ispettore: lettere, cifre e `_`, senza iniziare con una cifra e diverso da ogni altro corpo o variabile. I suoi campi si chiamano allora così:

| Campo | In una formula |
| --- | --- |
| Larghezza, lunghezza, altezza, diametro | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; per un corpo tondo, larghezza e lunghezza sono il suo diametro |
| Posizione X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Rotazione X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Perno X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Rastremazione, torsione e impostazioni proprie della forma | raggruppati per ciò a cui appartengono, per esempio `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; dopo `$name.` l'editor di formule li elenca tutti |

Rinominare il corpo lo rinomina in tutte le formule che lo usano. Una copia di un corpo con nome - incollata, duplicata o inserita - non mantiene il nome, perché due corpi non possono condividerlo; un breve messaggio lo dice.

## La tabella delle variabili

{{ui:variables.title}} si apre con il suo pulsante nella barra o con [[Ctrl]]+[[Shift]]+[[V]]. Ogni riga ha un nome, un valore o una formula, il suo risultato e una breve descrizione. {{ui:variables.add}} aggiunge una riga; il cestino ne toglie una. Una modifica vale appena premi [[Enter]] o lasci la cella, e [[Ctrl]]+[[Z]] la annulla come ogni altro passo. Un risultato che non si può calcolare mostra un segno rosso; il suo suggerimento dice perché. Rinominare una riga la rinomina in tutte le formule. Sotto la tabella vedi quali corpi hanno un nome di variabile. La finestra si sposta dal titolo e si ingrandisce dall'angolo in basso a destra.

## L'editor di formule

Una formula più lunga si scrive meglio nell'editor di formule: fai clic sull'*fx* all'inizio di un campo guidato da una formula, oppure fai clic in un campo qualsiasi e poi sull'*fx* che compare all'inizio. Mostra il risultato mentre scrivi, o perché non c'è. Dopo `$` elenca le variabili e i corpi con nome, dopo `$name.` i campi di quel corpo, ognuno con il suo valore; le frecce e [[Enter]] o [[Tab]] ne scelgono uno. [[Enter]] applica poi la formula, [[Shift]]+[[Enter]] inizia una nuova riga per tenere leggibile una formula lunga, e [[Esc]] chiude l'editor senza modifiche. Si sposta dal titolo.

## Quando i valori si muovono

Tutto ciò che dipende da un valore cambiato lo segue subito, come un solo passo della cronologia: un corpo che segue `lid` si sposta quando `lid` cresce. Alcune cose da sapere:

- **Trascinare un campo che ha una formula** mantiene la formula e aggiunge la differenza: `$wall * 2` trascinato 5 mm più in là diventa `$wall * 2 + 5`. Spostare un corpo insieme al corpo che segue non cambia nulla nella sua formula.
- **Un corpo bloccato** non segue le sue formule; il suo campo lo dice.
- **Le parti dentro un gruppo** mantengono le loro formule e i nomi di variabile quando il gruppo è chiuso, e le formule possono leggerle. Quando cambia un valore da cui dipendono, il gruppo viene ricostruito un attimo dopo il resto, nello stesso passo della cronologia. Spostare o allungare il gruppo aggiunge la differenza alle formule delle sue parti, come il trascinamento. Un gruppo con raccordi o smussi propri non viene ricostruito; aprilo con {{ui:group.edit}} per aggiornarlo.
