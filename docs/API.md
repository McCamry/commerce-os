# CommerceOS API Reference

## Categories API

Manage hierarchical categories for organization products.

### 1. List Categories
*   **Method**: `GET`
*   **Path**: `/categories`
*   **Query Parameters**:
    *   `organizationId` (Required, string/UUID): Filter by organization
    *   `parentId` (Optional, string/UUID or `"null"`): Filter by immediate parent. Use `"null"` for top-level categories.
    *   `status` (Optional, `RecordStatus`): Filter by status (`ACTIVE` or `INACTIVE`)
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": "c1a63cde-f1c5-4a58-86d1-002d0cf19230",
        "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
        "parentId": null,
        "name": "Electronics",
        "slug": "electronics",
        "description": "Electronic devices and accessories",
        "status": "ACTIVE",
        "createdAt": "2026-07-08T13:00:00.000Z",
        "updatedAt": "2026-07-08T13:00:00.000Z",
        "children": []
      }
    ]
    ```

### 2. Get Category Detail
*   **Method**: `GET`
*   **Path**: `/categories/:id`
*   **Response (200 OK)**:
    ```json
    {
      "id": "c1a63cde-f1c5-4a58-86d1-002d0cf19230",
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "parentId": null,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and accessories",
      "status": "ACTIVE",
      "createdAt": "2026-07-08T13:00:00.000Z",
      "updatedAt": "2026-07-08T13:00:00.000Z",
      "parent": null,
      "children": []
    }
    ```
*   **Error Responses**:
    *   `404 Not Found`: Category not found.

### 3. Create Category
*   **Method**: `POST`
*   **Path**: `/categories`
*   **Body**:
    ```json
    {
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "parentId": null,
      "name": "Laptops",
      "slug": "laptops",
      "description": "Notebooks and portable computers"
    }
    ```
*   **Response (201 Created)**: Returns the newly created category object.
*   **Error Responses**:
    *   `400 Bad Request`: Validation errors (e.g. missing required fields).
    *   `409 Conflict`: Slug already exists under this organization.

### 4. Update Category
*   **Method**: `PATCH`
*   **Path**: `/categories/:id`
*   **Body**:
    ```json
    {
      "name": "Premium Laptops",
      "description": "High-end portable computers",
      "status": "ACTIVE"
    }
    ```
*   **Response (200 OK)**: Returns the updated category object.
*   **Error Responses**:
    *   `404 Not Found`: Category not found.
    *   `409 Conflict`: Slug already conflicts with another category under the organization.

### 5. Delete Category (Soft Delete)
*   **Method**: `DELETE`
*   **Path**: `/categories/:id`
*   **Response (200 OK)**:
    ```json
    {
      "id": "c1a63cde-f1c5-4a58-86d1-002d0cf19230",
      "status": "INACTIVE",
      "deletedAt": "2026-07-08T14:00:00.000Z"
    }
    ```
*   **Error Responses**:
    *   `404 Not Found`: Category not found.

---

## Products API

Manage product catalog details, pricing, and associations.

### 1. List Products
*   **Method**: `GET`
*   **Path**: `/products`
*   **Query Parameters**:
    *   `organizationId` (Required, string/UUID): Filter by organization
    *   `categoryId` (Optional, string/UUID): Filter by category
    *   `status` (Optional, `ProductStatus`): Filter by status (`DRAFT`, `ACTIVE`, `ARCHIVED`)
    *   `search` (Optional, string): Search term matching name or code (SKU)
    *   `page` (Optional, integer, default `1`): Pagination page
    *   `limit` (Optional, integer, default `20`): Pagination limit
*   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": "a3b8cd2e-067f-44e2-895c-9c3f0b2f48ef",
          "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
          "code": "PROD-LAP-001",
          "name": "ThinkPad X1 Carbon",
          "slug": "thinkpad-x1-carbon",
          "description": "Lenovo premium business laptop",
          "price": "59900.00",
          "compareAtPrice": "65900.00",
          "status": "ACTIVE",
          "createdAt": "2026-07-08T13:00:00.000Z",
          "updatedAt": "2026-07-08T13:00:00.000Z",
          "categories": [
            {
              "id": "c1a63cde-f1c5-4a58-86d1-002d0cf19230",
              "name": "Laptops"
            }
          ]
        }
      ],
      "meta": {
        "total": 1,
        "page": 1,
        "limit": 20,
        "totalPages": 1
      }
    }
    ```

### 2. Get Product Detail
*   **Method**: `GET`
*   **Path**: `/products/:id`
*   **Response (200 OK)**:
    ```json
    {
      "id": "a3b8cd2e-067f-44e2-895c-9c3f0b2f48ef",
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "code": "PROD-LAP-001",
      "name": "ThinkPad X1 Carbon",
      "slug": "thinkpad-x1-carbon",
      "description": "Lenovo premium business laptop",
      "price": "59900.00",
      "compareAtPrice": "65900.00",
      "status": "ACTIVE",
      "createdAt": "2026-07-08T13:00:00.000Z",
      "updatedAt": "2026-07-08T13:00:00.000Z",
      "categories": [
        {
          "id": "c1a63cde-f1c5-4a58-86d1-002d0cf19230",
          "name": "Laptops",
          "slug": "laptops"
        }
      ],
      "media": [
        {
          "id": "d5f67g8h-1234-5678-abcd-1234567890ab",
          "url": "https://example.com/image1.jpg",
          "type": "IMAGE",
          "position": 0
        }
      ]
    }
    ```
*   **Error Responses**:
    *   `404 Not Found`: Product not found.

### 3. Create Product
*   **Method**: `POST`
*   **Path**: `/products`
*   **Body**:
    ```json
    {
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "code": "PROD-LAP-001",
      "name": "ThinkPad X1 Carbon",
      "slug": "thinkpad-x1-carbon",
      "description": "Lenovo premium business laptop",
      "price": 59900.00,
      "compareAtPrice": 65900.00,
      "status": "ACTIVE",
      "categoryIds": [
        "c1a63cde-f1c5-4a58-86d1-002d0cf19230"
      ],
      "media": [
        {
          "url": "https://example.com/image1.jpg",
          "type": "IMAGE",
          "position": 0
        }
      ]
    }
    ```
*   **Response (201 Created)**: Returns the newly created product object including its category relations and media list.
*   **Error Responses**:
    *   `400 Bad Request`: Validation errors (e.g. invalid price, missing required fields).
    *   `409 Conflict`: Product code (SKU) or slug already exists under this organization.

### 4. Update Product
*   **Method**: `PATCH`
*   **Path**: `/products/:id`
*   **Body**:
    ```json
    {
      "name": "ThinkPad X1 Carbon Gen 12",
      "price": 62900.00,
      "categoryIds": [
        "c1a63cde-f1c5-4a58-86d1-002d0cf19230",
        "d8e7c6b5-a1b2-c3d4-e5f6-7a8b9c0d1e2f"
      ],
      "media": [
        {
          "url": "https://example.com/image2.jpg",
          "type": "IMAGE",
          "position": 0
        }
      ]
    }
    ```
*   **Response (200 OK)**: Returns the updated product object with updated category and media details.
*   **Error Responses**:
    *   `404 Not Found`: Product not found.
    *   `409 Conflict`: Code (SKU) or slug conflicts with another product.

### 5. Delete Product (Soft Delete)
*   **Method**: `DELETE`
*   **Path**: `/products/:id`
*   **Response (200 OK)**:
    ```json
    {
      "id": "a3b8cd2e-067f-44e2-895c-9c3f0b2f48ef",
      "status": "ARCHIVED",
      "deletedAt": "2026-07-08T14:00:00.000Z"
    }
    ```
*   **Error Responses**:
    *   `404 Not Found`: Product not found.

---

## Authentication & Authorization API

### Auth Endpoints

#### 1. Login User
*   **Method**: `POST`
*   **Path**: `/auth/login`
*   **Body**:
    ```json
    {
      "username": "admin",
      "password": "password123",
      "organizationCode": "DEMO"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "7c489c9e-5d1e-4cb8-86c2-005d0cf19230",
      "user": {
        "id": "u1a63cde-f1c5-4a58-86d1-002d0cf19230",
        "username": "admin",
        "displayName": "Administrator"
      }
    }
    ```

#### 2. Refresh Token
*   **Method**: `POST`
*   **Path**: `/auth/refresh`
*   **Body**:
    ```json
    {
      "refreshToken": "7c489c9e-5d1e-4cb8-86c2-005d0cf19230"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "new-refresh-token-uuid..."
    }
    ```

#### 3. Logout User
*   **Method**: `POST`
*   **Path**: `/auth/logout`
*   **Body**:
    ```json
    {
      "refreshToken": "7c489c9e-5d1e-4cb8-86c2-005d0cf19230"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true
    }
    ```

#### 4. Get Current Profile
*   **Method**: `GET`
*   **Path**: `/auth/me`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Response (200 OK)**:
    ```json
    {
      "id": "u1a63cde-f1c5-4a58-86d1-002d0cf19230",
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "defaultStoreId": "s1a63cde-f1c5-4a58-86d1-002d0cf19230",
      "username": "admin",
      "email": "admin@example.com",
      "displayName": "Administrator",
      "roles": ["Admin"],
      "permissions": ["product.read", "product.create", "product.update", "product.delete", "user.manage"],
      "accessibleStores": [
        {
          "storeId": "s1a63cde-f1c5-4a58-86d1-002d0cf19230",
          "name": "Demo Main Store",
          "isDefault": true
        }
      ]
    }
    ```

---

### User Management Endpoints (`/users`)

#### 1. List Users
*   **Method**: `GET`
*   **Path**: `/users`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Query Parameters**:
    *   `organizationId` (Required): Filter by organization.
*   **Response (200 OK)**: List of user objects (excluding password hashes) with their assigned roles and stores.

#### 2. Create User
*   **Method**: `POST`
*   **Path**: `/users`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Body**:
    ```json
    {
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "username": "staff1",
      "email": "staff1@example.com",
      "password": "password123",
      "displayName": "Staff Member",
      "roleIds": ["role-uuid-1"],
      "storeIds": ["store-uuid-1"],
      "defaultStoreId": "store-uuid-1"
    }
    ```
*   **Response (201 Created)**: Returns the created user object.

#### 3. Update User
*   **Method**: `PATCH`
*   **Path**: `/users/:id`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Body**: Fields to update, including `roleIds` or `storeIds`.
*   **Response (200 OK)**: Returns the updated user.

#### 4. Delete User (Soft Delete)
*   **Method**: `DELETE`
*   **Path**: `/users/:id`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Response (200 OK)**: Soft deleted status.

---

### Role & Permission Management Endpoints

#### 1. List Permissions (Global)
*   **Method**: `GET`
*   **Path**: `/permissions`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Response (200 OK)**: Array of global permissions grouped by module.

#### 2. List Roles
*   **Method**: `GET`
*   **Path**: `/roles`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Query Parameters**:
    *   `organizationId` (Required): Filter by organization.
*   **Response (200 OK)**: Array of roles with their nested permission links.

#### 3. Create Role
*   **Method**: `POST`
*   **Path**: `/roles`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Body**:
    ```json
    {
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "code": "CASHIER",
      "name": "Cashier Storefront",
      "description": "Cashier storefront operators",
      "permissionIds": ["perm-uuid-1", "perm-uuid-2"]
    }
    ```
*   **Response (201 Created)**: Created role object.

#### 4. Assign Permissions to Role
*   **Method**: `PATCH`
*   **Path**: `/roles/:id/permissions`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Body**:
    ```json
    {
      "permissionIds": ["perm-uuid-1", "perm-uuid-2", "perm-uuid-3"]
    }
    ```
*   **Response (200 OK)**: Updated role with list of assigned permissions.

---

## Customers API

Manage customer master data (AR counterparties). Customers are organization-scoped and soft-deleted.

### 1. List Customers
*   **Method**: `GET`
*   **Path**: `/customers`
*   **Query Parameters**:
    *   `organizationId` (Required, string/UUID): Filter by organization.
    *   `customerGroupId` (Optional, string/UUID): Filter by customer group.
    *   `status` (Optional, `RecordStatus`): Filter by status (`ACTIVE` or `INACTIVE`).
*   **Response (200 OK)**: Array of customers (each including its `customerGroup`), ordered by name.
*   **Error Responses**:
    *   `400 Bad Request`: `organizationId` query parameter is missing.

### 2. Get Customer Detail
*   **Method**: `GET`
*   **Path**: `/customers/:id`
*   **Response (200 OK)**: Customer object including `customerGroup`, `addresses`, and `contacts`.
*   **Error Responses**:
    *   `404 Not Found`: Customer not found.

### 3. Create Customer
*   **Method**: `POST`
*   **Path**: `/customers`
*   **Body**:
    ```json
    {
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "customerGroupId": "grp-uuid-1",
      "code": "CUST-001",
      "name": "ACME Co., Ltd.",
      "taxId": "0105551234567",
      "branch": "HQ",
      "contactPerson": "Somchai",
      "phone1": "021234567",
      "email": "ap@acme.co.th",
      "creditDays": 30,
      "creditLimit": 500000
    }
    ```
*   **Notes**: `creditDays` defaults to `0` and `status` defaults to `ACTIVE` when omitted.
*   **Response (201 Created)**: Returns the newly created customer.
*   **Error Responses**:
    *   `409 Conflict`: Customer code already exists under this organization.
    *   `404 Not Found`: Related organization or customer group not found.

### 4. Update Customer
*   **Method**: `PATCH`
*   **Path**: `/customers/:id`
*   **Body**: Any subset of the create fields.
*   **Response (200 OK)**: Returns the updated customer.
*   **Error Responses**:
    *   `404 Not Found`: Customer not found.
    *   `409 Conflict`: Code conflicts with another customer under the organization.

### 5. Delete Customer (Soft Delete)
*   **Method**: `DELETE`
*   **Path**: `/customers/:id`
*   **Response (200 OK)**: Customer with `status: "INACTIVE"` and `deletedAt` set.
*   **Error Responses**:
    *   `404 Not Found`: Customer not found.

---

## Vendors API

Manage vendor/supplier master data (AP counterparties). Organization-scoped and soft-deleted.

### 1. List Vendors
*   **Method**: `GET`
*   **Path**: `/vendors`
*   **Query Parameters**:
    *   `organizationId` (Required, string/UUID): Filter by organization.
    *   `status` (Optional, `RecordStatus`): Filter by status (`ACTIVE` or `INACTIVE`).
*   **Response (200 OK)**: Array of vendors, ordered by name.
*   **Error Responses**:
    *   `400 Bad Request`: `organizationId` query parameter is missing.

### 2. Get Vendor Detail
*   **Method**: `GET`
*   **Path**: `/vendors/:id`
*   **Response (200 OK)**: Vendor object including `addresses`, `contacts`, and `priceLists`.
*   **Error Responses**:
    *   `404 Not Found`: Vendor not found.

### 3. Create Vendor
*   **Method**: `POST`
*   **Path**: `/vendors`
*   **Body**:
    ```json
    {
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "code": "VEND-001",
      "name": "Global Supply Co.",
      "taxId": "0105559876543",
      "contactPerson": "Nadia",
      "phone1": "027654321",
      "email": "sales@globalsupply.com",
      "website": "https://globalsupply.com",
      "creditDays": 45,
      "creditLimit": 1000000,
      "paymentTerm": "NET45"
    }
    ```
*   **Notes**: `creditDays` defaults to `0` and `status` defaults to `ACTIVE` when omitted.
*   **Response (201 Created)**: Returns the newly created vendor.
*   **Error Responses**:
    *   `409 Conflict`: Vendor code already exists under this organization.
    *   `404 Not Found`: Related organization not found.

### 4. Update Vendor
*   **Method**: `PATCH`
*   **Path**: `/vendors/:id`
*   **Body**: Any subset of the create fields.
*   **Response (200 OK)**: Returns the updated vendor.
*   **Error Responses**:
    *   `404 Not Found`: Vendor not found.
    *   `409 Conflict`: Code conflicts with another vendor under the organization.

### 5. Delete Vendor (Soft Delete)
*   **Method**: `DELETE`
*   **Path**: `/vendors/:id`
*   **Response (200 OK)**: Vendor with `status: "INACTIVE"` and `deletedAt` set.
*   **Error Responses**:
    *   `404 Not Found`: Vendor not found.

---

## Quotations API

Manage sales quotations with line items. Header and line totals are computed by the server.

**Total calculation** — per line: `gross = quantity × unitPrice`, `net = gross − discount`, `lineTax = net × taxRate%`, and `lineTotal = net` (ex-tax). Header roll-up: `subtotal = Σ gross`, `discount = Σ line discount`, `vat = Σ lineTax`, `grandTotal = subtotal − discount + vat`.

### 1. List Quotations
*   **Method**: `GET`
*   **Path**: `/quotations`
*   **Query Parameters**:
    *   `organizationId` (Required, string/UUID): Filter by organization.
    *   `storeId` (Optional, string/UUID): Filter by store.
    *   `customerId` (Optional, string/UUID): Filter by customer.
    *   `status` (Optional, string): Workflow status (`DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`).
*   **Response (200 OK)**: Array of quotations (each including `customer` and `store`), ordered by `quotationDate` descending.
*   **Error Responses**:
    *   `400 Bad Request`: `organizationId` query parameter is missing.

### 2. Get Quotation Detail
*   **Method**: `GET`
*   **Path**: `/quotations/:id`
*   **Response (200 OK)**: Quotation object including `customer`, `store`, and `items` (each with `variant` and `unit`).
*   **Error Responses**:
    *   `404 Not Found`: Quotation not found.

### 3. Create Quotation
*   **Method**: `POST`
*   **Path**: `/quotations`
*   **Body**:
    ```json
    {
      "organizationId": "504c5520-22c6-4e50-9d35-f09c62985ce4",
      "storeId": "s1a63cde-f1c5-4a58-86d1-002d0cf19230",
      "customerId": "cust-uuid-1",
      "quotationNo": "QT-2026-0001",
      "quotationDate": "2026-07-10",
      "expireDate": "2026-07-31",
      "remark": "Net 30 terms",
      "items": [
        { "variantId": "var-uuid-1", "unitId": "unit-uuid-1", "quantity": 2, "unitPrice": 100, "taxRate": 7 },
        { "variantId": "var-uuid-2", "unitId": "unit-uuid-1", "quantity": 1, "unitPrice": 50, "discount": 5 }
      ]
    }
    ```
*   **Notes**: `status` defaults to `DRAFT`. `subtotal`, `discount`, `vat`, `grandTotal`, and each line's `lineTotal` are computed server-side.
*   **Response (201 Created)**: Returns the created quotation with computed totals and items.
*   **Error Responses**:
    *   `400 Bad Request`: No items supplied.
    *   `409 Conflict`: Quotation number already exists under this organization.
    *   `404 Not Found`: Related organization, store, customer, variant, or unit not found.

### 4. Update Quotation
*   **Method**: `PATCH`
*   **Path**: `/quotations/:id`
*   **Body**: Header fields (`quotationDate`, `expireDate`, `remark`, `status`) and/or `items`. When `items` is supplied, the existing lines are fully replaced and all totals recomputed in a single transaction.
*   **Response (200 OK)**: Returns the updated quotation.
*   **Error Responses**:
    *   `400 Bad Request`: `items` supplied but empty.
    *   `404 Not Found`: Quotation not found.

### 5. Delete Quotation (Soft Delete)
*   **Method**: `DELETE`
*   **Path**: `/quotations/:id`
*   **Response (200 OK)**: Quotation with `deletedAt` set (workflow `status` is preserved).
*   **Error Responses**:
    *   `404 Not Found`: Quotation not found.

---

## Price Books API

Manage customer/group pricing lists with line items. Organization-scoped, soft-deleted.

*   `GET /price-books` — Query: `organizationId` (**required**), `customerGroupId`, `status`. Returns price books (with `customerGroup`) ordered by name.
*   `GET /price-books/:id` — Returns the price book with `customerGroup` and `items` (each with `variant`). `404` if not found.
*   `POST /price-books` — Body: `organizationId`, `code`, `name`, optional `customerGroupId`, `description`, `currency` (default `THB`), `effectiveDate`, `expiryDate`, `items[]` (`variantId`, `price`, optional `minQuantity` default `1`). `status` defaults to `ACTIVE`. `409` on duplicate code.
*   `PATCH /price-books/:id` — Any subset of the create fields. When `items` is supplied, existing items are fully replaced in a transaction.
*   `DELETE /price-books/:id` — Soft delete (`status: INACTIVE` + `deletedAt`).

---

## Purchase Requests API

Internal purchase requisitions with line items. Organization + store scoped, soft-deleted via `deletedAt`.

*   `GET /purchase-requests` — Query: `organizationId` (**required**), `storeId`, `status`. Returns requests (with `store`) ordered by request date descending.
*   `GET /purchase-requests/:id` — Returns the request with `store` and `items` (each with `variant`, `unit`). `404` if not found.
*   `POST /purchase-requests` — Body: `organizationId`, `storeId`, `requestNo`, `requestBy`, optional `requestDate`, `status` (default `DRAFT`), `remark`, and `items[]` (`variantId`, `unitId`, `quantity`, optional `remark`). `400` if no items; `409` on duplicate request number.
*   `PATCH /purchase-requests/:id` — Header fields and/or `items` (full replacement in a transaction).
*   `DELETE /purchase-requests/:id` — Soft delete (`deletedAt`).

---

## Purchase Invoices API

Vendor invoices (AP) with line items. Scoped by vendor; soft-deleted via `deletedAt`.

**Totals** — per line `lineTotal = quantity × unitPrice`; header `subtotal = Σ lineTotal`, `grandTotal = subtotal + vat`.

*   `GET /purchase-invoices` — Query (all optional): `vendorId`, `purchaseOrderId`, `status`. Returns invoices (with `vendor`) ordered by invoice date descending.
*   `GET /purchase-invoices/:id` — Returns the invoice with `vendor`, `purchaseOrder`, `items`, `payments`. `404` if not found.
*   `POST /purchase-invoices` — Body: `vendorId`, `invoiceNo`, `invoiceDate`, optional `purchaseOrderId`, `dueDate`, `vat`, and `items[]` (`variantId`, `unitId`, `quantity`, `unitPrice`, optional `description`). `subtotal`/`grandTotal`/line totals computed server-side. `400` if no items; `409` on duplicate invoice number per vendor.
*   `PATCH /purchase-invoices/:id` — Header fields and/or `items`. Supplying `items` recomputes totals in a transaction; supplying only `vat` recomputes `grandTotal`.
*   `DELETE /purchase-invoices/:id` — Soft delete (`deletedAt`).

---

## Purchase Returns API

Vendor returns with line items. Scoped by vendor; soft-deleted via `deletedAt`.

*   `GET /purchase-returns` — Query (all optional): `vendorId`, `status`. Returns returns (with `vendor`) ordered by return date descending.
*   `GET /purchase-returns/:id` — Returns the return with `vendor` and `items` (each with `variant`, `unit`). `404` if not found.
*   `POST /purchase-returns` — Body: `vendorId`, `returnNo`, optional `returnDate`, `reason`, `status` (default `DRAFT`), and `items[]` (`variantId`, `unitId`, `quantity`, optional `reason`). `400` if no items; `409` on duplicate return number per vendor.
*   `PATCH /purchase-returns/:id` — Header fields and/or `items` (full replacement in a transaction).
*   `DELETE /purchase-returns/:id` — Soft delete (`deletedAt`).

---

## Sales Invoices API

Customer invoices (AR) with line items. Scoped by sales order; soft-deleted via `deletedAt`.

**Totals** — per line `lineTotal = quantity × unitPrice`; header `subtotal = Σ lineTotal`, `grandTotal = subtotal + vat`.

*   `GET /sales-invoices` — Query (all optional): `salesOrderId`, `status`. Returns invoices (with `salesOrder`) ordered by invoice date descending.
*   `GET /sales-invoices/:id` — Returns the invoice with `salesOrder`, `items`, `receipts`. `404` if not found.
*   `POST /sales-invoices` — Body: `salesOrderId`, `invoiceNo`, optional `invoiceDate`, `vat`, and `items[]` (`variantId`, `unitId`, `quantity`, `unitPrice`). Totals computed server-side. `400` if no items; `409` on duplicate invoice number.
*   `PATCH /sales-invoices/:id` — Header fields and/or `items`. Supplying `items` recomputes totals in a transaction; supplying only `vat` recomputes `grandTotal`.
*   `DELETE /sales-invoices/:id` — Soft delete (`deletedAt`).

---

## Sales Returns API

Customer returns with line items. Scoped by sales order; soft-deleted via `deletedAt`.

*   `GET /sales-returns` — Query (all optional): `salesOrderId`, `status`. Returns returns (with `salesOrder`) ordered by return date descending.
*   `GET /sales-returns/:id` — Returns the return with `salesOrder` and `items` (each with `variant`, `unit`). `404` if not found.
*   `POST /sales-returns` — Body: `salesOrderId`, `returnNo`, optional `returnDate`, `reason`, `status` (default `COMPLETED`), and `items[]` (`variantId`, `unitId`, `quantity`, optional `reason`). `400` if no items; `409` on duplicate return number.
*   `PATCH /sales-returns/:id` — Header fields and/or `items` (full replacement in a transaction).
*   `DELETE /sales-returns/:id` — Soft delete (`deletedAt`).

---

## Receipts API

Payment receipts against sales invoices (no line items). Scoped by sales invoice; soft-deleted via `deletedAt`.

*   `GET /receipts` — Query (all optional): `salesInvoiceId`, `status`. Returns receipts (with `salesInvoice`) ordered by payment date descending.
*   `GET /receipts/:id` — Returns the receipt with `salesInvoice`. `404` if not found.
*   `POST /receipts` — Body: `salesInvoiceId`, `receiptNo`, `paymentMethod`, `amount`, optional `paymentDate`, `reference`, `status` (default `COMPLETED`). `409` on duplicate receipt number.
*   `PATCH /receipts/:id` — Any subset of the create fields.
*   `DELETE /receipts/:id` — Soft delete (`deletedAt`).