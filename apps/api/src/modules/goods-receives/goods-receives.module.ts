import { Module } from '@nestjs/common';
import { GoodsReceivesController } from './goods-receives.controller';
import { GoodsReceivesService } from './goods-receives.service';

@Module({
  controllers: [GoodsReceivesController],
  providers: [GoodsReceivesService],
})
export class GoodsReceivesModule {}
