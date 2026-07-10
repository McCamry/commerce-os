import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';

@Injectable()
export class StockAdjustmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: { warehouseId?: string }) {
    const where: Prisma.StockAdjustmentWhereInput = {};
    if (filter.warehouseId) {
      where.warehouseId = filter.warehouseId;
    }
    return this.prisma.stockAdjustment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        warehouse: true,
        items: {
          include: {
            variant: true,
            location: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const adj = await this.prisma.stockAdjustment.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: {
          include: {
            variant: true,
            location: true,
          },
        },
      },
    });
    if (!adj) {
      throw new NotFoundException('Stock adjustment document not found');
    }
    return adj;
  }

  async create(dto: CreateStockAdjustmentDto, userId: string) {
    const created = await this.prisma.$transaction(async (tx) => {
      const adjustment = await tx.stockAdjustment.create({
        data: {
          warehouseId: dto.warehouseId,
          reason: dto.reason || null,
          createdBy: userId,
          status: 'DRAFT',
        },
      });

      for (const item of dto.items) {
        const stock = await tx.inventoryLocation.findFirst({
          where: {
            productVariantId: item.variantId,
            warehouseLocationId: item.warehouseLocationId,
          },
        });

        const beforeQty = stock ? stock.quantity : 0;
        const difference = item.countQty - beforeQty;

        await tx.stockAdjustmentItem.create({
          data: {
            adjustmentId: adjustment.id,
            variantId: item.variantId,
            warehouseLocationId: item.warehouseLocationId,
            beforeQty,
            afterQty: item.countQty,
            difference,
          },
        });
      }

      return tx.stockAdjustment.findUnique({
        where: { id: adjustment.id },
        include: { items: true },
      });
    });

    if (!created) {
      throw new BadRequestException('Failed to create stock adjustment');
    }
    return created;
  }

  async complete(id: string, userId: string) {
    const adj = await this.findOne(id);
    if (adj.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT adjustments can be completed');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      for (const item of adj.items) {
        const stock = await tx.inventoryLocation.findFirst({
          where: {
            productVariantId: item.variantId,
            warehouseLocationId: item.warehouseLocationId,
          },
        });

        if (stock) {
          await tx.inventoryLocation.update({
            where: { id: stock.id },
            data: {
              quantity: item.afterQty,
              availableQty: item.afterQty - stock.reservedQty,
            },
          });
        } else {
          await tx.inventoryLocation.create({
            data: {
              productVariantId: item.variantId,
              warehouseLocationId: item.warehouseLocationId,
              quantity: item.afterQty,
              availableQty: item.afterQty,
            },
          });
        }

        if (item.difference !== 0) {
          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              toLocationId: item.warehouseLocationId,
              type: 'ADJUST',
              quantity: item.difference,
              referenceType: 'STOCK_ADJUSTMENT',
              referenceId: adj.id,
              movedBy: userId,
            },
          });
        }
      }

      return tx.stockAdjustment.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: { items: true },
      });
    });

    if (!updated) {
      throw new BadRequestException('Failed to complete stock adjustment');
    }
    return updated;
  }
}
