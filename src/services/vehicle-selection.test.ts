import { describe, expect, it } from "vitest";
import { selectVehicle } from "./vehicle-selection";
describe("vehicle selection", () => {
  it("prefers bicycles for suitable trips up to 5km", () => expect(selectVehicle({ distanceKm: 4.2, weightKg: 2 })).toBe("BICYCLE"));
  it("uses motorcycles for medium trips", () => expect(selectVehicle({ distanceKm: 10, weightKg: 5 })).toBe("MOTORCYCLE"));
  it("uses vans for heavy packages", () => expect(selectVehicle({ distanceKm: 20, weightKg: 50 })).toBe("VAN"));
});

