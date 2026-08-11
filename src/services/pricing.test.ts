import { describe, expect, it } from "vitest";
import { calculatePrice, splitEarnings } from "./pricing";

const rule = { baseFeeKobo: 50000, perKmKobo: 12000, minimumFeeKobo: 60000, vehicleMultiplierBps: 10000, expressMultiplierBps: 14000 };
describe("pricing", () => {
  it("calculates transparent standard pricing", () => expect(calculatePrice({ distanceKm: 4.2, vehicle: "BICYCLE", priority: "STANDARD" }, rule).totalKobo).toBe(100400));
  it("applies express pricing", () => expect(calculatePrice({ distanceKm: 5, vehicle: "MOTORCYCLE", priority: "EXPRESS" }, rule).totalKobo).toBe(154000));
  it("keeps the ledger balanced", () => {
    const split = splitEarnings(120000, 1500, 2000);
    expect(split.fulfillerEarningsKobo + split.platformFeeKobo + split.processingFeeKobo).toBe(120000);
  });
});

