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
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get()
  findAll(
    @Query('organizationId') organizationId: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'organizationId query parameter is required',
      );
    }
    return this.taxesService.findAll({ organizationId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTaxDto) {
    return this.taxesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaxDto) {
    return this.taxesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taxesService.remove(id);
  }
}
