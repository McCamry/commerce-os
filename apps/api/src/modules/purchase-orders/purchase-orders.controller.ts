import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.purchaseOrdersService.findAll(organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.purchaseOrdersService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.purchaseOrdersService.create(dto, organizationId);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.purchaseOrdersService.approve(id, organizationId);
  }
}
