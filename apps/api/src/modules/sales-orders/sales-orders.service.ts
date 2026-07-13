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
        // Gather ALL inventory rows for this variant across the warehouse
        // (stock may be spread over multiple locations/lots). Reserve against
        // the aggregate availability, oldest stock first (FIFO).
        const inventories = await tx.inventoryLocation.findMany({
          where: {
            productVariantId: item.variantId,
            location: { warehouseId: order.warehouseId },
          },
          orderBy: { lastMovementAt: 'asc' },
        });

        if (inventories.length === 0) {
          throw new BadRequestException(
            `No inventory record found for variant ${item.variantId} in this warehouse`,
          );
        }

        const totalAvailable = inventories.reduce(
          (sum, inv) => sum + inv.availableQty,
          0,
        );
        const requiredQty = item.quantity;
        const reservedQty = Math.min(totalAvailable, requiredQty);

        if (reservedQty < requiredQty) {
          allItemsReserved = false; // Partial reservation → backorder
        }

        // Distribute the reservation across locations (greedy, FIFO)
        let remaining = reservedQty;
        for (const inv of inventories) {
          if (remaining <= 0) break;
          const take = Math.min(remaining, inv.availableQty);
          if (take <= 0) continue;

          await tx.inventoryLocation.update({
            where: { id: inv.id },
            data: {
              availableQty: { decrement: take },
              reservedQty: { increment: take },
              lastMovementAt: new Date(),
            },
          });

          await tx.inventoryMovement.create({
            data: {
              toLocationId: inv.warehouseLocationId,
              variantId: item.variantId,
              lotId: inv.lotId,
              serialId: inv.serialId,
              type: 'SALES_RESERVE',
              quantity: take,
              referenceType: 'SALES_ORDER',
              referenceId: order.id,
              movedBy: performedBy,
            },
          });

          remaining -= take;
        }

        // Record the total reserved against the order item
        await tx.salesOrderItem.update({
          where: { id: item.id },
          data: { reservedQty },
        });
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
