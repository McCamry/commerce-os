import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: {
    organizationId: string;
    storeId?: string;
  }): Promise<Record<string, unknown>[]> {
    const whereClause: Prisma.WarehouseWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.storeId) {
      whereClause.storeId = filter.storeId;
    }

    const whs = await this.prisma.warehouse.findMany({
      where: whereClause,
      orderBy: [{ code: 'asc' }],
    });
    return whs as unknown as Record<string, unknown>[];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const wh = await this.prisma.warehouse.findFirst({
      where: { id, deletedAt: null },
    });
    if (!wh) {
      throw new NotFoundException('Warehouse not found');
    }
    return wh as unknown as Record<string, unknown>;
  }

  async create(dto: CreateWarehouseDto): Promise<Record<string, unknown>> {
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        if (dto.isDefault) {
          // Clear default flag on existing store warehouses
          await tx.warehouse.updateMany({
            where: { storeId: dto.storeId, isDefault: true },
            data: { isDefault: false },
          });
        }

        return await tx.warehouse.create({
          data: {
            organizationId: dto.organizationId,
            storeId: dto.storeId,
            code: dto.code.toUpperCase(),
            name: dto.name,
            description: dto.description || null,
            isDefault: dto.isDefault || false,
            status: 'ACTIVE',
          },
        });
      });
      return created as unknown as Record<string, unknown>;
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(
    id: string,
    dto: UpdateWarehouseDto,
  ): Promise<Record<string, unknown>> {
    const wh = await this.findOne(id);

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        if (dto.isDefault) {
          await tx.warehouse.updateMany({
            where: { storeId: String(wh.storeId), isDefault: true },
            data: { isDefault: false },
          });
        }

        return await tx.warehouse.update({
          where: { id },
          data: {
            name: dto.name,
            description: dto.description,
            isDefault: dto.isDefault,
            status: dto.status,
          },
        });
      });
      return updated as unknown as Record<string, unknown>;
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string): Promise<Record<string, unknown>> {
    await this.findOne(id);

    const removed = await this.prisma.warehouse.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
    return removed as unknown as Record<string, unknown>;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Warehouse code already exists under this organization',
        );
      }
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related organization or store reference not found',
        );
      }
    }
    throw error;
  }
}
