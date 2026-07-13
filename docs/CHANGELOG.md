# Changelog

## Unreleased

### Security
- Enforce tenant isolation on every read/update/delete: all `findOne`/`update`/`remove` (and the stock-transfer/adjustment approve/complete/cancel actions) now scope by the caller's organization, sourced from the JWT via `@CurrentUser('organizationId')` rather than trusting a client-supplied `?organizationId=` query param. List endpoints derive the org from the JWT too. Closes a cross-organization IDOR where any authenticated user could read, modify, or delete another org's records by id, and where `stock-transfers`, `stock-adjustments`, `inventory`, and `stores` list endpoints returned data across all organizations. Directly-scoped entities filter on their `organizationId` column; invoices/returns/receipts/locations/stock docs filter through their parent relation (vendor/salesOrder/salesInvoice/warehouse).
- Derive the organization on create from the JWT as well: removed `organizationId` from every create DTO (customers, products, brands, taxes, units, stores, price-books, product-categories, purchase-requests, quotations, vendors, warehouses, users, roles) so a client can no longer create a record into another organization by supplying a forged `organizationId` in the body. The value now always comes from `@CurrentUser('organizationId')`.
- Enforce authentication globally: registered `JwtAuthGuard` as an `APP_GUARD`, with a `@Public()` decorator to opt out (login/refresh/logout, health check, marketplace webhooks). Previously only a couple of controllers were guarded.
- Scope the non-org-scoped list endpoints to a tenant: `purchase-invoices`, `purchase-returns`, `sales-invoices`, `sales-returns`, and `receipts` now require an `organizationId` query param and filter through their parent relation (vendor/salesOrder/salesInvoice), preventing cross-organization data exposure.

### Added
- Wire the fulfillment backbone (previously service logic with no routes): `POST/GET /purchase-orders` (+ `POST /purchase-orders/:id/approve`), `POST /goods-receives`, `POST /sales-orders/:id/confirm`, and `POST /shipments/:id/ship`. All org/user context comes from the JWT; goods-receive `receivedBy` is the authenticated user.
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
- Database migrations: squashed the five partial migrations into a single `0_init` baseline that matches the full schema, so the database is reproducible with `prisma migrate deploy`. Use `prisma migrate dev` for future schema changes instead of `db push`.

## v0.0.1

- Monorepo
- Next.js
- NestJS
- Docker
- PostgreSQL
- Prisma