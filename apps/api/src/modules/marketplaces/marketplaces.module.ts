import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CoreService } from './core/core.service';
import { SyncService } from './sync/sync.service';
import { WebhooksController } from './webhooks/webhooks.controller';
import { ShopeeService } from './connectors/shopee/shopee.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'marketplace_sync',
    }),
  ],
  providers: [CoreService, SyncService, ShopeeService],
  controllers: [WebhooksController]
})
export class MarketplacesModule {}
