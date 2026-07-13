import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: { organizationId: string; status?: 'ACTIVE' | 'INACTIVE' }) {
    const whereClause: Prisma.UnitWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.unit.findMany({
      where: whereClause,
      orderBy: [{ name: 'asc' }],
    });
  }

  async findOne(id: string, organizationId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, organizationId, deletedAt: null },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async create(dto: CreateUnitDto) {
    try {
      return await this.prisma.unit.create({
        data: {
          organizationId: dto.organizationId,
          code: dto.code,
          name: dto.name,
          symbol: dto.symbol,
          status: dto.status || 'ACTIVE',
        },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateUnitDto, organizationId: string) {
    await this.findOne(id, organizationId);

    try {
      return await this.prisma.unit.update({
        where: { id },
        data: {
          code: dto.code,
          name: dto.name,
          symbol: dto.symbol,
          status: dto.status,
        },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.unit.update({
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
        throw new ConflictException('Unit code already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException('Related organization not found');
      }
    }

    throw error;
  }
}
