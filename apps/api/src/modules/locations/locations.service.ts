import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: {
    warehouseId: string;
  }): Promise<Record<string, unknown>[]> {
    const locations = await this.prisma.location.findMany({
      where: { warehouseId: filter.warehouseId, deletedAt: null },
      orderBy: [{ pickingRouteOrder: 'asc' }, { code: 'asc' }],
      include: {
        parent: true,
      },
    });

    return locations.map((loc) =>
      this.mapLocationDecimals(loc as unknown as Record<string, unknown>),
    );
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const loc = await this.prisma.location.findFirst({
      where: { id, deletedAt: null },
      include: {
        parent: true,
      },
    });
    if (!loc) {
      throw new NotFoundException('Location not found');
    }
    return this.mapLocationDecimals(loc as unknown as Record<string, unknown>);
  }

  async create(dto: CreateLocationDto): Promise<Record<string, unknown>> {
    try {
      const loc = await this.prisma.location.create({
        data: {
          warehouseId: dto.warehouseId,
          parentId: dto.parentId || null,
          code: dto.code.toUpperCase(),
          name: dto.name,
          allowPicking:
            dto.allowPicking !== undefined ? dto.allowPicking : true,
          allowReceiving:
            dto.allowReceiving !== undefined ? dto.allowReceiving : true,
          maxCapacity: dto.maxCapacity
            ? new Prisma.Decimal(dto.maxCapacity)
            : null,
          pickingRouteOrder: dto.pickingRouteOrder || 0,
          status: 'ACTIVE',
        },
      });
      return this.mapLocationDecimals(
        loc as unknown as Record<string, unknown>,
      );
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(
    id: string,
    dto: UpdateLocationDto,
  ): Promise<Record<string, unknown>> {
    await this.findOne(id);

    const updateData: Prisma.LocationUpdateInput = {
      name: dto.name,
      allowPicking: dto.allowPicking,
      allowReceiving: dto.allowReceiving,
      pickingRouteOrder: dto.pickingRouteOrder,
      status: dto.status,
    };

    if (dto.maxCapacity !== undefined) {
      updateData.maxCapacity = dto.maxCapacity
        ? new Prisma.Decimal(dto.maxCapacity)
        : null;
    }

    try {
      const loc = await this.prisma.location.update({
        where: { id },
        data: updateData,
      });
      return this.mapLocationDecimals(
        loc as unknown as Record<string, unknown>,
      );
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string): Promise<Record<string, unknown>> {
    await this.findOne(id);

    const loc = await this.prisma.location.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
    return this.mapLocationDecimals(loc as unknown as Record<string, unknown>);
  }

  private mapLocationDecimals(
    loc: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      ...loc,
      maxCapacity: loc.maxCapacity ? Number(loc.maxCapacity) : null,
    };
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Location code already exists under this warehouse',
        );
      }
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related warehouse or parent location not found',
        );
      }
    }
    throw error;
  }
}
