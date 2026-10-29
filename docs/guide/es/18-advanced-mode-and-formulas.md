---
title: Modo avanzado y fórmulas
summary: Fórmulas en los campos numéricos, variables, cuerpos que siguen a otros cuerpos, la tabla de variables y el editor de fórmulas: todo se activa con el modo avanzado.
---

## Activar el modo avanzado

Algunos diseños son más sencillos cuando un valor manda sobre otros: una tapa siempre 0,4 mm más pequeña que su caja, agujeros separados por el mismo grosor de pared, una pieza que se queda junto a otra vaya donde vaya. Para eso, el modo avanzado añade fórmulas y variables. Activa {{ui:workspace.advancedMode}} en {{ui:editor.workspaceSettings}}, pestaña {{ui:workspace.appearance}}. Nadie más se encuentra con nada de esto: en el modo normal y en el simple, los campos, el inspector y la cinta siguen como están.

Un diseño con fórmulas se abre también sin el modo avanzado. Muestra los últimos valores de sus fórmulas, y un aviso dice que usa fórmulas, con {{ui:advanced.switchOn}}. Un valor que cambies ahí pasa a ser un número normal: su fórmula se quita, así que volver al modo avanzado nunca deshace tu cambio.

## Fórmulas en los campos numéricos

En el modo avanzado, cada campo numérico del inspector acepta una fórmula. Escríbela como un cálculo:

| Escribe | Significado |
| --- | --- |
| `$wall * 2` | el doble de la variable `wall` de la tabla de variables |
| `$lid.size.width - 0.4` | el ancho del cuerpo llamado `lid`, menos 0,4 |
| `$lid.position.x + 30` | 30 a la derecha de `lid` |
| `$self.size.width / 2` | la mitad del ancho de este mismo cuerpo |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | redondeo (las mitades lejos del cero), raíz cuadrada, seno y coseno en grados, pi |

Los nombres empiezan por `$`. Mayúsculas y minúsculas dan igual: `$Wall` y `$wall` son lo mismo. Los números van en la unidad en que el diseño muestra sus campos; dentro de una fórmula no hay unidades.

Un campo que manda una fórmula aparece teñido y marcado con *fx*. Haz clic en él y la fórmula vuelve para cambiarla. Una fórmula que no se puede calcular - un nombre que no existe, una división por cero, dos fórmulas que dependen una de otra - pone el campo en rojo, y su descripción emergente dice por qué. Mientras tanto, el campo conserva su último valor. Escribir un número normal en el campo quita la fórmula.

## Dar un nombre de variable a un cuerpo

Una fórmula puede leer cualquier campo de un cuerpo que tenga nombre de variable. Dale uno en {{ui:formula.variableName}}, arriba del todo en el inspector: letras, dígitos y `_`, sin empezar por un dígito y distinto de cualquier otro cuerpo o variable. Sus campos se llaman entonces así:

| Campo | En una fórmula |
| --- | --- |
| Ancho, largo, alto, diámetro | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter` |
| Posición X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Rotación X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Pivote X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Estrechamiento, torsión y ajustes propios de la forma | agrupados según a qué pertenecen, por ejemplo `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; tras `$name.` el editor de fórmulas los lista todos |

Al renombrar el cuerpo, el nombre cambia en todas las fórmulas que lo usan. Una copia de un cuerpo con nombre - pegada, duplicada o insertada - no conserva el nombre, porque dos cuerpos no pueden compartirlo; un mensaje breve lo indica.

## La tabla de variables

{{ui:variables.title}} se abre con su botón en la cinta o con [[Ctrl]]+[[Mayús]]+[[V]]. Cada fila tiene un nombre, un valor o una fórmula, su resultado y una breve descripción. {{ui:variables.add}} añade una fila; la papelera la quita. Un cambio cuenta en cuanto pulsas [[Enter]] o sales de la celda, y [[Ctrl]]+[[Z]] lo deshace como cualquier otro paso. Un resultado que no se puede calcular muestra una marca roja; su descripción emergente dice por qué. Al renombrar una fila, el nombre cambia en todas las fórmulas. Debajo de la tabla ves qué cuerpos tienen nombre de variable. La ventana se mueve por su título y se agranda por su esquina inferior derecha.

## El editor de fórmulas

Una fórmula más larga se escribe mejor en el editor de fórmulas: haz clic en un campo y luego en el pequeño botón *fx* de su extremo. Muestra el resultado mientras escribes, o por qué no lo hay. Tras `$` lista las variables y los cuerpos con nombre; tras `$name.`, los campos de ese cuerpo, cada uno con su valor; las flechas y [[Enter]] o [[Tab]] eligen uno. Después, [[Enter]] aplica la fórmula, [[Mayús]]+[[Enter]] empieza una línea nueva para que una fórmula larga se lea bien y [[Esc]] cierra el editor sin cambios. Se mueve por su título.

## Cuando los valores se mueven

Todo lo que depende de un valor cambiado lo sigue al momento, como un solo paso del historial: un cuerpo que sigue a `lid` se mueve cuando `lid` crece. Conviene saber algunas cosas:

- **Arrastrar un campo que tiene fórmula** conserva la fórmula y le suma la diferencia: `$wall * 2` arrastrado 5 mm más pasa a ser `$wall * 2 + 5`. Mover un cuerpo junto con el cuerpo al que sigue no cambia nada en su fórmula.
- **Un cuerpo bloqueado** no sigue sus fórmulas; su campo lo dice.
- **Las piezas dentro de un grupo** aún no se pueden leer desde las fórmulas; las fórmulas trabajan con los cuerpos que están sobre el plano de trabajo.
