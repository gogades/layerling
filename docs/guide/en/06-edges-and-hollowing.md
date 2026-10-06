---
title: Breaking edges and hollowing bodies
summary: Chamfer and fillet on chosen edges, walls of equal thickness for boxes, cups and cases.
---

## Chamfering and filleting edges

Sharp edges rarely look good on a printed part, and they are not particularly strong either. A **chamfer** cuts the edge off at an angle, a **fillet** rounds it. Both act on the edges you click.

1. Select the body (or the group).
2. Click {{ui:editor.tool.fillet}} or {{ui:editor.tool.chamfer}} in the ribbon, or right-click the body and pick it from the menu.
3. The body's edges light up. Click those that should be affected. Another click takes an edge out again. With [[Shift]] you add or remove a single edge.
4. Set the size and confirm with {{ui:edge.apply}} or [[Enter]].

![The "Fillet edges" tool: all sharp edges are selected, the picture shows the preview with a 4 mm radius.](shot:fillet-preview)

The panel sits at the top right. If it covers edges you want to click, drag it away by its title bar; it opens there next time too, and so do {{ui:editor.tool.hollow}} and {{ui:editor.tool.array}}. Double-click the title bar to put it back.

In the panel you find:

- {{ui:edge.allSharpEdges}} selects every edge at once, {{ui:edge.clear}} empties the selection.
- **{{ui:edge.radius}}** for the fillet. For the chamfer you set {{ui:edge.distance}} or {{ui:edge.angle}}.
- {{ui:edge.sharpThreshold}} decides which edges count as sharp at all. A value of 25° treats only clear kinks as edges and leaves flat transitions alone.
- {{ui:edge.tangentChains}} takes along edges that flow smoothly into each other, for example all edges around a face with rounded corners.
- {{ui:edge.keepSize}} keeps the chamfer or fillet as large as it is, even if you scale the body later.
- {{ui:edge.previewQuality}} ({{ui:edge.draft}}, {{ui:edge.standard}} or {{ui:edge.fine}}) decides how finely the preview is calculated. For difficult parts {{ui:edge.draft}} is faster.

While you adjust the size, layerling recalculates the preview. It can take a moment. You may keep adjusting; the last value you chose is what gets calculated.

If the size is too large for the edge, layerling says so and suggests a smaller value. Often one or two millimetres less will do. At sharp angles a fillet needs more room than its radius suggests.

### Taking an edge treatment back

A treated body can always be treated again. Select it again and open the tool: under {{ui:edge.featureHistory}} you see what is already on it. {{ui:edge.revertAction}} takes back a single treatment. Note: if newer treatments lie on top, they go with it, and the panel tells you how many.

On a group, say a cylinder with a hole, the treated edge belongs to the finished body, not to one of its parts. So the group becomes a single body, and {{ui:editor.tool.ungroup}} is no longer available. Take the treatment back as described above and the group returns with all its parts. The easiest way is to treat edges last. That goes for threads too: the edge tool takes a thread as its exact body, so a block with a tapped hole in it gets its edges rounded with the thread in place. Working out a thread's edges takes longer than for a plain shape, a few seconds for an M6 and about half a minute for a G1/2 pipe thread.

> **Good to know:** layerling works with real CAD geometry for fillets and chamfers, not just a triangle mesh. That is why a rounded edge is still a rounded edge in the STEP export.

A part imported as STEP keeps its CAD geometry too: chamfers, fillets and hollowing work on the body from the file, however finely the part is drawn on screen. STL, OBJ and 3MF bring only triangles, and a finely drawn part can be too dense for the edge tool. If a part is also available as STEP, import that.

## Hollowing bodies

Boxes, cups, cases and covers have one thing in common: they are empty inside, with walls of equal thickness. That is exactly what {{ui:editor.tool.hollow}} does.

1. Select the body and click {{ui:editor.tool.hollow}}, or right-click the body and pick it from the menu.
2. Set the {{ui:shell.wall}}.
3. Choose which side stays open: {{ui:shell.opening.top}}, {{ui:shell.opening.bottom}}, {{ui:shell.opening.top-bottom}} or {{ui:shell.opening.none}} (fully closed, with a cavity in the middle).
4. Decide whether the {{ui:shell.edges}} should be {{ui:shell.edges.round}} or {{ui:shell.edges.sharp}}.
5. Click {{ui:shell.apply}}.

![The hollowing panel with wall thickness and open side.](shot:hollow-panel)

The walls grow inward. The outside stays as it is.

![The result: a shell with a 3 mm wall, open at the top.](shot:hollow-result)

For an opening at the top or bottom, the body needs a flat face there. Spheres and free-form shapes therefore cannot be hollowed this way. If the wall is too thick for the body, layerling tells you and asks for a thinner one.

If you resize a hollowed body later, layerling hollows it again at the new size right away. The wall stays as thick as you chose, round bodies included. A cylinder you pull further one way than the other becomes an ellipse.

> **Tip:** With a 0.4 mm nozzle, 1.2 to 2 mm of wall is a good start: thin enough to save material, thick enough for a sturdy part.
