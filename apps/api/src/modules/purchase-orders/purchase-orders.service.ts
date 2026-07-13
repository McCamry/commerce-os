import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreatePurchaseOrderDto,
  CreatePurchaseOrderItemDto,
} from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePurchaseOrderDto, organizationId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Purchase order must contain at least one item',
      );
    }

    const { items, subtotal } = this.calculate(dto.items);
    const vat = this.round(dto.vat ?? 0);
    const discount = this.round(dto.discount ?? 0);
    const shippingCost = this.round(dto.shippingCost ?? 0);
    const grandTotal = this.round(subtotal + vat + shippingCost - discount);

    try {
      return await this.prisma.purchaseOrder.create({
        data: {
          organizationId,
          storeId: dto.storeId,
          warehouseId: dto.warehouseId,
          vendorId: dto.vendorId,
          purchaseRequestId: dto.purchaseRequestId,
          purchaseNo: dto.purchaseNo,
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
          currency: dto.currency || 'THB',
          subtotal,
          vat,
          discount,
          shippingCost,
          grandTotal,
          remark: dto.remark,
          items: { create: items },
        },
        include: this.orderRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  findAll(organizationId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ purchaseDate: 'desc' }],
      include: { vendor: true, items: true },
    });
  }

  async findOne(id: string, organizationId: string) {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: this.orderRelations(),
    });

    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    return order;
  }

  async approve(id: string, organizationId: string) {
    const order = await this.findOne(id, organizationId);

    if (order.status !== 'DRAFT' && order.status !== 'WAITING_APPROVAL') {
      throw new BadRequestException(
        'Only DRAFT or WAITING_APPROVAL purchase orders can be approved',
      );
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: this.orderRelations(),
    });
  }

  /**
   * Line: lineTotal = quantity * unitPrice.
   * Header: subtotal = Σ lineTotal (vat/discount/shipping applied by caller).
   */
  private calculate(input: CreatePurchaseOrderItemDto[]) {
    let subtotal = 0;

    const items = input.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;

      return {
        variantId: item.variantId,
        unitId: item.unitId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: this.round(item.unitPrice),
        lineTotal: this.round(lineTotal),
      };
    });

    return { items, subtotal: this.round(subtotal) };
  }

  private round(value: number) {
    return Math.round((value + Number.EPSILON) * 10000) / 10000;
  }

  private orderRelations() {
    return {
      vendor: true,
      store: true,
      warehouse: true,
      items: { include: { variant: true, unit: true } },
    } satisfies Prisma.PurchaseOrderInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Purchase order number already exists for this organization',
        );
      }
      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related store, warehouse, vendor, variant, or unit not found',
        );
      }
    }
    throw error;
  }
}
