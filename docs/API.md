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