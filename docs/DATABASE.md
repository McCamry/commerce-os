# Database Design

## Design Goals

- Multi Organize
- Multi Store
- Multi Marketplace
- Multi Warehouse
- Multi Country
- Multi User
- Unlimited Product Variants
- Shared Inventory
- Marketplace Independent

## Current Scope

- Location master data: countries, provinces, districts, subdistricts
- Business master data: organizations, stores
- Soft delete support through `deleted_at`
- Active/inactive status through `RecordStatus`

## Local Workflow

```sh
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

When `schema.prisma` changes, create the matching migration before depending on the new models from API or seed code.
