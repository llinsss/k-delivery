import { NextResponse } from "next/server";
import { z } from "zod";
import { HaversineRoutingService } from "@/services/routing";
import { calculatePrice } from "@/services/pricing";
import { selectVehicle } from "@/services/vehicle-selection";

const schema = z.object({
  pickup: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }),
  dropoff: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }),
  weightKg: z.number().positive().max(500).optional(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  priority: z.enum(["STANDARD", "EXPRESS"]),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid quote request", details: parsed.error.flatten() } }, { status: 422 });
  const route = await new HaversineRoutingService().estimate(parsed.data.pickup, parsed.data.dropoff);
  const vehicle = selectVehicle({ distanceKm: route.distanceKm, weightKg: parsed.data.weightKg, size: parsed.data.size });
  const multiplier = { BICYCLE: 9000, MOTORCYCLE: 10000, CAR: 13500, VAN: 16500 }[vehicle];
  const quote = calculatePrice({ distanceKm: route.distanceKm, vehicle, priority: parsed.data.priority }, { baseFeeKobo: 50000, perKmKobo: 12000, minimumFeeKobo: 60000, vehicleMultiplierBps: multiplier, expressMultiplierBps: 14000 });
  return NextResponse.json({ data: { route, recommendedVehicle: vehicle, estimatedMinutes: route.durationMinutes, quote }, meta: { pricingRule: "development-default" } });
}

