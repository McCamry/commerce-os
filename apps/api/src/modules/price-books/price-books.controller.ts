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
import { PriceBooksService } from './price-books.service';
import { CreatePriceBookDto } from './dto/create-price-book.dto';
import { UpdatePriceBookDto } from './dto/update-price-book.dto';

@Controller('price-books')
export class PriceBooksController {
  constructor(private readonly priceBooksService: PriceBooksService) {}

  @Get()
  findAll(
    @Query('organizationId') organizationId: string,
    @Query('customerGroupId') customerGroupId?: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ) {
    if (!organizationId) {
      throw new BadRequestException(
        'organizationId query parameter is required',
      );
    }
    return this.priceBooksService.findAll({
      organizationId,
      customerGroupId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceBooksService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePriceBookDto) {
    return this.priceBooksService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePriceBookDto) {
    return this.priceBooksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priceBooksService.remove(id);
  }
}
