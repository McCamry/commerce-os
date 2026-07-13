import { Module } from '@nestjs/common';
import { StockAdjustmentsService } from './stock-adjustments.service';
import { StockAdjustmentsController } from './stock-adjustments.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [StockAdjustmentsService],
  controllers: [StockAdjustmentsController],
  exports: [StockAdjustmentsService],
})
export class StockAdjustmentsModule {}
