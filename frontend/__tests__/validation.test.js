import { describe, expect, it } from "vitest";
import { isValidEmail } from "../utils/validation.js";

describe("isValidEmail", () => {
  it("accepts a typical address", () => {
    expect(isValidEmail("reader@bookworld.com")).toBe(true);
  });

  it("rejects empty input", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects values without a domain", () => {
    expect(isValidEmail("reader@@@")).toBe(false);
  });
});
