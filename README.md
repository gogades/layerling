<div align="center">
  <table>
    <tr>
      <td width="145" align="center">
        <img src="apps/web/public/assets/layerling/layerling-logo.svg" width="110" alt="layerling logo">
      </td>
      <td>
        <h1 align="right">layerling</h1>
        <h3 align="right">Easy 3D CAD for 3D printing</h3>
        <p align="right">
          Drop a shape, cut a hole, round an edge, print it. In your browser, with no account and no CAD background.
        </p>
      </td>
    </tr>
  </table>

  <p>
    <a href="LICENSE"><img alt="GNU AGPLv3 license" src="https://img.shields.io/badge/license-AGPLv3-663399"></a>
    <img alt="No account needed" src="https://img.shields.io/badge/no%20account-nothing%20to%20sign%20up%20for-dd7906">
    <img alt="Made for 3D printing" src="https://img.shields.io/badge/made%20for-3D%20printing-ff9e2c">
    <a href="#layerling-mcp-skill"><img alt="Drivable by AI" src="https://img.shields.io/badge/AI--drivable-MCP%20server-16c0d4"></a>
  </p>

  <p><strong>English</strong> · <a href="README.de.md">Deutsch</a></p>
</div>

<p align="center">
  <img src="docs/media/screenshot.png" width="859" alt="layerling in the browser: the logo as a 3D model on the build plate, with the editor ribbon above it">
</p>

<p align="center"><em>The logo itself, built in layerling by Claude: three boxes, stacked, every edge filleted.</em></p>

## Who It Is For

You own a 3D printer. You want a part that fits something, not a career in CAD.

layerling works the way you already think: put a shape on the plate, drag it to size, turn a second shape into a hole, group the two, export, print. There is nothing to learn before you start and **nothing to sign up for** - open the page and build. Your designs stay in your own browser; no account, no cloud, nothing uploaded anywhere.

### Coming from Tinkercad?

You will recognise everything: the plate, the shapes, solids and holes, group and ungroup. Two things are waiting for you that you have been missing:

- **Chamfer and fillet.** Pick an edge and break it or round it - the one thing people ask for most once a printed part has to feel finished or slot into something. Applied edges stay reversible: take them off again whenever you like.
- **Real geometry underneath.** layerling keeps exact CAD shapes, not just a mesh, so a rounded edge stays a rounded edge. Export STL or OBJ for the slicer, or STEP if you want to carry the design into a full CAD program later.

And the parts you already have keep working: import an STL and build around it.

> **An AI can build along with you.** layerling ships an MCP server. An AI client such as Codex or Claude sees an open
> editor tab and works in it: add shapes, change measurements, group, cut, round edges, read the scene back, take pictures
> of the viewport. You describe the part, the AI builds it, you watch it happen and step in. This runs against a local
> layerling - see [layerling MCP Skill](#layerling-mcp-skill) for the setup.

## What It Does

- **Nothing to sign up for** - no account, no login, no layerling cloud. Designs live in your own browser, with thumbnails so you recognise them again.
- **Drivable by an AI** - an MCP server is included: an AI client builds in the open editor while you watch every step and step in whenever you want. Local, with nothing leaving the browser.
- **A real build plate** - grid, snapping, handles for moving, resizing and rotating, and a panel with the exact numbers when you need them.
- **Primitive shape library** - boxes, cylinders, spheres, cones, pyramids, wedges, text, roofs, half spheres, torus shapes, tubes, and more.
- **Solid and hole workflow** - turn shapes into cutters and group them into final geometry.
- **Boolean Intersection** - keep only the geometry where selected solid and hole shapes overlap.
- **Chamfer and fillet** - break or round any edge of a solid, and remove the treatment again later.
- **Bring your own models** - import an STL and build around it.
- **Projects as files** - save a whole project, history, sketches and groups included, as a `.lyl` file and carry on elsewhere. Older `.skf` files from earlier versions still open; saving then writes a `.lyl` beside them.
- **Export what your slicer wants** - STL or OBJ, for the selection or the whole scene, plus STEP if the design should travel on into a full CAD program.
- **Perspective or straight-on** - switch between the normal view and a flat, orthographic one with the cube button beside the zoom controls, or by pressing **O**. Your viewing direction and framing are kept.

## Where this comes from

layerling is a fork of [SketchForge-3D](https://github.com/Formsmith746/SketchForge-3D) by Formsmith746 and the SketchForge
contributors, licensed under the GNU Affero General Public License v3.0 only. The fork started on 16 September 2026 from
SketchForge 1.0.9.

SketchForge remains an excellent project and the reason this one exists.

## Getting Started

The shortest way is the hosted version. Nothing to install, nothing to sign up for - open it and build:

**http://layerling.henmedia.de/**

The rest of this page is about running your own copy: on your computer, or on a machine in the workshop that everyone opens in their browser. [Working on layerling](#working-on-layerling) is the way there.

Wherever the app is served from, the designs never leave the browser they were made in. Exports download straight to the person's own computer.

### Get the Files

```bash
git clone https://github.com/henmedia/layerling.git
cd layerling
```

No Git? Press the green **Code** button on the GitHub page, choose **Download ZIP**, extract it, and open a terminal in the extracted folder.

## Working on layerling

Take this path if you want to change the code.

### What You Need

- Node.js 20 or newer
- npm, included with Node.js

Check your versions:

```bash
node -v
npm -v
```

If those commands do not work, install Node.js from the official Node.js website and reopen your terminal.

### Install and Run

From the layerling project folder:

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000/
```

Leave the terminal open while you use the app. To stop the development server, press `Ctrl+C` in the terminal.

### Shared Projects on a Network

If you run layerling with `npm run dev` or `npm run start` on a machine other people open in their browser, it can offer a
shared folder for `.lyl` projects. Point `LAYERLING_SHARED_PROJECTS_DIR` at a directory before starting:

```bash
LAYERLING_SHARED_PROJECTS_DIR=/srv/layerling-projects npm run start
```

The **Shared** dashboard section then lists what is in there, and **Export → LYL → Save to shared** writes the current
project into it. Thumbnails land beside the files in `.thumbnails`. Private designs stay untouched in each user's browser.

Opening a shared file gives you a private local working copy. Saving back checks the revision on the server first; if
someone else changed the file in the meantime, layerling refuses to overwrite it and asks you to reload or save under a
different name. This is shared file storage, not simultaneous editing.

### Useful Developer Commands

Run TypeScript checks:

```bash
npm run typecheck
```

Run tests:

```bash
npm run test
```

Start the local layerling MCP bridge for editor automation:

```bash
npm run mcp:layerling
```

## Contributing

Contributions are welcome, and you do not have to be a 3D printing person to help - a clearer sentence in this README counts. Good places to help:

- editor bug fixes
- geometry and boolean test cases
- STL import/export edge cases
- UI polish
- documentation screenshots and videos
- accessibility and performance improvements

Read [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) before opening a pull request.

## Security

Please do not open public issues for security-sensitive reports. Read [.github/SECURITY.md](.github/SECURITY.md) for the reporting process.

## License

Copyright (C) 2026 layerling contributors.
Copyright (C) 2026 SketchForge contributors.

layerling is a modified version of SketchForge-3D and is licensed under the **GNU Affero General Public License v3.0 only**
(`AGPL-3.0-only`) - the same licence as the original. See [LICENSE](LICENSE), and "Where this comes from" above.

If you modify layerling and let people use the modified version over a network, section 13 of the licence requires you to
offer them the corresponding source code. The dashboard carries a **Source** link for exactly that: set
`NEXT_PUBLIC_SOURCE_CODE_URL` at build time to the public URL of the source your build came from.

## layerling MCP Skill

layerling includes a local MCP server for AI clients that support MCP tools. It lets an agent inspect and control a live local editor tab: list open editors, read the scene, create/update/select objects, group/cut/separate parts, list CAD edge ids, apply chamfer or fillet, inspect errors, and capture viewport images.

This is for local development only. Run layerling with `npm run dev`; the MCP route is disabled in production builds and static hosting.

### Start layerling for MCP

From the layerling project folder:

```bash
npm install
npm run dev
```

Open an editor tab:

```text
http://127.0.0.1:3000/?editor=1
```

The AI client starts the MCP server with:

```bash
node scripts/layerling-mcp-server.mjs
```

### Codex

The Codex skill is included at:

```text
docs/skills/layerling-mcp-skill
```

Install it into your Codex skills folder.

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item -Recurse -Force "docs\skills\layerling-mcp-skill" "$env:USERPROFILE\.codex\skills\layerling-mcp-skill"
```

macOS or Linux:

```bash
mkdir -p ~/.codex/skills
cp -R docs/skills/layerling-mcp-skill ~/.codex/skills/
```

Then add an MCP server entry to your Codex config. Use [`docs/mcp/codex-config.example.toml`](docs/mcp/codex-config.example.toml) as the template and replace the script path with the absolute path on your machine. Restart Codex after changing the config.

Once installed, ask Codex:

```text
Use $layerling-mcp-skill to list my open layerling editors and inspect the current scene.
```

### Claude

Claude does not use Codex `SKILL.md` files, but it can use the same layerling MCP server. Add the server to Claude Desktop's MCP config using [`docs/mcp/claude-desktop-config.example.json`](docs/mcp/claude-desktop-config.example.json) as the template, replacing the script path with the absolute path on your machine.

After restarting Claude Desktop, ask:

```text
Use the layerling MCP tools to list open editors, inspect the scene, and modify the selected object.
```

The main tool names are `layerling_list_editors`, `layerling_read_scene`, `layerling_list_objects`, `layerling_create_shape`, `layerling_update_object`, `layerling_list_edges`, `layerling_apply_edge_treatment`, and `layerling_capture_image`.
