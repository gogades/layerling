---
title: Selecting and arranging
summary: Selecting shapes, finding them in the object list, aligning, mirroring, rotating, laying flat on a face and multiplying in patterns.
---

## Selecting

A click on a shape selects it. With [[Shift]] you add more or take them away again. A click on empty space clears the selection, and so does [[Esc]]. Drag a frame on the empty workplane to select everything it touches; with [[Shift]] held, the frame adds what was not selected and takes away what was. And [[Ctrl]]+[[A]] selects all visible bodies.

What is in your way you hide ({{ui:editor.tool.hideSelected}}, [[Ctrl]]+[[H]]). Hidden shapes stay in the design, they are just not visible and stay out of the export; the export window says beforehand how many there are. [[Ctrl]]+[[Shift]]+[[H]] brings them all back. What should stay put you lock with the padlock at the top of the settings or with [[Ctrl]]+[[L]]. Locked shapes can neither be moved nor deleted by accident.

## The object list

With many parts it is easy to lose track in the view. The object list ({{ui:editor.tool.showOutliner}} or [[Ctrl]]+[[Shift]]+[[O]]) shows all shapes as a list.

![The object list: the group "Group" with two parts and a sphere beside it. A folder icon opens the group.](shot:object-list)

- A click on an entry selects the shape, including parts inside a group. With [[Shift]] held you add more entries or take them away again, just as in the view. The arrows fold groups open and shut.
- The label shows whether a part is {{ui:outliner.solid}} or {{ui:outliner.hole}}.
- Padlock and eye lock and hide single parts.
- {{ui:outliner.rename}} gives a part a name of its own; the pencil beside the name at the top of the settings does the same for the selected shape. Sensible names help enormously in larger designs.
- The search field finds shapes by name and by kind, so also "cylinder" or "hole". It also looks inside groups, however deeply nested: a group holding a match stays in the list and folds open to show the matching parts and the groups that lead to them. A group found by its own name shows all its parts when you open it.
- The arrow on the far left of the title bar folds the list down to its title bar and back.

The list sits docked just right of the view cube. Drag it by its title bar to put it anywhere on the workplane; it passes underneath the view cube and the camera bar. Drop it back beside the view cube, or double-click the title bar, and it docks again. Where it was and whether it was folded are remembered in this browser.

## Typing a position

The card {{ui:inspector.position}} in the properties panel shows where the selected body stands, and you can type it: {{ui:prop.positionX}} and {{ui:prop.positionY}} are the middle of its box on the plate, with the same signs as the distances shown on the workplane, and {{ui:prop.positionZ}} is the height of its underside. The values go in the unit you set, and the sliders reach as far as dragging does.

## Parking parts beside the plate

You can drag a shape past the edge of the plate and leave it there, about one plate width beyond each side, to keep it for later. The arrow keys move it as far as you like. A parked part still belongs to the design and goes into the export with everything else. To leave it out, hide it or export only the selection. If you have picked a printer, layerling warns at export when something sits outside its plate.

## Snapping while moving

When you drag a shape across the workplane, it snaps to other shapes: its left, right, front or back edge or its centre lands exactly on an edge or centre of another shape. A pink guide line shows what it is holding on to. That way two parts sit flush side by side or centred one behind the other without typing numbers. It works with the grid switched off, too.

Hold [[Shift]] while dragging to keep the move on one axis: the shape follows whichever direction, X or Y, you have dragged further in, and leaves the other alone. Best press [[Shift]] once you are already dragging; on a shape that is not selected yet, a click with [[Shift]] only adds it to the selection.

With [[Alt]] already held when the drag begins, you drag a copy, as in Tinkercad: the shape stays where it is and the copy lands where you let go. Pressing [[Alt]] only on the way pauses snapping; the shape then follows the grid only. A copy, too, snaps only once you let go of [[Alt]] on the way. To switch snapping off for good, use the grid menu in the bottom right ({{ui:inspector.objectSnap}}) or the settings. For now only moving on the normal workplane snaps, not lifting and not resizing.

## Aligning

Two or more selected shapes are lined up with {{ui:editor.tool.align}}: points appear around the selection for left, centre and right, front, centre and back, and top, centre and bottom. A click on a point moves all shapes there. If you first click one of the selected shapes, it stays in place and the others line up with it.

![Align shows the possible targets as dots around the selection.](shot:align)

The key is [[L]]. [[Esc]] cancels.

## Mirroring

{{ui:editor.tool.mirror}} ([[M]]) flips the selection across a plane: {{ui:mirror.leftRight}}, {{ui:mirror.frontBack}} or {{ui:mirror.topBottom}}. Click the matching axis arrow. That is handy for symmetric parts: build one half, copy it and mirror the copy.

## Rotating and setting the pivot

You rotate with the curved arrows on the shape, with the numbers in the settings or with [[R]] in 45° steps. Normally the selection turns about its centre. Sometimes it should not, for example when a tilted tube is to be turned further at its end. For that there is {{ui:editor.tool.rotationPivot}}: afterwards click on a face. A flat face supplies its centre, for example the axis of a tube end. The selection now turns about that point. A second click on the tool removes it again.

The angles stay with the body. In its settings, {{ui:inspector.rotation}} shows them as {{ui:prop.rotateX}}, {{ui:prop.rotateY}} and {{ui:prop.rotateZ}}, named like the position: Y runs across the plate, Z is up. Type an angle there and the body turns to it - about its centre, or about its own pivot if it has one. While a turned body is selected, its angles also show below it on the workplane; {{ui:workspace.showRotationAngles}} in the settings switches that off.

With **one body** selected, the pivot belongs to that body: select other parts and come back, and it is still there. It moves, turns and scales with the body, is saved in the project and comes back with Undo. Under {{ui:inspector.position}} the pivot has its own X, Y and Z, which you can type or nudge, and {{ui:inspector.pivotRemove}} takes it away. With several bodies selected the pivot is only for that selection, and a new selection removes it.

## Laying flat on a face

Should a part lie on its best side for printing? Select it, click {{ui:editor.tool.layFlat}} and then the face that should go down. While you move the pointer over the part, the face under it lights up, so you see which one you are about to pick; turn the view to check the other sides. The part turns so that this face rests on the workplane.

Two parts should meet face to face, or line up flush? Select the part that should move, click {{ui:editor.tool.mateFaces}}, then click its face and after that the face of the other part. In the panel, {{ui:mate.mode.against}} puts the faces against each other (back to back, touching), {{ui:mate.mode.flush}} lays them in one plane side by side; {{ui:mate.gap}} leaves room between them, for example for clearance. {{ui:mate.apply}} moves the part: it turns the shortest way until the faces are parallel - not at all if they already are - and then slides only towards the other face, so it keeps its place sideways. The other part stays where it is, and one Undo takes it all back.

Just as simple are {{ui:editor.tool.dropToWorkplane}} ([[D]]), which drops the selection onto the workplane, and {{ui:editor.tool.centerOnWorkplane}}.

## Patterns: row and circle

For hole grids, bolt circles and rings of teeth there is the {{ui:editor.tool.array}}. Select the shapes to be multiplied and click it in the ribbon.

![The pattern in "Circle" mode: the copies first appear as a preview.](shot:pattern-tool)

- **{{ui:array.mode.row}}:** The selection is repeated at equal distances. The row steps along all three axes at once, with {{ui:array.spacingX}}, {{ui:array.spacingY}} and {{ui:array.spacingZ}}: one of them gives a straight row, two or three a diagonal row or a staircase. A negative spacing lays the row the other way.
- **{{ui:array.mode.circle}}:** The selection is spread around a centre. How many copies there are you set under {{ui:array.count}}, and the {{ui:array.angle}} is 360° for a full circle. Choose whether the copies turn along. {{ui:array.rise}} lifts every copy a little more than the one before (a screw or an ascending spiral), and {{ui:array.radiusChange}} moves it further from the centre or closer to it (a flat spiral); together they give a conical spiral.

Tip: first set the pivot on a face with {{ui:editor.tool.rotationPivot}}, then the centre of the circle lies exactly there.

![The pattern in "Circle" mode with a rise and a radius change per copy: the copies climb and widen like a spiral.](shot:pattern-spiral)

The copies first appear as a preview. Only {{ui:array.apply}} creates them. If the copies are holes, group them afterwards with the body they should cut into.

## Undoing

{{ui:editor.tool.undo}} ([[Ctrl]]+[[Z]]) and {{ui:editor.tool.redo}} ([[Ctrl]]+[[Shift]]+[[Z]] or [[Ctrl]]+[[Y]]) step through your history. How many steps travel with the saved design you set in the settings under {{ui:workspace.history}}.

## Looking back: the history view

{{ui:editor.tool.history}}, next to undo and redo, opens a view of your history without changing anything. The work area shows the design as it was, and a slider at the bottom runs through every undo step: all the way to the right is the current state, each step to the left is one undo earlier, and states you have undone sit to the right of the current one. The arrow keys step through the states, [[Esc]] returns to the current state. You can turn and zoom the view meanwhile, but nothing can be selected or moved; the design itself stays exactly as it is. If the bar covers something, drag it away by its title bar; a double-click on it brings it back.

Two things you can take along from an earlier state. {{ui:historyView.createProject}} puts that state into a new design in the overview, named after this one with the time of that state in brackets - a design saved before layerling recorded times says "copy" instead - and with the history up to that point, so undo keeps working there. {{ui:historyView.export}} opens the usual export with that state as the design, so you can save it as STL, 3MF, STEP, a picture or a LYL file with the history up to that state.
