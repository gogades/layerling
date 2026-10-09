---
title: Threads, gears and other parts
summary: Screws, nuts and tapped holes that fit together, plus gear, spring, bent tube, honeycomb, dovetail, teardrop hole, counterbore and countersink.
---

Besides the basic shapes, the library contains some parts that would be tedious to put together yourself. All of them can be changed afterwards in their settings.

## Threads

Choose {{ui:shape.thread}} in the shape library. Under {{ui:inspector.threadRole}} you decide what it should be:

- **{{ui:thread.rod}}:** a cylinder with thread, for example a screw without a head.
- **{{ui:thread.screw}}:** with a head. You choose the {{ui:inspector.threadHead}}: {{ui:thread.headCylinder}}, {{ui:thread.headCountersunk}} or {{ui:thread.headHex}}.
- **{{ui:thread.nut}}:** the matching nut.
- **{{ui:thread.bore}}:** a tapped hole. It is a hole. Drag it into a part, group both, and the part has an internal thread.

![A screw with a cylinder head. On the right: kind and head shape, further down size, pitch and profile.](shot:thread-screw)

You pick the size under {{ui:prop.threadSize}} from a list: metric from M2 to M12, the inch sizes UNC and UNF from No. 4 to 1 inch, and the pipe threads G1/16 to G4. If you choose {{ui:thread.customSize}}, you set {{ui:prop.diameter}} and {{ui:prop.pitch}} yourself. For an inch size or a G size the field asks for {{ui:prop.threadsPerInch}} instead of the pitch in millimetres.

The list groups the sizes by series, and a line under the field names the series of the size you picked, with examples you know from everyday life:

- **M, metric coarse:** the ISO metric coarse thread to ISO 261, as on standard screws and nuts.
- **UNC, US inch coarse:** the camera and tripod screw is 1/4"-20 UNC (ISO 1222), larger tripod heads use 3/8"-16 UNC.
- **UNF, US inch fine:** the same diameters as UNC with a finer pitch (ASME B1.1).
- **G, pipe thread:** a shower hose connects with G1/2, a washing-machine inlet hose with G3/4. A garden tap ends in G3/4, smaller taps in G1/2; that is where the tap connector of a click-on hose system screws on.

The G sizes are the parallel Whitworth pipe threads to ISO 228-1, found on fittings for water, gas, hydraulics and pneumatics. The size names the pipe, not the thread: a G1 measures 33.249 mm across the thread. Choosing a G size sets the profile to {{ui:thread.profileWhitworth}}, and choosing a metric or inch size sets it back to {{ui:thread.profileV}}. A {{ui:thread.profileTrapezoidal}} or {{ui:thread.profileRound}} profile you picked yourself stays. The standard only defines the thread, so the head of a screw and a nut on a G size get the same proportions as on a diameter you set yourself. The tapered pipe threads R, Rc and Rp are not included.

More settings:

- **{{ui:prop.threadHand}}:** {{ui:thread.right}} or {{ui:thread.left}}.
- **{{ui:prop.threadProfile}}:** {{ui:thread.profileV}} is the standard profile of metric and inch threads, {{ui:thread.profileWhitworth}} that of the G pipe threads: 55° with rounded crests and roots. {{ui:thread.profileTrapezoidal}} and {{ui:thread.profileRound}} have flat crests and roots. That usually prints more reliably because no thin tips result.
- **{{ui:prop.clearance}}:** For nut and tapped hole, the room that makes sure a printed pair really turns. The coarser your printer works, the more clearance the pair needs. Rods and screws have a clearance of their own here, which makes the bolt that much thinner in diameter. It is set to 0. If you need it because a printed bolt has to go into a metal nut, which has no play itself, 0.2 to 0.3 mm is a good start.
- **{{ui:prop.chamfer}}, {{ui:prop.headChamfer}} and {{ui:prop.rimChamfer}}:** Chamfers at the ends so the thread starts cleanly and the head has no sharp edge.
- **{{ui:prop.quality}}:** How finely the thread is calculated. Higher is more exact, but slower.

Printed threads are a topic of their own. Make the screw-and-nut pair as a test first before you print a large part, and adjust the clearance to your printer.

The edge tool takes a thread as its exact body. You can chamfer or round the part that carries it with the thread already in place, or the rims of a screw head, see [Breaking edges and hollowing bodies](chapter:edges-and-hollowing). Working out a thread's edges takes a while: a few seconds for an M6, about half a minute for a G1/2 pipe thread. The quickest way to break the edge of a screw head is still the head chamfer in the properties.

## Gears

{{ui:shape.gear}} comes as {{ui:gear.spur}}, {{ui:gear.helical}} and {{ui:gear.bevel}}. New gears have {{ui:gear.profileInvolute}} under {{ui:prop.gearProfile}}: teeth with involute flanks, as gear generators and engineering use them. Such teeth roll cleanly on each other. You set the number of {{ui:prop.teeth}} and the {{ui:prop.gearModule}}, and the size follows: the outside diameter is module × (teeth + 2), the pitch circle module × teeth. New gears start at module 2. Two gears mesh when they have the same module and the same {{ui:prop.gearPressureAngle}} (usually 20°) and their centres stand (teeth + teeth) × module / 2 apart. Select both gears and the properties panel gives that centre distance and how far apart the centres are now. If a tooth then meets a tooth instead of a gap, turn one of the gears by half a tooth, which is 180° divided by its number of teeth. {{ui:prop.gearBacklash}} takes a little off the teeth so a printed pair does not bind. The value is for the pair, and each gear takes half of it; 0.2 mm is a good start, 0 gives the exact gear. Below the base circle the flank runs straight down to the root and is not undercut as a cutter would do it. That suits printing, but a very small pinion below about 17 teeth may rub slightly at the root.

A helical gear adds the {{ui:prop.helixAngle}}. With involute teeth it is the true helix angle on the pitch circle: two helical gears mesh when they have the same module and the same angle, one positive and the other negative. The bevel gear takes the involute teeth and makes them smaller towards its top. That is an approximation, not an exactly worked out bevel pair.

{{ui:gear.profileSimple}} are the straight teeth every gear had so far. There you set {{ui:prop.toothSize}} and {{ui:prop.toothWidth}} by hand. Older designs keep them until you change the tooth shape. Both have the {{ui:prop.centerHole}}.

The edge tool and the STEP export take every gear as its exact body, involute flanks as smooth curves. A helical gear on an oval footprint stays a triangle mesh, and so does a helical gear with involute teeth from about 31 teeth. Small teeth limit how far edges can be rounded: on a gear with simple teeth, 30 mm across with 12 teeth the flat between two teeth at the foot is only about 0.65 mm wide, so rounding every edge works up to about 0.5 mm, and on a bevel gear, whose top is smaller, up to about 0.4 mm. A helical gear's teeth lean, which narrows that flat across its slanted edges: the larger the helix angle against the gear's height, the smaller the rounding that fits. The edges of its two flat ends can be rounded, but chamfering just those edges fails in the CAD kernel; round them, or chamfer all edges together at a smaller size, such as 0.2 mm.

## Springs

The {{ui:shape.spring}} has {{ui:prop.turns}} and a {{ui:prop.wire}}. Together with the height they decide how soft the spring is. {{ui:prop.springHand}} sets which way the wire runs: {{ui:spring.right}} like a usual compression spring, or {{ui:spring.left}}.

The edge tool and the STEP export take a spring as its exact body: a round wire along a helix, cut square at both ends. You can round or chamfer those two wire ends, for instance.

## Bent tubes

A {{ui:shape.bentTube}} consists of up to twelve sections: a straight piece followed by a bend. For each you set the {{ui:prop.bentTubeSegmentLength}}, the {{ui:prop.bentTubeBendAngle}}, the {{ui:prop.bentTubeBendRadius}} and the {{ui:prop.bentTubeRoll}}. The section you are editing is lit up in orange on the tube, so you can follow the order. A roll angle of 0° bends within the plane of the workplane, at 90° the tube bends upward. The profile can be round, square, hexagonal or octagonal, the inside likewise, or fully solid. If the tube runs into itself, layerling warns you.

## Loft

The {{ui:shape.loft}} joins one outline at the bottom to another at the top, like a loft in Fusion: a hose adapter from one diameter to another, a square fan onto a round duct, a stand that turns round towards the top. For each end you pick {{ui:prop.loftBottomOutline}} and {{ui:prop.loftTopOutline}}: {{ui:loft.round}}, {{ui:loft.rectangle}} with {{ui:prop.loftBottomCorner}}, or {{ui:loft.polygon}} with its number of corners, plus the width and length of each end and the height. {{ui:prop.loftOffsetX}} and {{ui:prop.loftOffsetZ}} move the top end sideways for a slanted transition; the bottom end stays where it is.

{{ui:prop.loftWall}} turns the solid body into a tube open at the top and the bottom. The opening is smaller by the wall at both ends, measured across; where the wall slants it is a little thinner. Drag the frame bigger and both ends grow along, while the corner radius and the wall keep their size.

The loft is an exact body: its edges can be chamfered and filleted, and STEP export keeps it. Add a flange with screw holes as usual and group them.

## Honeycomb

The {{ui:shape.honeycomb}} is a plate with hexagonal holes: light, stiff and nice to look at. The {{ui:prop.honeycombCellSize}}, the {{ui:prop.honeycombWallThickness}} and the {{ui:prop.honeycombFrameWidth}} set the look.

## Hinge

The {{ui:shape.hinge}} prints in one piece and moves afterwards (print-in-place): two leaves lying open flat on the plate, with alternating knuckles on one axis between them. The pin belongs to the back leaf and runs with play through the knuckles of the front one. You set the {{ui:prop.hingeLength}}, the {{ui:prop.hingeOpenWidth}} and the {{ui:prop.hingeKnuckleDiameter}}, plus the number of {{ui:prop.hingeKnuckles}} (odd, so the pin is held at both ends), the {{ui:prop.hingePinDiameter}} and the {{ui:prop.hingeLeafThickness}}.

{{ui:prop.hingeClearance}} is the gap between the moving parts: around the pin, between the knuckles and in front of the leaves. With 0.4 mm a well-tuned printer usually breaks free with a small twist; if the parts fuse, raise it, if it wobbles too much, lower it. Print the hinge lying down as it appears on the plate, without supports. You can add holes to the leaves or group them into a larger part, such as a lid.

## Knurling

The {{ui:shape.knurl}} is a round grip with grooves all around, for knobs, thumb wheels and tool handles. Under {{ui:prop.knurlPattern}} you pick {{ui:knurl.straight}}, grooves along the axis as on a control knob, or {{ui:knurl.diamond}}: two slanted rows of grooves cross into small diamonds. You set the {{ui:prop.diameter}} and the {{ui:prop.height}}, the number of {{ui:prop.knurlCount}} and the {{ui:prop.knurlDepth}}; for crossed knurling also the {{ui:prop.knurlAngle}} to the axis. The {{ui:prop.knurlChamfer}} breaks both ends at 45 degrees, as on a turned knob; 0 leaves them sharp.

Straight knurling is an exact body, so its edges can be broken and rounded. Crossed knurling stays a mesh, because as an exact body it would take almost a minute to compute with 30 grooves. For a knob on a shaft, group the knurl with a hole, such as a {{ui:shape.thread}} set as a tapped hole. Grooves shallower than 0.4 mm hardly any printer prints cleanly, and layerling does not set them closer than 0.8 mm around the grip: a thin grip gets fewer of them.

## Dovetail

The {{ui:shape.dovetail}} is the joint in which two parts lock into each other and can only be slid together sideways. You set the width at the wide end, the {{ui:prop.dovetailNeckWidth}} and the length of the tail. Copy the tail for the other side and make the copy a hole: {{ui:prop.dovetailClearance}} then gives a little play so the joint does not jam after printing.

> **Tip:** A tapped hole cuts into the part it overlaps when grouped. So put it a bit into the material rather than just touching the surface.

## Teardrop hole

A hole lying on its side gets a bridge across its top when printed, and the bridge sags. The {{ui:shape.teardrop}} therefore has a point on top: every layer rests on the one below, and the hole comes out round enough without supports. Set the {{ui:prop.teardropDiameter}} to the size of the hole, about 3.4 mm for an M3 screw, and the {{ui:prop.teardropLength}} long enough to reach through the part. The {{ui:prop.teardropTipAngle}} is 90°, so the flanks meet at 45°. Most printers handle that cleanly; a flatter point needs more height, a steeper one saves it.

Make the teardrop a hole and group it with the part. Its length runs along the depth and the point faces up. For a hole in the other direction, turn it by 90° around the vertical axis.

## Counterbore and countersink

A screw head often should not stand proud. The {{ui:shape.counterbore}} cuts a round pocket for a socket-head screw (DIN 912), the {{ui:shape.countersink}} a cone for a countersunk screw (DIN 7991). Both stand with the head end up: the {{ui:prop.screwHoleHead}} is the diameter of the pocket or the cone, the {{ui:prop.screwHoleShaft}} the bore below it, the {{ui:prop.screwHoleLength}} the whole length. On the counterbore you set the {{ui:prop.screwHoleHeadDepth}}, on the countersink the {{ui:prop.screwHoleAngle}} (90° suits countersunk screws). The defaults fit an M3 screw.

Make the shape a hole and group it with the part. Let its top end a little above the surface the head should sit on, so the pocket opens cleanly. For the pocket of a hex nut, use a {{ui:shape.polygon}} with six sides as a hole.
