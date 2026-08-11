# Provider API v1

Base URL: `/api/v1`. JSON requests require `Content-Type: application/json`. Provider endpoints will accept `Authorization: Bearer kd_live_…`; only a key prefix and secure hash are stored. Delivery/payment creation requires `Idempotency-Key`.

Implemented in the foundation:

- `GET /health`
- `POST /quotes`
- `GET /deliveries`
- `POST /deliveries`
- `GET /deliveries/:id`

Contracted provider mutation endpoints for the next vertical slice:

- `POST /deliveries/:id/accept`
- `POST /deliveries/:id/status`
- `POST /deliveries/:id/cancel`
- `GET /deliveries/:id/tracking`

Errors use `{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": {} } }`. Webhook envelopes contain `id`, `type`, `deliveryId`, `createdAt`, and `payload`; signatures use HMAC-SHA256 and retries use exponential backoff.
