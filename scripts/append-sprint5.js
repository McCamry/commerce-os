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

injectRelation('Organization', `  vendors Vendor[]\n  purchaseRequests PurchaseRequest[]\n  purchaseOrders PurchaseOrder[]`);
injectRelation('Store', `  purchaseRequests PurchaseRequest[]\n  purchaseOrders PurchaseOrder[]`);
injectRelation('Warehouse', `  purchaseOrders PurchaseOrder[]\n  goodsReceives GoodsReceive[]`);
injectRelation('Location', `  goodsReceiveItems GoodsReceiveItem[]`);
injectRelation('ProductVariant', `  vendorPrices VendorPriceList[]\n  purchaseRequestItems PurchaseRequestItem[]\n  purchaseOrderItems PurchaseOrderItem[]\n  goodsReceiveItems GoodsReceiveItem[]\n  purchaseReturnItems PurchaseReturnItem[]\n  purchaseInvoiceItems PurchaseInvoiceItem[]`);
injectRelation('Unit', `  purchaseRequestItems PurchaseRequestItem[]\n  purchaseOrderItems PurchaseOrderItem[]\n  goodsReceiveItems GoodsReceiveItem[]\n  purchaseReturnItems PurchaseReturnItem[]\n  purchaseInvoiceItems PurchaseInvoiceItem[]`);


const newModels = `
//////////////////////////////////////////////////////
// SPRINT 5: PURCHASE MANAGEMENT
//////////////////////////////////////////////////////

model Vendor {
  id             String         @id @default(uuid())
  organizationId String         @map("organization_id")
  code           String
  name           String
  taxId          String?        @map("tax_id")
  branch         String?
  contactPerson  String?        @map("contact_person")
  phone1         String?        @map("phone_1")
  phone2         String?        @map("phone_2")
  email          String?
  website        String?
  creditDays     Int            @default(0) @map("credit_days")
  creditLimit    Decimal?       @db.Decimal(18, 4) @map("credit_limit")
  paymentTerm    String?        @map("payment_term")
  
  status         RecordStatus   @default(ACTIVE)
  deletedAt      DateTime?      @map("deleted_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  addresses      VendorAddress[]
  contacts       VendorContact[]
  priceLists     VendorPriceList[]
  purchaseOrders PurchaseOrder[]
  invoices       PurchaseInvoice[]
  returns        PurchaseReturn[]

  @@unique([organizationId, code], map: "uk_vendor_org_code")
  @@index([organizationId])
  @@index([name])
  @@map("vendors")
}

model VendorAddress {
  id            String       @id @default(uuid())
  vendorId      String       @map("vendor_id")
  type          String       // e.g., HQ, BILLING, WAREHOUSE
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

  vendor        Vendor       @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@map("vendor_addresses")
}

model VendorContact {
  id            String       @id @default(uuid())
  vendorId      String       @map("vendor_id")
  name          String
  position      String?
  phone         String?
  email         String?
  isPrimary     Boolean      @default(false) @map("is_primary")
  
  status        RecordStatus @default(ACTIVE)
  deletedAt     DateTime?    @map("deleted_at")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  vendor        Vendor       @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@map("vendor_contacts")
}

model VendorPriceList {
  id             String         @id @default(uuid())
  vendorId       String         @map("vendor_id")
  variantId      String         @map("variant_id")
  price          Decimal        @db.Decimal(18, 4)
  currency       String         @default("THB")
  minQuantity    Int            @default(1) @map("min_quantity")
  effectiveDate  DateTime       @default(now()) @map("effective_date")
  expiryDate     DateTime?      @map("expiry_date")
  
  status         RecordStatus   @default(ACTIVE)
  deletedAt      DateTime?      @map("deleted_at")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  vendor         Vendor         @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  variant        ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@index([variantId])
  @@map("vendor_price_lists")
}

model PurchaseRequest {
  id             String       @id @default(uuid())
  organizationId String       @map("organization_id")
  storeId        String       @map("store_id")
  requestNo      String       @map("request_no")
  requestDate    DateTime     @default(now()) @map("request_date")
  requestBy      String       @map("request_by")
  status         String       @default("DRAFT") // DRAFT, WAITING_APPROVAL, APPROVED, REJECTED, PO_CREATED, CANCELLED
  remark         String?
  
  deletedAt      DateTime?    @map("deleted_at")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  store          Store        @relation(fields: [storeId], references: [id], onDelete: Restrict)
  items          PurchaseRequestItem[]
  purchaseOrders PurchaseOrder[]

  @@unique([organizationId, requestNo], map: "uk_pr_org_no")
  @@index([organizationId])
  @@index([storeId])
  @@map("purchase_requests")
}

model PurchaseRequestItem {
  id                String       @id @default(uuid())
  purchaseRequestId String       @map("purchase_request_id")
  variantId         String       @map("variant_id")
  quantity          Int
  unitId            String       @map("unit_id")
  remark            String?
  
  purchaseRequest   PurchaseRequest @relation(fields: [purchaseRequestId], references: [id], onDelete: Cascade)
  variant           ProductVariant  @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unit              Unit            @relation(fields: [unitId], references: [id], onDelete: Restrict)

  @@index([purchaseRequestId])
  @@index([variantId])
  @@map("purchase_request_items")
}

model PurchaseOrder {
  id                String       @id @default(uuid())
  organizationId    String       @map("organization_id")
  storeId           String       @map("store_id")
  warehouseId       String       @map("warehouse_id")
  vendorId          String       @map("vendor_id")
  purchaseRequestId String?      @map("purchase_request_id")
  
  purchaseNo        String       @map("purchase_no")
  purchaseDate      DateTime     @default(now()) @map("purchase_date")
  expectedDate      DateTime?    @map("expected_date")
  currency          String       @default("THB")
  exchangeRate      Decimal      @default(1.0) @db.Decimal(18, 4) @map("exchange_rate")
  
  subtotal          Decimal      @default(0) @db.Decimal(18, 4)
  discount          Decimal      @default(0) @db.Decimal(18, 4)
  vat               Decimal      @default(0) @db.Decimal(18, 4)
  shippingCost      Decimal      @default(0) @db.Decimal(18, 4) @map("shipping_cost")
  grandTotal        Decimal      @default(0) @db.Decimal(18, 4) @map("grand_total")
  
  status            String       @default("DRAFT") // DRAFT, WAITING_APPROVAL, APPROVED, PARTIALLY_RECEIVED, COMPLETED, CANCELLED
  remark            String?
  
  deletedAt         DateTime?    @map("deleted_at")
  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt @map("updated_at")

  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  store             Store        @relation(fields: [storeId], references: [id], onDelete: Restrict)
  warehouse         Warehouse    @relation(fields: [warehouseId], references: [id], onDelete: Restrict)
  vendor            Vendor       @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  purchaseRequest   PurchaseRequest? @relation(fields: [purchaseRequestId], references: [id], onDelete: SetNull)
  
  items             PurchaseOrderItem[]
  goodsReceives     GoodsReceive[]
  invoices          PurchaseInvoice[]

  @@unique([organizationId, purchaseNo], map: "uk_po_org_no")
  @@index([organizationId])
  @@index([storeId])
  @@index([warehouseId])
  @@index([vendorId])
  @@map("purchase_orders")
}

model PurchaseOrderItem {
  id              String       @id @default(uuid())
  purchaseOrderId String       @map("purchase_order_id")
  variantId       String       @map("variant_id")
  unitId          String       @map("unit_id")
  description     String?
  
  quantity        Int
  receivedQty     Int          @default(0) @map("received_qty")
  unitPrice       Decimal      @default(0) @db.Decimal(18, 4) @map("unit_price")
  discount        Decimal      @default(0) @db.Decimal(18, 4)
  taxRate         Decimal      @default(0) @db.Decimal(18, 4) @map("tax_rate")
  lineTotal       Decimal      @default(0) @db.Decimal(18, 4) @map("line_total")
  
  status          String       @default("PENDING") // PENDING, PARTIALLY_RECEIVED, RECEIVED
  
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  variant         ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unit            Unit           @relation(fields: [unitId], references: [id], onDelete: Restrict)

  @@index([purchaseOrderId])
  @@index([variantId])
  @@map("purchase_order_items")
}

model GoodsReceive {
  id              String       @id @default(uuid())
  purchaseOrderId String       @map("purchase_order_id")
  warehouseId     String       @map("warehouse_id")
  receiveNo       String       @map("receive_no")
  receiveDate     DateTime     @default(now()) @map("receive_date")
  receivedBy      String       @map("received_by")
  status          String       @default("DRAFT") // DRAFT, QC_PENDING, COMPLETED, CANCELLED
  remark          String?
  
  deletedAt       DateTime?    @map("deleted_at")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Restrict)
  warehouse       Warehouse     @relation(fields: [warehouseId], references: [id], onDelete: Restrict)
  items           GoodsReceiveItem[]

  @@unique([warehouseId, receiveNo], map: "uk_gr_wh_no")
  @@index([purchaseOrderId])
  @@index([warehouseId])
  @@map("goods_receives")
}

model GoodsReceiveItem {
  id                  String       @id @default(uuid())
  goodsReceiveId      String       @map("goods_receive_id")
  purchaseOrderItemId String?      @map("purchase_order_item_id")
  variantId           String       @map("variant_id")
  unitId              String       @map("unit_id")
  locationId          String       @map("location_id")
  lotNumber           String?      @map("lot_number")
  serialNumber        String?      @map("serial_number")
  quantity            Int
  
  status              String       @default("PENDING") // PENDING, QC_PASSED, QC_REJECTED, COMPLETED
  
  goodsReceive        GoodsReceive   @relation(fields: [goodsReceiveId], references: [id], onDelete: Cascade)
  variant             ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unit                Unit           @relation(fields: [unitId], references: [id], onDelete: Restrict)
  location            Location       @relation(fields: [locationId], references: [id], onDelete: Restrict)

  @@index([goodsReceiveId])
  @@index([variantId])
  @@index([locationId])
  @@map("goods_receive_items")
}

model PurchaseInvoice {
  id              String       @id @default(uuid())
  vendorId        String       @map("vendor_id")
  purchaseOrderId String?      @map("purchase_order_id")
  invoiceNo       String       @map("invoice_no")
  invoiceDate     DateTime     @map("invoice_date")
  dueDate         DateTime?    @map("due_date")
  
  subtotal        Decimal      @default(0) @db.Decimal(18, 4)
  vat             Decimal      @default(0) @db.Decimal(18, 4)
  grandTotal      Decimal      @default(0) @db.Decimal(18, 4) @map("grand_total")
  
  status          String       @default("PENDING") // PENDING, PAID, PARTIALLY_PAID, CANCELLED
  
  deletedAt       DateTime?    @map("deleted_at")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  vendor          Vendor       @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  purchaseOrder   PurchaseOrder? @relation(fields: [purchaseOrderId], references: [id], onDelete: SetNull)
  items           PurchaseInvoiceItem[]
  payments        PurchasePayment[]

  @@unique([vendorId, invoiceNo], map: "uk_inv_vendor_no")
  @@index([vendorId])
  @@index([purchaseOrderId])
  @@map("purchase_invoices")
}

model PurchaseInvoiceItem {
  id                String       @id @default(uuid())
  purchaseInvoiceId String       @map("purchase_invoice_id")
  variantId         String       @map("variant_id")
  unitId            String       @map("unit_id")
  description       String?
  quantity          Int
  unitPrice         Decimal      @default(0) @db.Decimal(18, 4) @map("unit_price")
  lineTotal         Decimal      @default(0) @db.Decimal(18, 4) @map("line_total")
  
  purchaseInvoice   PurchaseInvoice @relation(fields: [purchaseInvoiceId], references: [id], onDelete: Cascade)
  variant           ProductVariant  @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unit              Unit            @relation(fields: [unitId], references: [id], onDelete: Restrict)

  @@index([purchaseInvoiceId])
  @@index([variantId])
  @@map("purchase_invoice_items")
}

model PurchasePayment {
  id                String       @id @default(uuid())
  purchaseInvoiceId String       @map("purchase_invoice_id")
  paymentDate       DateTime     @default(now()) @map("payment_date")
  paymentMethod     String       @map("payment_method") // CASH, BANK, CHEQUE, TRANSFER
  amount            Decimal      @db.Decimal(18, 4)
  reference         String?
  
  status            String       @default("COMPLETED") // PENDING, COMPLETED, CANCELLED
  
  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt @map("updated_at")

  purchaseInvoice   PurchaseInvoice @relation(fields: [purchaseInvoiceId], references: [id], onDelete: Restrict)

  @@index([purchaseInvoiceId])
  @@map("purchase_payments")
}

model PurchaseReturn {
  id              String       @id @default(uuid())
  vendorId        String       @map("vendor_id")
  returnNo        String       @map("return_no")
  returnDate      DateTime     @default(now()) @map("return_date")
  reason          String?
  status          String       @default("DRAFT") // DRAFT, COMPLETED, CANCELLED
  
  deletedAt       DateTime?    @map("deleted_at")
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  vendor          Vendor       @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  items           PurchaseReturnItem[]

  @@unique([vendorId, returnNo], map: "uk_ret_vendor_no")
  @@index([vendorId])
  @@map("purchase_returns")
}

model PurchaseReturnItem {
  id               String       @id @default(uuid())
  purchaseReturnId String       @map("purchase_return_id")
  variantId        String       @map("variant_id")
  unitId           String       @map("unit_id")
  quantity         Int
  reason           String?
  
  purchaseReturn   PurchaseReturn @relation(fields: [purchaseReturnId], references: [id], onDelete: Cascade)
  variant          ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  unit             Unit           @relation(fields: [unitId], references: [id], onDelete: Restrict)

  @@index([purchaseReturnId])
  @@index([variantId])
  @@map("purchase_return_items")
}
`;

fs.writeFileSync(schemaPath, schema + newModels);
console.log('Schema updated successfully.');
