import { describe, expect, it } from "vitest";
import { computeCartTotal } from "../utils/cartMath.js";

describe("computeCartTotal edge cases", () => {
  it("returns 0 for an empty cart", () => {
    expect(computeCartTotal([])).toBe(0);
  });

  it("coerces string price and quantity to numbers", () => {
    const total = computeCartTotal([
      { price: "12.5", quantity: "2" },
      { price: "7", quantity: "1" },
    ]);
    expect(total).toBe(32);
  });

  it("treats missing or invalid values as zero", () => {
    const total = computeCartTotal([
      { price: 20, quantity: 2 },
      { price: undefined, quantity: 5 },
      { price: 10, quantity: "abc" },
      {},
    ]);
    expect(total).toBe(40);
  });

  it("returns 0 for undefined input", () => {
    expect(computeCartTotal(undefined)).toBe(0);
  });
});
