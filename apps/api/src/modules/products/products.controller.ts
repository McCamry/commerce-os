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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('status') status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    return this.productsService.findAll({
      organizationId,
      categoryId,
      brandId,
      status,
      search,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.productsService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.productsService.create(dto, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.productsService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.productsService.remove(id, organizationId);
  }
}
