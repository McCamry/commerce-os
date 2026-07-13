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
import { SalesInvoicesService } from './sales-invoices.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from './dto/update-sales-invoice.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sales-invoices')
export class SalesInvoicesController {
  constructor(private readonly salesInvoicesService: SalesInvoicesService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('salesOrderId') salesOrderId?: string,
    @Query('status') status?: string,
  ) {
    return this.salesInvoicesService.findAll({
      organizationId,
      salesOrderId,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.salesInvoicesService.findOne(id, organizationId);
  }

  @Post()
  create(@Body() dto: CreateSalesInvoiceDto) {
    return this.salesInvoicesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSalesInvoiceDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.salesInvoicesService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.salesInvoicesService.remove(id, organizationId);
  }
}
