# Changelog

## Unreleased

### Added
- Customers module: full CRUD REST API (`/customers`), organization-scoped with soft delete.
- Vendors module: full CRUD REST API (`/vendors`), organization-scoped with soft delete.
- Quotations module: CRUD REST API (`/quotations`) with line items and server-side total calculation; item replacement on update runs in a transaction.
- Unit tests (service + controller) for the customers, vendors, and quotations modules.

### Fixed
- Corrected a broken `PrismaService` import path in `marketplaces/core` that failed the API build.
- Repaired scaffolding specs (app, marketplaces core/webhooks, sales-orders, shipments) whose services had gained dependencies, so the full test suite passes.

### Changed
- ESLint: relaxed type-checked `no-unsafe-*` and `no-floating-promises` rules for `*.spec.ts` files (jest matchers legitimately produce `any`).

## v0.0.1

- Monorepo
- Next.js
- NestJS
- Docker
- PostgreSQL
- Prisma