import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateStockTransferDto } from './dto/create-stock-transfer.dto';

@Injectable()
export class StockTransfersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: { organizationId: string; warehouseId?: string }) {
    // Scope to transfers where either endpoint warehouse belongs to the org.
    const where: Prisma.StockTransferWhereInput = {
      OR: [
        { fromWarehouse: { organizationId: filter.organizationId } },
        { toWarehouse: { organizationId: filter.organizationId } },
      ],
    };
    if (filter.warehouseId) {
      where.AND = {
        OR: [
          { fromWarehouseId: filter.warehouseId },
          { toWarehouseId: filter.warehouseId },
        ],
      };
    }
    return this.prisma.stockTransfer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: {
            variant: true,
            fromLocation: true,
            toLocation: true,
          },
        },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const transfer = await this.prisma.stockTransfer.findFirst({
      where: {
        id,
        OR: [
          { fromWarehouse: { organizationId } },
          { toWarehouse: { organizationId } },
        ],
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: {
            variant: true,
            fromLocation: true,
            toLocation: true,
          },
        },
      },
    });
    if (!transfer) {
      throw new NotFoundException('Stock transfer document not found');
    }
    return transfer;
  }

  async create(dto: CreateStockTransferDto, userId: string) {
    const created = await this.prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.create({
        data: {
          fromWarehouseId: dto.fromWarehouseId,
          toWarehouseId: dto.toWarehouseId,
          createdBy: userId,
          status: 'DRAFT',
        },
      });

      await tx.stockTransferItem.createMany({
        data: dto.items.map((item) => ({
          transferId: transfer.id,
          variantId: item.variantId,
          fromLocationId: item.fromLocationId,
          toLocationId: item.toLocationId,
          quantity: item.quantity,
        })),
      });

      return tx.stockTransfer.findUnique({
        where: { id: transfer.id },
        include: { items: true },
      });
    });

    if (!created) {
      throw new BadRequestException('Failed to create stock transfer');
    }
    return created;
  }

  async approve(id: string, organizationId: string) {
    const transfer = await this.findOne(id, organizationId);
    if (transfer.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT transfers can be approved');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const stock = await tx.inventoryLocation.findFirst({
          where: {
            productVariantId: item.variantId,
            warehouseLocationId: item.fromLocationId,
          },
        });

        const available = stock ? stock.quantity - stock.reservedQty : 0;
        if (available < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for SKU ${item.variant.sku} in source location. Available: ${available}, Required: ${item.quantity}`,
          );
        }

        await tx.inventoryLocation.update({
          where: { id: stock!.id },
          data: {
            reservedQty: { increment: item.quantity },
            availableQty: { decrement: item.quantity },
          },
        });
      }

      return tx.stockTransfer.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: { items: true },
      });
    });

    if (!updated) {
      throw new BadRequestException('Failed to approve stock transfer');
    }
    return updated;
  }

  async complete(id: string, userId: string, organizationId: string) {
    const transfer = await this.findOne(id, organizationId);
    if (transfer.status !== 'APPROVED') {
      throw new BadRequestException('Only APPROVED transfers can be completed');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const sourceStock = await tx.inventoryLocation.findFirst({
          where: {
            productVariantId: item.variantId,
            warehouseLocationId: item.fromLocationId,
          },
        });

        if (!sourceStock) {
          throw new BadRequestException('Source stock not found');
        }

        await tx.inventoryLocation.update({
          where: { id: sourceStock.id },
          data: {
            quantity: { decrement: item.quantity },
            reservedQty: { decrement: item.quantity },
          },
        });

        const destStock = await tx.inventoryLocation.findFirst({
          where: {
            productVariantId: item.variantId,
            warehouseLocationId: item.toLocationId,
          },
        });

        if (destStock) {
          await tx.inventoryLocation.update({
            where: { id: destStock.id },
            data: {
              quantity: { increment: item.quantity },
              availableQty: { increment: item.quantity },
            },
          });
        } else {
          await tx.inventoryLocation.create({
            data: {
              productVariantId: item.variantId,
              warehouseLocationId: item.toLocationId,
              quantity: item.quantity,
              availableQty: item.quantity,
            },
          });
        }

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            fromLocationId: item.fromLocationId,
            type: 'TRANSFER',
            quantity: -item.quantity,
            referenceType: 'STOCK_TRANSFER',
            referenceId: transfer.id,
            movedBy: userId,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            toLocationId: item.toLocationId,
            type: 'TRANSFER',
            quantity: item.quantity,
            referenceType: 'STOCK_TRANSFER',
            referenceId: transfer.id,
            movedBy: userId,
          },
        });
      }

      return tx.stockTransfer.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: { items: true },
      });
    });

    if (!updated) {
      throw new BadRequestException('Failed to complete stock transfer');
    }
    return updated;
  }

  async cancel(id: string, organizationId: string) {
    const transfer = await this.findOne(id, organizationId);
    if (transfer.status === 'COMPLETED' || transfer.status === 'CANCELLED') {
      throw new BadRequestException(
        'Completed or cancelled transfers cannot be cancelled',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (transfer.status === 'APPROVED') {
        for (const item of transfer.items) {
          const sourceStock = await tx.inventoryLocation.findFirst({
            where: {
              productVariantId: item.variantId,
              warehouseLocationId: item.fromLocationId,
            },
          });

          if (sourceStock) {
            await tx.inventoryLocation.update({
              where: { id: sourceStock.id },
              data: {
                reservedQty: { decrement: item.quantity },
                availableQty: { increment: item.quantity },
              },
            });
          }
        }
      }

      return tx.stockTransfer.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { items: true },
      });
    });

    if (!updated) {
      throw new BadRequestException('Failed to cancel stock transfer');
    }
    return updated;
  }
}
