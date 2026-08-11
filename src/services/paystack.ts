import type { PaymentProvider, PaymentRequest, PaymentResult } from "./adapters";

type PaystackEnvelope<T> = { status: boolean; message: string; data: T };

export class PaymentConfigurationError extends Error {
  constructor() { super("Paystack is not configured. Add PAYSTACK_SECRET_KEY to the server environment."); }
}

export class PaystackPaymentProvider implements PaymentProvider {
  constructor(private readonly secretKey = process.env.PAYSTACK_SECRET_KEY) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.secretKey) throw new PaymentConfigurationError();
    const response = await fetch(`https://api.paystack.co${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${this.secretKey}`, "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
    const result = await response.json() as PaystackEnvelope<T>;
    if (!response.ok || !result.status) throw new Error(result.message || "Payment provider request failed");
    return result.data;
  }

  async initialize(request: PaymentRequest): Promise<PaymentResult> {
    const data = await this.request<{ reference: string; authorization_url: string }>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({ email: request.email, amount: request.amountKobo, reference: request.reference, callback_url: request.callbackUrl, currency: "NGN", channels: ["card", "bank", "ussd", "bank_transfer"] }),
    });
    return { reference: data.reference, authorizationUrl: data.authorization_url, status: "PENDING" };
  }

  async verify(reference: string) {
    const data = await this.request<{ status: string; amount: number; currency: string }>(`/transaction/verify/${encodeURIComponent(reference)}`);
    return { verified: data.status === "success" && data.currency === "NGN", amountKobo: data.amount };
  }
}

