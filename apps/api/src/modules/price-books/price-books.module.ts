import { Module } from '@nestjs/common';
import { PriceBooksController } from './price-books.controller';
import { PriceBooksService } from './price-books.service';

@Module({
  controllers: [PriceBooksController],
  providers: [PriceBooksService],
})
export class PriceBooksModule {}
