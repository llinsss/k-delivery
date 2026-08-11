import { NextResponse } from "next/server";
import { z } from "zod";
import { PaymentConfigurationError, PaystackPaymentProvider } from "@/services/paystack";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference");
  const parsed = z.string().regex(/^KD-[A-F0-9]{20}$/).safeParse(reference);
  if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_REFERENCE", message: "Invalid payment reference" } }, { status: 422 });
  try {
    const result = await new PaystackPaymentProvider().verify(parsed.data);
    if (!result.verified) return NextResponse.json({ data: { status: "FAILED", reference: parsed.data } });
    return NextResponse.json({ data: { status: "SUCCEEDED", reference: parsed.data, amountKobo: result.amountKobo } });
  } catch (error) {
    const code = error instanceof PaymentConfigurationError ? "PAYMENT_NOT_CONFIGURED" : "PAYMENT_VERIFICATION_FAILED";
    return NextResponse.json({ error: { code, message: error instanceof Error ? error.message : "Unable to verify payment" } }, { status: error instanceof PaymentConfigurationError ? 503 : 502 });
  }
}

