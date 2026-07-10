const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../packages/database/prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

function injectRelation(modelName, relations) {
    const regex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?)(@@map\\(|\\})`, 'm');
    schema = schema.replace(regex, (match, p1, p2) => {
        return p1 + relations + '\n\n  ' + p2;
    });
}

// Inject relations to existing models
injectRelation('Organization', `  customerGroups CustomerGroup[]\n  customers Customer[]\n  quotations Quotation[]\n  salesOrders SalesOrder[]\n  priceBooks PriceBook[]\n  salesChannels SalesChannel[]`);
injectRelation('Store', `  quotations Quotation[]\n  salesOrders SalesOrder[]`);
injectRelation('Warehouse', `  salesOrders SalesOrder[]`);
injectRelation('ProductVariant', `  quotationItems QuotationItem[]\n  salesOrderItems SalesOrderItem[]\n  salesReturnItems SalesReturnItem[]\n  salesInvoiceItems SalesInvoiceItem[]\n  priceBookItems PriceBookItem[]`);
injectRelation('Unit', `  quotationItems QuotationItem[]\n  salesOrderItems SalesOrderItem[]\n  salesReturnItems SalesReturnItem[]\n  salesInvoiceItems SalesInvoiceItem[]`);


const newModels = `
//////////////////////////////////////////////////////
// SPRINT 6: SALES MANAGEMENT
//////////////////////////////////////////////////////

model CustomerGroup {
  id             String         @id @default(uuid())
  organizationId String         @map("organization_id")
  code           String
  name           String
  description    String?
  
  status         RecordStatus   @default(ACTIVE)
  deletedAt      DateTime?      @map("deleted_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  customers      Customer[]
  priceBooks     PriceBook[]

  @@unique([organizationId, code], map: "uk_customer_group_org_code")
  @@index([organizationId])
  @@map("customer_groups")
}

model Customer {
  id              String         @id @default(uuid())
  organizationId  String         @map("organization_id")
  customerGroupId String?        @map("customer_group_id")
  code            String
  name            String
  taxId           String?        @map("tax_id")
  branch          String?
  contactPerson   String?        @map("contact_person")
  phone1          String?        @map("phone_1")
  phone2          String?        @map("phone_2")
  email           String?
  creditDays      Int            @default(0) @map("credit_days")
  creditLimit     Decimal?       @db.Decimal(18, 4) @map("credit_limit")
  
  status          RecordStatus   @default(ACTIVE)
  deletedAt       DateTime?      @map("deleted_at")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  organization    Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  customerGroup   CustomerGroup? @relation(fields: [customerGroupId], references: [id], onDelete: SetNull)
  addresses       CustomerAddress[]
  contacts        CustomerContact[]
  quotations      Quotation[]
  salesOrders     SalesOrder[]

  @@unique([organizationId, code], map: "uk_customer_org_code")
  @@index([organizationId])
  @@index([name])
  @@map("customers")
}

model CustomerAddress {
  id            String       @id @default(uuid())
  customerId    String       @map("customer_id")
  type          String       // e.g., HQ, BILLING, SHIPPING
  address1      String
  address2      String?
  countryId     String?      @map("country_id")
  provinceId    String?      @map("province_id")
  districtId    String?      @map("district_id")
  subdistrictId String?      @map("subdistrict_id")
  isDefault     Boolean      @default(false) @map("is_default")
  
  status        RecordStatus @default(ACTIVE)
  deletedAt     DateTime?    @map("deleted_at")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  customer      Customer     @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@index([customerId])
  @@map("customer_addresses")
}

model CustomerContact {
  id            String       @id @default(uuid())
  customerId    String       @map("customer_id")
  name          String
  position      String?
  phone         String?
  email         String?
  isPrimary     Boolean      @default(false) @map("is_primary")
  
  status        RecordStatus @default(ACTIVE)
  deletedAt     DateTime?    @map("deleted_at")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  customer      Customer     @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@index([customerId])
  @@map("customer_contacts")
}

model PriceBook {
  id              String         @id @default(uuid())
  organizationId  String         @map("organization_id")
  customerGroupId String?        @map("customer_group_id")
  code            String
  name            String
  description     String?
  currency        String         @default("THB")
  effectiveDate   DateTime       @default(now()) @map("effective_date")
  expiryDate      DateTime?      @map("expiry_date")
  
  status          RecordStatus   @default(ACTIVE)
  deletedAt       DateTime?      @map("deleted_at")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  organization    Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  customerGroup   CustomerGroup? @relation(fields: [customerGroupId], references: [id], onDelete: SetNull)
  items           PriceBookItem[]

  @@unique([organizationId, code], map: "uk_price_book_org_code")
  @@index([organizationId])
  @@map("price_books")
}

model PriceBookItem {
  id             String         @id @default(uuid())
  priceBookId    String         @map("price_book_id")
  variantId      String         @map("variant_id")
  price          Decimal        @db.Decimal(18, 4)
  minQuantity    Int            @default(1) @map("min_quantity")
  
  priceBook      PriceBook      @relation(fields: [priceBookId], references: [id], onDelete: Cascade)
  variant        ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)

  @@unique([priceBookId, variantId, minQuantity], map: "uk_price_book_item")
  @@index([variantId])
  @@map("price_book_items")
}

model SalesChannel {
  id             String         @id @default(uuid())
  organizationId String         @map("organization_id")
  code           String
  name           String         // e.g., POS, Shopee, Lazada, B2B
  
  status         RecordStatus   @default(ACTIVE)
  deletedAt      DateTime?      @map("deleted_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  salesOrders    SalesOrder[]

  @@unique([organizationId, code], map: "uk_sales_channel_org_code")
  @@index([organizationId])
  @@map("sales_channels")
}

model Quotation {
  id             String       @id @default(uuid())
  organizationId String       @map("organization_id")
  storeId        String       @map("store_id")
  customerId     String       @map("customer_id")
  
  quotationNo    String       @map("quotation_no")
  quotationDate  DateTime     @default(now()) @map("quotation_date")
  expireDate     DateTime?    @map("expire_date")
  
  subtotal       Decimal      @default(0) @db.Decimal(18, 4)
  discount       Decimal      @default(0) @db.Decimal(18, 4)
  vat            Decimal      @default(0) @db.Decimal(18, 4)
  grandTotal     Decimal      @default(0) @db.Decimal(18, 4) @map("grand_total")
  
  status         String       @default("DRAFT") // DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
  remark         String?
  
  deletedAt      DateTime?    @map("deleted_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  store          Store        @relation(fields: [storeId], references: [id], onDelete: Restrict)
  customer       Customer     @relation(fields: [customerId], references: [id], onDelete: Restrict)
  
  items          QuotationItem[]
  salesOrders    SalesOrder[]

  @@unique([organizationId, quotationNo], map: "uk_quotation_org_no")
  @@index([organizationId])
  @@index([storeId])
  @@index([customerId])
  @@map("quotations")
}

model QuotationItem {
  id             String         @id @default(uuid())
  quotationId    String         @map("quotation_id")
  variantId      String         @map("variant_id")
  unitId         String         @map("unit_id")
  
  quantity       Int
  unitPrice      Decimal        @default(0) @db.Decimal(18, 4) @map("unit_price")
  discount       Decimal        @default(0) @db.Decimal(18, 4)
  taxRate        Decimal        @default(0) @db.Decimal(18, 4) @map("tax_rate")
  lineTotal      Decimal        @default(0) @db.Decimal(18, 4) @map("line_total")
  
  quotation      Quotation      @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  variant        ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unit           Unit           @relation(fields: [unitId], references: [id], onDelete: Restrict)

  @@index([quotationId])
  @@index([variantId])
  @@map("quotation_items")
}

model SalesOrder {
  id             String       @id @default(uuid())
  organizationId String       @map("organization_id")
  storeId        String       @map("store_id")
  warehouseId    String?      @map("warehouse_id")
  customerId     String       @map("customer_id")
  channelId      String?      @map("channel_id")
  quotationId    String?      @map("quotation_id")
  
  orderNo        String       @map("order_no")
  orderDate      DateTime     @default(now()) @map("order_date")
  currency       String       @default("THB")
  exchangeRate   Decimal      @default(1.0) @db.Decimal(18, 4) @map("exchange_rate")
  
  promotionCode  String?      @map("promotion_code")
  
  subtotal       Decimal      @default(0) @db.Decimal(18, 4)
  discount       Decimal      @default(0) @db.Decimal(18, 4)
  vat            Decimal      @default(0) @db.Decimal(18, 4)
  shippingFee    Decimal      @default(0) @db.Decimal(18, 4) @map("shipping_fee")
  grandTotal     Decimal      @default(0) @db.Decimal(18, 4) @map("grand_total")
  
  status         String       @default("DRAFT") // DRAFT, CONFIRMED, RESERVED, PICKING, PACKING, SHIPPED, COMPLETED, BACKORDERED, CANCELLED
  remark         String?
  
  deletedAt      DateTime?    @map("deleted_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  store          Store        @relation(fields: [storeId], references: [id], onDelete: Restrict)
  warehouse      Warehouse?   @relation(fields: [warehouseId], references: [id], onDelete: Restrict)
  customer       Customer     @relation(fields: [customerId], references: [id], onDelete: Restrict)
  channel        SalesChannel?@relation(fields: [channelId], references: [id], onDelete: SetNull)
  quotation      Quotation?   @relation(fields: [quotationId], references: [id], onDelete: SetNull)
  
  items          SalesOrderItem[]
  shipments      Shipment[]
  invoices       SalesInvoice[]
  returns        SalesReturn[]

  @@unique([organizationId, orderNo], map: "uk_so_org_no")
  @@index([organizationId])
  @@index([storeId])
  @@index([customerId])
  @@map("sales_orders")
}

model SalesOrderItem {
  id             String         @id @default(uuid())
  salesOrderId   String         @map("sales_order_id")
  variantId      String         @map("variant_id")
  unitId         String         @map("unit_id")
  
  quantity       Int
  reservedQty    Int            @default(0) @map("reserved_qty")
  shippedQty     Int            @default(0) @map("shipped_qty")
  
  unitPrice      Decimal        @default(0) @db.Decimal(18, 4) @map("unit_price")
  discount       Decimal        @default(0) @db.Decimal(18, 4)
  taxRate        Decimal        @default(0) @db.Decimal(18, 4) @map("tax_rate")
  lineTotal      Decimal        @default(0) @db.Decimal(18, 4) @map("line_total")
  
  salesOrder     SalesOrder     @relation(fields: [salesOrderId], references: [id], onDelete: Cascade)
  variant        ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unit           Unit           @relation(fields: [unitId], references: [id], onDelete: Restrict)
  shipmentItems  ShipmentItem[]

  @@index([salesOrderId])
  @@index([variantId])
  @@map("sales_order_items")
}

model Shipment {
  id             String       @id @default(uuid())
  salesOrderId   String       @map("sales_order_id")
  shipmentNo     String       @map("shipment_no")
  carrier        String?
  trackingNo     String?      @map("tracking_no")
  shipDate       DateTime     @default(now()) @map("ship_date")
  status         String       @default("PENDING") // PENDING, SHIPPED, DELIVERED, CANCELLED
  
  deletedAt      DateTime?    @map("deleted_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  salesOrder     SalesOrder   @relation(fields: [salesOrderId], references: [id], onDelete: Restrict)
  items          ShipmentItem[]

  @@unique([shipmentNo], map: "uk_shipment_no")
  @@index([salesOrderId])
  @@map("shipments")
}

model ShipmentItem {
  id               String         @id @default(uuid())
  shipmentId       String         @map("shipment_id")
  salesOrderItemId String         @map("sales_order_item_id")
  quantity         Int
  
  shipment         Shipment       @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  salesOrderItem   SalesOrderItem @relation(fields: [salesOrderItemId], references: [id], onDelete: Restrict)

  @@index([shipmentId])
  @@index([salesOrderItemId])
  @@map("shipment_items")
}

model SalesInvoice {
  id             String       @id @default(uuid())
  salesOrderId   String       @map("sales_order_id")
  invoiceNo      String       @map("invoice_no")
  invoiceDate    DateTime     @default(now()) @map("invoice_date")
  
  subtotal       Decimal      @default(0) @db.Decimal(18, 4)
  vat            Decimal      @default(0) @db.Decimal(18, 4)
  grandTotal     Decimal      @default(0) @db.Decimal(18, 4) @map("grand_total")
  
  status         String       @default("PENDING") // PENDING, PAID, CANCELLED
  
  deletedAt      DateTime?    @map("deleted_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  salesOrder     SalesOrder   @relation(fields: [salesOrderId], references: [id], onDelete: Restrict)
  items          SalesInvoiceItem[]
  receipts       Receipt[]
  creditNotes    CreditNote[]

  @@unique([invoiceNo], map: "uk_sales_invoice_no")
  @@index([salesOrderId])
  @@map("sales_invoices")
}

model SalesInvoiceItem {
  id             String         @id @default(uuid())
  salesInvoiceId String         @map("sales_invoice_id")
  variantId      String         @map("variant_id")
  unitId         String         @map("unit_id")
  
  quantity       Int
  unitPrice      Decimal        @default(0) @db.Decimal(18, 4) @map("unit_price")
  lineTotal      Decimal        @default(0) @db.Decimal(18, 4) @map("line_total")
  
  salesInvoice   SalesInvoice   @relation(fields: [salesInvoiceId], references: [id], onDelete: Cascade)
  variant        ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unit           Unit           @relation(fields: [unitId], references: [id], onDelete: Restrict)

  @@index([salesInvoiceId])
  @@index([variantId])
  @@map("sales_invoice_items")
}

model Receipt {
  id             String       @id @default(uuid())
  salesInvoiceId String       @map("sales_invoice_id")
  receiptNo      String       @map("receipt_no")
  paymentMethod  String       @map("payment_method") // CASH, TRANSFER, PROMPTPAY, CREDIT_CARD
  paymentDate    DateTime     @default(now()) @map("payment_date")
  amount         Decimal      @db.Decimal(18, 4)
  reference      String?
  
  status         String       @default("COMPLETED")
  
  deletedAt      DateTime?    @map("deleted_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  salesInvoice   SalesInvoice @relation(fields: [salesInvoiceId], references: [id], onDelete: Restrict)

  @@unique([receiptNo], map: "uk_receipt_no")
  @@index([salesInvoiceId])
  @@map("receipts")
}

model SalesReturn {
  id             String       @id @default(uuid())
  salesOrderId   String       @map("sales_order_id")
  returnNo       String       @map("return_no")
  returnDate     DateTime     @default(now()) @map("return_date")
  reason         String?
  status         String       @default("COMPLETED") // COMPLETED, CANCELLED
  
  deletedAt      DateTime?    @map("deleted_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  salesOrder     SalesOrder   @relation(fields: [salesOrderId], references: [id], onDelete: Restrict)
  items          SalesReturnItem[]

  @@unique([returnNo], map: "uk_sales_return_no")
  @@index([salesOrderId])
  @@map("sales_returns")
}

model SalesReturnItem {
  id             String         @id @default(uuid())
  salesReturnId  String         @map("sales_return_id")
  variantId      String         @map("variant_id")
  unitId         String         @map("unit_id")
  quantity       Int
  reason         String?
  
  salesReturn    SalesReturn    @relation(fields: [salesReturnId], references: [id], onDelete: Cascade)
  variant        ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unit           Unit           @relation(fields: [unitId], references: [id], onDelete: Restrict)

  @@index([salesReturnId])
  @@index([variantId])
  @@map("sales_return_items")
}

model CreditNote {
  id             String       @id @default(uuid())
  salesInvoiceId String       @map("sales_invoice_id")
  creditNo       String       @map("credit_no")
  amount         Decimal      @db.Decimal(18, 4)
  reason         String?
  
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  salesInvoice   SalesInvoice @relation(fields: [salesInvoiceId], references: [id], onDelete: Restrict)

  @@unique([creditNo], map: "uk_credit_note_no")
  @@index([salesInvoiceId])
  @@map("credit_notes")
}
`;

schema += '\n' + newModels;
fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Successfully injected Sprint 6 models.');
