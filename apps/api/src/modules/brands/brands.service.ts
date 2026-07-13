import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: { organizationId: string; status?: 'ACTIVE' | 'INACTIVE' }) {
    const whereClause: Prisma.BrandWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.brand.findMany({
      where: whereClause,
      orderBy: [{ name: 'asc' }],
    });
  }

  async findOne(id: string, organizationId: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { id, organizationId, deletedAt: null },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async create(dto: CreateBrandDto, organizationId: string) {
    try {
      return await this.prisma.brand.create({
        data: {
          organizationId,
          code: dto.code,
          name: dto.name,
          logo: dto.logo,
          website: dto.website,
          status: dto.status || 'ACTIVE',
        },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateBrandDto, organizationId: string) {
    await this.findOne(id, organizationId);

    try {
      return await this.prisma.brand.update({
        where: { id },
        data: {
          code: dto.code,
          name: dto.name,
          logo: dto.logo,
          website: dto.website,
          status: dto.status,
        },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.brand.update({
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
        throw new ConflictException('Brand code already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException('Related organization not found');
      }
    }

    throw error;
  }
}
