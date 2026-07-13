# CommerceOS

CommerceOS is a monorepo for building a marketplace-independent commerce back office. The system is designed around owned product, store, and inventory data, with Shopee, Lazada, TikTok, website, and POS integrations treated as adapters around the core model.

## Stack

- Monorepo: pnpm workspaces + Turborepo
- Web: Next.js, React, TypeScript
- API: NestJS, Prisma Client
- Database: PostgreSQL, Prisma Migrate
- Tooling: ESLint, Prettier, TypeScript

## Workspace

- `apps/api`: NestJS API. Currently exposes a database health check at `GET /`.
- `apps/web`: Next.js web app. Still mostly the starter UI.
- `apps/docs`: Next.js docs app from the Turborepo starter.
- `packages/database`: Prisma schema, migrations, and seed data.
- `packages/core`: Early shared TypeScript domain types.
- `packages/ui`: Shared React UI package from the starter.
- `docker`: Local PostgreSQL compose setup.
- `docs`: Architecture notes, roadmap, and API sketches.

## Getting Started

Install dependencies:

```sh
pnpm install
```

Start PostgreSQL:

```sh
docker compose -f docker/docker-compose.yml up -d
```

Generate Prisma Client:

```sh
pnpm db:generate
```

Apply migrations:

```sh
pnpm db:migrate
```

Seed starter data:

```sh
pnpm db:seed
```

Run the workspace:

```sh
pnpm dev
```

## Common Commands

```sh
pnpm build
pnpm lint
pnpm check-types
pnpm db:studio
```

## Current Domain Foundation

The Prisma schema spans the full enterprise model (location master data, org & security, product catalog, inventory/WMS, purchasing, sales/OMS, marketplace sync, accounting, and BI). See [docs/DATABASE.md](docs/DATABASE.md) for the domain breakdown.

API modules are being implemented incrementally on top of that schema:

- **Implemented (CRUD/logic)**: products, product categories, brands, units, taxes, stores, warehouses, locations, users, roles & permissions, auth, inventory, stock transfers/adjustments, goods receives, sales orders, shipments, customers, vendors, quotations, price books, purchase requests/invoices/returns, sales invoices/returns, receipts.
- **Scaffolded / not yet implemented**: the marketplace connectors (Shopee/sync workers).

## Notes

- The database schema is ahead of the app code: many models still have no corresponding API module yet (accounting, BI, deep OMS/WMS, promotions/CRM). Check `apps/api/src/modules` for what is actually wired up.
- When changing `packages/database/prisma/schema.prisma`, create and commit the matching Prisma migration before relying on the schema in seed data or API code.
