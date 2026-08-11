import type { DeliveryPriority, VehicleType } from "@/domain/delivery";

export interface PricingRuleInput {
  baseFeeKobo: number;
  perKmKobo: number;
  minimumFeeKobo: number;
  vehicleMultiplierBps: number;
  expressMultiplierBps: number;
}

export interface PriceQuote {
  subtotalKobo: number;
  totalKobo: number;
  distanceFeeKobo: number;
  vehicleAdjustmentKobo: number;
  priorityAdjustmentKobo: number;
  currency: "NGN";
}

const vehicleFallbackMultiplier: Record<VehicleType, number> = {
  BICYCLE: 9000,
  MOTORCYCLE: 10000,
  CAR: 13500,
  VAN: 16500,
};

export function calculatePrice(
  input: { distanceKm: number; vehicle: VehicleType; priority: DeliveryPriority },
  rule: PricingRuleInput,
): PriceQuote {
  if (!Number.isFinite(input.distanceKm) || input.distanceKm < 0) throw new Error("Distance must be a positive number");
  const distanceFeeKobo = Math.round(input.distanceKm * rule.perKmKobo);
  const beforeAdjustments = rule.baseFeeKobo + distanceFeeKobo;
  const vehicleBps = rule.vehicleMultiplierBps || vehicleFallbackMultiplier[input.vehicle];
  const afterVehicle = Math.round((beforeAdjustments * vehicleBps) / 10000);
  const vehicleAdjustmentKobo = afterVehicle - beforeAdjustments;
  const priorityBps = input.priority === "EXPRESS" ? rule.expressMultiplierBps : 10000;
  const afterPriority = Math.round((afterVehicle * priorityBps) / 10000);
  const priorityAdjustmentKobo = afterPriority - afterVehicle;
  return {
    subtotalKobo: beforeAdjustments,
    totalKobo: Math.max(rule.minimumFeeKobo, afterPriority),
    distanceFeeKobo,
    vehicleAdjustmentKobo,
    priorityAdjustmentKobo,
    currency: "NGN",
  };
}

export function splitEarnings(totalKobo: number, platformCommissionBps = 1500, processingFeeKobo = 0) {
  const platformFeeKobo = Math.round((totalKobo * platformCommissionBps) / 10000);
  return {
    customerChargeKobo: totalKobo,
    platformFeeKobo,
    processingFeeKobo,
    fulfillerEarningsKobo: totalKobo - platformFeeKobo - processingFeeKobo,
  };
}

