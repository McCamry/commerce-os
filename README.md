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

The Prisma schema currently focuses on master data:

- Countries, provinces, districts, and subdistricts
- Organizations
- Stores
- Record status and marketplace enums

The roadmap then moves through authentication, products, categories, inventory, orders, customers, dashboarding, and marketplace connectors.

## Notes

- The database schema is ahead of some app code. API modules for products, categories, inventory, orders, and customers are not implemented yet.
- When changing `packages/database/prisma/schema.prisma`, create and commit the matching Prisma migration before relying on the schema in seed data or API code.
