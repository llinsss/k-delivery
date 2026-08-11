import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole, VehicleType } from "@prisma/client";
import { hash } from "bcryptjs";
import { createHash } from "node:crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/kdeliver?schema=public" });
const prisma = new PrismaClient({ adapter });
const zoneNames = ["CBD", "Barnawa", "Kakuri", "Malali", "Kawo", "Sabon Tasha", "Narayi", "Gonin Gora", "Ungwan Rimi", "Tudun Wada", "Sabo"];

async function main() {
  for (const name of zoneNames) {
    await prisma.zone.upsert({ where: { code: name.replaceAll(" ", "-").toUpperCase() }, update: {}, create: { name, code: name.replaceAll(" ", "-").toUpperCase(), preferredVehicle: ["CBD", "Barnawa"].includes(name) ? VehicleType.BICYCLE : VehicleType.MOTORCYCLE } });
  }
  const passwordHash = await hash("Kaduna123!", 12);
  const users = [
    ["admin@kdeliver.ng", "+2348000000001", "Platform Admin", UserRole.PLATFORM_ADMIN],
    ["operations@kdeliver.ng", "+2348000000002", "Kaduna Operations", UserRole.OPERATIONS],
    ["merchant@kdeliver.ng", "+2348000000003", "Aisha Bello", UserRole.MERCHANT],
    ["customer@kdeliver.ng", "+2348000000004", "Abubakar Onoja", UserRole.CUSTOMER],
    ["provider@kdeliver.ng", "+2348000000005", "Yusuf Adamu", UserRole.PROVIDER_ADMIN],
    ["rider1@kdeliver.ng", "+2348000000006", "Musa Ibrahim", UserRole.RIDER],
    ["rider2@kdeliver.ng", "+2348000000007", "Sani Lawal", UserRole.RIDER],
  ] as const;
  for (const [email, phone, name, role] of users) await prisma.user.upsert({ where: { email }, update: {}, create: { email, phone, name, role, passwordHash } });
  const merchantUser = await prisma.user.findUniqueOrThrow({ where: { email: "merchant@kdeliver.ng" } });
  const merchant = await prisma.merchant.upsert({ where: { userId: merchantUser.id }, update: { businessName: "Arewa Essentials" }, create: { userId: merchantUser.id, businessName: "Arewa Essentials" } });
  const providerUser = await prisma.user.findUniqueOrThrow({ where: { email: "provider@kdeliver.ng" } });
  const provider = await prisma.provider.upsert({ where: { slug: "northline-logistics" }, update: { status: "ACTIVE" }, create: { name: "Northline Logistics", slug: "northline-logistics", status: "ACTIVE", commissionBps: 1500 } });
  await prisma.providerMember.upsert({ where: { providerId_userId: { providerId: provider.id, userId: providerUser.id } }, update: {}, create: { providerId: provider.id, userId: providerUser.id } });
  const developmentApiKey = "kd_test_northline_4f7a98d2e6c1b530";
  const developmentApiKeyHash = createHash("sha256").update(developmentApiKey).digest("hex");
  await prisma.apiKey.upsert({ where: { keyHash: developmentApiKeyHash }, update: {}, create: { providerId: provider.id, name: "Local development", prefix: "kd_test_northline", keyHash: developmentApiKeyHash } });
  for (const [email, registration, type] of [["rider1@kdeliver.ng", "KD-B042", VehicleType.BICYCLE], ["rider2@kdeliver.ng", "KD-M117", VehicleType.MOTORCYCLE]] as const) {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const rider = await prisma.rider.upsert({ where: { userId: user.id }, update: { providerId: provider.id, status: "ACTIVE" }, create: { userId: user.id, providerId: provider.id, status: "ACTIVE", availability: "ONLINE" } });
    await prisma.vehicle.upsert({ where: { registration }, update: { riderId: rider.id, providerId: provider.id }, create: { registration, type, riderId: rider.id, providerId: provider.id, capacityKg: type === VehicleType.BICYCLE ? 8 : 30 } });
  }
  await prisma.pricingRule.upsert({ where: { id: "kaduna-default-pricing" }, update: {}, create: { id: "kaduna-default-pricing", name: "Kaduna launch pricing", baseFeeKobo: 50000, perKmKobo: 12000, vehicleMultiplierBps: 10000, expressMultiplierBps: 14000, minimumFeeKobo: 60000, cancellationFeeKobo: 30000 } });
  const barnawa = await prisma.zone.findUniqueOrThrow({ where: { code: "BARNAWA" } });
  const cbd = await prisma.zone.findUniqueOrThrow({ where: { code: "CBD" } });
  await prisma.hub.upsert({ where: { id: "barnawa-hub" }, update: {}, create: { id: "barnawa-hub", name: "Barnawa Hub", latitude: 10.4762, longitude: 7.4238, capacity: 10, zoneId: barnawa.id } });
  await prisma.hub.upsert({ where: { id: "cbd-hub" }, update: {}, create: { id: "cbd-hub", name: "CBD Hub", latitude: 10.5105, longitude: 7.4165, capacity: 15, zoneId: cbd.id } });
  const pickup = await prisma.location.upsert({ where: { kadunaCode: "KD-BNW-10001" }, update: {}, create: { kadunaCode: "KD-BNW-10001", userId: merchantUser.id, label: "Main shop", formattedAddress: "Barnawa Shopping Complex, Kaduna", landmark: "Beside the main gate", contactName: "Arewa Essentials", contactPhone: "+2348000000003", latitude: 10.4762, longitude: 7.4238, zoneId: barnawa.id } });
  const dropoff = await prisma.location.upsert({ where: { kadunaCode: "KD-CBD-10002" }, update: {}, create: { kadunaCode: "KD-CBD-10002", formattedAddress: "Ahmadu Bello Way, Kaduna CBD", landmark: "Opposite Central Market", contactName: "Fatima Musa", contactPhone: "+2348012345678", latitude: 10.5105, longitude: 7.4165, zoneId: cbd.id } });
  const rider = await prisma.rider.findFirstOrThrow({ where: { providerId: provider.id, user: { email: "rider1@kdeliver.ng" } }, include: { vehicles: true } });
  await prisma.delivery.upsert({ where: { publicId: "KD-7F2K9A" }, update: {}, create: { publicId: "KD-7F2K9A", creatorId: merchantUser.id, merchantId: merchant.id, providerId: provider.id, riderId: rider.id, vehicleId: rider.vehicles[0].id, pickupLocationId: pickup.id, dropoffLocationId: dropoff.id, pickupZoneId: barnawa.id, dropoffZoneId: cbd.id, status: "IN_TRANSIT", priority: "STANDARD", packageType: "Parcel", packageDescription: "Customer order", packageSize: "SMALL", weightKg: 2, distanceKm: 4.2, estimatedMinutes: 30, recommendedVehicle: "BICYCLE", quotedAmountKobo: 90360, recipientPinHash: await hash("4829", 10), events: { create: [{ toStatus: "CREATED" }, { fromStatus: "CREATED", toStatus: "PRICED" }, { fromStatus: "PRICED", toStatus: "SEARCHING" }, { fromStatus: "SEARCHING", toStatus: "ASSIGNED" }, { fromStatus: "ASSIGNED", toStatus: "RIDER_ARRIVING" }, { fromStatus: "RIDER_ARRIVING", toStatus: "AT_PICKUP" }, { fromStatus: "AT_PICKUP", toStatus: "PICKED_UP" }, { fromStatus: "PICKED_UP", toStatus: "IN_TRANSIT" }] }, payment: { create: { reference: "KD-SEED-PAYMENT-001", provider: "development-seed", status: "SUCCEEDED", amountKobo: 90360, verifiedAt: new Date() } } } });
}

main().finally(() => prisma.$disconnect());
