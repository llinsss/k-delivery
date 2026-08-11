# K-Deliver

**Kaduna’s open delivery network.**

K-Deliver is an attempt to make delivery in Kaduna feel less like a chain of phone calls.

Today, a merchant often finds a rider through WhatsApp, explains the same address several times, negotiates a price, and calls again to ask where the package is. Meanwhile, another delivery company nearby may have an idle rider and no way to see that demand.

K-Deliver brings those pieces into one network:

- a customer can send and track a package;
- a merchant can manage recurring deliveries;
- an independent rider can receive suitable jobs;
- an existing logistics company can contribute capacity, use the infrastructure, or do both;
- an operations team can manage the marketplace behind it all.

The aim is not to own every bicycle or motorcycle in Kaduna. The aim is to build the shared pricing, dispatch, tracking, payment and integration layer underneath the city’s delivery ecosystem.

## The product in one picture

```text
Customers ───────┐
Merchants ───────┼──▶ K-Deliver ──▶ Bicycles
Business APIs ───┘       │          Motorcycles
                         │          Independent riders
                  pricing · dispatch · partner fleets
                  tracking · payments · events
```

Short, suitable trips favour bicycles. Medium-distance trips generally favour motorcycles. The final choice belongs to a configurable vehicle-selection service, because a five-kilometre document and a five-kilometre refrigerator are obviously not the same job.

## What you can explore today

The repository contains a working product foundation backed by PostgreSQL—not a collection of disconnected mock screens.

### Customer

- A mobile-first “Send something” flow
- Package size, weight and priority selection
- Configurable price and vehicle recommendations
- Paystack checkout initialization and server-side verification
- Public, account-free delivery tracking
- A detailed FAQ explaining how the network operates

### Merchants

- A dedicated business workspace
- Metrics calculated from delivery and payment records
- Saved pickup locations
- Delivery history, routes, riders, prices and tracking links
- A faster merchant delivery-entry flow

### Logistics partners

Kaduna delivery companies can apply under one of three models:

1. **K-Deliver fulfillment** — send jobs into the network and use eligible shared capacity.
2. **Infrastructure only** — retain their fleet while using dispatch, tracking, APIs and webhooks.
3. **Hybrid** — prioritize their own riders and use the network when extra capacity is needed.

The onboarding application records company details, fleet size, service zones, current volume and preferred integration. Approved providers have workspace areas for jobs, riders, vehicles, API credentials and webhooks.

### Platform foundation

- PostgreSQL schema and Prisma migrations
- Explicit role and permission matrix
- Delivery state machine and event history
- Pricing, routing, vehicle-selection and dispatch services
- Provider API-key hashing and authentication
- Idempotent provider delivery creation
- Versioned REST endpoints under `/api/v1`
- Service boundaries for notifications, realtime updates and background work

## A candid status note

K-Deliver is under active MVP development. The database-backed merchant and provider surfaces work, and the provider delivery API creates genuine records. Some launch-critical journeys are still being completed:

- phone OTP and production session authentication;
- authenticated operations approval for provider applications;
- merchant form persistence through payment and dispatch;
- rider offers, acceptance timeouts and lifecycle controls;
- WebSocket location streaming;
- PIN proof of delivery and automatic earnings ledger entries;
- webhook delivery workers and retries.

Development adapters are labelled as such. The app does not treat an unverified payment as successful or claim that a generated map is live rider tracking.

## Running it locally

You will need:

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer

Install the project:

```bash
git clone <repository-url>
cd k-deliver
npm install
cp .env.example .env
```

Create a PostgreSQL database called `kdeliver`, then update `DATABASE_URL` in `.env` for your local credentials. A typical connection looks like:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kdeliver?schema=public"
```

Prepare and seed the database:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the application:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

> This machine currently has a project-local PostgreSQL development cluster in `.postgres` configured on port `5433`. That directory is ignored by Git and should not be copied into a deployment.

## Useful routes

| Area | Local route |
| --- | --- |
| Customer landing page | `/` |
| Create a delivery | `/send` |
| Sample database-backed tracking | `/track/KD-7F2K9A` |
| Business gateway | `/business` |
| Merchant workspace | `/merchant` |
| Logistics partner information | `/partners` |
| Provider application | `/partners/onboard` |
| Provider workspace | `/provider` |
| API health | `/api/v1/health` |

## Development data

Running the seed creates deliberately recognisable local records:

- **Arewa Essentials** — merchant
- **Northline Logistics** — provider
- two verified riders with bicycle and motorcycle vehicles
- Kaduna zones and bicycle hubs
- one in-transit delivery, `KD-7F2K9A`

Seed user passwords are `Kaduna123!`. They are for local development only.

The local provider API key is:

```text
kd_test_northline_4f7a98d2e6c1b530
```

Never carry this key into a shared or production environment.

## Provider API example

List the seeded provider’s deliveries:

```bash
curl http://localhost:3000/api/v1/deliveries \
  -H "Authorization: Bearer kd_test_northline_4f7a98d2e6c1b530"
```

Provider delivery creation also requires an `Idempotency-Key`. See [the API guide](docs/API.md) for the current contract.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by Prisma and the application |
| `AUTH_SECRET` | Session/token signing secret; replace before deployment |
| `APP_URL` | Public application origin used for callbacks and tracking links |
| `PAYMENT_PROVIDER` | Selected payment adapter |
| `PAYSTACK_SECRET_KEY` | Server-only Paystack secret used to initialize and verify transactions |
| `MAP_PROVIDER` | Selected routing/map adapter |
| `MAPBOX_ACCESS_TOKEN` | Optional production Mapbox credential |
| `WEBHOOK_SIGNING_SECRET` | Secret used to sign outgoing provider events |
| `CRON_SECRET` | Protects scheduled worker endpoints |

Start from [.env.example](.env.example). Never commit `.env` or a production credential.

## Everyday commands

```bash
npm run dev          # start Next.js locally
npm run typecheck    # check TypeScript without emitting files
npm run lint         # run ESLint
npm run test         # run the Vitest suite once
npm run test:watch   # run tests while developing
npm run build        # produce a production build
npm run db:generate  # regenerate Prisma Client
npm run db:migrate   # create/apply a development migration
npm run db:seed      # load Kaduna development data
```

## Where things live

```text
src/app/             pages and versioned API routes
src/components/      shared customer and business UI
src/domain/          delivery states and domain rules
src/services/        pricing, routing, dispatch, payments and adapters
src/lib/             database, permissions and provider authentication
prisma/              schema, migrations and Kaduna seed data
docs/                architecture and provider API notes
```

Business rules belong in `src/services` or `src/domain`, not buried in page components or route handlers. External providers sit behind interfaces so switching a payment, map or notification vendor does not require rebuilding the product.

## Documentation

- [Architecture and service boundaries](docs/ARCHITECTURE.md)
- [Provider API and webhook contract](docs/API.md)
- [Database schema](prisma/schema.prisma)

## Before deploying

The local setup is intentionally convenient; production should not be.

- Use managed PostgreSQL and run `prisma migrate deploy` during release.
- Replace every development secret and seed credential.
- Configure a real routing/geocoding provider.
- Configure Paystack with server-only production credentials and verified callbacks.
- Run realtime and background workers against managed Redis or equivalent infrastructure.
- Protect customer, rider and operations routes with authenticated sessions and enforced permissions.
- Remove or rotate the seeded provider key.
- Serve the application behind TLS and keep precise rider location scoped to authorized delivery participants.

## The principle behind the code

K-Deliver should stay small enough to launch, but its centre of gravity is the network—not a single fleet.

The critical loop is:

```text
create → price → pay → match → assign → pick up → track → deliver → record earnings
```

Everything we add should make that loop more reliable for Kaduna’s customers, merchants, riders and delivery companies.
