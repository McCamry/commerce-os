import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Get()
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.salesOrdersService.findAll(organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.salesOrdersService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreateSalesOrderDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.salesOrdersService.create(dto, organizationId);
  }

  @Post(':id/confirm')
  confirm(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; organizationId: string },
  ) {
    return this.salesOrdersService.confirmOrder(
      id,
      user.userId,
      user.organizationId,
    );
  }
}
