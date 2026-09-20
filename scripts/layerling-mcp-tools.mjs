// Die Werkzeugbeschreibungen der MCP-Bruecke, getrennt vom Server, damit ein
// Test sie lesen kann, ohne den Server zu starten - er haengt sich beim Laden
// an die Standardeingabe und liefe im Test einfach weiter.

export const editorTargetSchema = {
  type: "object",
  properties: {
    editorNumber: { type: "number", description: "The 5-digit Layerling editor number from layerling_list_editors." },
    editorId: { type: "string", description: "Optional internal editor id. Prefer editorNumber for human-directed use." },
    timeoutMs: { type: "number", description: "Command timeout in milliseconds. Defaults to 15000." },
  },
};

/**
 * Die Arten, die sich anlegen lassen. Der Editor holt sie aus dem Formenkatalog;
 * diese Liste ist nur die Ansage nach aussen, und ein Test schlaegt fehl, sobald
 * beide auseinanderlaufen. `cube` ist ein Quader mit gleichen Kanten, `sketch`
 * eine ausgezogene Skizze - beide stehen in keinem Katalog.
 */
export const creatableShapeKinds = [
  "box", "cube", "cylinder", "ellipse", "polygon", "sphere", "cone", "pyramid", "wedge",
  "roundRoof", "halfSphere", "torus", "tube", "text", "thread", "spring", "gear",
  "ruler", "sketch",
];

/**
 * Was eine Form ausser Lage und Mass ausmacht. Anlegen und Aendern nehmen
 * dieselben Felder - sonst entstuende wieder etwas, das sich hinterher nicht
 * mehr anfassen laesst. Jeder Wert wird im Editor gegen dieselben Grenzen
 * geprueft wie in den Einstellungen; was daneben liegt, wird eingefangen.
 */
export const shapeSettingSchema = {
  sides: { type: "number", description: "Cylinder, cone, tube, polygon, pyramid, round roof. Left out on a round body, the side count follows the diameter." },
  steps: { type: "number", description: "Sphere and half sphere: how finely the surface is divided." },
  bevel: { type: "number", description: "Tube: wall thickness. Text: rounding of the lettering." },
  segments: { type: "number", description: "Text only: steps in the rounding." },
  topRadius: { type: "number", description: "Cone only: radius of the flat top. 0 runs to a point." },
  baseRadius: { type: "number", description: "Cone only: radius at the base." },
  topWidth: { type: "number", description: "Pyramid only: width of the flat top. 0 runs to a point." },
  topDepth: { type: "number", description: "Pyramid only: depth of the flat top. 0 runs to a point." },
  taperTopWidth: { type: "number", description: "Taper, on every shape except gear, thread, spring and pyramid: width of the top face. Setting one value of a face pins the other." },
  taperTopDepth: { type: "number", description: "Taper, on every shape except gear, thread, spring and pyramid: depth of the top face." },
  taperBottomWidth: { type: "number", description: "Taper, on every shape except gear, thread, spring and pyramid: width of the bottom face." },
  taperBottomDepth: { type: "number", description: "Taper, on every shape except gear, thread, spring and pyramid: depth of the bottom face." },
  teeth: { type: "number", description: "Gear only." },
  toothSize: { type: "number", description: "Gear only." },
  toothWidth: { type: "number", description: "Gear only." },
  centerHoleSize: { type: "number", description: "Gear only: bore through the middle." },
  gearType: { type: "string", enum: ["spur", "helical", "bevel"], description: "Gear only." },
  helixAngle: { type: "number", description: "Helical gear only." },
  helixQuality: { type: "number", description: "Helical gear only." },
  threadRole: { type: "string", enum: ["rod", "screw", "nut", "bore"], description: "Thread only. A bore becomes a cutter that threads the part it is grouped with." },
  threadHead: { type: "string", enum: ["cylinder", "countersunk", "hex"], description: "Thread only, and only for a screw." },
  threadHand: { type: "string", enum: ["right", "left"], description: "Thread only." },
  threadProfile: { type: "string", enum: ["v", "trapezoidal", "round"], description: "Thread only: tooth shape. \"v\" is the sharp 60-degree ISO default; trapezoidal and round both leave a flat crest and root, which prints more reliably." },
  threadDiameter: { type: "number", description: "Thread only, in millimetres: 6 is an M6. Width and depth follow it, they are not set separately." },
  threadPitch: { type: "number", description: "Thread only, in millimetres per turn: an M6 runs 1.0 as standard." },
  threadClearance: { type: "number", description: "Thread only, for nuts and tapped holes: how much room the thread leaves so a printed pair still turns." },
  threadQuality: { type: "number", description: "Thread only: columns around the circumference." },
  threadChamfer: { type: "number", description: "Thread only: the break at the ends that leads the first turn in." },
  threadHeadHeight: { type: "number", description: "Thread only, and only for a screw: height of the head. Left out it follows the standard for the size." },
  threadHeadChamfer: { type: "number", description: "Thread only, and only for a screw with a cylinder or hex head: the chamfer that breaks the sharp rim of the head. 0 leaves it sharp." },
  springTurns: { type: "number", description: "Spring only." },
  springWire: { type: "number", description: "Spring only: thickness of the wire." },
  springQuality: { type: "number", description: "Spring only." },
  text: { type: "string", description: "Text only: the lettering itself." },
  font: { type: "string", description: "Text only." },
};

export const tools = [
  {
    name: "layerling_list_editors",
    description: "List Layerling editor tabs that are currently open and heartbeating, including editorNumber and projectName.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "layerling_read_scene",
    description: "Read the current scene, selection, workspace units, and exact object dimensions from an open Layerling editor.",
    inputSchema: {
      ...editorTargetSchema,
      properties: {
        ...editorTargetSchema.properties,
        includeRawShapes: { type: "boolean", description: "Include raw WorkplaneShape JSON. Can be large for imported meshes." },
      },
    },
  },
  {
    name: "layerling_list_objects",
    description: "List all current objects available in the editor with exact dimensions, position, rotation, and object ids.",
    inputSchema: editorTargetSchema,
  },
  {
    name: "layerling_select_objects",
    description: "Select objects by id in the Layerling editor.",
    inputSchema: {
      ...editorTargetSchema,
      required: ["ids"],
      properties: {
        ...editorTargetSchema.properties,
        ids: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "layerling_delete_objects",
    description: "Delete objects by id, or delete the current selection when ids are omitted.",
    inputSchema: {
      ...editorTargetSchema,
      properties: {
        ...editorTargetSchema.properties,
        ids: { type: "array", items: { type: "string" } },
        id: { type: "string" },
      },
    },
  },
  {
    name: "layerling_create_shape",
    description: "Create any of Layerling's shapes: boxes, cylinders, polygons, spheres, cones, pyramids, wedges, roofs, tori, tubes, raised text, threads (rod, screw, nut, tapped hole), springs, gears, or a simple extruded sketch. Width, depth and height default to what the editor uses for that shape; everything a shape has beyond its size is optional and falls back to the same defaults as a shape placed by hand.",
    inputSchema: {
      ...editorTargetSchema,
      required: ["kind"],
      properties: {
        ...editorTargetSchema.properties,
        kind: { type: "string", enum: creatableShapeKinds },
        name: { type: "string" },
        color: { type: "string" },
        x: { type: "number" },
        z: { type: "number" },
        elevation: { type: "number" },
        width: { type: "number" },
        depth: { type: "number" },
        height: { type: "number", description: "For a screw this is head plus thread; set threadHeadHeight if the head should differ from the standard." },
        size: { type: "number" },
        rotation: { type: "number" },
        rotationX: { type: "number" },
        rotationZ: { type: "number" },
        ...shapeSettingSchema,
      },
    },
  },
  {
    name: "layerling_import_mesh",
    description: "Import a triangle mesh into Layerling from raw position and optional normal arrays.",
    inputSchema: {
      ...editorTargetSchema,
      required: ["positions"],
      properties: {
        ...editorTargetSchema.properties,
        name: { type: "string" },
        color: { type: "string" },
        x: { type: "number" },
        z: { type: "number" },
        elevation: { type: "number" },
        width: { type: "number" },
        depth: { type: "number" },
        height: { type: "number" },
        positions: { type: "array", items: { type: "number" } },
        normals: { type: "array", items: { type: "number" } },
      },
    },
  },
  {
    name: "layerling_update_object",
    description: "Update one object: exact dimensions, position, color, name, hole state, rotations, locked and hidden state, and everything the shape has beyond its size - the side count of a cylinder, the diameter of a thread, the turns of a spring, the lettering of a text. Changing a thread's diameter or pitch moves width and depth with it.",
    inputSchema: {
      ...editorTargetSchema,
      required: ["id"],
      properties: {
        ...editorTargetSchema.properties,
        id: { type: "string" },
        name: { type: "string" },
        color: { type: "string" },
        hole: { type: "boolean" },
        locked: { type: "boolean" },
        hidden: { type: "boolean" },
        x: { type: "number" },
        z: { type: "number" },
        elevation: { type: "number" },
        width: { type: "number" },
        depth: { type: "number" },
        height: { type: "number" },
        size: { type: "number" },
        rotation: { type: "number" },
        rotationX: { type: "number" },
        rotationZ: { type: "number" },
        ...shapeSettingSchema,
      },
    },
  },
  {
    name: "layerling_align_objects",
    description: "Align two or more Layerling objects using the same alignment logic as the editor Alignment button.",
    inputSchema: {
      ...editorTargetSchema,
      required: ["axis", "target"],
      properties: {
        ...editorTargetSchema.properties,
        ids: { type: "array", items: { type: "string" }, description: "Object ids to align. If omitted, uses the current selection." },
        anchorId: { type: "string", description: "Optional object id to keep fixed as the alignment reference." },
        axis: { type: "string", enum: ["x", "y", "z"], description: "x=left/right, z=front/back, y=bottom/top." },
        target: { type: "string", enum: ["min", "center", "max"], description: "Which side/center to align." },
      },
    },
  },
  {
    name: "layerling_group_objects",
    description: "Group objects by id using Layerling's normal grouping/boolean pipeline.",
    inputSchema: {
      ...editorTargetSchema,
      required: ["ids"],
      properties: {
        ...editorTargetSchema.properties,
        ids: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "layerling_ungroup_objects",
    description: "Ungroup one or more grouped objects by id and preserve their edited geometry.",
    inputSchema: {
      ...editorTargetSchema,
      properties: {
        ...editorTargetSchema.properties,
        ids: { type: "array", items: { type: "string" } },
        id: { type: "string" },
      },
    },
  },
  {
    name: "layerling_boolean_cut",
    description: "Cut solids with hole objects. Provide solidIds and holeIds; the result replaces the operands.",
    inputSchema: {
      ...editorTargetSchema,
      required: ["solidIds", "holeIds"],
      properties: {
        ...editorTargetSchema.properties,
        solidIds: { type: "array", items: { type: "string" } },
        holeIds: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "layerling_separate_parts",
    description: "Separate one disconnected multi-part object into independent objects.",
    inputSchema: {
      ...editorTargetSchema,
      properties: {
        ...editorTargetSchema.properties,
        id: { type: "string" },
      },
    },
  },
  {
    name: "layerling_list_edges",
    description: "List real CAD edge ids for one object so a later chamfer/fillet can target specific edges.",
    inputSchema: {
      ...editorTargetSchema,
      required: ["id"],
      properties: {
        ...editorTargetSchema.properties,
        id: { type: "string" },
        sharpAngle: { type: "number" },
      },
    },
  },
  {
    name: "layerling_apply_edge_treatment",
    description: "Apply chamfer or fillet to specific edge ids returned by layerling_list_edges.",
    inputSchema: {
      ...editorTargetSchema,
      required: ["id", "kind", "edgeIds", "amount"],
      properties: {
        ...editorTargetSchema.properties,
        id: { type: "string" },
        kind: { type: "string", enum: ["chamfer", "fillet"] },
        edgeIds: {
          anyOf: [
            { type: "array", items: { type: "number" } },
            { type: "string", enum: ["all"] },
          ],
        },
        allEdges: { type: "boolean" },
        amount: { type: "number" },
        chamferAngle: { type: "number" },
        sharpAngle: { type: "number" },
        quality: { type: "string", enum: ["draft", "standard", "fine"] },
        preserveEdgeSize: { type: "boolean" },
      },
    },
  },
  {
    name: "layerling_inspect_errors",
    description: "Inspect the editor notice, last MCP error, and active edge modifier error.",
    inputSchema: editorTargetSchema,
  },
  {
    name: "layerling_capture_image",
    description: "Capture a PNG image of the editor viewport from current/home/top/bottom/front/back/right/left view.",
    inputSchema: {
      ...editorTargetSchema,
      properties: {
        ...editorTargetSchema.properties,
        face: { type: "string", enum: ["current", "home", "top", "bottom", "front", "back", "right", "left"] },
      },
    },
  },
];
