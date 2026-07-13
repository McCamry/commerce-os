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
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('salesInvoiceId') salesInvoiceId?: string,
    @Query('status') status?: string,
  ) {
    return this.receiptsService.findAll({
      organizationId,
      salesInvoiceId,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.receiptsService.findOne(id, organizationId);
  }

  @Post()
  create(@Body() dto: CreateReceiptDto) {
    return this.receiptsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReceiptDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.receiptsService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.receiptsService.remove(id, organizationId);
  }
}
