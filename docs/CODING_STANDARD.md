# Coding Standard

To ensure consistency across Commerce OS, all code must follow these naming and structuring conventions.

## 1. Naming Conventions

### 1.1 Folders & Directories
- **Case**: `kebab-case`
- **Examples**: `user-service`, `inventory-module`, `purchase-order`

### 1.2 Files
- **Case**: `kebab-case.ts`
- **Examples**: `create-user.dto.ts`, `inventory.service.ts`

### 1.3 Classes
- **Case**: `PascalCase`
- **Examples**: `UserService`, `ProductController`, `StockAdjustmentService`

### 1.4 Variables & Methods
- **Case**: `camelCase`
- **Examples**: `productName`, `stockQty`, `findLevels()`

### 1.5 Constants
- **Case**: `UPPER_SNAKE_CASE`
- **Examples**: `JWT_SECRET`, `DEFAULT_PAGE_SIZE`

## 2. Formatting & Linting
- Always run `pnpm format` before committing.
- Ensure `pnpm lint` passes without warnings or errors.
- Prettier is used for formatting (`.prettierrc`).
- ESLint is used for static analysis (`.eslintrc.js`).
