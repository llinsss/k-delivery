import type { VehicleType } from "@/domain/delivery";

export interface DispatchCandidate {
  id: string;
  vehicle: VehicleType;
  proximityKm: number;
  etaMinutes: number;
  reliability: number;
  workload: number;
  available: boolean;
  askingPriceKobo?: number;
}

export interface DispatchWeights { proximity: number; eta: number; reliability: number; workload: number; price: number }
export const defaultDispatchWeights: DispatchWeights = { proximity: 0.3, eta: 0.25, reliability: 0.25, workload: 0.1, price: 0.1 };

export function rankCandidates(candidates: DispatchCandidate[], requiredVehicle: VehicleType, weights = defaultDispatchWeights) {
  return candidates
    .filter((candidate) => candidate.available && candidate.vehicle === requiredVehicle)
    .map((candidate) => ({
      ...candidate,
      score: (1 / (1 + candidate.proximityKm)) * weights.proximity
        + (1 / (1 + candidate.etaMinutes)) * weights.eta
        + candidate.reliability * weights.reliability
        + (1 / (1 + candidate.workload)) * weights.workload
        + (1 / (1 + (candidate.askingPriceKobo ?? 0) / 100000)) * weights.price,
    }))
    .sort((a, b) => b.score - a.score);
}

