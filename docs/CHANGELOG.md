# Changelog

layerling started over at 1.0.0 when it was forked from SketchForge-3D 1.0.9.
Everything from 1.0.9 downwards is SketchForge's history, kept here because the
code still carries it - so a lower number further down is older, not newer.

## Unreleased

- layerling has icons of its own in the sizes a browser cannot make from an SVG. iOS takes nothing but PNG for the home screen, so **Add to Home Screen** used to put a snapshot of the page there instead of the mark, and anything that asks for `/favicon.ico` out of habit got a 404. The mark itself is unchanged: the PNGs are drawn from the same `layerling-icon.svg` the browser tab already shows, so it stays the one place the brand is described.
- A web manifest makes the site something a browser can install - its own window without an address bar, under the right name and icon, and on Android an icon that survives being masked into whatever shape the launcher uses. There is no service worker, so an installed layerling still needs the network; installing only takes the browser's own frame away.
- A link to layerling.com brings a picture with it now: the mark, the name and the line about what this is. The page carried no `og:image` at all until now, so a forum or a messenger had nothing to show but the bare address.
- Dark mode shows its toolbar again. The drawn marks are all `currentColor`, so a tool can take the colour of the group it sits in - but the rule that set that colour named a near-black outright instead of the theme's ink. On the dark ground the enabled tools were dim and the disabled ones were gone altogether, which left whole groups looking like empty boxes. Brightening them through a filter had been papering over it; that is gone too, because it only washed out what now has the right colour to begin with.
- Two more corners that the dark theme had missed: the light ground beneath the 3D canvas, which flashed white wherever the canvas had not caught up with a resize, and the heading of the folded-up welcome panel, which was left darker than the line underneath it.
- **Sketch to 3D** opens its menu again on a window narrower than 1240 pixels. Below that width the toolbar scrolls sideways, and a row that scrolls in one direction cannot let anything hang out of it in the other - so the menu was drawn, just behind the workplane. The shapes menu beside it had been given the way out years ago; this one now takes the same one.
- The shapes menu in sketch mode says what its shapes are called. It had been printing the name of the translation instead of the translation, so the list read "sketch.rectangle" and "sketch.circle". Only the tooltip was right.
- Two shapes joined that menu: an **oval** and a **half circle**. The oval is an ellipse half as tall as it is wide; the half circle is an arc closed by its own chord, so it can be extruded straight away. Both arrive as ordinary points and edges, the same as the ones you draw - every point can be moved afterwards, every edge split. Their curves are four-point Béziers, which follow the true arc to within a ten-thousandth of its radius.
- And two more after them: a **pie slice** and a **bolt circle**. The slice is a quarter of the circle above it, an arc between two radii. The bolt circle is a disc with six holes on a pitch circle - at the size it arrives in, a 20 disc, a 13 pitch circle and 3 holes, which is clearance for an M3. Its holes are holes because the sketch says so: it counts how deeply each closed outline sits inside the others, and what sits an odd number deep is cut away. That is also why the disc comes along - six circles on their own would extrude into six pillars. Delete it if you want the pattern inside an outline of your own; it is an ordinary loop like any other.

## 1.3.0

- Added notes on the workplane. A note stays where you put it, or pins itself to a body and travels along as that body moves, turns and grows. The pin carries a number, a click folds the card open, a switch in **Visibility** hides all of them at once, and nothing of them reaches an exported STL. A note rides inside the design's own history, so undo and redo take it with them, and it travels in the `.lyl` and to the server without anything extra being asked for.
- **Duplicate** in a design's menu makes a copy of it. On the server the file itself is copied - beside the original, under a free name, picture included - so the copy carries the original's geometry down to the byte and nothing is repacked. In your browser the copy becomes a design of its own, with the same shapes, the same history and a preview picture of its own, bound to nothing on the server. The copy of a copy is called "(copy 2)", not "(copy) (copy)".
- The search now covers the whole server folder instead of only the one you happen to be standing in. It used to hide what did not match in front of you and leave the folder tiles untouched, so a design one level down was invisible and unreachable at once. Every hit now says which folder holds it, and that folder is a button: one click and you are there, with the search cleared. Folders are found by name as well, and while you search, the server tile on the start page says how many matches wait over there.
- The workplane can be worked with fingers. One finger does what the left mouse button does: tap to select, drag to move, drag on empty space for a selection box. Two fingers belong to the view - spread them to zoom, move them together to shift the workplane - and putting the second finger down takes back whatever the first one had started, so a pinch never nudges a part. Turning has no gesture of its own; the camera rail carries a switch for it, and that switch only appears on a touch screen. Until now the view could only be turned with the right mouse button and shifted with the middle one, and a tablet has neither.
- Number fields hand over their whole value when you jump into them, ready to be overwritten. A decimal keypad has no arrow keys to place the caret with, and a field five characters wide is not hit digit by digit with a finger: turning "20.00" into "35" meant deleting one character at a time, and a slip left "23.000".
- The MCP bridge can set the taper it had been reporting all along. The values arrived and were then dropped without a word, because everything a command carries is measured against the workspace shape defaults while a taper belongs to the single body - the same shape of bug as the thread and spring settings in 1.2.1. Which shapes ignore a taper is one function now, so the panel and the bridge cannot drift apart. `radius`, the rounding of a box, was dropped from what the bridge reports: the format carries it, but no control and no command sets it.
- Note for older versions: notes travel inside the design's history, which 1.2.2 and older know nothing about. They open such a file and pass the notes over - **and throw them away on the next save**. The format version itself is unchanged.

## 1.2.2

- The status line moved out of the camera rail's column: it floats at the top of the workspace now, beside the view cube, where a whole sentence fits. Down in the corner the two shared a column, and on a flat window - an iPad in landscape with all of Safari's bars - they met.
- It also goes away again. A confirmation steps back after four seconds, a prompt or a failure after thirty, and while there is nothing to report there is no panel at all.
- The camera rail begins sixteen pixels below the view cube instead of sixty-nine, and stands in two columns on a window too flat for one, plus and minus side by side. The rule hangs on the window's height now; the only one before it hung on the width and never matched a window that was wide but flat.
- Pressing the house takes the preview picture and saves a design that lives on the server, there and then. The preview used to wait for a pause in the work and was then taken from a canvas that the hidden editor had already collapsed to nothing - so it never arrived at all.
- A design that was merely opened no longer uploads itself moments later. What counts as a change is the content, not how often the editor's bookkeeping ran.

## 1.2.1

- Fixed the workspace settings losing what they had been told about threads and springs. **Shape defaults** offered the fields and the value took effect at once, but the next time layerling started it stood at standard again: the list those settings are checked against had never learned the two shapes that arrived in 1.2.0, and whatever is not on that list is dropped without a word on the way into storage. Every other shape kept its defaults all along.
- The MCP bridge can now build every shape the palette has a tile for - polygons, spheres, cones, pyramids, wedges, roofs, tori, tubes, gears, springs and threads - instead of boxes, cylinders and sketches alone. It takes its list from the same catalogue the shape menu is built from, so a shape added later is offered without anybody remembering to say so.
- What a shape is beyond its size now travels in both directions. A thread can be asked for by diameter and pitch, a spring by turns and wire, a text by its lettering, and the same values can be set again afterwards - a cylinder's side count can finally be pinned once the cylinder already stands there. Changing a thread's diameter moves its width and depth with it, and a head that sat at the standard height for its size moves to the standard for the new one.
- Reading a scene tells what a shape is made of. Until now the answer carried sizes only, so a client read the dimensions of a screw without ever learning whether M4 or M5 stood on it. A round body that has no side count of its own reports the number it is drawn with at its current size, and says that the number follows the size.
- A locked object was a dead end over the bridge: four operations refused to touch it and nothing could release it. The same call may now pass `locked: false`, and `hidden` can be set as well.
- Everything arriving over the bridge is held to the limits the panel uses, so a value cannot enter a design that would then be refused when that design is saved. A pitch of 99 on an M5 arrives as 3.75.

The bridge is the local development server's `/api/layerling-mcp`; static builds and layerling.com do not carry it, and none of this changes what the editor does by hand.

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
