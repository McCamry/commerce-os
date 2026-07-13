import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface GoodsReceiveItemInput {
  purchaseOrderItemId?: string;
  variantId: string;
  unitId: string;
  locationId: string;
  quantity: number;
  lotNumber?: string;
  serialNumber?: string;
  manufactureDate?: string;
  expireDate?: string;
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
      // 1. Resolve lot / serial records up front (create-or-reuse per variant)
      //    so received stock is tracked against the correct lot/serial and
      //    lands in a lot/serial-specific InventoryLocation row.
      const resolvedItems = [] as (GoodsReceiveItemInput & {
        lotId: string | null;
        serialId: string | null;
      })[];

      for (const item of data.items) {
        let lotId: string | null = null;
        let serialId: string | null = null;

        if (item.lotNumber) {
          const existingLot = await tx.inventoryLot.findFirst({
            where: { variantId: item.variantId, lotNumber: item.lotNumber },
          });
          lotId = existingLot
            ? existingLot.id
            : (
                await tx.inventoryLot.create({
                  data: {
                    variantId: item.variantId,
                    lotNumber: item.lotNumber,
                    manufactureDate: item.manufactureDate
                      ? new Date(item.manufactureDate)
                      : null,
                    expireDate: item.expireDate
                      ? new Date(item.expireDate)
                      : null,
                  },
                })
              ).id;
        }

        if (item.serialNumber) {
          const serial = await tx.inventorySerial.upsert({
            where: {
              variantId_serialNumber: {
                variantId: item.variantId,
                serialNumber: item.serialNumber,
              },
            },
            update: {},
            create: {
              variantId: item.variantId,
              serialNumber: item.serialNumber,
            },
          });
          serialId = serial.id;
        }

        resolvedItems.push({ ...item, lotId, serialId });
      }

      // 2. Create GoodsReceive (persisting the lot/serial numbers on each line)
      const grn = await tx.goodsReceive.create({
        data: {
          purchaseOrderId: data.purchaseOrderId,
          warehouseId: data.warehouseId,
          receiveNo: data.receiveNo,
          receivedBy: data.receivedBy,
          status: 'COMPLETED',
          items: {
            create: resolvedItems.map((item) => ({
              purchaseOrderItemId: item.purchaseOrderItemId,
              variantId: item.variantId,
              unitId: item.unitId,
              locationId: item.locationId,
              lotNumber: item.lotNumber,
              serialNumber: item.serialNumber,
              quantity: item.quantity,
              status: 'COMPLETED',
            })),
          },
        },
        include: { items: true },
      });

      // 3. Update PO status
      await tx.purchaseOrder.update({
        where: { id: data.purchaseOrderId },
        data: { status: 'PARTIALLY_RECEIVED' },
      });

      // 4. Update inventory & create movements
      for (const item of resolvedItems) {
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
            lotId: item.lotId,
            serialId: item.serialId,
            quantity: item.quantity,
            movedBy: grn.receivedBy,
          },
        });

        // Upsert inventory at the receiving location, keyed by lot & serial so
        // distinct lots/serials never collapse into a single stock row.
        const existingInv = await tx.inventoryLocation.findFirst({
          where: {
            warehouseLocationId: item.locationId,
            productVariantId: item.variantId,
            lotId: item.lotId,
            serialId: item.serialId,
          },
        });

        if (existingInv) {
          await tx.inventoryLocation.update({
            where: { id: existingInv.id },
            data: {
              quantity: { increment: item.quantity },
              availableQty: { increment: item.quantity },
              lastMovementAt: new Date(),
            },
          });
        } else {
          await tx.inventoryLocation.create({
            data: {
              warehouseLocationId: item.locationId,
              productVariantId: item.variantId,
              lotId: item.lotId,
              serialId: item.serialId,
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
