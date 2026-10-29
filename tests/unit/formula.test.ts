import { describe, expect, it } from "vitest";
import { evaluateFormula } from "@/lib/formula";

const values: Record<string, number> = { wall: 2, "box.position.x": 10, "box.size.width": 40 };
const references = (reference: string) => values[reference];
const value = (text: string) => {
  const result = evaluateFormula(text, references);
  return result.ok ? result.value : Number.NaN;
};

describe("formulas of the advanced mode", () => {
  it("reads `$` references, with spaces or without", () => {
    expect(value("$wall * 2 + 1")).toBe(5);
    expect(value("$wall*2+1")).toBe(5);
    expect(value("$box.size.width - 0.4")).toBeCloseTo(39.6);
    expect(value("($box.position.x + $box.size.width) / 2")).toBe(25);
  });

  it("keeps `x` as a times sign beside a reference that ends in x", () => {
    expect(value("$box.position.x x 2")).toBe(20);
    expect(value("3x$wall")).toBe(6);
  });

  it("knows round, sqrt, sin and cos in degrees, and pi, in any case", () => {
    expect(value("round(2.6)")).toBe(3);
    expect(value("round(2.5)")).toBe(3);
    expect(value("round(-2.5)")).toBe(-3);
    expect(value("SQRT(16) + $wall")).toBe(6);
    expect(value("sin(30)")).toBeCloseTo(0.5);
    expect(value("cos(60) * $box.size.width")).toBeCloseTo(20);
    expect(value("2 * pi")).toBeCloseTo(2 * Math.PI);
    expect(value("sqrt($wall * 8)")).toBe(4);
  });

  it("says why a formula fails", () => {
    expect(evaluateFormula("$lid.size.width", references)).toEqual({ ok: false, error: { kind: "unknown", name: "lid.size.width" } });
    expect(evaluateFormula("sqrt(-1)", references)).toEqual({ ok: false, error: { kind: "math" } });
    expect(evaluateFormula("$wall / 0", references)).toEqual({ ok: false, error: { kind: "math" } });
    for (const text of ["$", "$box.", "$2a", "max(1)", "sqrt 4", "sqrt(4", "$wall $wall", "pi(2)", "constructor(4)", ""]) {
      expect(evaluateFormula(text, references), text).toEqual({ ok: false, error: { kind: "syntax" } });
    }
  });

  it("takes no names at all without references, as the normal mode's fields always did", () => {
    expect(evaluateFormula("$wall * 2").ok).toBe(false);
    expect(evaluateFormula("sqrt(4)").ok).toBe(false);
    expect(evaluateFormula("pi").ok).toBe(false);
    expect(evaluateFormula("1 000 + 2 x 3")).toEqual({ ok: true, value: 1006 });
    expect(evaluateFormula("(40+2)/2")).toEqual({ ok: true, value: 21 });
  });
});
