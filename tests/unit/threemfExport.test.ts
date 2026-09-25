import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { exportMeshesTo3mf, type ThreeMfExportMesh } from "@/lib/threemfExport";

// A unit cube in Layerling's Y-up coordinates, standing on the workplane,
// written as 12 triangles with 36 unshared corners - the way meshForShape
// hands meshes over.
function cube(name: string, color: string | undefined, offsetX = 0): ThreeMfExportMesh {
  const corners: [number, number, number][] = [
    [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
    [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
  ].map(([x, y, z]) => [x + offsetX, y, z]);
  const quads = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]];
  const vertices: [number, number, number][] = [];
  const faces: [number, number, number][] = [];
  for (const [a, b, c, d] of quads) {
    for (const triangle of [[a, b, c], [a, c, d]]) {
      faces.push([vertices.length, vertices.length + 1, vertices.length + 2]);
      triangle.forEach((corner) => vertices.push(corners[corner]));
    }
  }
  return { name, color, vertices, faces };
}

function readPackage(bytes: Uint8Array) {
  const files = unzipSync(bytes);
  return {
    names: Object.keys(files).sort(),
    contentTypes: strFromU8(files["[Content_Types].xml"]),
    rels: strFromU8(files["_rels/.rels"]),
    model: strFromU8(files["3D/3dmodel.model"]),
  };
}

function vertexCoordinates(objectXml: string) {
  return [...objectXml.matchAll(/<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"\/>/g)].map((match) => match.slice(1, 4).map(Number));
}

describe("exportMeshesTo3mf", () => {
  it("writes the three parts a 3MF consumer requires", () => {
    const { names, contentTypes, rels, model } = readPackage(exportMeshesTo3mf([cube("Box", "#d97813")]));

    expect(names).toEqual(["3D/3dmodel.model", "[Content_Types].xml", "_rels/.rels"]);
    expect(contentTypes).toContain('Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"');
    expect(rels).toContain('Target="/3D/3dmodel.model"');
    expect(rels).toContain('Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"');
    expect(model).toContain('<model unit="millimeter"');
    expect(model).toContain('xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"');
  });

  it("welds shared corners and keeps every triangle", () => {
    const { model } = readPackage(exportMeshesTo3mf([cube("Box", undefined)]));

    expect(vertexCoordinates(model)).toHaveLength(8);
    expect([...model.matchAll(/<triangle /g)]).toHaveLength(12);
  });

  it("writes Z-up coordinates like the STL export", () => {
    const { model } = readPackage(exportMeshesTo3mf([cube("Box", undefined)]));
    const points = vertexCoordinates(model);

    // Layerling's height (y 0..1) becomes z, its depth (z 0..1) becomes -y.
    expect(Math.min(...points.map((point) => point[2]))).toBe(0);
    expect(Math.max(...points.map((point) => point[2]))).toBe(1);
    expect(Math.min(...points.map((point) => point[1]))).toBe(-1);
    expect(Math.max(...points.map((point) => point[1]))).toBe(0);
  });

  it("keeps every body as its own named, coloured object with a build item", () => {
    const { model } = readPackage(exportMeshesTo3mf([
      cube("Base <plate> & lid", "#d97813"),
      cube("Peg", "#1e88e5", 3),
      cube("Second base", "#D97813", 6),
    ]));

    expect(model).toContain('<base name="Color 1" displaycolor="#D97813"/><base name="Color 2" displaycolor="#1E88E5"/></basematerials>');
    expect(model).toContain('name="Base &lt;plate&gt; &amp; lid" pid="1" pindex="0"');
    expect(model).toContain('name="Peg" pid="1" pindex="1"');
    expect(model).toContain('name="Second base" pid="1" pindex="0"');
    expect([...model.matchAll(/<item objectid="(\d+)"\/>/g)].map((match) => match[1])).toEqual(["2", "3", "4"]);
  });

  it("falls back to the default colour for anything that is not #rrggbb", () => {
    const { model } = readPackage(exportMeshesTo3mf([cube("Box", "orange")]));
    expect(model).toContain('displaycolor="#D97813"');
  });

  it("adds the design name as title metadata", () => {
    const { model } = readPackage(exportMeshesTo3mf([cube("Box", undefined)], { title: "Gear & case" }));
    expect(model).toContain('<metadata name="Title">Gear &amp; case</metadata>');
  });

  it("refuses to write a package without any triangles", () => {
    expect(() => exportMeshesTo3mf([{ name: "Empty", vertices: [], faces: [] }])).toThrow(/at least one body/);
  });
});
