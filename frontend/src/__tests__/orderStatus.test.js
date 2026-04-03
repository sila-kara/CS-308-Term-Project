import { describe, expect, it } from "vitest";
import {
  nextDeliveryStatus,
  ORDER_STATUS_SEQUENCE,
} from "../utils/orderStatus.js";

describe("nextDeliveryStatus", () => {
  it("moves from processing to in-transit", () => {
    expect(nextDeliveryStatus("processing")).toBe("in-transit");
  });

  it("moves from in-transit to delivered", () => {
    expect(nextDeliveryStatus("in-transit")).toBe("delivered");
  });

  it("keeps delivered as terminal", () => {
    expect(nextDeliveryStatus("delivered")).toBe("delivered");
  });

  it("sequence has three stages for coursework milestone", () => {
    expect(ORDER_STATUS_SEQUENCE.length).toBe(3);
  });
});
