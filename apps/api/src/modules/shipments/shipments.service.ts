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

        // Deduct from Inventory (OnHand & Reserved)
        const inventory = await tx.inventoryLocation.findFirst({
          where: {
            productVariantId: orderItem.variantId,
            location: { warehouseId: shipment.salesOrder.warehouseId },
          },
        });

        if (!inventory) {
          throw new BadRequestException(
            `No inventory record found for variant ${orderItem.variantId}`,
          );
        }

        if (inventory.reservedQty < shipQty) {
          throw new BadRequestException(
            `Insufficient reserved quantity for variant ${orderItem.variantId}`,
          );
        }

        if (inventory.quantity < shipQty) {
          throw new BadRequestException(
            `Insufficient on-hand quantity for variant ${orderItem.variantId}`,
          );
        }

        // Update Inventory
        await tx.inventoryLocation.update({
          where: { id: inventory.id },
          data: {
            quantity: { decrement: shipQty },
            reservedQty: { decrement: shipQty },
          },
        });

        // Create Inventory Movement
        await tx.inventoryMovement.create({
          data: {
            fromLocationId: inventory.warehouseLocationId,
            variantId: orderItem.variantId,
            type: 'SALES_SHIPMENT',
            quantity: -shipQty, // Negative for deduction
            referenceType: 'SHIPMENT',
            referenceId: shipment.id,
            movedBy: performedBy,
          },
        });

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
