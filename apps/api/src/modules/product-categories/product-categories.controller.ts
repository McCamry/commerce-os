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
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('parentId') parentId?: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.categoriesService.findAll({ organizationId, parentId, status });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.categoriesService.findOne(id, organizationId);
  }

  @Post()
  create(@Body() dto: CreateProductCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductCategoryDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.categoriesService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.categoriesService.remove(id, organizationId);
  }
}
