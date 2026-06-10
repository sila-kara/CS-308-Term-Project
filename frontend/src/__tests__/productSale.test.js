import { describe, expect, it } from "vitest";
import { effectivePrice, isOnSale, isTopRated } from "../utils/productUtils.js";

const makeProduct = (overrides = {}) => ({
  price: 100,
  isDiscountActive: false,
  discountRate: 0,
  discountedPrice: 100,
  rating: 4.0,
  ratingCount: 10,
  ...overrides,
});

describe("isOnSale", () => {
  it("returns true when discount is active and discounted price is below regular price", () => {
    const product = makeProduct({
      isDiscountActive: true,
      discountRate: 20,
      discountedPrice: 80,
    });
    expect(isOnSale(product)).toBe(true);
  });

  it("returns false when discount is not active", () => {
    const product = makeProduct({
      isDiscountActive: false,
      discountRate: 20,
      discountedPrice: 80,
    });
    expect(isOnSale(product)).toBe(false);
  });

  it("returns false when discounted price is not lower than regular price", () => {
    const product = makeProduct({
      isDiscountActive: true,
      discountRate: 0,
      discountedPrice: 100,
    });
    expect(isOnSale(product)).toBe(false);
  });

  it("returns false for null or undefined product", () => {
    expect(isOnSale(null)).toBe(false);
    expect(isOnSale(undefined)).toBe(false);
  });
});

describe("effectivePrice", () => {
  it("returns discounted price when product is on sale", () => {
    const product = makeProduct({
      isDiscountActive: true,
      discountRate: 25,
      discountedPrice: 75,
    });
    expect(effectivePrice(product)).toBe(75);
  });

  it("returns regular price when product is not on sale", () => {
    const product = makeProduct({ price: 120, isDiscountActive: false });
    expect(effectivePrice(product)).toBe(120);
  });

  it("returns 0 when price is missing and product is not on sale", () => {
    expect(effectivePrice({})).toBe(0);
  });
});

describe("isTopRated", () => {
  it("returns true when rating and rating count meet thresholds", () => {
    const product = makeProduct({ rating: 4.9, ratingCount: 100 });
    expect(isTopRated(product)).toBe(true);
  });

  it("returns true at the minimum threshold values", () => {
    const product = makeProduct({ rating: 4.8, ratingCount: 50 });
    expect(isTopRated(product)).toBe(true);
  });

  it("returns false when rating is below 4.8", () => {
    const product = makeProduct({ rating: 4.7, ratingCount: 100 });
    expect(isTopRated(product)).toBe(false);
  });

  it("returns false when rating count is below 50", () => {
    const product = makeProduct({ rating: 5.0, ratingCount: 49 });
    expect(isTopRated(product)).toBe(false);
  });

  it("returns false for null or undefined product", () => {
    expect(isTopRated(null)).toBe(false);
    expect(isTopRated(undefined)).toBe(false);
  });
});
