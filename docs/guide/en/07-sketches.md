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

- **Draw:** {{ui:sketch.line}} makes straight sections: click points one after another. The {{ui:sketch.bezier}} is shaped with its handles: click a point and drag. The {{ui:sketch.smooth}} lays a flowing path through the points you click. To close the outline, click the first point again at the end.
- **Shapes:** {{ui:sketch.addShape}} offers ready-made outlines: {{ui:sketch.rectangle}}, {{ui:sketch.circle}}, {{ui:sketch.ellipse}}, {{ui:sketch.halfCircle}}, {{ui:sketch.pieSlice}}, {{ui:sketch.boltCircle}} (a disc with holes), {{ui:sketch.triangle}} and {{ui:sketch.hexagon}}. Pick one and drag a frame.
- **Selection:** {{ui:sketch.select}} moves points and lines. A click inside a closed outline selects the whole outline, so you can drag or resize it straight away; inside a hole it picks the hole. With [[Shift]] held, a click on a point or line adds it to the selection or takes it away again, so you can pick several and move them together. Drag a box over empty space to select everything in it. {{ui:sketch.refine}}: a click on a section adds a point, a click on a point removes it. Also there are {{ui:sketch.erase}} and inserting a template image ({{ui:sketch.addImage}}).
- **Clipboard:** {{ui:editor.tool.copy}}, {{ui:editor.tool.paste}}, {{ui:editor.tool.duplicate}} and {{ui:editor.tool.delete}} work on the selected points, lines and images, as in the 3D editor; [[Ctrl]]+[[X]] cuts. Pasted and duplicated geometry lands next to the original with a 10 mm gap, on a free spot where it touches no existing line, so it never gets joined to what is already there. It stays selected, so you can drag it straight into place.
- **History:** {{ui:sketch.undo}} and {{ui:sketch.redo}}.
- **View:** [[F]] fits the whole sketch in the view, [[Shift]]+[[F]] zooms to the selection, as in the 3D editor. The {{ui:camera.tapeTools}} on the side bar measures the distance between two points. The sketch also shows dimensions as soon as you click something: the length of a line, or for a point the lengths of the lines that meet there. On a straight line you can click the dimension pill and type the length in millimetres; [[Enter]] applies it, [[Esc]] cancels. The line keeps its direction, its start point stays where it is, and the lines at the other end follow. With an end point selected, that one moves. [[Alt]]+[[Enter]] grows the line to both sides around its middle. On curves the pill only shows the length.

A body comes only from a **closed** outline.

![An L-shaped outline. At the selected corner point, top left, the lengths of the two lines are shown in millimetres.](shot:sketch-outline)

## Rounding or chamfering corners

Click a corner point and choose {{ui:sketch.filletCorner}} or {{ui:sketch.chamferCorner}}. A small field appears for the {{ui:sketch.filletRadius}} or the {{ui:sketch.chamferDistance}}. Enter the size and confirm with the check mark. This works for corners between two straight lines.

![The corner at the top left is rounded with a 12 mm radius.](shot:sketch-fillet)

## Making a body from it

Click {{ui:sketch.finishSketch}}. The outline stands as a body on the workplane. In its settings you change the height, the colour and everything else as with any other shape. When you resize it, layerling builds it again from the sketch a moment later, and the sketch grows with it. So it stays an exact body that takes chamfers and fillets, and the next time you edit it the sketch has the size the body has.

If the workplane lies on the side of a body, you draw the way you look at that side: up in the sketch is up on the finished body too. The faint outline of the body in the sketch view shows where it stands.

![The outline has become a body. The corner is rounded.](shot:sketch-result)

With {{ui:inspector.editSketch}} you can return to the sketch at any time to change it. Edge treatments you already made on the body are lost, though, because the edges are created anew.

### Revolving

When revolving, you draw half the cross-section **to the left of the axis** shown in the sketch. Next to it you see a 3D preview of the revolve. It shows at once what the body will look like. The outline must be closed. At the end click {{ui:sketch.finishRevolve}}.

## A picture as template

With {{ui:sketch.addImage}} you put a photo or a drawing under the sketch and trace it. You can set its size, opacity and position. Once the picture sits right, lock it with [[L]] so you do not move it by accident while drawing. If its settings at the right edge cover the picture, drag them away by their title bar; a double-click on it docks them again.

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
| [[R]] | rotate the closed sketch by 45° |
| [[L]] | lock or unlock the template image |

> **Tip:** Draw as few points as needed. An outline with a few well-placed points gives a smoother body than a tangle of many.
