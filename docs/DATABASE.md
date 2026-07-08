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

### Security & RBAC Models

#### User Model
```prisma
model User {
  id             String          @id @default(uuid())
  organizationId String          @map("organization_id")
  defaultStoreId String?         @map("default_store_id")
  username       String
  email          String
  phone          String?
  passwordHash   String          @map("password_hash")
  firstName      String?         @map("first_name")
  lastName       String?         @map("last_name")
  displayName    String?         @map("display_name")
  avatar         String?
  lastLoginAt    DateTime?       @map("last_login_at")
  status         RecordStatus    @default(ACTIVE)
  deletedAt      DateTime?       @map("deleted_at")
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  organization   Organization    @relation(fields: [organizationId], references: [id])
  defaultStore   Store?          @relation("DefaultStore", fields: [defaultStoreId], references: [id])
  userRoles      UserRole[]
  userStores     UserStore[]
  refreshTokens  RefreshToken[]
  sessions       UserSession[]
  loginHistories LoginHistory[]
  auditLogs      AuditLog[]

  @@unique([organizationId, username], map: "uk_user_org_username")
  @@unique([organizationId, email], map: "uk_user_org_email")
  @@index([organizationId])
  @@map("users")
}
```

#### Role Model
```prisma
model Role {
  id             String           @id @default(uuid())
  organizationId String           @map("organization_id")
  code           String
  name           String
  description    String?
  isSystem       Boolean          @default(false) @map("is_system")
  status         RecordStatus     @default(ACTIVE)
  deletedAt      DateTime?        @map("deleted_at")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")

  organization   Organization     @relation(fields: [organizationId], references: [id])
  userRoles      UserRole[]
  rolePermissions RolePermission[]

  @@unique([organizationId, code], map: "uk_role_org_code")
  @@index([organizationId])
  @@map("roles")
}
```

#### Permission Model
```prisma
model Permission {
  id              String           @id @default(uuid())
  code            String           @unique
  module          String
  name            String
  description     String?
  rolePermissions RolePermission[]

  @@map("permissions")
}
```

#### UserRole Model (Many-to-Many Join User & Role)
```prisma
model UserRole {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  roleId    String   @map("role_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId], map: "uk_user_role_user_role")
  @@map("user_roles")
}
```

#### RolePermission Model (Many-to-Many Join Role & Permission)
```prisma
model RolePermission {
  id           String     @id @default(uuid())
  roleId       String     @map("role_id")
  permissionId String     @map("permission_id")
  createdAt    DateTime   @default(now()) @map("created_at")

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId], map: "uk_role_permission_role_perm")
  @@map("role_permissions")
}
```

#### UserStore Model (Many-to-Many Join User & Store)
```prisma
model UserStore {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  storeId   String   @map("store_id")
  isDefault Boolean  @default(false) @map("is_default")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([userId, storeId], map: "uk_user_store_user_store")
  @@map("user_stores")
}
```

#### RefreshToken Model
```prisma
model RefreshToken {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  token     String    @unique
  expiredAt DateTime  @map("expired_at")
  revokedAt DateTime? @map("revoked_at")
  ip        String?
  userAgent String?   @map("user_agent")
  createdAt DateTime  @default(now()) @map("created_at")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}
```

#### UserSession Model
```prisma
model UserSession {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  token        String   @unique
  ip           String?
  userAgent    String?  @map("user_agent")
  device       String?
  browser      String?
  lastActiveAt DateTime @default(now()) @map("last_active_at")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_sessions")
}
```

#### LoginHistory Model
```prisma
model LoginHistory {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  ip        String?
  browser   String?
  device    String?
  success   Boolean
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("login_histories")
}
```

#### AuditLog Model
```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  action    String
  module    String
  recordId  String   @map("record_id")
  oldValue  Json?    @map("old_value")
  newValue  Json?    @map("new_value")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@map("audit_logs")
}
```

## Local Workflow

```sh
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

When `schema.prisma` changes, create the matching migration before depending on the new models from API or seed code.
