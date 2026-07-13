import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PurchaseInvoicesService } from './purchase-invoices.service';
import { CreatePurchaseInvoiceDto } from './dto/create-purchase-invoice.dto';
import { UpdatePurchaseInvoiceDto } from './dto/update-purchase-invoice.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('purchase-invoices')
export class PurchaseInvoicesController {
  constructor(
    private readonly purchaseInvoicesService: PurchaseInvoicesService,
  ) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('vendorId') vendorId?: string,
    @Query('purchaseOrderId') purchaseOrderId?: string,
    @Query('status') status?: string,
  ) {
    return this.purchaseInvoicesService.findAll({
      organizationId,
      vendorId,
      purchaseOrderId,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.purchaseInvoicesService.findOne(id, organizationId);
  }

  @Post()
  create(@Body() dto: CreatePurchaseInvoiceDto) {
    return this.purchaseInvoicesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseInvoiceDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.purchaseInvoicesService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.purchaseInvoicesService.remove(id, organizationId);
  }
}
