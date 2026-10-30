---
title: Mode avancé et formules
summary: Des formules dans les champs numériques, des variables, des corps qui en suivent d'autres, le tableau des variables et l'éditeur de formule - le tout activé avec le mode avancé.
---

## Activer le mode avancé

Certaines créations sont plus simples quand une valeur en commande d'autres : un couvercle toujours 0,4 mm plus petit que sa boîte, des trous espacés de la même épaisseur de paroi, une pièce qui reste à côté d'une autre où qu'elle aille. Le mode avancé ajoute pour cela des formules et des variables. Activez {{ui:workspace.advancedMode}} dans {{ui:editor.workspaceSettings}}, onglet {{ui:workspace.appearance}}. Personne d'autre n'en voit rien : en mode normal et en mode simple, les champs, l'inspecteur et le ruban restent tels quels.

Une création avec des formules s'ouvre aussi sans le mode avancé. Elle montre les dernières valeurs de ses formules, et un message indique qu'elle utilise des formules, avec {{ui:advanced.switchOn}}. Une valeur que vous y changez devient ensuite un simple nombre : sa formule disparaît, donc revenir au mode avancé n'annule jamais votre changement.

## Des formules dans les champs numériques

En mode avancé, chaque champ numérique de l'inspecteur accepte une formule. Tapez-la comme un calcul :

| Écrire | Signification |
| --- | --- |
| `$wall * 2` | le double de la variable `wall` du tableau des variables |
| `$lid.size.width - 0.4` | la largeur du corps nommé `lid`, moins 0,4 |
| `$lid.position.x + 30` | 30 à droite de `lid` |
| `$self.size.width / 2` | la moitié de la largeur de ce corps lui-même |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | arrondi (les moitiés loin de zéro), racine carrée, sinus et cosinus en degrés, pi |

Les noms commencent par `$`. Majuscules et minuscules ne comptent pas : `$Wall` et `$wall` sont la même chose. Les nombres sont dans l'unité où la création affiche ses champs ; une formule ne contient pas d'unités.

Un champ commandé par une formule est teinté et marqué *fx*. Cliquez dedans et la formule revient pour être modifiée. Une formule qui ne peut pas être calculée - un nom qui n'existe pas, une division par zéro, deux formules qui dépendent l'une de l'autre - colore le champ en rouge, et son info-bulle dit pourquoi. Le champ garde en attendant sa dernière valeur. Taper un simple nombre dans le champ retire la formule. Les cases de cotes de la zone de travail font de même : une largeur, une longueur, une hauteur ou une hauteur au-dessus du plateau commandée par une formule affiche *fx* dans sa case, et un clic ouvre la case sur la formule, précédée du *fx* qui ouvre l'éditeur de formules.

## Donner un nom de variable à un corps

Une formule peut lire n'importe quel champ d'un corps qui a un nom de variable. Donnez-lui-en un dans {{ui:formula.variableName}}, tout en haut de l'inspecteur : lettres, chiffres et `_`, sans commencer par un chiffre et différent de tout autre corps ou variable. Ses champs s'appellent alors ainsi :

| Champ | Dans une formule |
| --- | --- |
| Largeur, longueur, hauteur, diamètre | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter` ; pour un corps rond, la largeur et la longueur sont son diamètre |
| Position X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Rotation X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Pivot X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Effilement, torsion et réglages propres à la forme | groupés selon ce à quoi ils appartiennent, par exemple `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth` ; après `$name.`, l'éditeur de formule les propose tous |

Renommer le corps le renomme dans toutes les formules qui l'utilisent. Une copie d'un corps nommé - collée, dupliquée ou insérée - ne garde pas le nom, car deux corps ne peuvent pas le partager ; un court message le signale.

## Le tableau des variables

{{ui:variables.title}} s'ouvre avec son bouton dans le ruban ou avec [[Ctrl]]+[[Shift]]+[[V]]. Chaque ligne a un nom, une valeur ou une formule, son résultat et une courte description. {{ui:variables.add}} ajoute une ligne ; la corbeille en supprime une. Un changement compte dès que vous appuyez sur [[Enter]] ou quittez la cellule, et [[Ctrl]]+[[Z]] l'annule comme toute autre étape. Un résultat impossible à calculer affiche une marque rouge ; son info-bulle dit pourquoi. Renommer une ligne la renomme dans toutes les formules. Sous le tableau, vous voyez quels corps ont un nom de variable. La fenêtre se déplace par son titre et s'agrandit par son coin inférieur droit.

## L'éditeur de formule

Une formule plus longue s'écrit plus facilement dans l'éditeur de formule : cliquez sur le *fx* au début d'un champ piloté par une formule, ou cliquez dans n'importe quel champ, puis sur le *fx* qui apparaît à son début. Il montre le résultat pendant que vous tapez, ou pourquoi il n'y en a pas. Après `$`, il propose les variables et les corps nommés, après `$name.` les champs de ce corps, chacun avec sa valeur ; les flèches et [[Enter]] ou [[Tab]] en choisissent un. [[Enter]] applique ensuite la formule, [[Shift]]+[[Enter]] commence une nouvelle ligne pour garder une longue formule lisible, et [[Esc]] ferme l'éditeur sans changement. Il se déplace par son titre.

## Quand les valeurs bougent

Tout ce qui dépend d'une valeur modifiée la suit aussitôt, en une seule étape de l'historique : un corps qui suit `lid` se déplace quand `lid` grandit. Quelques points à savoir :

- **Faire glisser un champ qui a une formule** garde la formule et ajoute la différence : `$wall * 2` tiré 5 mm plus loin devient `$wall * 2 + 5`. Déplacer un corps avec le corps qu'il suit ne change rien à sa formule.
- **Un corps verrouillé** ne suit pas ses formules ; son champ l'indique.
- **Les pièces d'un groupe** gardent leurs formules et leurs noms de variable quand le groupe est fermé, et les formules peuvent les lire. Quand une valeur dont elles dépendent change, le groupe est reconstruit un instant après le reste, dans la même étape de l'historique. Déplacer ou étirer le groupe reporte la différence sur les formules de ses pièces, comme un glissement. Un groupe qui a ses propres congés ou chanfreins n'est pas reconstruit ; ouvrez-le avec {{ui:group.edit}} pour le mettre à jour.
