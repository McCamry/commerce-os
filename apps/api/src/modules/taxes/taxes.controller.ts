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
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.taxesService.findAll({ organizationId, status });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.taxesService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreateTaxDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.taxesService.create(dto, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaxDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.taxesService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.taxesService.remove(id, organizationId);
  }
}
