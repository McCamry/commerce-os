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
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('storeId') storeId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return this.quotationsService.findAll({
      organizationId,
      storeId,
      customerId,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.quotationsService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreateQuotationDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.quotationsService.create(dto, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuotationDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.quotationsService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.quotationsService.remove(id, organizationId);
  }
}
