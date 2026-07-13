# API Guideline

This document defines the strict structure and behavior for all REST APIs in Commerce OS.

## 1. Response Standards

All API responses must be intercepted and wrapped in a standard JSON format. 

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Product A"
  },
  "meta": {}
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name is required",
    "details": ["name must be a string"]
  }
}
```

## 2. Pagination & Filtering

All list endpoints (e.g., `GET /products`) must support standardized pagination and filtering.

### Standard Query Parameters
- `page` (default: 1)
- `limit` (default: 20)
- `sort` (field name)
- `order` (asc / desc)
- `search` / `keyword` (for text search)
- `status`, `organization`, `store`

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "pages": 13
  }
}
```

## 3. Response Codes

Standard error codes mapped from HTTP status codes:
- `400 BAD_REQUEST` -> `VALIDATION_ERROR`
- `401 UNAUTHORIZED` -> `UNAUTHORIZED`
- `403 FORBIDDEN` -> `FORBIDDEN`
- `404 NOT_FOUND` -> `NOT_FOUND`
- `409 CONFLICT` -> `CONFLICT`
- `500 INTERNAL_SERVER_ERROR` -> `INTERNAL_ERROR`

## 4. Swagger / OpenAPI

All controllers and DTOs must be decorated with NestJS Swagger annotations:
- `@ApiTags('Module Name')`
- `@ApiOperation({ summary: '...' })`
- `@ApiResponse({ status: 200, description: '...', type: ResponseDto })`
- Properties must use `@ApiProperty()` in DTOs.
