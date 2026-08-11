export const deliveryStatuses = [
  "CREATED", "PRICED", "SEARCHING", "ASSIGNED", "RIDER_ARRIVING",
  "AT_PICKUP", "PICKED_UP", "IN_TRANSIT", "AT_DESTINATION",
  "DELIVERED", "CANCELLED", "FAILED", "DISPUTED",
] as const;

export type DeliveryStatus = (typeof deliveryStatuses)[number];
export type VehicleType = "BICYCLE" | "MOTORCYCLE" | "CAR" | "VAN";
export type DeliveryPriority = "STANDARD" | "EXPRESS";

export const DELIVERY_TRANSITIONS: Record<DeliveryStatus, readonly DeliveryStatus[]> = {
  CREATED: ["PRICED", "CANCELLED", "FAILED"],
  PRICED: ["SEARCHING", "CANCELLED", "FAILED"],
  SEARCHING: ["ASSIGNED", "CANCELLED", "FAILED"],
  ASSIGNED: ["RIDER_ARRIVING", "SEARCHING", "CANCELLED", "FAILED"],
  RIDER_ARRIVING: ["AT_PICKUP", "SEARCHING", "CANCELLED", "FAILED"],
  AT_PICKUP: ["PICKED_UP", "CANCELLED", "FAILED"],
  PICKED_UP: ["IN_TRANSIT", "FAILED", "DISPUTED"],
  IN_TRANSIT: ["AT_DESTINATION", "FAILED", "DISPUTED"],
  AT_DESTINATION: ["DELIVERED", "FAILED", "DISPUTED"],
  DELIVERED: ["DISPUTED"],
  CANCELLED: [],
  FAILED: ["DISPUTED"],
  DISPUTED: [],
};

export class InvalidDeliveryTransitionError extends Error {
  constructor(from: DeliveryStatus, to: DeliveryStatus) {
    super(`Delivery cannot transition from ${from} to ${to}`);
    this.name = "InvalidDeliveryTransitionError";
  }
}

export function assertDeliveryTransition(from: DeliveryStatus, to: DeliveryStatus) {
  if (!DELIVERY_TRANSITIONS[from].includes(to)) {
    throw new InvalidDeliveryTransitionError(from, to);
  }
}

