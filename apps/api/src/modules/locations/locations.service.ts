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

  findAll(filter: { warehouseId: string }) {
    return this.prisma.warehouseLocation.findMany({
      where: { warehouseId: filter.warehouseId },
      orderBy: [{ code: 'asc' }],
      include: { bin: true },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.warehouseLocation.findUnique({
      where: { id },
      include: { bin: true, warehouse: true },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async create(dto: CreateLocationDto) {
    try {
      return await this.prisma.warehouseLocation.create({
        data: {
          warehouseId: dto.warehouseId,
          binId: dto.binId || null,
          code: dto.code.toUpperCase(),
          barcode: dto.barcode,
          status: 'ACTIVE',
        },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateLocationDto) {
    await this.findOne(id);

    try {
      return await this.prisma.warehouseLocation.update({
        where: { id },
        data: {
          code: dto.code ? dto.code.toUpperCase() : undefined,
          barcode: dto.barcode,
          binId: dto.binId,
          status: dto.status,
        },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.warehouseLocation.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Location code or barcode already exists');
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Related warehouse or bin not found');
      }
    }
    throw error;
  }
}
