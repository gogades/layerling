---
title: Advanced mode and formulas
summary: Formulas in number fields, variables, bodies that follow other bodies, the variables table and the formula editor - all switched on with the advanced mode.
---

## Switching on the advanced mode

Some designs are easier when one value drives others: a lid always 0.4 mm smaller than its box, holes spaced by the same wall thickness, a part that sits next to another wherever that one goes. The advanced mode adds formulas and variables for that. Switch on {{ui:workspace.advancedMode}} in {{ui:editor.workspaceSettings}}, on the tab {{ui:workspace.appearance}}. Nobody else meets any of it: in the normal and the simple mode the fields, the inspector and the ribbon stay as they are.

A design made with formulas still opens without the advanced mode. It shows the last values its formulas gave, and a notice says that it uses formulas, with {{ui:advanced.switchOn}}. A value you change there is a plain number from then on: its formula is dropped, so switching back never undoes your change.

## Formulas in number fields

In the advanced mode every number field of the inspector takes a formula. Type it as you would a calculation:

| Write | Meaning |
| --- | --- |
| `$wall * 2` | twice the variable `wall` from the variables table |
| `$lid.size.width - 0.4` | the width of the body named `lid`, less 0.4 |
| `$lid.position.x + 30` | 30 to the right of `lid` |
| `$self.size.width / 2` | half of this body's own width |
| `round($wall)`, `sqrt($a)`, `sin(30)`, `cos($angle)`, `pi` | rounding (halves away from zero), square root, sine and cosine in degrees, pi |

Names start with `$`. Upper and lower case do not matter: `$Wall` and `$wall` are the same. Numbers are in the unit the design shows its fields in; there are no units inside a formula.

A field a formula drives is tinted and marked *fx*. Click into it and the formula comes back to change. A formula that cannot be worked out - a name that does not exist, a division by zero, two formulas that depend on each other - turns the field red, and its tooltip says why. The field keeps its last value meanwhile. Typing a plain number into the field takes the formula away again.

## Giving a body a variable name

A formula can read any field of a body that has a variable name. Give it one in {{ui:formula.variableName}}, at the top of the inspector: letters, digits and `_`, not starting with a digit, and not the same as another body or variable. Its fields are then named like this:

| Field | In a formula |
| --- | --- |
| Width, length, height, diameter | `$name.size.width`, `.size.length`, `.size.height`, `.size.diameter`; a round body's width and length are its diameter |
| Position X, Y, Z | `$name.position.x`, `.position.y`, `.position.z` |
| Rotation X, Y, Z | `$name.rotation.x`, `.rotation.y`, `.rotation.z` |
| Pivot X, Y, Z | `$name.pivot.x`, `.pivot.y`, `.pivot.z` |
| Taper, twist and the shape's own settings | grouped by what they belong to, for example `$name.taper.top_length`, `$name.twist.angle`, `$name.gear.teeth`; after `$name.` the formula editor lists them all |

Renaming the body renames it in every formula that uses it. A copy of a named body - pasted, duplicated or inserted - does not keep the name, as two bodies cannot share one; a short message says so.

## The variables table

{{ui:variables.title}} opens with its button in the ribbon or [[Ctrl]]+[[Shift]]+[[V]]. Each row has a name, a value or a formula, its result and a short description. {{ui:variables.add}} adds a row; the bin removes one. A change counts once you press [[Enter]] or leave the cell, and [[Ctrl]]+[[Z]] takes it back like any other step. A result that cannot be worked out shows a red mark; its tooltip says why. Renaming a row renames it in every formula. Below the table you see which bodies have a variable name. The window can be moved by its title and made larger at its lower right corner.

## The formula editor

A longer formula is easier in the formula editor: click the *fx* at the start of a field a formula drives, or click into any field and then the *fx* that appears at its start. It shows the result while you type, or why there is none. After `$` it lists the variables and named bodies, after `$name.` the fields of that body, each with its value; the arrow keys and [[Enter]] or [[Tab]] take one. [[Enter]] then applies the formula, [[Shift]]+[[Enter]] starts a new line to keep a long formula readable, and [[Esc]] closes the editor without a change. It can be moved by its title.

## When values move

Everything that depends on a changed value follows it right away, as one step of the history: a body that follows `lid` moves when `lid` grows. A few things are worth knowing:

- **Dragging a field that has a formula** keeps the formula and adds the difference: `$wall * 2` dragged 5 mm further becomes `$wall * 2 + 5`. Moving a body together with the body it follows changes nothing in its formula.
- **A locked body** does not follow its formulas; its field says so.
- **Parts inside a group** keep their formulas and variable names when the group is closed, and formulas can read them. When a value they depend on changes, the group is built again a moment after the rest, in the same step of the history. Moving or stretching the group writes the difference onto its parts' formulas, as dragging does. A group with fillets or chamfers of its own is not built again; open it with {{ui:group.edit}} to update it.
