import { describe, expect, it } from "vitest";
import { assertDeliveryTransition } from "./delivery";
describe("delivery state machine", () => {
  it("allows the fulfillment path", () => expect(() => assertDeliveryTransition("PICKED_UP", "IN_TRANSIT")).not.toThrow());
  it("rejects skipped states", () => expect(() => assertDeliveryTransition("SEARCHING", "DELIVERED")).toThrow());
});
