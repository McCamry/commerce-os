# Changelog

## Unreleased

### Added
- Customers module: full CRUD REST API (`/customers`), organization-scoped with soft delete.
- Vendors module: full CRUD REST API (`/vendors`), organization-scoped with soft delete.
- Quotations module: CRUD REST API (`/quotations`) with line items and server-side total calculation; item replacement on update runs in a transaction.
- Price Books module: CRUD REST API (`/price-books`) with line items, organization-scoped, soft delete.
- Purchase Requests module: CRUD REST API (`/purchase-requests`) with line items, organization + store scoped.
- Purchase Invoices module: CRUD REST API (`/purchase-invoices`), vendor-scoped, with server-side total calculation.
- Purchase Returns module: CRUD REST API (`/purchase-returns`) with line items, vendor-scoped.
- Sales Invoices module: CRUD REST API (`/sales-invoices`), sales-order-scoped, with server-side total calculation.
- Sales Returns module: CRUD REST API (`/sales-returns`) with line items, sales-order-scoped.
- Receipts module: CRUD REST API (`/receipts`) for invoice payments, sales-invoice-scoped.
- Unit tests (service + controller) for all of the above modules, including total-calculation coverage for invoices and quotations.

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