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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('warehouseId') warehouseId: string,
  ) {
    if (!warehouseId) {
      throw new BadRequestException('warehouseId query parameter is required');
    }
    return this.locationsService.findAll({ warehouseId, organizationId });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.locationsService.findOne(id, organizationId);
  }

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.locationsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.locationsService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.locationsService.remove(id, organizationId);
  }
}
