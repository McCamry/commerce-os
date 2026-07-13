import { Controller, Param, Post } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.salesOrdersService.confirmOrder(id, userId);
  }
}
