import { Module } from '@nestjs/common';
import { StockTransfersService } from './stock-transfers.service';
import { StockTransfersController } from './stock-transfers.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [StockTransfersService],
  controllers: [StockTransfersController],
  exports: [StockTransfersService],
})
export class StockTransfersModule {}
