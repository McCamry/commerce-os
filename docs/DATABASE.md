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
- Product & Category data:
  - `Category`: Hierarchy tree structure (self-relation) under `Organization`
  - `Product`: Master product listings linked to `Organization` and classified by `Category`
  - `ProductMedia`: Support for product images and videos with display ordering
- Soft delete support through `deleted_at`
- Active/inactive status through `RecordStatus`

## Database Models Design (Prisma Reference)

### Category Model
Representing hierarchical categories of products:
```prisma
model Category {
  id             String       @id @default(uuid())
  organizationId String       @map("organization_id")
  parentId       String?      @map("parent_id")
  name           String
  slug           String
  description    String?
  status         RecordStatus @default(ACTIVE)
  deletedAt      DateTime?    @map("deleted_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  organization   Organization @relation(fields: [organizationId], references: [id])
  parent         Category?    @relation("CategoryTree", fields: [parentId], references: [id])
  children       Category[]   @relation("CategoryTree")
  products       Product[]    // Many-to-many relation with Product

  @@unique([organizationId, slug], map: "uk_category_org_slug")
  @@index([organizationId])
  @@index([parentId])
  @@map("categories")
}
```

### Product Model
Representing products sold across stores and marketplaces:
```prisma
model Product {
  id             String        @id @default(uuid())
  organizationId String        @map("organization_id")
  code           String        @map("code") // Internal SKU code
  name           String
  slug           String
  description    String?
  price          Decimal       @db.Decimal(12, 2) @default(0)
  compareAtPrice Decimal?      @map("compare_at_price") @db.Decimal(12, 2)
  status         ProductStatus @default(DRAFT)
  deletedAt      DateTime?     @map("deleted_at")
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  organization   Organization  @relation(fields: [organizationId], references: [id])
  categories     Category[]    // Many-to-many relation with Category
  media          ProductMedia[]

  @@unique([organizationId, code], map: "uk_product_org_code")
  @@unique([organizationId, slug], map: "uk_product_org_slug")
  @@index([organizationId])
  @@map("products")
}
```

### ProductMedia Model
Images and videos showcasing products:
```prisma
model ProductMedia {
  id        String    @id @default(uuid())
  productId String    @map("product_id")
  url       String
  type      MediaType @default(IMAGE)
  position  Int       @default(0) // Ordering for frontend display
  createdAt DateTime  @default(now()) @map("created_at")

  product   Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@map("product_media")
}
```

## Local Workflow

```sh
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

When `schema.prisma` changes, create the matching migration before depending on the new models from API or seed code.
