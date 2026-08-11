export interface PaymentRequest { reference: string; amountKobo: number; email: string; callbackUrl: string }
export interface PaymentResult { reference: string; authorizationUrl: string; status: "PENDING" | "SUCCEEDED" }
export interface PaymentProvider {
  initialize(request: PaymentRequest): Promise<PaymentResult>;
  verify(reference: string): Promise<{ verified: boolean; amountKobo: number }>;
}
export interface NotificationProvider { send(input: { channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP"; to: string; body: string }): Promise<void> }
export interface RealtimePublisher { publish(channel: string, event: string, payload: unknown): Promise<void> }
export interface JobQueue { enqueue(name: string, payload: unknown, options?: { delayMs?: number }): Promise<void> }

