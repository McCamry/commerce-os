import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SalesOrdersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async confirmOrder(orderId: string, performedBy: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Fetch Order and Items
      const order = await tx.salesOrder.findUnique({
        where: { id: orderId },
        include: { items: true, customer: true },
      });

      if (!order) {
        throw new NotFoundException('Sales Order not found');
      }

      if (order.status !== 'DRAFT') {
        throw new BadRequestException('Only DRAFT orders can be confirmed');
      }

      if (!order.warehouseId) {
        throw new BadRequestException(
          'Warehouse must be assigned before confirmation',
        );
      }

      // 2. Check Customer Credit Limit (if they have one)
      if (order.customer.creditLimit) {
        // Calculate total unpaid invoices
        const unpaidInvoices = await tx.salesInvoice.aggregate({
          where: {
            salesOrder: { customerId: order.customerId },
            status: 'PENDING',
          },
          _sum: { grandTotal: true },
        });

        const currentDebt = unpaidInvoices._sum.grandTotal || 0;
        const newDebt = Number(currentDebt) + Number(order.grandTotal);

        if (newDebt > Number(order.customer.creditLimit)) {
          throw new BadRequestException(
            `Credit limit exceeded. Limit: ${Number(order.customer.creditLimit)}, New Total Debt: ${newDebt}`,
          );
        }
      }

      // 3. Process each item for Reservation and Backorder
      let allItemsReserved = true;

      for (const item of order.items) {
        // Find inventory for this variant at the selected warehouse
        const inventory = await tx.inventoryLocation.findFirst({
          where: {
            productVariantId: item.variantId,
            location: { warehouseId: order.warehouseId },
          },
        });

        if (!inventory) {
          throw new BadRequestException(
            `No inventory record found for variant ${item.variantId} in this warehouse`,
          );
        }

        const availableQty = inventory.availableQty;
        const requiredQty = item.quantity;

        let reservedQty = 0;
        if (availableQty >= requiredQty) {
          reservedQty = requiredQty;
        } else {
          reservedQty = availableQty; // Reserve whatever is left
          allItemsReserved = false;
        }

        // Update Order Item
        await tx.salesOrderItem.update({
          where: { id: item.id },
          data: { reservedQty },
        });

        // Update Inventory if we reserved anything
        if (reservedQty > 0) {
          await tx.inventoryLocation.update({
            where: { id: inventory.id },
            data: {
              availableQty: { decrement: reservedQty },
              reservedQty: { increment: reservedQty },
            },
          });

          // Create Inventory Movement
          await tx.inventoryMovement.create({
            data: {
              toLocationId: inventory.warehouseLocationId,
              variantId: item.variantId,
              type: 'SALES_RESERVE',
              quantity: reservedQty,
              referenceType: 'SALES_ORDER',
              referenceId: order.id,
              movedBy: performedBy,
            },
          });
        }
      }

      // 4. Update Order Status
      const newStatus = allItemsReserved ? 'RESERVED' : 'BACKORDERED';

      const updatedOrder = await tx.salesOrder.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      return updatedOrder;
    });

    this.eventEmitter.emit('sales-order.confirmed', result);
    return result;
  }
}
