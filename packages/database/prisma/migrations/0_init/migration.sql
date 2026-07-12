-- CreateEnum
CREATE TYPE "MarketplaceType" AS ENUM ('SHOPEE', 'LAZADA', 'TIKTOK', 'WEBSITE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LedgerBookType" AS ENUM ('FINANCIAL', 'TAX', 'MANAGEMENT', 'IFRS');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "phone_code" TEXT,
    "currency_code" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "country_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subdistricts" (
    "id" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subdistricts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tax_id" TEXT,
    "contact_person" TEXT,
    "phone_1" TEXT,
    "phone_2" TEXT,
    "email" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "remark" TEXT,
    "country_id" TEXT NOT NULL,
    "province_id" TEXT,
    "district_id" TEXT,
    "subdistrict_id" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tax_id" TEXT,
    "contact_person" TEXT,
    "phone_1" TEXT,
    "phone_2" TEXT,
    "email" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "remark" TEXT,
    "country_id" TEXT NOT NULL,
    "province_id" TEXT,
    "district_id" TEXT,
    "subdistrict_id" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Bangkok',
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxes" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "unit_id" TEXT NOT NULL,
    "tax_id" TEXT,
    "code" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_serialized" BOOLEAN NOT NULL DEFAULT false,
    "allow_backorder" BOOLEAN NOT NULL DEFAULT false,
    "weight" DECIMAL(10,4),
    "width" DECIMAL(10,4),
    "height" DECIMAL(10,4),
    "length" DECIMAL(10,4),
    "slug" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_keyword" TEXT,
    "meta_description" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "inventoryPolicyId" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DECIMAL(10,4),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_barcodes" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_barcodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_prices" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "price_type" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "price" DECIMAL(12,2) NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "alt_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_values" (
    "id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_attribute_values" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "attribute_value_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variant_attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_marketplaces" (
    "id" TEXT NOT NULL,
    "product_id" TEXT,
    "variant_id" TEXT,
    "marketplace" "MarketplaceType" NOT NULL,
    "external_product_id" TEXT NOT NULL,
    "external_variant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_marketplaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "default_store_id" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "display_name" TEXT,
    "avatar" TEXT,
    "last_login_at" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "success" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustments" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustment_items" (
    "id" TEXT NOT NULL,
    "adjustment_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "warehouse_location_id" TEXT NOT NULL,
    "lot_id" TEXT,
    "serial_id" TEXT,
    "before_qty" INTEGER NOT NULL,
    "after_qty" INTEGER NOT NULL,
    "difference" INTEGER NOT NULL,
    "reason" TEXT,

    CONSTRAINT "stock_adjustment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfers" (
    "id" TEXT NOT NULL,
    "from_warehouse_id" TEXT NOT NULL,
    "to_warehouse_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "transfer_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfer_items" (
    "id" TEXT NOT NULL,
    "transfer_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "from_location_id" TEXT NOT NULL,
    "to_location_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "stock_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_snapshots" (
    "id" TEXT NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "inventory_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "branch" TEXT,
    "contact_person" TEXT,
    "phone_1" TEXT,
    "phone_2" TEXT,
    "email" TEXT,
    "website" TEXT,
    "credit_days" INTEGER NOT NULL DEFAULT 0,
    "credit_limit" DECIMAL(18,4),
    "payment_term" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_addresses" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "country_id" TEXT,
    "province_id" TEXT,
    "district_id" TEXT,
    "subdistrict_id" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_contacts" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_price_lists" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "request_no" TEXT NOT NULL,
    "request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "remark" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_request_items" (
    "id" TEXT NOT NULL,
    "purchase_request_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_id" TEXT NOT NULL,
    "remark" TEXT,

    CONSTRAINT "purchase_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "purchase_request_id" TEXT,
    "purchase_no" TEXT NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_date" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "exchange_rate" DECIMAL(18,4) NOT NULL DEFAULT 1.0,
    "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "discount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vat" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "shipping_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "remark" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "received_qty" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "discount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receives" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "receive_no" TEXT NOT NULL,
    "receive_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "remark" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receive_items" (
    "id" TEXT NOT NULL,
    "goods_receive_id" TEXT NOT NULL,
    "purchase_order_item_id" TEXT,
    "variant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "lot_number" TEXT,
    "serial_number" TEXT,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "goods_receive_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_invoices" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "purchase_order_id" TEXT,
    "invoice_no" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vat" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_invoice_items" (
    "id" TEXT NOT NULL,
    "purchase_invoice_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "purchase_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_payments" (
    "id" TEXT NOT NULL,
    "purchase_invoice_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_returns" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "return_no" TEXT NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_return_items" (
    "id" TEXT NOT NULL,
    "purchase_return_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,

    CONSTRAINT "purchase_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_groups" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "customer_group_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "branch" TEXT,
    "contact_person" TEXT,
    "phone_1" TEXT,
    "phone_2" TEXT,
    "email" TEXT,
    "credit_days" INTEGER NOT NULL DEFAULT 0,
    "credit_limit" DECIMAL(18,4),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "country_id" TEXT,
    "province_id" TEXT,
    "district_id" TEXT,
    "subdistrict_id" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_contacts" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_books" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "customer_group_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_book_items" (
    "id" TEXT NOT NULL,
    "price_book_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "price" DECIMAL(18,4) NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "price_book_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_channels" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "quotation_no" TEXT NOT NULL,
    "quotation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_date" TIMESTAMP(3),
    "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "discount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vat" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "remark" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "discount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "warehouse_id" TEXT,
    "customer_id" TEXT NOT NULL,
    "channel_id" TEXT,
    "quotation_id" TEXT,
    "oms_order_id" TEXT,
    "order_no" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "exchange_rate" DECIMAL(18,4) NOT NULL DEFAULT 1.0,
    "promotion_code" TEXT,
    "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "discount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vat" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "shipping_fee" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "remark" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_items" (
    "id" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reserved_qty" INTEGER NOT NULL DEFAULT 0,
    "shipped_qty" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "discount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "sales_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "shipment_no" TEXT NOT NULL,
    "carrier" TEXT,
    "tracking_no" TEXT,
    "ship_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_items" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "sales_order_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "shipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_invoices" (
    "id" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "vat" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_invoice_items" (
    "id" TEXT NOT NULL,
    "sales_invoice_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "sales_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "sales_invoice_id" TEXT NOT NULL,
    "receipt_no" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(18,4) NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_returns" (
    "id" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "return_no" TEXT NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_return_items" (
    "id" TEXT NOT NULL,
    "sales_return_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,

    CONSTRAINT "sales_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" TEXT NOT NULL,
    "sales_invoice_id" TEXT NOT NULL,
    "credit_no" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplaces" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_version" TEXT,
    "base_url" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "marketplaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_accounts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "marketplace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "marketplace_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_shops" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "country" TEXT,
    "currency" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "marketplace_shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_tokens" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_products" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "marketplace_product_id" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "marketplace_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_variants" (
    "id" TEXT NOT NULL,
    "marketplace_product_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "marketplace_sku" TEXT NOT NULL,
    "marketplace_variant_id" TEXT NOT NULL,

    CONSTRAINT "marketplace_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_inventories" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "inventory_id" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "last_sync" TIMESTAMP(3),

    CONSTRAINT "marketplace_inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_orders" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "sales_order_id" TEXT,
    "marketplace_order_id" TEXT NOT NULL,
    "order_status" TEXT NOT NULL,
    "buyer_name" TEXT,
    "order_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_order_items" (
    "id" TEXT NOT NULL,
    "marketplace_order_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "marketplace_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_shipments" (
    "id" TEXT NOT NULL,
    "marketplace_order_id" TEXT NOT NULL,
    "shipment_id" TEXT,
    "tracking_no" TEXT,
    "carrier" TEXT,
    "sync_status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "marketplace_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_webhooks" (
    "id" TEXT NOT NULL,
    "marketplace_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retry" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_sync_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "message" TEXT,

    CONSTRAINT "marketplace_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_error_logs" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT,
    "api" TEXT NOT NULL,
    "request" JSONB,
    "response" JSONB,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_sources" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "order_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "order_no" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "grand_total" DECIMAL(18,4) NOT NULL,
    "sla_due_date" TIMESTAMP(3),
    "risk_level" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "allocated_qty" INTEGER NOT NULL DEFAULT 0,
    "shipped_qty" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_histories" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "order_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocations" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_items" (
    "id" TEXT NOT NULL,
    "allocation_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "allocation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillments" (
    "id" TEXT NOT NULL,
    "allocation_id" TEXT NOT NULL,
    "picking_wave_id" TEXT,
    "status" TEXT NOT NULL,
    "assigned_to" TEXT,

    CONSTRAINT "fulfillments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fulfillment_items" (
    "id" TEXT NOT NULL,
    "fulfillment_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "fulfillment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picking_waves" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "wave_no" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "zone_id" TEXT,

    CONSTRAINT "picking_waves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_boxes" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "box_no" TEXT NOT NULL,
    "weight" DECIMAL(10,4),
    "width" DECIMAL(10,4),
    "height" DECIMAL(10,4),
    "length" DECIMAL(10,4),

    CONSTRAINT "packing_boxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_labels" (
    "id" TEXT NOT NULL,
    "packing_box_id" TEXT NOT NULL,
    "shipment_id" TEXT,
    "pdf" TEXT,
    "tracking_no" TEXT,

    CONSTRAINT "shipment_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "back_orders" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "back_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancel_orders" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "reason" TEXT,
    "refund" DECIMAL(18,4),

    CONSTRAINT "cancel_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancel_order_items" (
    "id" TEXT NOT NULL,
    "cancel_order_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "cancel_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_holds" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "order_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_tags" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "order_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_notes" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "order_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "condition" JSONB,
    "action" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "allocation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "condition" JSONB,
    "action" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "shipping_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "condition" JSONB,
    "action" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_inventory_policies" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pickingStrategy" TEXT NOT NULL DEFAULT 'FIFO',
    "abcClass" TEXT NOT NULL DEFAULT 'C',
    "allow_negative_stock" BOOLEAN NOT NULL DEFAULT false,
    "lot_tracking" BOOLEAN NOT NULL DEFAULT false,
    "serial_tracking" BOOLEAN NOT NULL DEFAULT false,
    "expiry_tracking" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "wms_inventory_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_warehouse_zones" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "wms_warehouse_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_warehouse_aisles" (
    "id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "wms_warehouse_aisles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_warehouse_racks" (
    "id" TEXT NOT NULL,
    "aisle_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "wms_warehouse_racks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_warehouse_shelves" (
    "id" TEXT NOT NULL,
    "rack_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "wms_warehouse_shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_warehouse_bins" (
    "id" TEXT NOT NULL,
    "shelf_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "wms_warehouse_bins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_warehouse_locations" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "bin_id" TEXT,
    "code" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "wms_warehouse_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_inventory_lots" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "lot_number" TEXT NOT NULL,
    "manufacture_date" TIMESTAMP(3),
    "expire_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wms_inventory_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_inventory_serials" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wms_inventory_serials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_inventory_locations" (
    "id" TEXT NOT NULL,
    "warehouse_location_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "lot_id" TEXT,
    "serial_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_qty" INTEGER NOT NULL DEFAULT 0,
    "available_qty" INTEGER NOT NULL DEFAULT 0,
    "damaged_qty" INTEGER NOT NULL DEFAULT 0,
    "allocated_qty" INTEGER NOT NULL DEFAULT 0,
    "last_movement_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wms_inventory_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_inventory_movements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "from_location_id" TEXT,
    "to_location_id" TEXT,
    "lot_id" TEXT,
    "serial_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "moved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wms_inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_receivings" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "purchase_order_id" TEXT,
    "goods_receive_id" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "wms_receivings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_receiving_items" (
    "id" TEXT NOT NULL,
    "receiving_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "expected_qty" INTEGER NOT NULL,
    "received_qty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wms_receiving_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_put_aways" (
    "id" TEXT NOT NULL,
    "receiving_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assigned_to" TEXT,

    CONSTRAINT "wms_put_aways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_put_away_items" (
    "id" TEXT NOT NULL,
    "put_away_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "from_location_id" TEXT,
    "to_location_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "wms_put_away_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_picking_tasks" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "wave_id" TEXT,
    "assigned_to" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "wms_picking_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_picking_task_items" (
    "id" TEXT NOT NULL,
    "picking_task_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "expected_qty" INTEGER NOT NULL,
    "picked_qty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wms_picking_task_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_packing_tasks" (
    "id" TEXT NOT NULL,
    "picking_task_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assigned_to" TEXT,

    CONSTRAINT "wms_packing_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_packing_task_items" (
    "id" TEXT NOT NULL,
    "packing_task_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "box_id" TEXT,

    CONSTRAINT "wms_packing_task_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_cycle_counts" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "count_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "assigned_to" TEXT,

    CONSTRAINT "wms_cycle_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_cycle_count_items" (
    "id" TEXT NOT NULL,
    "cycle_count_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "system_qty" INTEGER NOT NULL,
    "count_qty" INTEGER,
    "difference" INTEGER,

    CONSTRAINT "wms_cycle_count_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_account_groups" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fin_account_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_accounts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "group_id" TEXT,
    "parent_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "is_posting" BOOLEAN NOT NULL DEFAULT true,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fin_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_fiscal_years" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "fin_fiscal_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_accounting_periods" (
    "id" TEXT NOT NULL,
    "fiscal_year_id" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "fin_accounting_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_ledger_books" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LedgerBookType" NOT NULL,
    "base_currency" TEXT NOT NULL DEFAULT 'THB',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fin_ledger_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_exchange_rates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "from_currency" TEXT NOT NULL,
    "to_currency" TEXT NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "source" TEXT,

    CONSTRAINT "fin_exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_accounting_events" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "fin_accounting_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_accounting_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "effective_from" TIMESTAMP(3),
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fin_accounting_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_rule_conditions" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "fin_rule_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_journal_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "journal_id" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "fin_journal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_journal_line_templates" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "mapping_code" TEXT NOT NULL,
    "is_debit" BOOLEAN NOT NULL,
    "amount_formula" TEXT NOT NULL,

    CONSTRAINT "fin_journal_line_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_account_mappings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "mapping_code" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "account_id" TEXT NOT NULL,

    CONSTRAINT "fin_account_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_journals" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "fin_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_journal_entries" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "journal_id" TEXT NOT NULL,
    "ledger_book_id" TEXT NOT NULL,
    "entry_no" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reversed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fin_journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_journal_entry_lines" (
    "id" TEXT NOT NULL,
    "journal_entry_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'THB',
    "exchange_rate" DECIMAL(18,6) NOT NULL DEFAULT 1.0,
    "debit_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "credit_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "base_debit" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "base_credit" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "description" TEXT,
    "cost_center_id" TEXT,
    "profit_center_id" TEXT,

    CONSTRAINT "fin_journal_entry_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_accounts_receivable" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "original_amount" DECIMAL(18,4) NOT NULL,
    "balance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "fin_accounts_receivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_ar_payments" (
    "id" TEXT NOT NULL,
    "ar_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "bank_transaction_id" TEXT,

    CONSTRAINT "fin_ar_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_accounts_payable" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "original_amount" DECIMAL(18,4) NOT NULL,
    "balance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "fin_accounts_payable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_ap_payments" (
    "id" TEXT NOT NULL,
    "ap_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "bank_transaction_id" TEXT,

    CONSTRAINT "fin_ap_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_cash_accounts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'THB',

    CONSTRAINT "fin_cash_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_bank_accounts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_no" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "branch" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "balance" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "fin_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_bank_transactions" (
    "id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "amount" DECIMAL(18,4) NOT NULL,
    "description" TEXT,

    CONSTRAINT "fin_bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_tax_codes" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "fin_tax_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_tax_rates" (
    "id" TEXT NOT NULL,
    "tax_code_id" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),

    CONSTRAINT "fin_tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_cost_centers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "fin_cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_profit_centers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "fin_profit_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_budgets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "fin_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_budget_lines" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "cost_center_id" TEXT,
    "amount" DECIMAL(18,4) NOT NULL,
    "period" INTEGER NOT NULL,

    CONSTRAINT "fin_budget_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_dashboards" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role_access" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bi_dashboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_dashboard_widgets" (
    "id" TEXT NOT NULL,
    "dashboard_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "position_x" INTEGER NOT NULL,
    "position_y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "bi_dashboard_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_metric_definitions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "formula" TEXT NOT NULL,
    "unit" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bi_metric_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_kpis" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target_value" DECIMAL(18,4) NOT NULL,
    "warning_value" DECIMAL(18,4),
    "period" TEXT NOT NULL,

    CONSTRAINT "bi_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_kpi_history" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "metric_date" DATE NOT NULL,
    "store_id" TEXT,
    "warehouse_id" TEXT,
    "marketplace_id" TEXT,
    "actual_value" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "bi_kpi_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_report_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "base_query" TEXT NOT NULL,
    "columns" TEXT NOT NULL,
    "role_access" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bi_report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_saved_reports" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bi_saved_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_scheduled_reports" (
    "id" TEXT NOT NULL,
    "saved_report_id" TEXT NOT NULL,
    "cron_expression" TEXT NOT NULL,
    "recipients" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'PDF',
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "bi_scheduled_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_report_executions" (
    "id" TEXT NOT NULL,
    "saved_report_id" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executed_by" TEXT,
    "duration_ms" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "file_url" TEXT,

    CONSTRAINT "bi_report_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_report_caches" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "cache_key" TEXT NOT NULL,
    "resultData" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bi_report_caches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dw_fact_sales" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "date_id" DATE NOT NULL,
    "store_id" TEXT,
    "marketplace_id" TEXT,
    "customer_id" TEXT,
    "product_id" TEXT,
    "sales_order_id" TEXT,
    "invoice_id" TEXT,
    "invoice_item_id" TEXT,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "discount" DECIMAL(18,4) NOT NULL,
    "net_sales_amount" DECIMAL(18,4) NOT NULL,
    "cogs" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "gross_profit" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "dw_fact_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dw_fact_purchases" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "date_id" DATE NOT NULL,
    "store_id" TEXT,
    "warehouse_id" TEXT,
    "vendor_id" TEXT,
    "product_id" TEXT,
    "purchase_order_id" TEXT,
    "invoice_id" TEXT,
    "invoice_item_id" TEXT,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "discount" DECIMAL(18,4) NOT NULL,
    "net_purchase_amount" DECIMAL(18,4) NOT NULL,
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "dw_fact_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dw_fact_inventory_movements" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "date_id" DATE NOT NULL,
    "warehouse_id" TEXT,
    "product_id" TEXT,
    "movement_type" TEXT NOT NULL,
    "reference_doc" TEXT,
    "quantity_change" DECIMAL(18,4) NOT NULL,
    "cost_value_change" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "dw_fact_inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dw_fact_inventory_snapshots" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "date_id" DATE NOT NULL,
    "warehouse_id" TEXT,
    "product_id" TEXT,
    "closing_quantity" DECIMAL(18,4) NOT NULL,
    "closing_cost_value" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "dw_fact_inventory_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dw_fact_finance" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "date_id" DATE NOT NULL,
    "ledger_book_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "cost_center_id" TEXT,
    "profit_center_id" TEXT,
    "daily_debit" DECIMAL(18,4) NOT NULL,
    "daily_credit" DECIMAL(18,4) NOT NULL,
    "net_movement" DECIMAL(18,4) NOT NULL,
    "closing_balance" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "dw_fact_finance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_alert_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metric_id" TEXT,
    "condition" TEXT NOT NULL,
    "actionConfig" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "bi_alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_alert_histories" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trigger_value" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "bi_alert_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_forecast_models" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target_metric" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "bi_forecast_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bi_forecast_results" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "target_date" DATE NOT NULL,
    "product_id" TEXT,
    "warehouse_id" TEXT,
    "forecast_value" DECIMAL(18,4) NOT NULL,
    "confidence_low" DECIMAL(18,4),
    "confidence_high" DECIMAL(18,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bi_forecast_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_campaigns" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "budget_amount" DECIMAL(18,4),
    "used_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_promotions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_combinable" BOOLEAN NOT NULL DEFAULT false,
    "auto_apply" BOOLEAN NOT NULL DEFAULT false,
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "user_limit" INTEGER,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_tiers" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier_level" INTEGER NOT NULL,

    CONSTRAINT "promo_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_conditions" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT,
    "tier_id" TEXT,
    "type" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "promo_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_actions" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT,
    "tier_id" TEXT,
    "type" TEXT NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "max_discount" DECIMAL(18,4),
    "targetConfig" TEXT,

    CONSTRAINT "promo_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_voucher_batches" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "code_prefix" TEXT,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_voucher_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_vouchers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "promotion_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "code" TEXT NOT NULL,
    "is_claimed" BOOLEAN NOT NULL DEFAULT false,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_voucher_usages" (
    "id" TEXT NOT NULL,
    "voucher_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "discount_amount" DECIMAL(18,4) NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_voucher_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_product_bundles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bundle_price" DECIMAL(18,4) NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_product_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_bundle_items" (
    "id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "promo_bundle_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_customer_segments" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_customer_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_price_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "product_id" TEXT,
    "category_id" TEXT,
    "adjustment_type" TEXT NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrderToOrderTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrderToOrderTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "uk_country_code" ON "countries"("code");

-- CreateIndex
CREATE INDEX "idx_country_code" ON "countries"("code");

-- CreateIndex
CREATE INDEX "idx_country_name_th" ON "countries"("name_th");

-- CreateIndex
CREATE INDEX "idx_country_status" ON "countries"("status");

-- CreateIndex
CREATE INDEX "idx_province_country" ON "provinces"("country_id");

-- CreateIndex
CREATE INDEX "idx_province_code" ON "provinces"("code");

-- CreateIndex
CREATE INDEX "idx_province_name_th" ON "provinces"("name_th");

-- CreateIndex
CREATE INDEX "idx_province_status" ON "provinces"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uk_province_country_code" ON "provinces"("country_id", "code");

-- CreateIndex
CREATE INDEX "idx_district_province" ON "districts"("province_id");

-- CreateIndex
CREATE INDEX "idx_district_code" ON "districts"("code");

-- CreateIndex
CREATE INDEX "idx_district_name_th" ON "districts"("name_th");

-- CreateIndex
CREATE INDEX "idx_district_status" ON "districts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uk_district_province_code" ON "districts"("province_id", "code");

-- CreateIndex
CREATE INDEX "idx_subdistrict_district" ON "subdistricts"("district_id");

-- CreateIndex
CREATE INDEX "idx_subdistrict_code" ON "subdistricts"("code");

-- CreateIndex
CREATE INDEX "idx_subdistrict_name_th" ON "subdistricts"("name_th");

-- CreateIndex
CREATE INDEX "idx_subdistrict_status" ON "subdistricts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uk_subdistrict_district_code" ON "subdistricts"("district_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_code_key" ON "organizations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "idx_org_code" ON "organizations"("code");

-- CreateIndex
CREATE INDEX "idx_org_slug" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "idx_org_name" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "idx_org_country" ON "organizations"("country_id");

-- CreateIndex
CREATE INDEX "idx_org_province" ON "organizations"("province_id");

-- CreateIndex
CREATE INDEX "idx_org_district" ON "organizations"("district_id");

-- CreateIndex
CREATE INDEX "idx_org_subdistrict" ON "organizations"("subdistrict_id");

-- CreateIndex
CREATE INDEX "idx_org_status" ON "organizations"("status");

-- CreateIndex
CREATE INDEX "idx_store_org" ON "stores"("organization_id");

-- CreateIndex
CREATE INDEX "idx_store_code" ON "stores"("code");

-- CreateIndex
CREATE INDEX "idx_store_slug" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "idx_store_name" ON "stores"("name");

-- CreateIndex
CREATE INDEX "idx_store_country" ON "stores"("country_id");

-- CreateIndex
CREATE INDEX "idx_store_province" ON "stores"("province_id");

-- CreateIndex
CREATE INDEX "idx_store_district" ON "stores"("district_id");

-- CreateIndex
CREATE INDEX "idx_store_subdistrict" ON "stores"("subdistrict_id");

-- CreateIndex
CREATE INDEX "idx_store_status" ON "stores"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uk_store_org_code" ON "stores"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "uk_store_org_slug" ON "stores"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "product_categories_organization_id_idx" ON "product_categories"("organization_id");

-- CreateIndex
CREATE INDEX "product_categories_parent_id_idx" ON "product_categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_category_org_code" ON "product_categories"("organization_id", "code");

-- CreateIndex
CREATE INDEX "brands_organization_id_idx" ON "brands"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_brand_org_code" ON "brands"("organization_id", "code");

-- CreateIndex
CREATE INDEX "units_organization_id_idx" ON "units"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_unit_org_code" ON "units"("organization_id", "code");

-- CreateIndex
CREATE INDEX "taxes_organization_id_idx" ON "taxes"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_tax_org_code" ON "taxes"("organization_id", "code");

-- CreateIndex
CREATE INDEX "products_organization_id_idx" ON "products"("organization_id");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_brand_id_idx" ON "products"("brand_id");

-- CreateIndex
CREATE INDEX "products_unit_id_idx" ON "products"("unit_id");

-- CreateIndex
CREATE INDEX "products_tax_id_idx" ON "products"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_product_org_code" ON "products"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "uk_product_org_slug" ON "products"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_variant_product_sku" ON "product_variants"("product_id", "sku");

-- CreateIndex
CREATE INDEX "product_barcodes_variant_id_idx" ON "product_barcodes"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_barcode_variant_code" ON "product_barcodes"("variant_id", "barcode");

-- CreateIndex
CREATE INDEX "product_prices_variant_id_idx" ON "product_prices"("variant_id");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

-- CreateIndex
CREATE INDEX "attributes_organization_id_idx" ON "attributes"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_attribute_org_name" ON "attributes"("organization_id", "name");

-- CreateIndex
CREATE INDEX "attribute_values_attribute_id_idx" ON "attribute_values"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_attr_value_name" ON "attribute_values"("attribute_id", "value");

-- CreateIndex
CREATE INDEX "product_variant_attribute_values_variant_id_idx" ON "product_variant_attribute_values"("variant_id");

-- CreateIndex
CREATE INDEX "product_variant_attribute_values_attribute_value_id_idx" ON "product_variant_attribute_values"("attribute_value_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_variant_attr_value" ON "product_variant_attribute_values"("variant_id", "attribute_value_id");

-- CreateIndex
CREATE INDEX "product_marketplaces_product_id_idx" ON "product_marketplaces"("product_id");

-- CreateIndex
CREATE INDEX "product_marketplaces_variant_id_idx" ON "product_marketplaces"("variant_id");

-- CreateIndex
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");

-- CreateIndex
CREATE INDEX "users_default_store_id_idx" ON "users"("default_store_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_user_org_username" ON "users"("organization_id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "uk_user_org_email" ON "users"("organization_id", "email");

-- CreateIndex
CREATE INDEX "roles_organization_id_idx" ON "roles"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_role_org_code" ON "roles"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_user_role_user_role" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_role_permission_role_perm" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_stores_user_id_idx" ON "user_stores"("user_id");

-- CreateIndex
CREATE INDEX "user_stores_store_id_idx" ON "user_stores"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_user_store_user_store" ON "user_stores"("user_id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "login_histories_user_id_idx" ON "login_histories"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "warehouses_organization_id_idx" ON "warehouses"("organization_id");

-- CreateIndex
CREATE INDEX "warehouses_store_id_idx" ON "warehouses"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_warehouse_org_code" ON "warehouses"("organization_id", "code");

-- CreateIndex
CREATE INDEX "stock_adjustments_warehouse_id_idx" ON "stock_adjustments"("warehouse_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_created_by_idx" ON "stock_adjustments"("created_by");

-- CreateIndex
CREATE INDEX "stock_adjustment_items_adjustment_id_idx" ON "stock_adjustment_items"("adjustment_id");

-- CreateIndex
CREATE INDEX "stock_adjustment_items_variant_id_idx" ON "stock_adjustment_items"("variant_id");

-- CreateIndex
CREATE INDEX "stock_adjustment_items_warehouse_location_id_idx" ON "stock_adjustment_items"("warehouse_location_id");

-- CreateIndex
CREATE INDEX "stock_transfers_from_warehouse_id_idx" ON "stock_transfers"("from_warehouse_id");

-- CreateIndex
CREATE INDEX "stock_transfers_to_warehouse_id_idx" ON "stock_transfers"("to_warehouse_id");

-- CreateIndex
CREATE INDEX "stock_transfers_created_by_idx" ON "stock_transfers"("created_by");

-- CreateIndex
CREATE INDEX "stock_transfer_items_transfer_id_idx" ON "stock_transfer_items"("transfer_id");

-- CreateIndex
CREATE INDEX "stock_transfer_items_variant_id_idx" ON "stock_transfer_items"("variant_id");

-- CreateIndex
CREATE INDEX "stock_transfer_items_from_location_id_idx" ON "stock_transfer_items"("from_location_id");

-- CreateIndex
CREATE INDEX "stock_transfer_items_to_location_id_idx" ON "stock_transfer_items"("to_location_id");

-- CreateIndex
CREATE INDEX "inventory_snapshots_warehouse_id_idx" ON "inventory_snapshots"("warehouse_id");

-- CreateIndex
CREATE INDEX "inventory_snapshots_variant_id_idx" ON "inventory_snapshots"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_inventory_snapshot" ON "inventory_snapshots"("snapshot_date", "warehouse_id", "variant_id");

-- CreateIndex
CREATE INDEX "vendors_organization_id_idx" ON "vendors"("organization_id");

-- CreateIndex
CREATE INDEX "vendors_name_idx" ON "vendors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "uk_vendor_org_code" ON "vendors"("organization_id", "code");

-- CreateIndex
CREATE INDEX "vendor_addresses_vendor_id_idx" ON "vendor_addresses"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_contacts_vendor_id_idx" ON "vendor_contacts"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_price_lists_vendor_id_idx" ON "vendor_price_lists"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_price_lists_variant_id_idx" ON "vendor_price_lists"("variant_id");

-- CreateIndex
CREATE INDEX "purchase_requests_organization_id_idx" ON "purchase_requests"("organization_id");

-- CreateIndex
CREATE INDEX "purchase_requests_store_id_idx" ON "purchase_requests"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_pr_org_no" ON "purchase_requests"("organization_id", "request_no");

-- CreateIndex
CREATE INDEX "purchase_request_items_purchase_request_id_idx" ON "purchase_request_items"("purchase_request_id");

-- CreateIndex
CREATE INDEX "purchase_request_items_variant_id_idx" ON "purchase_request_items"("variant_id");

-- CreateIndex
CREATE INDEX "purchase_orders_organization_id_idx" ON "purchase_orders"("organization_id");

-- CreateIndex
CREATE INDEX "purchase_orders_store_id_idx" ON "purchase_orders"("store_id");

-- CreateIndex
CREATE INDEX "purchase_orders_warehouse_id_idx" ON "purchase_orders"("warehouse_id");

-- CreateIndex
CREATE INDEX "purchase_orders_vendor_id_idx" ON "purchase_orders"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_po_org_no" ON "purchase_orders"("organization_id", "purchase_no");

-- CreateIndex
CREATE INDEX "purchase_order_items_purchase_order_id_idx" ON "purchase_order_items"("purchase_order_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_variant_id_idx" ON "purchase_order_items"("variant_id");

-- CreateIndex
CREATE INDEX "goods_receives_purchase_order_id_idx" ON "goods_receives"("purchase_order_id");

-- CreateIndex
CREATE INDEX "goods_receives_warehouse_id_idx" ON "goods_receives"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_gr_wh_no" ON "goods_receives"("warehouse_id", "receive_no");

-- CreateIndex
CREATE INDEX "goods_receive_items_goods_receive_id_idx" ON "goods_receive_items"("goods_receive_id");

-- CreateIndex
CREATE INDEX "goods_receive_items_variant_id_idx" ON "goods_receive_items"("variant_id");

-- CreateIndex
CREATE INDEX "goods_receive_items_location_id_idx" ON "goods_receive_items"("location_id");

-- CreateIndex
CREATE INDEX "purchase_invoices_vendor_id_idx" ON "purchase_invoices"("vendor_id");

-- CreateIndex
CREATE INDEX "purchase_invoices_purchase_order_id_idx" ON "purchase_invoices"("purchase_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_inv_vendor_no" ON "purchase_invoices"("vendor_id", "invoice_no");

-- CreateIndex
CREATE INDEX "purchase_invoice_items_purchase_invoice_id_idx" ON "purchase_invoice_items"("purchase_invoice_id");

-- CreateIndex
CREATE INDEX "purchase_invoice_items_variant_id_idx" ON "purchase_invoice_items"("variant_id");

-- CreateIndex
CREATE INDEX "purchase_payments_purchase_invoice_id_idx" ON "purchase_payments"("purchase_invoice_id");

-- CreateIndex
CREATE INDEX "purchase_returns_vendor_id_idx" ON "purchase_returns"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_ret_vendor_no" ON "purchase_returns"("vendor_id", "return_no");

-- CreateIndex
CREATE INDEX "purchase_return_items_purchase_return_id_idx" ON "purchase_return_items"("purchase_return_id");

-- CreateIndex
CREATE INDEX "purchase_return_items_variant_id_idx" ON "purchase_return_items"("variant_id");

-- CreateIndex
CREATE INDEX "customer_groups_organization_id_idx" ON "customer_groups"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_customer_group_org_code" ON "customer_groups"("organization_id", "code");

-- CreateIndex
CREATE INDEX "customers_organization_id_idx" ON "customers"("organization_id");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "customers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "uk_customer_org_code" ON "customers"("organization_id", "code");

-- CreateIndex
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses"("customer_id");

-- CreateIndex
CREATE INDEX "customer_contacts_customer_id_idx" ON "customer_contacts"("customer_id");

-- CreateIndex
CREATE INDEX "price_books_organization_id_idx" ON "price_books"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_price_book_org_code" ON "price_books"("organization_id", "code");

-- CreateIndex
CREATE INDEX "price_book_items_variant_id_idx" ON "price_book_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_price_book_item" ON "price_book_items"("price_book_id", "variant_id", "min_quantity");

-- CreateIndex
CREATE INDEX "sales_channels_organization_id_idx" ON "sales_channels"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_sales_channel_org_code" ON "sales_channels"("organization_id", "code");

-- CreateIndex
CREATE INDEX "quotations_organization_id_idx" ON "quotations"("organization_id");

-- CreateIndex
CREATE INDEX "quotations_store_id_idx" ON "quotations"("store_id");

-- CreateIndex
CREATE INDEX "quotations_customer_id_idx" ON "quotations"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_quotation_org_no" ON "quotations"("organization_id", "quotation_no");

-- CreateIndex
CREATE INDEX "quotation_items_quotation_id_idx" ON "quotation_items"("quotation_id");

-- CreateIndex
CREATE INDEX "quotation_items_variant_id_idx" ON "quotation_items"("variant_id");

-- CreateIndex
CREATE INDEX "sales_orders_organization_id_idx" ON "sales_orders"("organization_id");

-- CreateIndex
CREATE INDEX "sales_orders_store_id_idx" ON "sales_orders"("store_id");

-- CreateIndex
CREATE INDEX "sales_orders_customer_id_idx" ON "sales_orders"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_so_org_no" ON "sales_orders"("organization_id", "order_no");

-- CreateIndex
CREATE INDEX "sales_order_items_sales_order_id_idx" ON "sales_order_items"("sales_order_id");

-- CreateIndex
CREATE INDEX "sales_order_items_variant_id_idx" ON "sales_order_items"("variant_id");

-- CreateIndex
CREATE INDEX "shipments_sales_order_id_idx" ON "shipments"("sales_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_shipment_no" ON "shipments"("shipment_no");

-- CreateIndex
CREATE INDEX "shipment_items_shipment_id_idx" ON "shipment_items"("shipment_id");

-- CreateIndex
CREATE INDEX "shipment_items_sales_order_item_id_idx" ON "shipment_items"("sales_order_item_id");

-- CreateIndex
CREATE INDEX "sales_invoices_sales_order_id_idx" ON "sales_invoices"("sales_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_sales_invoice_no" ON "sales_invoices"("invoice_no");

-- CreateIndex
CREATE INDEX "sales_invoice_items_sales_invoice_id_idx" ON "sales_invoice_items"("sales_invoice_id");

-- CreateIndex
CREATE INDEX "sales_invoice_items_variant_id_idx" ON "sales_invoice_items"("variant_id");

-- CreateIndex
CREATE INDEX "receipts_sales_invoice_id_idx" ON "receipts"("sales_invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_receipt_no" ON "receipts"("receipt_no");

-- CreateIndex
CREATE INDEX "sales_returns_sales_order_id_idx" ON "sales_returns"("sales_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_sales_return_no" ON "sales_returns"("return_no");

-- CreateIndex
CREATE INDEX "sales_return_items_sales_return_id_idx" ON "sales_return_items"("sales_return_id");

-- CreateIndex
CREATE INDEX "sales_return_items_variant_id_idx" ON "sales_return_items"("variant_id");

-- CreateIndex
CREATE INDEX "credit_notes_sales_invoice_id_idx" ON "credit_notes"("sales_invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_credit_note_no" ON "credit_notes"("credit_no");

-- CreateIndex
CREATE UNIQUE INDEX "marketplaces_code_key" ON "marketplaces"("code");

-- CreateIndex
CREATE INDEX "marketplace_accounts_organization_id_idx" ON "marketplace_accounts"("organization_id");

-- CreateIndex
CREATE INDEX "marketplace_accounts_marketplace_id_idx" ON "marketplace_accounts"("marketplace_id");

-- CreateIndex
CREATE INDEX "marketplace_shops_account_id_idx" ON "marketplace_shops"("account_id");

-- CreateIndex
CREATE INDEX "marketplace_shops_store_id_idx" ON "marketplace_shops"("store_id");

-- CreateIndex
CREATE INDEX "marketplace_tokens_account_id_idx" ON "marketplace_tokens"("account_id");

-- CreateIndex
CREATE INDEX "marketplace_products_shop_id_idx" ON "marketplace_products"("shop_id");

-- CreateIndex
CREATE INDEX "marketplace_products_product_id_idx" ON "marketplace_products"("product_id");

-- CreateIndex
CREATE INDEX "marketplace_variants_marketplace_product_id_idx" ON "marketplace_variants"("marketplace_product_id");

-- CreateIndex
CREATE INDEX "marketplace_variants_variant_id_idx" ON "marketplace_variants"("variant_id");

-- CreateIndex
CREATE INDEX "marketplace_inventories_variant_id_idx" ON "marketplace_inventories"("variant_id");

-- CreateIndex
CREATE INDEX "marketplace_inventories_shop_id_idx" ON "marketplace_inventories"("shop_id");

-- CreateIndex
CREATE INDEX "marketplace_inventories_inventory_id_idx" ON "marketplace_inventories"("inventory_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_orders_sales_order_id_key" ON "marketplace_orders"("sales_order_id");

-- CreateIndex
CREATE INDEX "marketplace_orders_shop_id_idx" ON "marketplace_orders"("shop_id");

-- CreateIndex
CREATE INDEX "marketplace_order_items_marketplace_order_id_idx" ON "marketplace_order_items"("marketplace_order_id");

-- CreateIndex
CREATE INDEX "marketplace_order_items_variant_id_idx" ON "marketplace_order_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_shipments_shipment_id_key" ON "marketplace_shipments"("shipment_id");

-- CreateIndex
CREATE INDEX "marketplace_shipments_marketplace_order_id_idx" ON "marketplace_shipments"("marketplace_order_id");

-- CreateIndex
CREATE INDEX "marketplace_webhooks_marketplace_id_idx" ON "marketplace_webhooks"("marketplace_id");

-- CreateIndex
CREATE INDEX "marketplace_error_logs_shop_id_idx" ON "marketplace_error_logs"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_sources_code_key" ON "order_sources"("code");

-- CreateIndex
CREATE INDEX "orders_organization_id_idx" ON "orders"("organization_id");

-- CreateIndex
CREATE INDEX "orders_store_id_idx" ON "orders"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_organization_id_order_no_key" ON "orders"("organization_id", "order_no");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_variant_id_idx" ON "order_items"("variant_id");

-- CreateIndex
CREATE INDEX "order_status_histories_order_id_idx" ON "order_status_histories"("order_id");

-- CreateIndex
CREATE INDEX "allocations_order_id_idx" ON "allocations"("order_id");

-- CreateIndex
CREATE INDEX "allocations_warehouse_id_idx" ON "allocations"("warehouse_id");

-- CreateIndex
CREATE INDEX "allocation_items_allocation_id_idx" ON "allocation_items"("allocation_id");

-- CreateIndex
CREATE INDEX "allocation_items_order_item_id_idx" ON "allocation_items"("order_item_id");

-- CreateIndex
CREATE INDEX "fulfillments_allocation_id_idx" ON "fulfillments"("allocation_id");

-- CreateIndex
CREATE INDEX "fulfillments_picking_wave_id_idx" ON "fulfillments"("picking_wave_id");

-- CreateIndex
CREATE INDEX "fulfillment_items_fulfillment_id_idx" ON "fulfillment_items"("fulfillment_id");

-- CreateIndex
CREATE INDEX "fulfillment_items_variant_id_idx" ON "fulfillment_items"("variant_id");

-- CreateIndex
CREATE INDEX "picking_waves_organization_id_idx" ON "picking_waves"("organization_id");

-- CreateIndex
CREATE INDEX "picking_waves_warehouse_id_idx" ON "picking_waves"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "picking_waves_organization_id_wave_no_key" ON "picking_waves"("organization_id", "wave_no");

-- CreateIndex
CREATE INDEX "packing_boxes_order_id_idx" ON "packing_boxes"("order_id");

-- CreateIndex
CREATE INDEX "shipment_labels_packing_box_id_idx" ON "shipment_labels"("packing_box_id");

-- CreateIndex
CREATE INDEX "shipment_labels_shipment_id_idx" ON "shipment_labels"("shipment_id");

-- CreateIndex
CREATE INDEX "back_orders_order_id_idx" ON "back_orders"("order_id");

-- CreateIndex
CREATE INDEX "back_orders_order_item_id_idx" ON "back_orders"("order_item_id");

-- CreateIndex
CREATE INDEX "back_orders_variant_id_idx" ON "back_orders"("variant_id");

-- CreateIndex
CREATE INDEX "cancel_orders_order_id_idx" ON "cancel_orders"("order_id");

-- CreateIndex
CREATE INDEX "cancel_order_items_cancel_order_id_idx" ON "cancel_order_items"("cancel_order_id");

-- CreateIndex
CREATE INDEX "cancel_order_items_order_item_id_idx" ON "cancel_order_items"("order_item_id");

-- CreateIndex
CREATE INDEX "order_holds_order_id_idx" ON "order_holds"("order_id");

-- CreateIndex
CREATE INDEX "order_tags_organization_id_idx" ON "order_tags"("organization_id");

-- CreateIndex
CREATE INDEX "order_notes_order_id_idx" ON "order_notes"("order_id");

-- CreateIndex
CREATE INDEX "allocation_rules_organization_id_idx" ON "allocation_rules"("organization_id");

-- CreateIndex
CREATE INDEX "shipping_rules_organization_id_idx" ON "shipping_rules"("organization_id");

-- CreateIndex
CREATE INDEX "automation_rules_organization_id_idx" ON "automation_rules"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "wms_warehouse_locations_code_key" ON "wms_warehouse_locations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "wms_warehouse_locations_barcode_key" ON "wms_warehouse_locations"("barcode");

-- CreateIndex
CREATE INDEX "wms_inventory_lots_variant_id_idx" ON "wms_inventory_lots"("variant_id");

-- CreateIndex
CREATE INDEX "wms_inventory_serials_variant_id_idx" ON "wms_inventory_serials"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_wms_inventory_serial" ON "wms_inventory_serials"("variant_id", "serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "uk_wms_inv_loc" ON "wms_inventory_locations"("warehouse_location_id", "product_variant_id", "lot_id", "serial_id");

-- CreateIndex
CREATE UNIQUE INDEX "fin_account_groups_organization_id_code_key" ON "fin_account_groups"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "fin_accounts_organization_id_code_key" ON "fin_accounts"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "fin_fiscal_years_organization_id_year_key" ON "fin_fiscal_years"("organization_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "fin_accounting_periods_fiscal_year_id_period_key" ON "fin_accounting_periods"("fiscal_year_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "fin_ledger_books_organization_id_code_key" ON "fin_ledger_books"("organization_id", "code");

-- CreateIndex
CREATE INDEX "fin_exchange_rates_organization_id_from_currency_to_currenc_idx" ON "fin_exchange_rates"("organization_id", "from_currency", "to_currency", "effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "fin_accounting_events_code_key" ON "fin_accounting_events"("code");

-- CreateIndex
CREATE INDEX "fin_rule_conditions_rule_id_idx" ON "fin_rule_conditions"("rule_id");

-- CreateIndex
CREATE INDEX "fin_journal_line_templates_template_id_idx" ON "fin_journal_line_templates"("template_id");

-- CreateIndex
CREATE INDEX "fin_account_mappings_organization_id_mapping_code_reference_idx" ON "fin_account_mappings"("organization_id", "mapping_code", "reference_type", "reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "fin_journals_organization_id_code_key" ON "fin_journals"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "fin_journal_entries_organization_id_entry_no_key" ON "fin_journal_entries"("organization_id", "entry_no");

-- CreateIndex
CREATE INDEX "fin_journal_entry_lines_journal_entry_id_idx" ON "fin_journal_entry_lines"("journal_entry_id");

-- CreateIndex
CREATE INDEX "fin_journal_entry_lines_account_id_idx" ON "fin_journal_entry_lines"("account_id");

-- CreateIndex
CREATE INDEX "fin_accounts_receivable_customer_id_idx" ON "fin_accounts_receivable"("customer_id");

-- CreateIndex
CREATE INDEX "fin_accounts_receivable_invoice_id_idx" ON "fin_accounts_receivable"("invoice_id");

-- CreateIndex
CREATE INDEX "fin_ar_payments_ar_id_idx" ON "fin_ar_payments"("ar_id");

-- CreateIndex
CREATE INDEX "fin_accounts_payable_vendor_id_idx" ON "fin_accounts_payable"("vendor_id");

-- CreateIndex
CREATE INDEX "fin_accounts_payable_invoice_id_idx" ON "fin_accounts_payable"("invoice_id");

-- CreateIndex
CREATE INDEX "fin_ap_payments_ap_id_idx" ON "fin_ap_payments"("ap_id");

-- CreateIndex
CREATE UNIQUE INDEX "fin_cash_accounts_organization_id_code_key" ON "fin_cash_accounts"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "fin_bank_accounts_organization_id_account_no_key" ON "fin_bank_accounts"("organization_id", "account_no");

-- CreateIndex
CREATE INDEX "fin_bank_transactions_bank_account_id_idx" ON "fin_bank_transactions"("bank_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "fin_tax_codes_organization_id_code_key" ON "fin_tax_codes"("organization_id", "code");

-- CreateIndex
CREATE INDEX "fin_tax_rates_tax_code_id_idx" ON "fin_tax_rates"("tax_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "fin_cost_centers_organization_id_code_key" ON "fin_cost_centers"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "fin_profit_centers_organization_id_code_key" ON "fin_profit_centers"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "fin_budgets_organization_id_name_year_key" ON "fin_budgets"("organization_id", "name", "year");

-- CreateIndex
CREATE INDEX "fin_budget_lines_budget_id_idx" ON "fin_budget_lines"("budget_id");

-- CreateIndex
CREATE INDEX "bi_dashboards_organization_id_idx" ON "bi_dashboards"("organization_id");

-- CreateIndex
CREATE INDEX "bi_dashboard_widgets_dashboard_id_idx" ON "bi_dashboard_widgets"("dashboard_id");

-- CreateIndex
CREATE UNIQUE INDEX "bi_metric_definitions_organization_id_code_key" ON "bi_metric_definitions"("organization_id", "code");

-- CreateIndex
CREATE INDEX "bi_kpis_organization_id_idx" ON "bi_kpis"("organization_id");

-- CreateIndex
CREATE INDEX "bi_kpi_history_organization_id_metric_id_metric_date_idx" ON "bi_kpi_history"("organization_id", "metric_id", "metric_date");

-- CreateIndex
CREATE UNIQUE INDEX "bi_report_templates_organization_id_code_key" ON "bi_report_templates"("organization_id", "code");

-- CreateIndex
CREATE INDEX "bi_saved_reports_template_id_idx" ON "bi_saved_reports"("template_id");

-- CreateIndex
CREATE INDEX "bi_scheduled_reports_saved_report_id_idx" ON "bi_scheduled_reports"("saved_report_id");

-- CreateIndex
CREATE INDEX "bi_report_executions_saved_report_id_idx" ON "bi_report_executions"("saved_report_id");

-- CreateIndex
CREATE UNIQUE INDEX "bi_report_caches_template_id_cache_key_key" ON "bi_report_caches"("template_id", "cache_key");

-- CreateIndex
CREATE INDEX "dw_fact_sales_organization_id_date_id_idx" ON "dw_fact_sales"("organization_id", "date_id");

-- CreateIndex
CREATE INDEX "dw_fact_sales_product_id_idx" ON "dw_fact_sales"("product_id");

-- CreateIndex
CREATE INDEX "dw_fact_sales_customer_id_idx" ON "dw_fact_sales"("customer_id");

-- CreateIndex
CREATE INDEX "dw_fact_sales_store_id_idx" ON "dw_fact_sales"("store_id");

-- CreateIndex
CREATE INDEX "dw_fact_purchases_organization_id_date_id_idx" ON "dw_fact_purchases"("organization_id", "date_id");

-- CreateIndex
CREATE INDEX "dw_fact_purchases_product_id_idx" ON "dw_fact_purchases"("product_id");

-- CreateIndex
CREATE INDEX "dw_fact_purchases_vendor_id_idx" ON "dw_fact_purchases"("vendor_id");

-- CreateIndex
CREATE INDEX "dw_fact_inventory_movements_organization_id_date_id_idx" ON "dw_fact_inventory_movements"("organization_id", "date_id");

-- CreateIndex
CREATE INDEX "dw_fact_inventory_movements_warehouse_id_idx" ON "dw_fact_inventory_movements"("warehouse_id");

-- CreateIndex
CREATE INDEX "dw_fact_inventory_movements_product_id_idx" ON "dw_fact_inventory_movements"("product_id");

-- CreateIndex
CREATE INDEX "dw_fact_inventory_snapshots_organization_id_date_id_idx" ON "dw_fact_inventory_snapshots"("organization_id", "date_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_dw_inventory_snapshot" ON "dw_fact_inventory_snapshots"("organization_id", "date_id", "warehouse_id", "product_id");

-- CreateIndex
CREATE INDEX "dw_fact_finance_organization_id_date_id_idx" ON "dw_fact_finance"("organization_id", "date_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_finance_fact" ON "dw_fact_finance"("organization_id", "ledger_book_id", "account_id", "date_id");

-- CreateIndex
CREATE INDEX "bi_alert_rules_organization_id_idx" ON "bi_alert_rules"("organization_id");

-- CreateIndex
CREATE INDEX "bi_alert_histories_rule_id_idx" ON "bi_alert_histories"("rule_id");

-- CreateIndex
CREATE INDEX "bi_forecast_models_organization_id_idx" ON "bi_forecast_models"("organization_id");

-- CreateIndex
CREATE INDEX "bi_forecast_results_model_id_target_date_idx" ON "bi_forecast_results"("model_id", "target_date");

-- CreateIndex
CREATE INDEX "promo_campaigns_organization_id_status_idx" ON "promo_campaigns"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "promo_campaigns_organization_id_code_key" ON "promo_campaigns"("organization_id", "code");

-- CreateIndex
CREATE INDEX "promo_promotions_organization_id_status_idx" ON "promo_promotions"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "promo_promotions_organization_id_code_key" ON "promo_promotions"("organization_id", "code");

-- CreateIndex
CREATE INDEX "promo_tiers_promotion_id_idx" ON "promo_tiers"("promotion_id");

-- CreateIndex
CREATE INDEX "promo_conditions_promotion_id_idx" ON "promo_conditions"("promotion_id");

-- CreateIndex
CREATE INDEX "promo_conditions_tier_id_idx" ON "promo_conditions"("tier_id");

-- CreateIndex
CREATE INDEX "promo_actions_promotion_id_idx" ON "promo_actions"("promotion_id");

-- CreateIndex
CREATE INDEX "promo_actions_tier_id_idx" ON "promo_actions"("tier_id");

-- CreateIndex
CREATE INDEX "promo_voucher_batches_organization_id_idx" ON "promo_voucher_batches"("organization_id");

-- CreateIndex
CREATE INDEX "promo_vouchers_promotion_id_idx" ON "promo_vouchers"("promotion_id");

-- CreateIndex
CREATE INDEX "promo_vouchers_customer_id_idx" ON "promo_vouchers"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "promo_vouchers_organization_id_code_key" ON "promo_vouchers"("organization_id", "code");

-- CreateIndex
CREATE INDEX "promo_voucher_usages_voucher_id_idx" ON "promo_voucher_usages"("voucher_id");

-- CreateIndex
CREATE INDEX "promo_voucher_usages_customer_id_idx" ON "promo_voucher_usages"("customer_id");

-- CreateIndex
CREATE INDEX "promo_voucher_usages_order_id_idx" ON "promo_voucher_usages"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "promo_product_bundles_organization_id_code_key" ON "promo_product_bundles"("organization_id", "code");

-- CreateIndex
CREATE INDEX "promo_bundle_items_bundle_id_idx" ON "promo_bundle_items"("bundle_id");

-- CreateIndex
CREATE INDEX "promo_bundle_items_product_id_idx" ON "promo_bundle_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "promo_customer_segments_organization_id_code_key" ON "promo_customer_segments"("organization_id", "code");

-- CreateIndex
CREATE INDEX "promo_price_rules_organization_id_segment_id_idx" ON "promo_price_rules"("organization_id", "segment_id");

-- CreateIndex
CREATE INDEX "promo_price_rules_product_id_idx" ON "promo_price_rules"("product_id");

-- CreateIndex
CREATE INDEX "promo_price_rules_category_id_idx" ON "promo_price_rules"("category_id");

-- CreateIndex
CREATE INDEX "_OrderToOrderTag_B_index" ON "_OrderToOrderTag"("B");

-- AddForeignKey
ALTER TABLE "provinces" ADD CONSTRAINT "provinces_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subdistricts" ADD CONSTRAINT "subdistricts_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_subdistrict_id_fkey" FOREIGN KEY ("subdistrict_id") REFERENCES "subdistricts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_subdistrict_id_fkey" FOREIGN KEY ("subdistrict_id") REFERENCES "subdistricts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxes" ADD CONSTRAINT "taxes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "taxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_inventoryPolicyId_fkey" FOREIGN KEY ("inventoryPolicyId") REFERENCES "wms_inventory_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_barcodes" ADD CONSTRAINT "product_barcodes_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attribute_values" ADD CONSTRAINT "product_variant_attribute_values_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attribute_values" ADD CONSTRAINT "product_variant_attribute_values_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_marketplaces" ADD CONSTRAINT "product_marketplaces_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_marketplaces" ADD CONSTRAINT "product_marketplaces_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_default_store_id_fkey" FOREIGN KEY ("default_store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stores" ADD CONSTRAINT "user_stores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stores" ADD CONSTRAINT "user_stores_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_histories" ADD CONSTRAINT "login_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_adjustment_id_fkey" FOREIGN KEY ("adjustment_id") REFERENCES "stock_adjustments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_warehouse_location_id_fkey" FOREIGN KEY ("warehouse_location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "wms_inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_serial_id_fkey" FOREIGN KEY ("serial_id") REFERENCES "wms_inventory_serials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_from_warehouse_id_fkey" FOREIGN KEY ("from_warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "stock_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_snapshots" ADD CONSTRAINT "inventory_snapshots_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_snapshots" ADD CONSTRAINT "inventory_snapshots_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_addresses" ADD CONSTRAINT "vendor_addresses_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_contacts" ADD CONSTRAINT "vendor_contacts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_price_lists" ADD CONSTRAINT "vendor_price_lists_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_price_lists" ADD CONSTRAINT "vendor_price_lists_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_purchase_request_id_fkey" FOREIGN KEY ("purchase_request_id") REFERENCES "purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_purchase_request_id_fkey" FOREIGN KEY ("purchase_request_id") REFERENCES "purchase_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receives" ADD CONSTRAINT "goods_receives_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receives" ADD CONSTRAINT "goods_receives_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receive_items" ADD CONSTRAINT "goods_receive_items_goods_receive_id_fkey" FOREIGN KEY ("goods_receive_id") REFERENCES "goods_receives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receive_items" ADD CONSTRAINT "goods_receive_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receive_items" ADD CONSTRAINT "goods_receive_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receive_items" ADD CONSTRAINT "goods_receive_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_invoices" ADD CONSTRAINT "purchase_invoices_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_invoices" ADD CONSTRAINT "purchase_invoices_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_invoice_items" ADD CONSTRAINT "purchase_invoice_items_purchase_invoice_id_fkey" FOREIGN KEY ("purchase_invoice_id") REFERENCES "purchase_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_invoice_items" ADD CONSTRAINT "purchase_invoice_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_invoice_items" ADD CONSTRAINT "purchase_invoice_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_payments" ADD CONSTRAINT "purchase_payments_purchase_invoice_id_fkey" FOREIGN KEY ("purchase_invoice_id") REFERENCES "purchase_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_purchase_return_id_fkey" FOREIGN KEY ("purchase_return_id") REFERENCES "purchase_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_groups" ADD CONSTRAINT "customer_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_customer_group_id_fkey" FOREIGN KEY ("customer_group_id") REFERENCES "customer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_books" ADD CONSTRAINT "price_books_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_books" ADD CONSTRAINT "price_books_customer_group_id_fkey" FOREIGN KEY ("customer_group_id") REFERENCES "customer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_book_items" ADD CONSTRAINT "price_book_items_price_book_id_fkey" FOREIGN KEY ("price_book_id") REFERENCES "price_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_book_items" ADD CONSTRAINT "price_book_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_channels" ADD CONSTRAINT "sales_channels_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "sales_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_oms_order_id_fkey" FOREIGN KEY ("oms_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_sales_order_item_id_fkey" FOREIGN KEY ("sales_order_item_id") REFERENCES "sales_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoice_items" ADD CONSTRAINT "sales_invoice_items_sales_invoice_id_fkey" FOREIGN KEY ("sales_invoice_id") REFERENCES "sales_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoice_items" ADD CONSTRAINT "sales_invoice_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoice_items" ADD CONSTRAINT "sales_invoice_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_sales_invoice_id_fkey" FOREIGN KEY ("sales_invoice_id") REFERENCES "sales_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_sales_return_id_fkey" FOREIGN KEY ("sales_return_id") REFERENCES "sales_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_sales_invoice_id_fkey" FOREIGN KEY ("sales_invoice_id") REFERENCES "sales_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_accounts" ADD CONSTRAINT "marketplace_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_accounts" ADD CONSTRAINT "marketplace_accounts_marketplace_id_fkey" FOREIGN KEY ("marketplace_id") REFERENCES "marketplaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_shops" ADD CONSTRAINT "marketplace_shops_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "marketplace_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_shops" ADD CONSTRAINT "marketplace_shops_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_tokens" ADD CONSTRAINT "marketplace_tokens_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "marketplace_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "marketplace_shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_products" ADD CONSTRAINT "marketplace_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_variants" ADD CONSTRAINT "marketplace_variants_marketplace_product_id_fkey" FOREIGN KEY ("marketplace_product_id") REFERENCES "marketplace_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_variants" ADD CONSTRAINT "marketplace_variants_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_inventories" ADD CONSTRAINT "marketplace_inventories_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_inventories" ADD CONSTRAINT "marketplace_inventories_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "marketplace_shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_inventories" ADD CONSTRAINT "marketplace_inventories_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "wms_inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "marketplace_shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_order_items" ADD CONSTRAINT "marketplace_order_items_marketplace_order_id_fkey" FOREIGN KEY ("marketplace_order_id") REFERENCES "marketplace_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_order_items" ADD CONSTRAINT "marketplace_order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_shipments" ADD CONSTRAINT "marketplace_shipments_marketplace_order_id_fkey" FOREIGN KEY ("marketplace_order_id") REFERENCES "marketplace_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_shipments" ADD CONSTRAINT "marketplace_shipments_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_webhooks" ADD CONSTRAINT "marketplace_webhooks_marketplace_id_fkey" FOREIGN KEY ("marketplace_id") REFERENCES "marketplaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_error_logs" ADD CONSTRAINT "marketplace_error_logs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "marketplace_shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "order_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_histories" ADD CONSTRAINT "order_status_histories_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_histories" ADD CONSTRAINT "order_status_histories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_items" ADD CONSTRAINT "allocation_items_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "allocations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_items" ADD CONSTRAINT "allocation_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_items" ADD CONSTRAINT "allocation_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillments" ADD CONSTRAINT "fulfillments_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillments" ADD CONSTRAINT "fulfillments_picking_wave_id_fkey" FOREIGN KEY ("picking_wave_id") REFERENCES "picking_waves"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillments" ADD CONSTRAINT "fulfillments_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillment_items" ADD CONSTRAINT "fulfillment_items_fulfillment_id_fkey" FOREIGN KEY ("fulfillment_id") REFERENCES "fulfillments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fulfillment_items" ADD CONSTRAINT "fulfillment_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picking_waves" ADD CONSTRAINT "picking_waves_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picking_waves" ADD CONSTRAINT "picking_waves_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_boxes" ADD CONSTRAINT "packing_boxes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_labels" ADD CONSTRAINT "shipment_labels_packing_box_id_fkey" FOREIGN KEY ("packing_box_id") REFERENCES "packing_boxes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_labels" ADD CONSTRAINT "shipment_labels_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "back_orders" ADD CONSTRAINT "back_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "back_orders" ADD CONSTRAINT "back_orders_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "back_orders" ADD CONSTRAINT "back_orders_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancel_orders" ADD CONSTRAINT "cancel_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancel_order_items" ADD CONSTRAINT "cancel_order_items_cancel_order_id_fkey" FOREIGN KEY ("cancel_order_id") REFERENCES "cancel_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancel_order_items" ADD CONSTRAINT "cancel_order_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_holds" ADD CONSTRAINT "order_holds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_tags" ADD CONSTRAINT "order_tags_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_rules" ADD CONSTRAINT "allocation_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_rules" ADD CONSTRAINT "shipping_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_warehouse_zones" ADD CONSTRAINT "wms_warehouse_zones_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_warehouse_aisles" ADD CONSTRAINT "wms_warehouse_aisles_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "wms_warehouse_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_warehouse_racks" ADD CONSTRAINT "wms_warehouse_racks_aisle_id_fkey" FOREIGN KEY ("aisle_id") REFERENCES "wms_warehouse_aisles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_warehouse_shelves" ADD CONSTRAINT "wms_warehouse_shelves_rack_id_fkey" FOREIGN KEY ("rack_id") REFERENCES "wms_warehouse_racks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_warehouse_bins" ADD CONSTRAINT "wms_warehouse_bins_shelf_id_fkey" FOREIGN KEY ("shelf_id") REFERENCES "wms_warehouse_shelves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_warehouse_locations" ADD CONSTRAINT "wms_warehouse_locations_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_warehouse_locations" ADD CONSTRAINT "wms_warehouse_locations_bin_id_fkey" FOREIGN KEY ("bin_id") REFERENCES "wms_warehouse_bins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_lots" ADD CONSTRAINT "wms_inventory_lots_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_serials" ADD CONSTRAINT "wms_inventory_serials_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_locations" ADD CONSTRAINT "wms_inventory_locations_warehouse_location_id_fkey" FOREIGN KEY ("warehouse_location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_locations" ADD CONSTRAINT "wms_inventory_locations_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_locations" ADD CONSTRAINT "wms_inventory_locations_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "wms_inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_locations" ADD CONSTRAINT "wms_inventory_locations_serial_id_fkey" FOREIGN KEY ("serial_id") REFERENCES "wms_inventory_serials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_movements" ADD CONSTRAINT "wms_inventory_movements_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_movements" ADD CONSTRAINT "wms_inventory_movements_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_movements" ADD CONSTRAINT "wms_inventory_movements_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_movements" ADD CONSTRAINT "wms_inventory_movements_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "wms_inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_movements" ADD CONSTRAINT "wms_inventory_movements_serial_id_fkey" FOREIGN KEY ("serial_id") REFERENCES "wms_inventory_serials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_inventory_movements" ADD CONSTRAINT "wms_inventory_movements_moved_by_fkey" FOREIGN KEY ("moved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_receivings" ADD CONSTRAINT "wms_receivings_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_receivings" ADD CONSTRAINT "wms_receivings_goods_receive_id_fkey" FOREIGN KEY ("goods_receive_id") REFERENCES "goods_receives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_receiving_items" ADD CONSTRAINT "wms_receiving_items_receiving_id_fkey" FOREIGN KEY ("receiving_id") REFERENCES "wms_receivings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_receiving_items" ADD CONSTRAINT "wms_receiving_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_put_aways" ADD CONSTRAINT "wms_put_aways_receiving_id_fkey" FOREIGN KEY ("receiving_id") REFERENCES "wms_receivings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_put_aways" ADD CONSTRAINT "wms_put_aways_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_put_away_items" ADD CONSTRAINT "wms_put_away_items_put_away_id_fkey" FOREIGN KEY ("put_away_id") REFERENCES "wms_put_aways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_put_away_items" ADD CONSTRAINT "wms_put_away_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_put_away_items" ADD CONSTRAINT "wms_put_away_items_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_put_away_items" ADD CONSTRAINT "wms_put_away_items_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_picking_tasks" ADD CONSTRAINT "wms_picking_tasks_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_picking_tasks" ADD CONSTRAINT "wms_picking_tasks_wave_id_fkey" FOREIGN KEY ("wave_id") REFERENCES "picking_waves"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_picking_tasks" ADD CONSTRAINT "wms_picking_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_picking_task_items" ADD CONSTRAINT "wms_picking_task_items_picking_task_id_fkey" FOREIGN KEY ("picking_task_id") REFERENCES "wms_picking_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_picking_task_items" ADD CONSTRAINT "wms_picking_task_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_picking_task_items" ADD CONSTRAINT "wms_picking_task_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_packing_tasks" ADD CONSTRAINT "wms_packing_tasks_picking_task_id_fkey" FOREIGN KEY ("picking_task_id") REFERENCES "wms_picking_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_packing_tasks" ADD CONSTRAINT "wms_packing_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_packing_task_items" ADD CONSTRAINT "wms_packing_task_items_packing_task_id_fkey" FOREIGN KEY ("packing_task_id") REFERENCES "wms_packing_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_packing_task_items" ADD CONSTRAINT "wms_packing_task_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_packing_task_items" ADD CONSTRAINT "wms_packing_task_items_box_id_fkey" FOREIGN KEY ("box_id") REFERENCES "packing_boxes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_cycle_counts" ADD CONSTRAINT "wms_cycle_counts_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_cycle_counts" ADD CONSTRAINT "wms_cycle_counts_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_cycle_count_items" ADD CONSTRAINT "wms_cycle_count_items_cycle_count_id_fkey" FOREIGN KEY ("cycle_count_id") REFERENCES "wms_cycle_counts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_cycle_count_items" ADD CONSTRAINT "wms_cycle_count_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "wms_warehouse_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_cycle_count_items" ADD CONSTRAINT "wms_cycle_count_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_account_groups" ADD CONSTRAINT "fin_account_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounts" ADD CONSTRAINT "fin_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounts" ADD CONSTRAINT "fin_accounts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "fin_account_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounts" ADD CONSTRAINT "fin_accounts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "fin_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_fiscal_years" ADD CONSTRAINT "fin_fiscal_years_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounting_periods" ADD CONSTRAINT "fin_accounting_periods_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "fin_fiscal_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_ledger_books" ADD CONSTRAINT "fin_ledger_books_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_exchange_rates" ADD CONSTRAINT "fin_exchange_rates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounting_rules" ADD CONSTRAINT "fin_accounting_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounting_rules" ADD CONSTRAINT "fin_accounting_rules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "fin_accounting_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounting_rules" ADD CONSTRAINT "fin_accounting_rules_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "fin_journal_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_rule_conditions" ADD CONSTRAINT "fin_rule_conditions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "fin_accounting_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_templates" ADD CONSTRAINT "fin_journal_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_templates" ADD CONSTRAINT "fin_journal_templates_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "fin_journals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_line_templates" ADD CONSTRAINT "fin_journal_line_templates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "fin_journal_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_account_mappings" ADD CONSTRAINT "fin_account_mappings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_account_mappings" ADD CONSTRAINT "fin_account_mappings_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "fin_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journals" ADD CONSTRAINT "fin_journals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "fin_journals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_ledger_book_id_fkey" FOREIGN KEY ("ledger_book_id") REFERENCES "fin_ledger_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_entries" ADD CONSTRAINT "fin_journal_entries_reversed_by_id_fkey" FOREIGN KEY ("reversed_by_id") REFERENCES "fin_journal_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_entry_lines" ADD CONSTRAINT "fin_journal_entry_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "fin_journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_entry_lines" ADD CONSTRAINT "fin_journal_entry_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "fin_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_entry_lines" ADD CONSTRAINT "fin_journal_entry_lines_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "fin_cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_journal_entry_lines" ADD CONSTRAINT "fin_journal_entry_lines_profit_center_id_fkey" FOREIGN KEY ("profit_center_id") REFERENCES "fin_profit_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounts_receivable" ADD CONSTRAINT "fin_accounts_receivable_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounts_receivable" ADD CONSTRAINT "fin_accounts_receivable_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounts_receivable" ADD CONSTRAINT "fin_accounts_receivable_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_ar_payments" ADD CONSTRAINT "fin_ar_payments_ar_id_fkey" FOREIGN KEY ("ar_id") REFERENCES "fin_accounts_receivable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_ar_payments" ADD CONSTRAINT "fin_ar_payments_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "fin_bank_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounts_payable" ADD CONSTRAINT "fin_accounts_payable_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounts_payable" ADD CONSTRAINT "fin_accounts_payable_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_accounts_payable" ADD CONSTRAINT "fin_accounts_payable_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "purchase_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_ap_payments" ADD CONSTRAINT "fin_ap_payments_ap_id_fkey" FOREIGN KEY ("ap_id") REFERENCES "fin_accounts_payable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_ap_payments" ADD CONSTRAINT "fin_ap_payments_bank_transaction_id_fkey" FOREIGN KEY ("bank_transaction_id") REFERENCES "fin_bank_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_cash_accounts" ADD CONSTRAINT "fin_cash_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_bank_accounts" ADD CONSTRAINT "fin_bank_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_bank_transactions" ADD CONSTRAINT "fin_bank_transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "fin_bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_tax_codes" ADD CONSTRAINT "fin_tax_codes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_tax_rates" ADD CONSTRAINT "fin_tax_rates_tax_code_id_fkey" FOREIGN KEY ("tax_code_id") REFERENCES "fin_tax_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_cost_centers" ADD CONSTRAINT "fin_cost_centers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_profit_centers" ADD CONSTRAINT "fin_profit_centers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_budgets" ADD CONSTRAINT "fin_budgets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_budget_lines" ADD CONSTRAINT "fin_budget_lines_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "fin_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_dashboards" ADD CONSTRAINT "bi_dashboards_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_dashboard_widgets" ADD CONSTRAINT "bi_dashboard_widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "bi_dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_metric_definitions" ADD CONSTRAINT "bi_metric_definitions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_kpis" ADD CONSTRAINT "bi_kpis_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_kpis" ADD CONSTRAINT "bi_kpis_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "bi_metric_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_kpi_history" ADD CONSTRAINT "bi_kpi_history_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_kpi_history" ADD CONSTRAINT "bi_kpi_history_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "bi_metric_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_report_templates" ADD CONSTRAINT "bi_report_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_saved_reports" ADD CONSTRAINT "bi_saved_reports_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "bi_report_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_scheduled_reports" ADD CONSTRAINT "bi_scheduled_reports_saved_report_id_fkey" FOREIGN KEY ("saved_report_id") REFERENCES "bi_saved_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_report_executions" ADD CONSTRAINT "bi_report_executions_saved_report_id_fkey" FOREIGN KEY ("saved_report_id") REFERENCES "bi_saved_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_report_caches" ADD CONSTRAINT "bi_report_caches_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "bi_report_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_alert_rules" ADD CONSTRAINT "bi_alert_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_alert_histories" ADD CONSTRAINT "bi_alert_histories_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "bi_alert_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_forecast_models" ADD CONSTRAINT "bi_forecast_models_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bi_forecast_results" ADD CONSTRAINT "bi_forecast_results_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "bi_forecast_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_campaigns" ADD CONSTRAINT "promo_campaigns_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_promotions" ADD CONSTRAINT "promo_promotions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_promotions" ADD CONSTRAINT "promo_promotions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "promo_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_tiers" ADD CONSTRAINT "promo_tiers_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promo_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_conditions" ADD CONSTRAINT "promo_conditions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promo_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_conditions" ADD CONSTRAINT "promo_conditions_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "promo_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_actions" ADD CONSTRAINT "promo_actions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promo_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_actions" ADD CONSTRAINT "promo_actions_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "promo_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_voucher_batches" ADD CONSTRAINT "promo_voucher_batches_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_voucher_batches" ADD CONSTRAINT "promo_voucher_batches_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "promo_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_vouchers" ADD CONSTRAINT "promo_vouchers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_vouchers" ADD CONSTRAINT "promo_vouchers_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "promo_voucher_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_vouchers" ADD CONSTRAINT "promo_vouchers_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promo_promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_vouchers" ADD CONSTRAINT "promo_vouchers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_voucher_usages" ADD CONSTRAINT "promo_voucher_usages_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "promo_vouchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_voucher_usages" ADD CONSTRAINT "promo_voucher_usages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_voucher_usages" ADD CONSTRAINT "promo_voucher_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_product_bundles" ADD CONSTRAINT "promo_product_bundles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_bundle_items" ADD CONSTRAINT "promo_bundle_items_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "promo_product_bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_bundle_items" ADD CONSTRAINT "promo_bundle_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_customer_segments" ADD CONSTRAINT "promo_customer_segments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_price_rules" ADD CONSTRAINT "promo_price_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_price_rules" ADD CONSTRAINT "promo_price_rules_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "promo_customer_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_price_rules" ADD CONSTRAINT "promo_price_rules_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_price_rules" ADD CONSTRAINT "promo_price_rules_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToOrderTag" ADD CONSTRAINT "_OrderToOrderTag_A_fkey" FOREIGN KEY ("A") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToOrderTag" ADD CONSTRAINT "_OrderToOrderTag_B_fkey" FOREIGN KEY ("B") REFERENCES "order_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

