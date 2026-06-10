import { describe, expect, it } from "vitest";
import { isValidEmail } from "../utils/validation.js";

describe("isValidEmail edge cases", () => {
  it("accepts an address with surrounding whitespace", () => {
    expect(isValidEmail("  reader@bookworld.com  ")).toBe(true);
  });

  it("rejects null and undefined", () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });

  it("rejects non-string values", () => {
    expect(isValidEmail(123)).toBe(false);
    expect(isValidEmail({ email: "a@b.com" })).toBe(false);
  });

  it("rejects addresses without a top-level domain", () => {
    expect(isValidEmail("reader@bookworld")).toBe(false);
  });

  it("rejects addresses missing the local part", () => {
    expect(isValidEmail("@bookworld.com")).toBe(false);
  });

  it("rejects whitespace-only input", () => {
    expect(isValidEmail("   ")).toBe(false);
  });
});
