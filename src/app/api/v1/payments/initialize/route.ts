import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculatePrice } from "@/services/pricing";
import { PaymentConfigurationError, PaystackPaymentProvider } from "@/services/paystack";

const requestSchema = z.object({
  email: z.email(),
  idempotencyKey: z.string().min(16).max(128),
  distanceKm: z.number().positive().max(100),
  vehicle: z.enum(["BICYCLE", "MOTORCYCLE", "CAR", "VAN"]),
  priority: z.enum(["STANDARD", "EXPRESS"]),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Enter a valid email and delivery quote.", details: parsed.error.flatten() } }, { status: 422 });
  const multiplier = { BICYCLE: 9000, MOTORCYCLE: 10000, CAR: 13500, VAN: 16500 }[parsed.data.vehicle];
  const quote = calculatePrice({ distanceKm: parsed.data.distanceKm, vehicle: parsed.data.vehicle, priority: parsed.data.priority }, { baseFeeKobo: 50000, perKmKobo: 12000, minimumFeeKobo: 60000, vehicleMultiplierBps: multiplier, expressMultiplierBps: 14000 });
  const digest = createHash("sha256").update(parsed.data.idempotencyKey).digest("hex").slice(0, 20).toUpperCase();
  const reference = `KD-${digest}`;
  const appUrl = process.env.APP_URL ?? new URL(request.url).origin;
  try {
    const payment = await new PaystackPaymentProvider().initialize({ reference, amountKobo: quote.totalKobo, email: parsed.data.email, callbackUrl: `${appUrl}/payment/callback?reference=${reference}` });
    return NextResponse.json({ data: { ...payment, amountKobo: quote.totalKobo } });
  } catch (error) {
    if (error instanceof PaymentConfigurationError) return NextResponse.json({ error: { code: "PAYMENT_NOT_CONFIGURED", message: error.message } }, { status: 503 });
    return NextResponse.json({ error: { code: "PAYMENT_INITIALIZATION_FAILED", message: error instanceof Error ? error.message : "Unable to start payment" } }, { status: 502 });
  }
}

