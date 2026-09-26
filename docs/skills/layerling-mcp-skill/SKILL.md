---
name: layerling-mcp-skill
description: Control a live local layerling editor through its MCP server. Use when the assistant needs to list currently open layerling editor tabs, target a tab by editorNumber/projectName, read the current scene, list or select objects, create any of the editor's shapes including threads, springs, gears and raised text, update dimensions/position/rotation, align objects, group/ungroup/cut/separate parts, list exact CAD edge ids, apply chamfer/fillet to specific edges, inspect editor errors, or capture viewport images from view-cube angles.
---

# layerling MCP

## Quick Start

Use this skill only with a local layerling app running in development mode.

1. Start layerling from the repo:

```bash
npm run dev
```

2. Open an editor tab at `http://localhost:3000/?editor=1`.

3. Configure your MCP client to start the stdio server:

```bash
node scripts/layerling-mcp-server.mjs
```

The MCP server talks to the app through `/api/layerling-mcp`. Open editor tabs heartbeat into that route and receive commands from it. Production and static builds intentionally return 404 for the MCP route.

## Client Compatibility

Codex can use this folder as a skill and the MCP server as tools. Install the folder under `~/.codex/skills/layerling-mcp-skill` and configure the MCP server in Codex.

Claude Code reads this same file directly from the repo: it looks for skills under `.claude/skills/<name>/SKILL.md`, so a copy lives at `.claude/skills/layerling-mcp-skill/SKILL.md` (kept identical to this one by a test, not a symlink - a symlink checked out on Windows without Developer Mode turns into a text file containing the path instead of loading). The repo's `.mcp.json` registers the stdio server project-scoped, so Claude Code starts it automatically; nothing needs installing by hand.

Claude Desktop does not read either kind of skill file, but it can use the same `scripts/layerling-mcp-server.mjs` MCP server through Claude's `mcpServers` JSON config. Use the repository README for client setup examples.

## Targeting Editors

Always call `layerling_list_editors` first when the user mentions multiple projects, tabs, or a number like `49536`.

Use `editorNumber` for follow-up commands. It is a 5-digit per-tab number stored in browser `sessionStorage`, so two open layerling tabs have different numbers. The list also includes `projectName`, `projectId`, URL, shape count, selected count, notice, and last error.

If only one editor is open, commands may omit `editorNumber`; the server will target the sole live editor.

## Core Workflow

Read scene/object state before modifying geometry:

```text
layerling_list_editors
layerling_read_scene({ editorNumber })
layerling_list_objects({ editorNumber })
```

For object edits, use exact object `id` values from the scene. Do not invent object names; names are helpful labels only.

Every object carries a `settings` block beside its dimensions, holding what the dimensions do not say: the side count of a round body, the size and pitch of a thread, the turns of a spring, the taper of a box, the lettering of a text. Every value it reports can be set again through `layerling_create_shape` and `layerling_update_object`. A round body whose `settings.sidesFollowSize` is true has no fixed side count of its own - the number shown is what it is drawn with at its current size, and it changes as the object grows. `includeRawShapes` is only needed for the full shape record and can be large.

Useful tools:

- `layerling_select_objects`: select ids in the live editor.
- `layerling_delete_objects`: delete ids in the live editor, or delete the current selection when ids are omitted.
- `layerling_create_shape`: create any shape the editor has a tile for - `box`, `cube`, `cylinder`, `polygon`, `sphere`, `cone`, `pyramid`, `wedge`, `roundRoof`, `halfSphere`, `torus`, `tube`, `text`, `thread`, `spring`, `gear` - or a `sketch` extrusion. Size and everything beyond it are optional and fall back to what the editor uses when the same shape is placed by hand. A `thread` is a rod, a screw, a nut or a tapped hole, set through `threadRole`; its width and depth follow `threadDiameter` and are not given separately. A cylinder without `sides` picks its own side count from the diameter, the way the editor does. Every shape except gear, thread, spring and pyramid can be tapered through `taperTopWidth`, `taperTopDepth`, `taperBottomWidth` and `taperBottomDepth`; naming one value of a face pins the other one as it stands.
- `layerling_import_mesh`: import STL-style mesh data into the editor.
- `layerling_update_object`: set exact dimensions, position, color, name, hole state, `rotation`/`rotationX`/`rotationZ`, `locked`/`hidden`, and the same shape settings `layerling_create_shape` takes - the side count of a cylinder, the diameter of a thread, the turns of a spring, the taper of a box, the lettering of a text. A locked object refuses every change until the same call passes `locked: false`. Changing a thread's diameter moves its width and depth with it, and a head that sat at its standard height moves to the standard for the new size.
- `layerling_align_objects`: align two or more ids using the same logic as the editor Alignment button.
- `layerling_group_objects`: group selected ids using the normal layerling group/boolean path.
- `layerling_boolean_cut`: pass `solidIds` and `holeIds`; the result replaces the operands.
- `layerling_ungroup_objects`: restore grouped children while preserving edited child geometry.
- `layerling_separate_parts`: split disconnected parts in one object.
- `layerling_hollow_object`: hollow a solid into walls of equal thickness, open on top, bottom, both, or closed.
- `layerling_inspect_errors`: read the editor notice, edge modifier error, and last MCP error.

## Edge Features

Chamfer and fillet are separate edge-treatment operations in layerling. Do not fake a chamfer/fillet with cylinders or extra decorative geometry. Cylinders are only appropriate when the requested shape itself has a circular/rounded 2D footprint, such as rounded tray corners or a cylindrical peg.

For chamfer/fillet, never guess edge ids.

1. Call `layerling_list_edges({ editorNumber, id, sharpAngle })`.
2. Use returned `selectableEdgeIds` or inspect returned edge geometry.
3. Call `layerling_apply_edge_treatment({ editorNumber, id, kind, edgeIds, amount, chamferAngle })`.

`edgeIds` can be an array of numeric ids or `"all"`. `kind` is `chamfer` or `fillet`. The app commits the result through normal history, so undo/redo works.

## Hollowing

For a box, cup, case or any body with walls, build the outside shape and hollow it with `layerling_hollow_object({ editorNumber, id, thickness, openings })`. Do not fake walls by subtracting a smaller copy of the shape - that gives uneven walls on anything but a box. The walls grow inward, so the outside keeps its size. `openings` is `top` (default), `bottom`, `top-bottom` or `none` for a sealed cavity; it needs a flat face on that side, measured against the world's up axis. `edges` is `round` (default; where the body steps or has an opening, the inner walls meet in a rounding as big as the wall) or `sharp` (they meet in a sharp edge). Too thick a wall is refused with an error - use a thinner one.

## Images

Use `layerling_capture_image` for viewport PNGs. `face` can be `current`, `home`, `top`, `bottom`, `front`, `back`, `right`, or `left`. These use the same camera/view-cube orientation logic as the editor UI.

## Visual Verification

After creating or heavily modifying an object, use vision when available. Capture at least one useful viewport image with `layerling_capture_image`; for 3D geometry, prefer `home` plus any needed orthographic-style faces such as `top`, `front`, or `right`. Inspect the rendered result against the user's requirements before saying the task is done.

Do not rely only on numeric scene data when the user asked for a physical object. Use numeric checks for dimensions and visual checks for whether the model reads correctly.

## Safety

This bridge is local-development only. If a command fails, call `layerling_inspect_errors` before retrying. For geometry operations that can be expensive, set a larger `timeoutMs` on the tool call.
