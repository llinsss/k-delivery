# K-Deliver architecture

K-Deliver is a modular monolith for the launch phase. Next.js serves the responsive applications and `/api/v1` REST API; PostgreSQL is the source of truth and Prisma owns schema access. Business rules live in `src/services`, not route handlers, so dispatch, pricing, routing, payments and notifications can later move into independent workers without rewriting clients.

## Critical path

`create → price → payment verification → search → offer → assign → pickup → track → PIN proof → deliver → ledger`

Delivery status changes must pass through the state machine and create a `DeliveryEvent` in the same database transaction. Slow secondary work—notifications, webhook delivery, matching retries, reconciliation and analytics—is represented by the `JobQueue` boundary and should run in a Redis-backed worker in production.

## Integration boundaries

- Routing: `RoutingService`; local development uses honest Haversine estimates, production should use Mapbox/Google/OSM routing.
- Payments: `PaymentProvider`; production credentials remain server-only and callbacks must be verified.
- Realtime: `RealtimePublisher`; channels must be scoped to a delivery and authorized viewer.
- Notifications: `NotificationProvider`; email, SMS, push and WhatsApp adapters can be selected per event.
- Dispatch: ranked candidates are modular; provider capacity can enter the same candidate pipeline.

## Security model

Roles and permissions are explicit in `src/lib/rbac.ts`. Route handlers must authenticate first, call `requirePermission`, then scope database queries to the authenticated owner/provider. Provider API keys store only hashes and prefixes. Public tracking uses an unguessable tracking token, never internal IDs or unrestricted rider feeds.

