import { describe, expect, it } from "vitest";
import { computeCartTotal } from "../utils/cartMath.js";

describe("computeCartTotal", () => {
  it("sums price times quantity for all lines", () => {
    const total = computeCartTotal([
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 },
    ]);
    expect(total).toBe(25);
  });

  it("returns 0 for non-array input", () => {
    expect(computeCartTotal(null)).toBe(0);
  });
});
