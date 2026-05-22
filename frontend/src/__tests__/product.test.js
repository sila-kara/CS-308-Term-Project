import { describe, expect, it } from "vitest";
import {
  validateProduct,
  filterByCategory,
  sortByPrice,
  sortByPopularity,
  searchProducts,
} from "../utils/productUtils.js";

const makeProduct = (overrides = {}) => ({
  id: 1,
  name: "Test Product",
  model: "TP-100",
  serialNumber: "SN-001",
  description: "A test product",
  stock: 10,
  price: 99.99,
  warrantyStatus: true,
  distributorInfo: "Distributor A",
  category: "electronics",
  rating: 4.5,
  ...overrides,
});

describe("validateProduct", () => {
  it("returns true for a valid product with all required fields", () => {
    expect(validateProduct(makeProduct())).toBe(true);
  });

  it("returns false when a required field is missing", () => {
    const { name, ...noName } = makeProduct();
    expect(validateProduct(noName)).toBe(false);
  });

  it("returns false when price is missing", () => {
    const { price, ...noPrice } = makeProduct();
    expect(validateProduct(noPrice)).toBe(false);
  });

  it("returns false when warrantyStatus is missing", () => {
    const { warrantyStatus, ...noWarranty } = makeProduct();
    expect(validateProduct(noWarranty)).toBe(false);
  });

  it("returns false for null input", () => {
    expect(validateProduct(null)).toBe(false);
  });

  it("returns false for an empty object", () => {
    expect(validateProduct({})).toBe(false);
  });

  it("returns false when price is null", () => {
    expect(validateProduct(makeProduct({ price: null }))).toBe(false);
  });
});

describe("filterByCategory", () => {
  it("returns only products matching the given category", () => {
    const products = [
      makeProduct({ id: 1, category: "electronics" }),
      makeProduct({ id: 2, category: "books" }),
      makeProduct({ id: 3, category: "electronics" }),
    ];
    const result = filterByCategory(products, "electronics");
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.category === "electronics")).toBe(true);
  });

  it("returns empty array when no products match", () => {
    const products = [makeProduct({ category: "books" })];
    expect(filterByCategory(products, "electronics")).toHaveLength(0);
  });

  it("returns empty array for empty product list", () => {
    expect(filterByCategory([], "electronics")).toHaveLength(0);
  });
});

describe("sortByPrice", () => {
  const products = [
    makeProduct({ id: 1, price: 50 }),
    makeProduct({ id: 2, price: 20 }),
    makeProduct({ id: 3, price: 80 }),
  ];

  it("sorts ascending by default", () => {
    const result = sortByPrice(products, "asc");
    expect(result.map((p) => p.price)).toEqual([20, 50, 80]);
  });

  it("sorts descending when order is 'desc'", () => {
    const result = sortByPrice(products, "desc");
    expect(result.map((p) => p.price)).toEqual([80, 50, 20]);
  });

  it("does not mutate the original array", () => {
    const original = [...products];
    sortByPrice(products, "asc");
    expect(products).toEqual(original);
  });

  it("returns all products when prices are equal", () => {
    const samePriceProducts = [
      makeProduct({ id: 1, price: 50 }),
      makeProduct({ id: 2, price: 50 }),
      makeProduct({ id: 3, price: 50 }),
    ];
    const result = sortByPrice(samePriceProducts, "asc");
    expect(result).toHaveLength(3);
    expect(result.every((p) => p.price === 50)).toBe(true);
  });
});

describe("sortByPopularity", () => {
  it("sorts by rating descending", () => {
    const products = [
      makeProduct({ id: 1, rating: 3.0 }),
      makeProduct({ id: 2, rating: 4.8 }),
      makeProduct({ id: 3, rating: 4.2 }),
    ];
    const result = sortByPopularity(products);
    expect(result.map((p) => p.rating)).toEqual([4.8, 4.2, 3.0]);
  });

  it("treats missing rating as 0", () => {
    const products = [
      makeProduct({ id: 1, rating: undefined }),
      makeProduct({ id: 2, rating: 3.5 }),
    ];
    const result = sortByPopularity(products);
    expect(result[0].rating).toBe(3.5);
  });
});

describe("searchProducts", () => {
  const products = [
    makeProduct({ id: 1, name: "Laptop Pro", description: "High-end laptop" }),
    makeProduct({ id: 2, name: "Wireless Mouse", description: "Ergonomic design" }),
    makeProduct({ id: 3, name: "USB Hub", description: "Laptop accessory" }),
  ];

  it("filters by name match", () => {
    const result = searchProducts(products, "Mouse");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("filters by description match", () => {
    const result = searchProducts(products, "accessory");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("is case-insensitive", () => {
    const result = searchProducts(products, "LAPTOP");
    expect(result).toHaveLength(2);
  });

  it("returns all products when query is empty", () => {
    expect(searchProducts(products, "")).toHaveLength(3);
  });

  it("returns empty array when nothing matches", () => {
    expect(searchProducts(products, "zzznomatch")).toHaveLength(0);
  });

  it("does not crash and returns correct results with special characters in query", () => {
    const prods = [
      makeProduct({ id: 1, name: "C++ Programming", description: "Systems language" }),
      makeProduct({ id: 2, name: "Python Basics", description: "Beginner guide" }),
    ];
    expect(() => searchProducts(prods, "C++")).not.toThrow();
    expect(searchProducts(prods, "C++")).toHaveLength(1);
    expect(searchProducts(prods, "C++")[0].id).toBe(1);
  });
});
