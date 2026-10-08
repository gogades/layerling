---
title: "Sketches: from outline to body"
summary: Draw a flat outline, round or chamfer its corners and pull or spin it into a body.
---

Not everything can be put together from basic shapes. For parts with a contour of their own, such as a bracket, a tooth profile or a vase, you first draw the **outline** and then make a body from it. That is what sketch mode is for.

## Starting a sketch

At the top, switch from {{ui:editor.modeGeometry}} to {{ui:editor.modeSketch}}. Click {{ui:sketch.to3d}} in the ribbon and choose what the outline should become:

- **{{ui:sketch.extrude}}:** The outline is pulled upward, like a cookie cutter.
- **{{ui:sketch.revolve}}:** The outline is spun about an axis, as on a lathe. That gives vases, cups, cones and everything round.

The editor then shows a sheet with a grid. That is your drawing surface.

## Drawing

The ribbon in sketch mode is divided into areas:

- **Draw:** {{ui:sketch.line}} makes straight sections: click points one after another; holding [[Shift]] constrains the line horizontally or vertically. The {{ui:sketch.bezier}} is shaped with its handles: click a point and drag. The {{ui:sketch.smooth}} lays a flowing path through the points you click. To close the outline, click the first point again at the end.
- **Shapes:** {{ui:sketch.addShape}} offers ready-made outlines: {{ui:sketch.rectangle}}, {{ui:sketch.circle}}, {{ui:sketch.ellipse}}, {{ui:sketch.halfCircle}}, {{ui:sketch.pieSlice}}, {{ui:sketch.boltCircle}} (a disc with holes), {{ui:sketch.triangle}} and {{ui:sketch.hexagon}}. Pick one and drag a frame.
- **Selection:** {{ui:sketch.select}} moves points and lines. A click inside a closed outline selects the whole outline, so you can drag or resize it straight away; inside a hole it picks the hole. With [[Shift]] held, a click on a point or line adds it to the selection or takes it away again, so you can pick several and move them together. Drag a box over empty space to select everything in it. A line can be dragged too (it moves by its two ends, or all of the selection if it is part of one). The arrow keys move the selection by one grid step, [[Shift]] with them by a larger one, and [[Shift]] held while you drag keeps the move on one axis. {{ui:sketch.refine}}: a click on a section adds a point, a click on a point removes it. Also there are {{ui:sketch.erase}} and inserting a template image ({{ui:sketch.addImage}}).
- **Clipboard:** {{ui:editor.tool.copy}}, {{ui:editor.tool.paste}}, {{ui:editor.tool.duplicate}} and {{ui:editor.tool.delete}} work on the selected points, lines and images, as in the 3D editor; [[Ctrl]]+[[X]] cuts. Pasted and duplicated geometry lands next to the original with a 10 mm gap, on a free spot where it touches no existing line, so it never gets joined to what is already there. It stays selected, so you can drag it straight into place.
- **History:** {{ui:sketch.undo}} and {{ui:sketch.redo}}.
- **View:** [[F]] fits the whole sketch in the view, [[Shift]]+[[F]] zooms to the selection, as in the 3D editor. The {{ui:camera.tapeTools}} on the side bar measures the distance between two points. The sketch also shows dimensions as soon as you click something: the length of a line, or for a point the lengths of the lines that meet there. The {{ui:sketch.showMeasurements}} button on the side bar hides and shows these dimensions when they get in the way, for example while shaping curves; the tape measure keeps working. On a straight line you can click the dimension pill and type the length in millimetres; [[Enter]] applies it, [[Esc]] cancels. The line keeps its direction, its start point stays where it is, and the lines at the other end follow. With an end point selected, that one moves. [[Alt]]+[[Enter]] grows the line to both sides around its middle. On curves the pill only shows the length.

A body comes only from a **closed** outline.

![An L-shaped outline. At the selected corner point, top left, the lengths of the two lines are shown in millimetres, and the angle between them in degrees.](shot:sketch-outline)

## Curving a straight side

Select a straight line and click {{ui:sketch.curveLine}} in the bar that appears: the side bows out into a curve, as in Tinkercad, and shows its two handles. Drag them to shape the curve; the further out a handle stands, the stronger the bend. {{ui:sketch.straightenLine}} makes the side straight again. A point you select can be made round with {{ui:sketch.smooth}}: it gets handles of its own and the lines next to it become curves.

![The bottom side of the L-shaped outline bent into a curve, with its two handles at the ends.](shot:sketch-curve)

## Reading and typing angles

Click a corner point where **two straight lines** meet: next to the lengths, layerling shows the **angle** between them in degrees, with a small arc. On a closed outline it is the angle inside the shape, so a dent reads above 180°. Click the value and type a new angle. One of the two lines then turns about the corner and keeps its length, and the other stays where it is. The line that turns is drawn dashed; [[Tab]] switches to the other one, [[Enter]] applies and [[Esc]] cancels. What hangs at the far end of the turned line goes with it.

A corner shows no angle where a curve meets it, or where more than two lines meet. The {{ui:sketch.showMeasurements}} button on the side bar hides the angle together with the lengths.

## Rounding or chamfering corners

Click a corner point and choose {{ui:sketch.filletCorner}} or {{ui:sketch.chamferCorner}}. A small field appears for the {{ui:sketch.filletRadius}} or the {{ui:sketch.chamferDistance}}. Enter the size and confirm with the check mark. This works for corners between two straight lines.

![The corner at the top left is rounded with a 12 mm radius.](shot:sketch-fillet)

## Making a body from it

Click {{ui:sketch.finishSketch}}. The outline stands as a body on the workplane. In its settings you change the height, the colour and everything else as with any other shape. When you resize it, layerling builds it again from the sketch a moment later, and the sketch grows with it. So it stays an exact body that takes chamfers and fillets, and the next time you edit it the sketch has the size the body has.

If the workplane lies on the side of a body, you draw the way you look at that side: up in the sketch is up on the finished body too. The faint outline of the body in the sketch view shows where it stands. If the workplane cuts through a body, the sketch view shows the outline of that cut instead, so a hollow body appears as a ring and you can line the sketch up with its walls.

![The outline has become a body. The corner is rounded.](shot:sketch-result)

With {{ui:inspector.editSketch}} you can return to the sketch at any time to change it. A double click on the body does the same, as in Tinkercad (a locked body stays closed). Edge treatments you already made on the body are lost, though, because the edges are created anew.

### Revolving

When revolving, you draw half the cross-section **to the left of the axis** shown in the sketch. Next to it you see a 3D preview of the revolve. It shows at once what the body will look like. The outline must be closed. At the end click {{ui:sketch.finishRevolve}}.

A revolved body is an exact body, like an extruded one: it takes chamfers and fillets, and you can hollow it, for a cup or a vase. A body revolved with an older layerling is a mesh; open {{ui:inspector.editSketch}} and finish it again to make it exact. A profile that reaches across the axis cannot be built exactly and becomes a mesh, as before.

## A picture as template

With {{ui:sketch.addImage}} you put a photo or a drawing under the sketch and trace it. You can set its size, opacity and position. Once the picture sits right, lock it with [[L]] so you do not move it by accident while drawing. A locked image is out of the way: clicks go through it, so you can pick lines and points on top of it and drag a frame over them. To select it again, for example to unlock it, [[Alt]]+click it. If its settings at the right edge cover the picture, drag them away by their title bar; a double-click on it docks them again.

## Keys in sketch mode

| Key | Effect |
| --- | --- |
| [[Esc]] | end the line chain, clear the selection |
| [[Delete]] | delete the selected element |
| [[Ctrl]]+[[C]] | copy the selection |
| [[Ctrl]]+[[X]] | cut the selection |
| [[Ctrl]]+[[V]] | paste |
| [[Ctrl]]+[[D]] | duplicate the selection |
| [[Ctrl]]+[[Z]] | undo |
| [[Shift]] | while drawing: constrain line horizontally or vertically; while dragging: keep movement on one axis |
| [[R]] | rotate the closed sketch by 45° |
| [[L]] | lock or unlock the template image |

> **Tip:** Draw as few points as needed. An outline with a few well-placed points gives a smoother body than a tangle of many.
