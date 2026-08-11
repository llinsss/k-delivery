import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticateProvider } from "@/lib/provider-auth";
import { HaversineRoutingService } from "@/services/routing";
import { selectVehicle } from "@/services/vehicle-selection";
import { calculatePrice } from "@/services/pricing";
import { hash } from "bcryptjs";

const location = z.object({ address: z.string().min(5).max(240), landmark: z.string().max(160).optional(), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), contactName: z.string().min(2), contactPhone: z.string().regex(/^\+?234\d{10}$|^0\d{10}$/) });
const createSchema = z.object({ pickup: location, dropoff: location, package: z.object({ type: z.string().min(2).max(60), description: z.string().max(500).optional(), size: z.enum(["SMALL", "MEDIUM", "LARGE"]), weightKg: z.number().positive().max(500).optional() }), priority: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD") });
const unauthorized = () => NextResponse.json({ error: { code: "UNAUTHORIZED", message: "A valid provider API key is required" } }, { status: 401 });

export async function GET(request: Request) {
  const auth = await authenticateProvider(request); if (!auth) return unauthorized();
  const url = new URL(request.url); const take = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
  const deliveries = await db.delivery.findMany({ where: { providerId: auth.providerId }, include: { pickup: true, dropoff: true }, orderBy: { createdAt: "desc" }, take });
  return NextResponse.json({ data: deliveries.map(item => ({ id: item.publicId, status: item.status, priority: item.priority, priceKobo: item.quotedAmountKobo, currency: "NGN", pickup: item.pickup, dropoff: item.dropoff, trackingUrl: `${process.env.APP_URL ?? url.origin}/track/${item.publicId}`, createdAt: item.createdAt })) });
}

export async function POST(request: Request) {
  const auth = await authenticateProvider(request); if (!auth) return unauthorized();
  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey || idempotencyKey.length < 8) return NextResponse.json({ error: { code: "IDEMPOTENCY_KEY_REQUIRED", message: "Provide an Idempotency-Key of at least 8 characters" } }, { status: 400 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid delivery request", details: parsed.error.flatten() } }, { status: 422 });
  const member = await db.providerMember.findFirst({ where: { providerId: auth.providerId } });
  if (!member) return NextResponse.json({ error: { code: "PROVIDER_CONFIGURATION_ERROR", message: "Provider has no administrative member" } }, { status: 409 });
  const existing = await db.delivery.findFirst({ where: { creatorId: member.userId, idempotencyKey }, include: { pickup: true, dropoff: true } });
  if (existing) return NextResponse.json({ data: { id: existing.publicId, status: existing.status, trackingUrl: `${process.env.APP_URL ?? new URL(request.url).origin}/track/${existing.publicId}` }, meta: { idempotentReplay: true } });
  const route = await new HaversineRoutingService().estimate(parsed.data.pickup, parsed.data.dropoff);
  const vehicle = selectVehicle({ distanceKm: route.distanceKm, weightKg: parsed.data.package.weightKg, size: parsed.data.package.size });
  const multiplier = { BICYCLE: 9000, MOTORCYCLE: 10000, CAR: 13500, VAN: 16500 }[vehicle];
  const quote = calculatePrice({ distanceKm: route.distanceKm, vehicle, priority: parsed.data.priority }, { baseFeeKobo: 50000, perKmKobo: 12000, minimumFeeKobo: 60000, vehicleMultiplierBps: multiplier, expressMultiplierBps: 14000 });
  const publicId = `KD-${randomBytes(3).toString("hex").toUpperCase()}`;
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const delivery = await db.$transaction(async tx => {
    const pickup = await tx.location.create({ data: { formattedAddress: parsed.data.pickup.address, landmark: parsed.data.pickup.landmark, contactName: parsed.data.pickup.contactName, contactPhone: parsed.data.pickup.contactPhone, latitude: parsed.data.pickup.latitude, longitude: parsed.data.pickup.longitude } });
    const dropoff = await tx.location.create({ data: { formattedAddress: parsed.data.dropoff.address, landmark: parsed.data.dropoff.landmark, contactName: parsed.data.dropoff.contactName, contactPhone: parsed.data.dropoff.contactPhone, latitude: parsed.data.dropoff.latitude, longitude: parsed.data.dropoff.longitude } });
    return tx.delivery.create({ data: { publicId, creatorId: member.userId, providerId: auth.providerId, pickupLocationId: pickup.id, dropoffLocationId: dropoff.id, status: "PRICED", priority: parsed.data.priority, packageType: parsed.data.package.type, packageDescription: parsed.data.package.description, packageSize: parsed.data.package.size, weightKg: parsed.data.package.weightKg, distanceKm: route.distanceKm, estimatedMinutes: route.durationMinutes, recommendedVehicle: vehicle, quotedAmountKobo: quote.totalKobo, recipientPinHash: await hash(pin, 10), idempotencyKey, events: { create: [{ toStatus: "CREATED" }, { fromStatus: "CREATED", toStatus: "PRICED" }] } } });
  });
  return NextResponse.json({ data: { id: delivery.publicId, status: delivery.status, recommendedVehicle: vehicle, distanceKm: route.distanceKm, etaMinutes: route.durationMinutes, priceKobo: quote.totalKobo, currency: "NGN", trackingUrl: `${process.env.APP_URL ?? new URL(request.url).origin}/track/${delivery.publicId}` } }, { status: 201 });
}

