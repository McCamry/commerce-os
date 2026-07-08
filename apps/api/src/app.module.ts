import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
