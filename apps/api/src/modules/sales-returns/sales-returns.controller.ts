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
import { SalesReturnsService } from './sales-returns.service';
import { CreateSalesReturnDto } from './dto/create-sales-return.dto';
import { UpdateSalesReturnDto } from './dto/update-sales-return.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sales-returns')
export class SalesReturnsController {
  constructor(private readonly salesReturnsService: SalesReturnsService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('salesOrderId') salesOrderId?: string,
    @Query('status') status?: string,
  ) {
    return this.salesReturnsService.findAll({
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
    return this.salesReturnsService.findOne(id, organizationId);
  }

  @Post()
  create(@Body() dto: CreateSalesReturnDto) {
    return this.salesReturnsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSalesReturnDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.salesReturnsService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.salesReturnsService.remove(id, organizationId);
  }
}
