import { describe, expect, it } from "vitest";
import { nextDeliveryStatus, statusLabel } from "../utils/orderStatus.js";

describe("statusLabel", () => {
  it("returns a readable label for processing", () => {
    expect(statusLabel("processing")).toBe("Processing");
  });

  it("returns a readable label for in-transit", () => {
    expect(statusLabel("in-transit")).toBe("In transit");
  });

  it("returns a readable label for delivered", () => {
    expect(statusLabel("delivered")).toBe("Delivered");
  });

  it("returns the raw status for unknown values", () => {
    expect(statusLabel("cancelled")).toBe("cancelled");
    expect(statusLabel("custom-status")).toBe("custom-status");
  });
});

describe("nextDeliveryStatus edge cases", () => {
  it("keeps unknown status unchanged", () => {
    expect(nextDeliveryStatus("cancelled")).toBe("cancelled");
    expect(nextDeliveryStatus("unknown")).toBe("unknown");
  });
});
