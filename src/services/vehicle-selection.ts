import type { VehicleType } from "@/domain/delivery";

export interface VehicleSelectionPolicy {
  bicycleMaxKm: number;
  motorcycleMaxKm: number;
  bicycleMaxWeightKg: number;
  motorcycleMaxWeightKg: number;
}

export const defaultVehiclePolicy: VehicleSelectionPolicy = {
  bicycleMaxKm: 5,
  motorcycleMaxKm: 15,
  bicycleMaxWeightKg: 8,
  motorcycleMaxWeightKg: 30,
};

export function selectVehicle(
  input: { distanceKm: number; weightKg?: number; size?: string },
  policy = defaultVehiclePolicy,
): VehicleType {
  const weight = input.weightKg ?? 1;
  const bulky = input.size === "LARGE";
  if (input.distanceKm <= policy.bicycleMaxKm && weight <= policy.bicycleMaxWeightKg && !bulky) return "BICYCLE";
  if (input.distanceKm <= policy.motorcycleMaxKm && weight <= policy.motorcycleMaxWeightKg) return "MOTORCYCLE";
  return bulky || weight > policy.motorcycleMaxWeightKg ? "VAN" : "CAR";
}

