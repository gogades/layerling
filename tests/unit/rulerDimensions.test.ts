import { describe, expect, it } from "vitest";
import { pointAlongRuler, rulerDimensionMatch, type RulerCandidatePose, type RulerPose } from "@/lib/rulerDimensions";

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
