import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ShipmentsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async markAsShipped(shipmentId: string, performedBy: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Fetch Shipment with Items and SalesOrder
      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          items: {
            include: { salesOrderItem: true },
          },
          salesOrder: true,
        },
      });

      if (!shipment) {
        throw new NotFoundException('Shipment not found');
      }

      if (shipment.status !== 'PENDING') {
        throw new BadRequestException('Only PENDING shipments can be shipped');
      }

      if (!shipment.salesOrder.warehouseId) {
        throw new BadRequestException('Sales order has no warehouse assigned');
      }

      // 2. Process each Shipment Item
      for (const item of shipment.items) {
        const orderItem = item.salesOrderItem;
        const shipQty = item.quantity;

        // Gather ALL inventory rows for this variant across the warehouse.
        // Reserved/on-hand stock may be spread over multiple locations/lots,
        // so validate and deduct against the aggregate, oldest stock first.
        const inventories = await tx.inventoryLocation.findMany({
          where: {
            productVariantId: orderItem.variantId,
            location: { warehouseId: shipment.salesOrder.warehouseId },
          },
          orderBy: { lastMovementAt: 'asc' },
        });

        if (inventories.length === 0) {
          throw new BadRequestException(
            `No inventory record found for variant ${orderItem.variantId}`,
          );
        }

        const totalReserved = inventories.reduce(
          (sum, inv) => sum + inv.reservedQty,
          0,
        );
        const totalOnHand = inventories.reduce(
          (sum, inv) => sum + inv.quantity,
          0,
        );

        if (totalReserved < shipQty) {
          throw new BadRequestException(
            `Insufficient reserved quantity for variant ${orderItem.variantId}`,
          );
        }

        if (totalOnHand < shipQty) {
          throw new BadRequestException(
            `Insufficient on-hand quantity for variant ${orderItem.variantId}`,
          );
        }

        // Deduct across the locations holding reserved stock (FIFO)
        let remaining = shipQty;
        for (const inv of inventories) {
          if (remaining <= 0) break;
          const take = Math.min(remaining, inv.reservedQty, inv.quantity);
          if (take <= 0) continue;

          await tx.inventoryLocation.update({
            where: { id: inv.id },
            data: {
              quantity: { decrement: take },
              reservedQty: { decrement: take },
              lastMovementAt: new Date(),
            },
          });

          await tx.inventoryMovement.create({
            data: {
              fromLocationId: inv.warehouseLocationId,
              variantId: orderItem.variantId,
              lotId: inv.lotId,
              serialId: inv.serialId,
              type: 'SALES_SHIPMENT',
              quantity: -take, // Negative for deduction
              referenceType: 'SHIPMENT',
              referenceId: shipment.id,
              movedBy: performedBy,
            },
          });

          remaining -= take;
        }

        // Update Order Item shippedQty
        await tx.salesOrderItem.update({
          where: { id: orderItem.id },
          data: { shippedQty: { increment: shipQty } },
        });
      }

      // 3. Update Shipment Status
      await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: 'SHIPPED' },
      });

      // 4. Check if Order is completely shipped
      const allOrderItems = await tx.salesOrderItem.findMany({
        where: { salesOrderId: shipment.salesOrderId },
      });

      const isComplete = allOrderItems.every((i) => i.shippedQty >= i.quantity);

      await tx.salesOrder.update({
        where: { id: shipment.salesOrderId },
        data: { status: isComplete ? 'COMPLETED' : 'SHIPPED' },
      });

      return { success: true, shipment };
    });

    this.eventEmitter.emit('shipment.shipped', result.shipment);
    return result;
  }
}
