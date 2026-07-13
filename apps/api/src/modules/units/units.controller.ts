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
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.unitsService.findAll({ organizationId, status });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.unitsService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreateUnitDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.unitsService.create(dto, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.unitsService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.unitsService.remove(id, organizationId);
  }
}
