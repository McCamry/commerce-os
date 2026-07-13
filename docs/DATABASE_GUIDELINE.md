# Database Guideline

This document defines the strict Prisma and PostgreSQL guidelines for Commerce OS.

## 1. Naming Conventions

### 1.1 Tables
- **Case**: `snake_case`, plural.
- **Prisma mapping**: Use `@@map("table_names")` at the end of the model.

### 1.2 Columns
- **Case in DB**: `snake_case`.
- **Case in Prisma**: `camelCase` with `@map("snake_case_name")`.
- **Primary Key**: `id` mapped as `String @id @default(uuid())`.
- **Foreign Key**: `organizationId`, `storeId`, `productId` mapped as `organization_id`, etc.

### 1.3 Constraints and Indexes
Always name constraints and indexes explicitly:
- **Primary Key**: `pk_table_name` (Prisma handles implicitly if just `@id`, but explicit mappings are preferred for composite).
- **Foreign Key**: Handled by Prisma relations.
- **Unique Constraint**: `uk_table_column` (e.g., `@@unique([code], map: "uk_product_code")`)
- **Index**: `idx_table_column` (e.g., `@@index([status], map: "idx_product_status")`)

## 2. Standard Columns

Every model must have the following columns unless explicitly exempt:
```prisma
status    RecordStatus @default(ACTIVE)
deletedAt DateTime?    @map("deleted_at")
createdAt DateTime     @default(now()) @map("created_at")
updatedAt DateTime     @updatedAt @map("updated_at")
```

## 3. Data Types
- **UUID**: All primary keys must be `UUID v4`.
- **Money/Currency**: Never use `Float`. Always use `Decimal` (e.g., `Decimal(18,4)`).
- **Timezone**: All `DateTime` fields are stored in `UTC`. The presentation layer will format this to `Asia/Bangkok` or the local timezone.

## 4. Soft Delete
Do not permanently delete records. 
- Use the `deletedAt` field to mark a record as deleted.
- Update `status` to `INACTIVE` or `ARCHIVED` if applicable.
