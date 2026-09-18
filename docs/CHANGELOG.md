# Changelog

layerling started over at 1.0.0 when it was forked from SketchForge-3D 1.0.9.
Everything from 1.0.9 downwards is SketchForge's history, kept here because the
code still carries it - so a lower number further down is older, not newer.

## 1.2.0

- Added threads as a shape of their own, in four forms: a threaded rod, a screw with a socket, countersunk or hex head, a hex nut, and a tapped hole. The thread is cut from the real ISO profile - sixty degrees, with the crest and the root flattened the way the standard prescribes - not from a sawtooth. That is what makes a printed screw actually run in a printed nut.
- M2 to M12 are listed by name, and so are UNC and UNF from #4 up to one inch. Diameter and pitch can also be set freely, and for an inch size the pitch field asks for threads per inch instead of millimetres, because that is the number written on the part. Left-hand threads are a switch, not a separate shape.
- A clearance value sets how much room the thread leaves, so a nut printed at 0.2 mm clearance turns on a rod instead of welding itself to it, and both thread ends can take a chamfer that leads the first turn in.
- In the panel, **Length** means the thread alone and the head has its own height slider, so shortening a screw no longer shrinks its head. The diameter is one slider: dragging a handle in the workspace scales both horizontal axes together, so a thread can never come out oval.
- The tapped hole is a cutting tool like any other. Drag it into a part, group the two, and the part has a thread in it.
- Added springs - a wire wound along a helix, with the number of turns, the wire thickness and the resolution as separate values. The spring fills the box it is given exactly, including the wire at both ends, so a spring of 30 mm measures 30 mm.
- Added the polygon: a prism of three to twenty-four sides, sitting exactly in its footprint. A hexagon inserted at 20 mm measures 20 mm across the flats and is equilateral, not squashed.
- The pyramid now has **Top length** and **Top width** instead of running to a point, which makes a frustum a matter of two numbers. Taper did the same job worse and has been dropped there, along with everywhere else it had nothing to act on.
- Corrected the footprint of round shapes: a cylinder drawn at 20 mm now measures 20 mm, where a low side count used to leave it noticeably smaller - a six-sided one measured 17.32.
- Round shapes now pick their own number of sides, following the diameter, so that no flat sits more than five thousandths of a millimetre off the true circle. A small pin no longer carries the polygon count of a large disc, and a large disc no longer shows its facets. **Sides follow the size** turns the following off and pins the number by hand; existing designs keep the number they were saved with.
- The shape list is laid out in several columns and no longer needs scrolling, and its heading is simply **Shapes**.
- Note for older versions: threads, springs, polygons and pyramid frustums are new shape types in the `.lyl` package. The format version is unchanged, so designs written here still open in 1.1, but a design that contains one of the new shapes does not.

## 1.1.0

- Designs can now be kept on the server instead of only in the browser, and everyone who opens the page sees them. Where layerling runs on Node, `LAYERLING_SHARED_PROJECTS_DIR` points at the folder; where it is served as a static export, `store.php` travels with it and a folder named `store` beside `index.html` switches it on. Without either, nothing changes.
- Designs on the server can be organised in subfolders, moved between them by dragging or through **Move to ...** in their menu, and dragged over from the browser. A design started inside a folder is created there, and every change saves itself back - five seconds after the last one and when the editor is left.
- Neither route has a login: whoever reaches the page can read, write and delete what is in the folder. It refuses anything that is not a `.lyl` package and any path that would lead out of the folder, and it will not overwrite a file that changed in the meantime.
- Dropped the settings window. The save path it offered only ever worked where layerling runs on Node on the same machine, and version, licence and source were in the footer anyway. The language moved to the top right corner as two small flags, where a website's language picker is looked for - and where the editor can show it too, so the language can be changed without leaving a design.
- Settled on one word for the thing you build: **Entwurf** throughout the German interface, **design** throughout the English. "Project" now only means layerling itself.

## 1.0.1

- Added a welcome panel that greets a first visit in place of the empty project list, with a short guide aimed at people arriving from Tinkercad. Once projects exist it folds into a single line under the list.
- Put the footer under the workspace as well, so the version, the legal pages and the way to the source stay in view while modelling.
- Added the version of the running build and a link to the release notes to that footer, plus an optional sponsor button configured through `NEXT_PUBLIC_SPONSOR_URL`.
- Fixed the wordmark clipping the descender of its g: the line box was shorter than the glyphs, and the rule that gives the name its ellipsis on narrow windows cut off everything below.
- Subtracted the new footer from every height inside the editor that was measured against the toolbar alone; the workspace and the sketch surface had been reaching past their container.

## 1.0.0

First release of the fork, based on SketchForge 1.0.9 and under the same licence.

- Translated the whole interface into German alongside English - not only the menus, but notices, dialogues and the names new projects are given.
- Renamed the project format to `.lyl` with the schema identifier `com.layerling.project`. Files written as `.skf` still open, whatever their format version, and are saved back as `.lyl`.
- Fixed the multi-second freeze that followed a simple transform in large projects: autosave no longer writes a full copy of every object's display edges into every undo state.
- Raised the project format to version 2, which stores display edges as deduplicated assets. Version 1 and the version 0 prototype are still opened; a reader that only knows version 1 refuses a version 2 package.
- Encoded and hashed mesh, display-edge, and imported-source data is now reused across saves instead of being rebuilt for every autosave, and restored undo states share one display-edge list per object.
- Reworked the ribbon: groups tell themselves apart by colour, the icons fit at every window width, and a Help group offers a keyboard-shortcut overview and a short guide to the editor.
- Added arrow-key nudging by the snap grid's own step, framing the camera on the selection, centring a selection on the active workplane, a label on the workplane's front edge, and dimension labels that stay clear of the rotation handle.

## 1.0.9

- Corrected Top and Bottom camera views so they align exactly with the vertical axis in both perspective and orthographic projection.
- Added Ctrl/Cmd + right-button panning in Sketch mode while preserving middle-button panning.

## 1.0.8

- Duplicated objects now stay in the exact position of their source instead of receiving an automatic offset.
- Added geometry shortcuts: `R` rotates selected objects by 45 degrees and `Shift+R` rotates them by 22.5 degrees around the active workplane normal.
- Corrected rotation controls so objects turn in the direction indicated by the pointer on every rotation plane.
- Kept selection outlines, resize anchors, and height controls stable during close zoom while naturally hiding controls that leave the viewport.
- Kept object faces visible from inside the object and hid rotation controls while the camera is inside the selection.

## 1.0.7

- Raised the supported `project.json` size in `.skf` packages from 32 MiB to 64 MiB and compacted new project exports without removing editable data.
- Reused decoded derived-mesh data across restored history states to reduce memory pressure when opening large `.skf` projects.
- Prevented workspace-only changes from advancing the persisted shape revision and replacing newer live objects with an older snapshot.

## 1.0.6

- Fixed dense STL imports failing with `Invalid string length` while creating their initial undo-history fingerprint.
- Streamed large numeric mesh arrays into deterministic hashes instead of converting millions of coordinates to one oversized JSON string.

## 1.0.5

- Made the rotation handles larger and aligned their arrow glyphs with the model faces as the camera moves, including stable behavior on long objects.
- Positioned the lower rotation handle consistently at the model base and corrected its visual and drag directions.
- Added an optional **Select before moving** workspace setting so the first click selects an object without immediately dragging it.

## 1.0.4

- Fixed imported STL objects briefly appearing and then vanishing when a stale IndexedDB project read completed after the import.
- Prevented older persisted project data from overwriting newer live editor state during asynchronous project hydration.

## 0.1.0

- Initial open-source alpha.
- Browser-based 3D workspace with primitive shape editing.
- STL import and STL/OBJ export.
- Grouping and hole subtraction workflows.
- Local project dashboard with generated thumbnails.
