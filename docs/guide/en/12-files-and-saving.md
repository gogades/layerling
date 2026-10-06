---
title: Files, saving and sharing
summary: Where your designs live, how to back them up, which formats layerling imports and exports, and what is possible on a shared server.
---

## Where your designs live

layerling saves everything in the browser on your computer. There is no account and nothing is uploaded. Every change saves itself. The preview picture on the start page shows the view you last had in front of you when you went back with {{ui:editor.homeDashboard}}. If you open layerling in the same browser days later, everything is there.

That has a downside: whoever clears the browser storage or switches to another computer loses the designs. **So back up important work into a file.**

## Backing up and passing on

On the start page every design has a menu with the options to rename, duplicate and delete. With {{ui:dashboard.backupAll}} you pack all designs into one single file. Through {{ui:dashboard.importGeometry}} they come back, also in another browser or on another computer. The {{ui:myShapes.title}} of this browser travel in the same file, in the folder `Custom shapes`, see [Shapes](chapter:shapes).

You back up a single design in the editor: {{ui:editor.export}}, choose the format **LYL** and click {{ui:export.saveProject}}. The LYL file is layerling's own design format and contains everything: shapes, groups, sketches, CAD data, imported sources and the history, meaning the undo steps. Under {{ui:export.historyTitle}} you choose how many of the last steps travel along; it starts at what the settings (the cogwheel in the ribbon) keep under {{ui:workspace.history}}. Older `.skf` files from earlier versions can still be opened; they are then saved as `.lyl`.

## Exporting

Click {{ui:editor.export}} or press [[Ctrl]]+[[E]].

![The export window with the formats STL, 3MF, OBJ, STEP, SVG, PNG and LYL.](shot:export-panel)

At the top is the file name, below it you choose the format. With something selected, only the selection is exported, otherwise the whole design. If the selection leaves out visible parts, a note in the window says so plainly, and {{ui:export.selectAll}} selects everything visible in one click. Once the file is written, the window closes by itself; if the export fails, it stays open with the message.

| Format | For | What to know |
| --- | --- | --- |
| **STL** | slicer and 3D printing | A triangle mesh. The simplest and most widespread format. |
| **3MF** | slicer with colours | Every body stays a part of its own with name and colour. Overlapping bodies are only joined when they share a colour; where a shape sits inside one of another colour, say a logo in a plate, the one built first leaves room for the later one. Suited to PrusaSlicer, Bambu Studio, OrcaSlicer and Cura. Bambu Studio and OrcaSlicer ask on opening how to map the colours onto your filaments, and call the file "not from Bambu" - the message is harmless. |
| **OBJ** | modelling and exchange | A widely supported mesh format. Colours are stored as vertex colours in the same file, with no extra `.mtl`. Bambu Studio and OrcaSlicer read them and ask, as with 3MF, how to map them onto your filaments; other programs see only the shape. As with 3MF, overlapping bodies are only joined when they share a colour. |
| **STEP** | a full CAD program | Keeps boxes, cylinders, spheres and cones as exact geometry, and so shapes made from an outline (star, heart, ellipse, tube, half sphere, round roof, rounded box, dovetail, the bores and more), the bent tube, threads, springs and gears, plus fillets and chamfers. The first STEP export in a session loads the CAD kernel (about 22 MB) once. |
| **SVG** | laser cutter and plotter | A clean top view in millimetres, including holes and curved outlines. |
| **PNG** | forum posts, print sites, questions | A picture of the view as it is, at twice the resolution and without handles, selection frames and dimensions. {{ui:export.png.plate}} and {{ui:export.png.transparent}} are chosen in the window. Turn and zoom first until the picture is right; the selection does not matter here. |
| **LYL** | layerling itself | The editable design with everything that belongs to it. |

Holes cannot be exported on their own. Group them with a body first, otherwise layerling points it out.

### How much filament does it take?

For STL, 3MF, OBJ and STEP the {{ui:export.estimateTitle}} box shows the volume, weight and length of 1.75 mm filament of what is exported. It counts like the file: visible bodies only, groups with their holes taken off, overlaps only once. On the right you pick the filament - PLA, PETG, ABS, ASA, TPU or PA (nylon) - and the weight follows its density. It is worked out as solid, as if printed with 100 % infill. With walls and infill the slicer shows less; the number is the upper bound, good for comparing and for whether the spool will last.

## Importing

With {{ui:editor.import}} or [[Ctrl]]+[[I]] you bring foreign files into the design.

![The import window: open or insert designs and drop geometry.](shot:import-panel)

- **{{ui:import.openProject}}:** A layerling design (`.lyl`, or an older `.skf`) comes back as a new design.
- **{{ui:import.insertProject}}:** The bodies of a layerling design are added to the open one. Handy for basic shapes you need again and again: build them once, save them and bring them in every time.
- **Add geometry:** Drop STL, OBJ, 3MF, STEP or SVG files in the window or click to choose a file. Imported meshes can be turned, moved, cut with holes and built upon. An SVG becomes a shape you can build on, one from a tracer such as picsvg.com or Inkscape's "Trace Bitmap" as well. A coloured OBJ or 3MF comes in as one body per colour, each in its place. In an OBJ the colours sit either in the file itself, as in an OBJ from layerling, or in an `.mtl` beside it. Select that one too, or import the whole ZIP the way Tinkercad hands out its OBJ. A 3MF carries its colours itself, and in a project from Bambu Studio, OrcaSlicer or PrusaSlicer each part takes the colour of its filament. Colour painted onto faces in the slicer is not read.

Template pictures are added in sketch mode, see [Sketches](chapter:sketches).

## Simplifying an imported mesh

A scanned or sculpted mesh often has far more triangles than its shape needs, and every one of them is carried along while you move, cut and save. {{ui:simplify.title}} in the Modify group (or in the right-click menu of the body) shows the mesh as it is next to what a chosen share of its triangles would leave of it; both views turn and zoom together with the mouse buttons of the workplane. Set how much to keep as a percentage or a number of triangles, and {{ui:simplify.apply}} takes the lighter mesh. The result is a plain mesh: for the result of a cut or merge, {{ui:group.edit}} and its original parts are given up.

Cutting, merging and intersecting an imported mesh is calculated in your browser, so the workspace settings limit how many triangles such a mesh may have ({{ui:workspace.booleanTriangleLimit}}). A mesh above the limit is not processed, and the message names its triangle count; simplify the mesh first, or raise the limit if your computer can take it.

## Reporting a bug

If layerling does something unexpected, save a {{ui:editor.bugReport}}: the link sits in the footer at the bottom, next to the forum. It is an ordinary .lyl file with your design that opens in layerling, and it also carries a short text file with the version, browser, screen size, the last messages and any errors. Nothing personal is in it. Attach the file to your post in the forum or on GitHub, so the problem can be followed with exactly your design.

## Shared designs on a server

When layerling runs on your own computer or web server, it can offer a shared folder in which all users keep designs. On the start page it then appears as {{ui:dashboard.sharedProjects}}. You create folders there, move designs by dragging and search across the whole folder. A design that lives there saves itself back to it. Custom shapes kept on the server sit in its folder `Custom shapes`, see [Shapes](chapter:shapes).

That is not simultaneous editing: whoever opens a file works on a copy of their own. If somebody else has changed the file in the meantime, layerling refuses to overwrite it.

On layerling.com this function is not switched on. How to set it up on your own server is described in the [README on GitHub](https://github.com/henmedia/layerling/blob/main/README.md).
