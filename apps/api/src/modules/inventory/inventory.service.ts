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
    const where: Prisma.InventoryLocationWhereInput = {};
    if (warehouseId) where.location = { warehouseId };
    if (variantId) where.productVariantId = variantId;

    const items = await this.prisma.inventoryLocation.findMany({
      where,
      include: {
        variant: true,
        location: { include: { warehouse: true } },
        lot: true,
        serial: true,
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

    const items = await this.prisma.inventoryLocation.findMany({
      where: { productVariantId: variantId },
      include: {
        location: { include: { warehouse: true } },
        lot: true,
        serial: true,
      },
    });
    return items as unknown as Record<string, unknown>[];
  }
}
