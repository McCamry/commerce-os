import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findLevels(
    warehouseId?: string,
    variantId?: string,
  ): Promise<Record<string, unknown>[]> {
    const where: Prisma.InventoryWhereInput = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (variantId) where.variantId = variantId;

    const items = await this.prisma.inventory.findMany({
      where,
      include: {
        variant: true,
        warehouse: true,
        location: true,
        lots: true,
        serials: true,
      },
    });
    return items as unknown as Record<string, unknown>[];
  }

  async findByVariant(variantId: string): Promise<Record<string, unknown>[]> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    const items = await this.prisma.inventory.findMany({
      where: { variantId },
      include: {
        warehouse: true,
        location: true,
        lots: true,
        serials: true,
      },
    });
    return items as unknown as Record<string, unknown>[];
  }
}
