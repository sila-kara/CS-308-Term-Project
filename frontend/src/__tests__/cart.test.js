import { describe, expect, it } from "vitest";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  calculateTotal,
  isInStock,
} from "../utils/cartUtils.js";

const makeProduct = (id, price, stock) => ({ id, name: `Product ${id}`, price, stock });

describe("addToCart", () => {
  it("adds a new product to an empty cart", () => {
    const product = makeProduct(1, 10, 5);
    const cart = addToCart([], product, 2);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it("increases quantity when product already in cart", () => {
    const product = makeProduct(1, 10, 10);
    const cart = [{ product, quantity: 3 }];
    const updated = addToCart(cart, product, 2);
    expect(updated[0].quantity).toBe(5);
  });

  it("throws when requested quantity exceeds stock", () => {
    const product = makeProduct(1, 10, 2);
    expect(() => addToCart([], product, 5)).toThrow("Insufficient stock");
  });

  it("throws when adding more would exceed stock for existing cart item", () => {
    const product = makeProduct(1, 10, 4);
    const cart = [{ product, quantity: 3 }];
    expect(() => addToCart(cart, product, 2)).toThrow("Insufficient stock");
  });

  it("throws when product has zero stock", () => {
    const product = makeProduct(1, 10, 0);
    expect(() => addToCart([], product, 1)).toThrow("Insufficient stock");
  });
});

describe("removeFromCart", () => {
  it("removes the correct product from the cart", () => {
    const p1 = makeProduct(1, 10, 5);
    const p2 = makeProduct(2, 20, 3);
    const cart = [{ product: p1, quantity: 1 }, { product: p2, quantity: 2 }];
    const result = removeFromCart(cart, 1);
    expect(result).toHaveLength(1);
    expect(result[0].product.id).toBe(2);
  });

  it("returns the same cart when product not found", () => {
    const p1 = makeProduct(1, 10, 5);
    const cart = [{ product: p1, quantity: 1 }];
    const result = removeFromCart(cart, 99);
    expect(result).toHaveLength(1);
  });

  it("returns empty array when removing the only item", () => {
    const product = makeProduct(1, 10, 5);
    const cart = [{ product, quantity: 1 }];
    expect(removeFromCart(cart, 1)).toHaveLength(0);
  });
});

describe("updateQuantity", () => {
  it("updates quantity of an existing item", () => {
    const product = makeProduct(1, 10, 10);
    const cart = [{ product, quantity: 2 }];
    const result = updateQuantity(cart, 1, 7);
    expect(result[0].quantity).toBe(7);
  });

  it("removes item when new quantity is zero", () => {
    const product = makeProduct(1, 10, 5);
    const cart = [{ product, quantity: 3 }];
    const result = updateQuantity(cart, 1, 0);
    expect(result).toHaveLength(0);
  });

  it("removes item when new quantity is negative", () => {
    const product = makeProduct(1, 10, 5);
    const cart = [{ product, quantity: 3 }];
    const result = updateQuantity(cart, 1, -1);
    expect(result).toHaveLength(0);
  });

  it("throws when new quantity exceeds stock", () => {
    const product = makeProduct(1, 10, 3);
    const cart = [{ product, quantity: 1 }];
    expect(() => updateQuantity(cart, 1, 5)).toThrow("Insufficient stock");
  });

  it("throws when product not found in cart", () => {
    const product = makeProduct(1, 10, 5);
    const cart = [{ product, quantity: 1 }];
    expect(() => updateQuantity(cart, 99, 2)).toThrow("Product not found in cart");
  });
});

describe("calculateTotal", () => {
  it("returns zero for empty cart", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("calculates total for a single item", () => {
    const product = makeProduct(1, 15, 10);
    const cart = [{ product, quantity: 3 }];
    expect(calculateTotal(cart)).toBe(45);
  });

  it("calculates total for multiple items", () => {
    const p1 = makeProduct(1, 10, 10);
    const p2 = makeProduct(2, 25, 5);
    const cart = [{ product: p1, quantity: 2 }, { product: p2, quantity: 3 }];
    expect(calculateTotal(cart)).toBe(95);
  });
});

describe("isInStock", () => {
  it("returns true when stock is greater than zero", () => {
    expect(isInStock(makeProduct(1, 10, 5))).toBe(true);
  });

  it("returns false when stock is zero", () => {
    expect(isInStock(makeProduct(1, 10, 0))).toBe(false);
  });
});
