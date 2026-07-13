import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: {
    organizationId: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) {
    const whereClause: Prisma.TaxWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.status) {
      whereClause.status = filter.status;
    }

    const taxes = await this.prisma.tax.findMany({
      where: whereClause,
      orderBy: [{ rate: 'asc' }],
    });

    return taxes.map((t) => ({
      ...t,
      rate: Number(t.rate),
    }));
  }

  async findOne(id: string, organizationId: string) {
    const tax = await this.prisma.tax.findFirst({
      where: { id, organizationId, deletedAt: null },
    });

    if (!tax) {
      throw new NotFoundException('Tax not found');
    }

    return {
      ...tax,
      rate: Number(tax.rate),
    };
  }

  async create(dto: CreateTaxDto, organizationId: string) {
    try {
      const tax = await this.prisma.tax.create({
        data: {
          organizationId,
          code: dto.code,
          name: dto.name,
          rate: new Prisma.Decimal(dto.rate),
          status: dto.status || 'ACTIVE',
        },
      });

      return {
        ...tax,
        rate: Number(tax.rate),
      };
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateTaxDto, organizationId: string) {
    await this.findOne(id, organizationId);

    try {
      const data: Prisma.TaxUpdateInput = {
        code: dto.code,
        name: dto.name,
        status: dto.status,
      };

      if (dto.rate !== undefined) {
        data.rate = new Prisma.Decimal(dto.rate);
      }

      const tax = await this.prisma.tax.update({
        where: { id },
        data,
      });

      return {
        ...tax,
        rate: Number(tax.rate),
      };
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    const tax = await this.prisma.tax.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });

    return {
      ...tax,
      rate: Number(tax.rate),
    };
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Tax code already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException('Related organization not found');
      }
    }

    throw error;
  }
}
