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

// Inject relations
injectRelation('Organization', `  marketplaceAccounts MarketplaceAccount[]`);
injectRelation('Store', `  marketplaceShops MarketplaceShop[]`);
injectRelation('Product', `  marketplaceProducts MarketplaceProduct[]`);
injectRelation('ProductVariant', `  marketplaceVariants MarketplaceVariant[]\n  marketplaceInventories MarketplaceInventory[]\n  marketplaceOrderItems MarketplaceOrderItem[]`);
injectRelation('Inventory', `  marketplaceInventories MarketplaceInventory[]`);
injectRelation('SalesOrder', `  marketplaceOrders MarketplaceOrder[]`);
injectRelation('Shipment', `  marketplaceShipments MarketplaceShipment[]`);


const newModels = `
//////////////////////////////////////////////////////
// SPRINT 7: MARKETPLACE INTEGRATION
//////////////////////////////////////////////////////

model Marketplace {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  apiVersion  String?  @map("api_version")
  baseUrl     String?  @map("base_url")
  status      RecordStatus @default(ACTIVE)

  accounts    MarketplaceAccount[]
  webhooks    MarketplaceWebhook[]

  @@map("marketplaces")
}

model MarketplaceAccount {
  id              String       @id @default(uuid())
  organizationId  String       @map("organization_id")
  marketplaceId   String       @map("marketplace_id")
  name            String
  status          RecordStatus @default(ACTIVE)
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
  marketplace     Marketplace  @relation(fields: [marketplaceId], references: [id], onDelete: Restrict)
  
  shops           MarketplaceShop[]
  tokens          MarketplaceToken[]

  @@index([organizationId])
  @@index([marketplaceId])
  @@map("marketplace_accounts")
}

model MarketplaceShop {
  id              String       @id @default(uuid())
  accountId       String       @map("account_id")
  storeId         String       @map("store_id")
  shopId          String       @map("shop_id")
  shopName        String       @map("shop_name")
  country         String?
  currency        String?
  status          RecordStatus @default(ACTIVE)
  
  account         MarketplaceAccount @relation(fields: [accountId], references: [id], onDelete: Restrict)
  store           Store              @relation(fields: [storeId], references: [id], onDelete: Restrict)

  products        MarketplaceProduct[]
  inventories     MarketplaceInventory[]
  orders          MarketplaceOrder[]
  errorLogs       MarketplaceErrorLog[]

  @@index([accountId])
  @@index([storeId])
  @@map("marketplace_shops")
}

model MarketplaceToken {
  id              String   @id @default(uuid())
  accountId       String   @map("account_id")
  accessToken     String   @map("access_token") @db.Text
  refreshToken    String?  @map("refresh_token") @db.Text
  expireAt        DateTime @map("expire_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  account         MarketplaceAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@map("marketplace_tokens")
}

model MarketplaceProduct {
  id                   String   @id @default(uuid())
  shopId               String   @map("shop_id")
  productId            String   @map("product_id")
  marketplaceProductId String   @map("marketplace_product_id")
  status               RecordStatus @default(ACTIVE)

  shop                 MarketplaceShop @relation(fields: [shopId], references: [id], onDelete: Restrict)
  product              Product         @relation(fields: [productId], references: [id], onDelete: Restrict)
  variants             MarketplaceVariant[]

  @@index([shopId])
  @@index([productId])
  @@map("marketplace_products")
}

model MarketplaceVariant {
  id                   String   @id @default(uuid())
  marketplaceProductId String   @map("marketplace_product_id")
  variantId            String   @map("variant_id")
  marketplaceSku       String   @map("marketplace_sku")
  marketplaceVariantId String   @map("marketplace_variant_id")

  marketplaceProduct   MarketplaceProduct @relation(fields: [marketplaceProductId], references: [id], onDelete: Cascade)
  variant              ProductVariant     @relation(fields: [variantId], references: [id], onDelete: Restrict)

  @@index([marketplaceProductId])
  @@index([variantId])
  @@map("marketplace_variants")
}

model MarketplaceInventory {
  id          String   @id @default(uuid())
  variantId   String   @map("variant_id")
  shopId      String   @map("shop_id")
  inventoryId String?  @map("inventory_id")
  stock       Int      @default(0)
  reserved    Int      @default(0)
  lastSync    DateTime? @map("last_sync")

  variant     ProductVariant   @relation(fields: [variantId], references: [id], onDelete: Restrict)
  shop        MarketplaceShop  @relation(fields: [shopId], references: [id], onDelete: Restrict)
  inventory   Inventory?       @relation(fields: [inventoryId], references: [id], onDelete: SetNull)

  @@index([variantId])
  @@index([shopId])
  @@index([inventoryId])
  @@map("marketplace_inventories")
}

model MarketplaceOrder {
  id                 String   @id @default(uuid())
  shopId             String   @map("shop_id")
  salesOrderId       String?  @map("sales_order_id") @unique
  marketplaceOrderId String   @map("marketplace_order_id")
  orderStatus        String   @map("order_status")
  buyerName          String?  @map("buyer_name")
  orderDate          DateTime @map("order_date")
  createdAt          DateTime @default(now()) @map("created_at")

  shop               MarketplaceShop  @relation(fields: [shopId], references: [id], onDelete: Restrict)
  salesOrder         SalesOrder?      @relation(fields: [salesOrderId], references: [id], onDelete: SetNull)
  items              MarketplaceOrderItem[]
  shipments          MarketplaceShipment[]

  @@index([shopId])
  @@map("marketplace_orders")
}

model MarketplaceOrderItem {
  id               String   @id @default(uuid())
  marketplaceOrderId String @map("marketplace_order_id")
  variantId        String   @map("variant_id")
  quantity         Int
  price            Decimal  @db.Decimal(12,2)

  order            MarketplaceOrder @relation(fields: [marketplaceOrderId], references: [id], onDelete: Cascade)
  variant          ProductVariant   @relation(fields: [variantId], references: [id], onDelete: Restrict)

  @@index([marketplaceOrderId])
  @@index([variantId])
  @@map("marketplace_order_items")
}

model MarketplaceShipment {
  id                 String   @id @default(uuid())
  marketplaceOrderId String   @map("marketplace_order_id")
  shipmentId         String?  @map("shipment_id") @unique
  trackingNo         String?  @map("tracking_no")
  carrier            String?
  syncStatus         String   @map("sync_status") @default("PENDING")

  order              MarketplaceOrder @relation(fields: [marketplaceOrderId], references: [id], onDelete: Restrict)
  shipment           Shipment?        @relation(fields: [shipmentId], references: [id], onDelete: SetNull)

  @@index([marketplaceOrderId])
  @@map("marketplace_shipments")
}

model MarketplaceWebhook {
  id            String   @id @default(uuid())
  marketplaceId String   @map("marketplace_id")
  event         String
  payload       Json
  processed     Boolean  @default(false)
  retryCount    Int      @default(0) @map("retry_count")
  createdAt     DateTime @default(now()) @map("created_at")

  marketplace   Marketplace @relation(fields: [marketplaceId], references: [id], onDelete: Restrict)

  @@index([marketplaceId])
  @@map("marketplace_webhooks")
}

model MarketplaceJob {
  id          String   @id @default(uuid())
  type        String
  payload     Json
  status      String   @default("PENDING")
  retry       Int      @default(0)
  startedAt   DateTime? @map("started_at")
  finishedAt  DateTime? @map("finished_at")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("marketplace_jobs")
}

model MarketplaceSyncLog {
  id          String   @id @default(uuid())
  type        String
  direction   String   // INBOUND, OUTBOUND
  status      String
  startedAt   DateTime @default(now()) @map("started_at")
  finishedAt  DateTime? @map("finished_at")
  message     String?  @db.Text

  @@map("marketplace_sync_logs")
}

model MarketplaceErrorLog {
  id          String   @id @default(uuid())
  shopId      String?  @map("shop_id")
  api         String
  request     Json?
  response    Json?
  message     String   @db.Text
  createdAt   DateTime @default(now()) @map("created_at")

  shop        MarketplaceShop? @relation(fields: [shopId], references: [id], onDelete: Cascade)

  @@index([shopId])
  @@map("marketplace_error_logs")
}
`;

schema = schema + '\n' + newModels;
fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Sprint 7 models injected successfully.');
