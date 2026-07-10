import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface GoodsReceiveItemInput {
  purchaseOrderItemId?: string;
  variantId: string;
  unitId: string;
  locationId: string;
  quantity: number;
}

interface CreateGoodsReceiveInput {
  purchaseOrderId: string;
  warehouseId: string;
  receiveNo: string;
  receivedBy: string;
  items: GoodsReceiveItemInput[];
}

@Injectable()
export class GoodsReceivesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateGoodsReceiveInput) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create GoodsReceive
      const grn = await tx.goodsReceive.create({
        data: {
          purchaseOrderId: data.purchaseOrderId,
          warehouseId: data.warehouseId,
          receiveNo: data.receiveNo,
          receivedBy: data.receivedBy,
          status: 'COMPLETED',
          items: {
            create: data.items.map((item) => ({
              purchaseOrderItemId: item.purchaseOrderItemId,
              variantId: item.variantId,
              unitId: item.unitId,
              locationId: item.locationId,
              quantity: item.quantity,
              status: 'COMPLETED',
            })),
          },
        },
        include: { items: true },
      });

      // 2. Update PO status
      await tx.purchaseOrder.update({
        where: { id: data.purchaseOrderId },
        data: { status: 'PARTIALLY_RECEIVED' },
      });

      // 3. Update inventory & create movements
      for (const item of grn.items) {
        // Update PO Item received qty
        if (item.purchaseOrderItemId) {
          await tx.purchaseOrderItem.update({
            where: { id: item.purchaseOrderItemId },
            data: {
              receivedQty: { increment: item.quantity },
              status: 'PARTIALLY_RECEIVED',
            },
          });
        }

        // Inventory movement (goods received into location)
        await tx.inventoryMovement.create({
          data: {
            type: 'PURCHASE_RECEIPT',
            referenceType: 'GRN',
            referenceId: grn.receiveNo,
            toLocationId: item.locationId,
            variantId: item.variantId,
            quantity: item.quantity,
            movedBy: grn.receivedBy,
          },
        });

        // Upsert inventory at the receiving location
        const existingInv = await tx.inventoryLocation.findFirst({
          where: {
            warehouseLocationId: item.locationId,
            productVariantId: item.variantId,
          },
        });

        if (existingInv) {
          await tx.inventoryLocation.update({
            where: { id: existingInv.id },
            data: {
              quantity: { increment: item.quantity },
              availableQty: { increment: item.quantity },
            },
          });
        } else {
          await tx.inventoryLocation.create({
            data: {
              warehouseLocationId: item.locationId,
              productVariantId: item.variantId,
              quantity: item.quantity,
              availableQty: item.quantity,
              reservedQty: 0,
            },
          });
        }
      }

      return grn;
    });
  }
}
