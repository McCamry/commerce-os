import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    parentId?: string | null;
    status?: 'ACTIVE' | 'INACTIVE';
  }) {
    const whereClause: Prisma.ProductCategoryWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.parentId !== undefined) {
      whereClause.parentId =
        filter.parentId === 'null' ? null : filter.parentId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.productCategory.findMany({
      where: whereClause,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const category = await this.prisma.productCategory.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateProductCategoryDto, organizationId: string) {
    try {
      return await this.prisma.productCategory.create({
        data: {
          organizationId,
          parentId: dto.parentId || null,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          sortOrder: dto.sortOrder || 0,
          status: dto.status || 'ACTIVE',
        },
        include: {
          parent: true,
          children: true,
        },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(
    id: string,
    dto: UpdateProductCategoryDto,
    organizationId: string,
  ) {
    await this.findOne(id, organizationId);

    try {
      return await this.prisma.productCategory.update({
        where: { id },
        data: {
          parentId: dto.parentId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          sortOrder: dto.sortOrder,
          status: dto.status,
        },
        include: {
          parent: true,
          children: true,
        },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.productCategory.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category code already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related organization or parent category not found',
        );
      }
    }

    throw error;
  }
}
