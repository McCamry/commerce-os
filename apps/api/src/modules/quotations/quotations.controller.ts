import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  findAll(
    @Query('organizationId') organizationId: string,
    @Query('storeId') storeId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'organizationId query parameter is required',
      );
    }
    return this.quotationsService.findAll({
      organizationId,
      storeId,
      customerId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateQuotationDto) {
    return this.quotationsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuotationDto) {
    return this.quotationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotationsService.remove(id);
  }
}
