import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './database/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoresModule } from './modules/stores/stores.module';
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { UnitsModule } from './modules/units/units.module';
import { TaxesModule } from './modules/taxes/taxes.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { RolesPermissionsModule } from './modules/roles-permissions/roles-permissions.module';
import { AuthModule } from './modules/auth/auth.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { LocationsModule } from './modules/locations/locations.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { StockTransfersModule } from './modules/stock-transfers/stock-transfers.module';
import { StockAdjustmentsModule } from './modules/stock-adjustments/stock-adjustments.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { PurchaseRequestsModule } from './modules/purchase-requests/purchase-requests.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { GoodsReceivesModule } from './modules/goods-receives/goods-receives.module';
import { PurchaseInvoicesModule } from './modules/purchase-invoices/purchase-invoices.module';
import { PurchaseReturnsModule } from './modules/purchase-returns/purchase-returns.module';
import { CustomersModule } from './modules/customers/customers.module';
import { PriceBooksModule } from './modules/price-books/price-books.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { SalesOrdersModule } from './modules/sales-orders/sales-orders.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { SalesInvoicesModule } from './modules/sales-invoices/sales-invoices.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { SalesReturnsModule } from './modules/sales-returns/sales-returns.module';
import { MarketplacesModule } from './modules/marketplaces/marketplaces.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    StoresModule,
    ProductCategoriesModule,
    BrandsModule,
    UnitsModule,
    TaxesModule,
    ProductsModule,
    UsersModule,
    RolesPermissionsModule,
    AuthModule,
    WarehousesModule,
    LocationsModule,
    InventoryModule,
    StockTransfersModule,
    StockAdjustmentsModule,
    VendorsModule,
    PurchaseRequestsModule,
    PurchaseOrdersModule,
    GoodsReceivesModule,
    PurchaseInvoicesModule,
    PurchaseReturnsModule,
    CustomersModule,
    PriceBooksModule,
    QuotationsModule,
    SalesOrdersModule,
    ShipmentsModule,
    SalesInvoicesModule,
    ReceiptsModule,
    SalesReturnsModule,
    MarketplacesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
