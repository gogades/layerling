import { describe, expect, it } from "vitest";
import { cornerRulerCorner, cornerRulerDimensionMatches, cornerRulerDimensionMatchesFromCorner, cornerRulerTicks, pointAlongRuler, rulerDimensionMatch, type CornerRulerPose, type RulerCandidatePose, type RulerPose } from "@/lib/rulerDimensions";

function ruler(overrides: Partial<RulerPose> = {}): RulerPose {
  return { x: 0, z: 0, rotation: 0, length: 150, crossWidth: 25, ...overrides };
}

function candidate(overrides: Partial<RulerCandidatePose> = {}): RulerCandidatePose {
  return { x: 0, z: 0, rotation: 0, width: 20, height: 20, depth: 12, ...overrides };
}

describe("rulerDimensionMatch", () => {
  it("liest die Breite eines achsparallelen Koerpers direkt ab", () => {
    const match = rulerDimensionMatch(ruler(), candidate());

    expect(match).not.toBeNull();
    expect(match?.extentAlong).toBeCloseTo(20, 6);
    expect(match?.alignedField).toBe("width");
    expect(match?.alongOffset).toBeCloseTo(0, 6);
  });

  it("liest nach einer 90-Grad-Drehung die Tiefe statt der Breite ab", () => {
    const match = rulerDimensionMatch(ruler(), candidate({ rotation: 90 }));

    expect(match?.extentAlong).toBeCloseTo(12, 6);
    expect(match?.alignedField).toBe("depth");
  });

  it("zeigt bei 45 Grad nur die Randausdehnung, keine eintippbare Eigenschaft", () => {
    const match = rulerDimensionMatch(ruler(), candidate({ rotation: 45 }));
    const erwartet = 20 * Math.abs(Math.cos(Math.PI / 4)) + 12 * Math.abs(Math.sin(Math.PI / 4));

    expect(match?.alignedField).toBeNull();
    expect(match?.extentAlong).toBeCloseTo(erwartet, 6);
  });

  it("ignoriert einen Koerper ausserhalb des Lineal-Bandes", () => {
    const match = rulerDimensionMatch(ruler({ crossWidth: 25 }), candidate({ z: 50 }));

    expect(match).toBeNull();
  });

  it("folgt der eigenen Drehung des Lineals", () => {
    const gedreht = ruler({ rotation: 90 });
    const match = rulerDimensionMatch(gedreht, candidate());

    // Ungedreht steht die Tiefe des Koerpers jetzt parallel zur gedrehten Lineal-Achse.
    expect(match?.alignedField).toBe("depth");
    expect(match?.extentAlong).toBeCloseTo(12, 6);
  });

  it("misst den Versatz entlang der Achse, nicht die Weltkoordinate", () => {
    const match = rulerDimensionMatch(ruler(), candidate({ x: 40 }));

    expect(match?.alongOffset).toBeCloseTo(40, 6);
  });
});

describe("pointAlongRuler", () => {
  it("laeuft bei Drehung 0 entlang der Weltachse X", () => {
    const punkt = pointAlongRuler(ruler({ x: 5, z: 5 }), 30);

    expect(punkt.x).toBeCloseTo(35, 6);
    expect(punkt.z).toBeCloseTo(5, 6);
  });

  it("folgt einer 90-Grad-Drehung des Lineals", () => {
    const punkt = pointAlongRuler(ruler({ rotation: 90 }), 30);

    expect(punkt.x).toBeCloseTo(0, 6);
    expect(punkt.z).toBeCloseTo(-30, 6);
  });
});

function cornerPose(overrides: Partial<CornerRulerPose> = {}): CornerRulerPose {
  return { x: 0, z: 0, rotation: 0, armLengthX: 100, armLengthZ: 80, armWidth: 12, ...overrides };
}

describe("cornerRulerCorner", () => {
  it("liegt bei Drehung 0 eine halbe Armlaenge je Achse von der Mitte entfernt", () => {
    const corner = cornerRulerCorner(cornerPose());

    expect(corner.x).toBeCloseTo(-50, 6);
    expect(corner.z).toBeCloseTo(-40, 6);
  });

  it("folgt der eigenen Drehung der Form", () => {
    const corner = cornerRulerCorner(cornerPose({ rotation: 90 }));

    expect(corner.x).toBeCloseTo(-40, 6);
    expect(corner.z).toBeCloseTo(50, 6);
  });
});

describe("cornerRulerDimensionMatches", () => {
  it("erkennt einen Nachbarn nur am Arm, in dessen Band er liegt", () => {
    const nearArmX = cornerRulerDimensionMatches(cornerPose(), candidate({ x: 10, z: -40 }));

    expect(nearArmX.armX).not.toBeNull();
    expect(nearArmX.armX?.extentAlong).toBeCloseTo(20, 6);
    expect(nearArmX.armZ).toBeNull();
  });

  it("erkennt denselben Nachbarn am anderen Arm, wenn er dort liegt", () => {
    const nearArmZ = cornerRulerDimensionMatches(cornerPose(), candidate({ x: -50, z: 10 }));

    expect(nearArmZ.armX).toBeNull();
    expect(nearArmZ.armZ).not.toBeNull();
    expect(nearArmZ.armZ?.extentAlong).toBeCloseTo(12, 6);
  });

  it("meldet keinen Treffer, wenn der Nachbar zu weit von beiden Armen absteht", () => {
    const weitWeg = cornerRulerDimensionMatches(cornerPose(), candidate({ x: 200, z: 200 }));

    expect(weitWeg.armX).toBeNull();
    expect(weitWeg.armZ).toBeNull();
  });
});

describe("cornerRulerDimensionMatchesFromCorner", () => {
  it("liefert dasselbe Ergebnis wie cornerRulerDimensionMatches, wenn die Ecke direkt vorliegt", () => {
    const pose = cornerPose();
    const corner = cornerRulerCorner(pose);
    const viaCenter = cornerRulerDimensionMatches(pose, candidate({ x: 10, z: -40 }));
    const viaCornerDirekt = cornerRulerDimensionMatchesFromCorner(corner, pose.rotation, pose.armLengthX, pose.armLengthZ, pose.armWidth, candidate({ x: 10, z: -40 }));

    expect(viaCornerDirekt.armX?.extentAlong).toBeCloseTo(viaCenter.armX?.extentAlong ?? NaN, 6);
    expect(viaCornerDirekt.armZ).toBeNull();
    expect(viaCenter.armZ).toBeNull();
  });
});

describe("cornerRulerTicks", () => {
  it("erzeugt einen Teilstrich je Millimeter, einschliesslich beider Enden", () => {
    const ticks = cornerRulerTicks(10);

    expect(ticks).toHaveLength(11);
    expect(ticks[0]).toEqual({ offset: 0, isTen: true, isFive: true });
    expect(ticks[10]).toEqual({ offset: 10, isTen: true, isFive: true });
  });

  it("markiert Fuenfer- und Zehner-Teilstriche richtig", () => {
    const ticks = cornerRulerTicks(12);

    expect(ticks.find((tick) => tick.offset === 5)).toMatchObject({ isFive: true, isTen: false });
    expect(ticks.find((tick) => tick.offset === 7)).toMatchObject({ isFive: false, isTen: false });
    expect(ticks.find((tick) => tick.offset === 12)).toMatchObject({ isFive: false, isTen: false });
  });

  it("liefert nur den Nullstrich fuer eine Laenge von 0", () => {
    const ticks = cornerRulerTicks(0);

    expect(ticks).toEqual([{ offset: 0, isTen: true, isFive: true }]);
  });
});
