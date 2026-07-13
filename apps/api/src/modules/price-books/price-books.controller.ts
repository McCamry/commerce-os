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
import { PriceBooksService } from './price-books.service';
import { CreatePriceBookDto } from './dto/create-price-book.dto';
import { UpdatePriceBookDto } from './dto/update-price-book.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('price-books')
export class PriceBooksController {
  constructor(private readonly priceBooksService: PriceBooksService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('customerGroupId') customerGroupId?: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.priceBooksService.findAll({
      organizationId,
      customerGroupId,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.priceBooksService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreatePriceBookDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.priceBooksService.create(dto, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePriceBookDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.priceBooksService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.priceBooksService.remove(id, organizationId);
  }
}
