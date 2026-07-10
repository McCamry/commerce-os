import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PurchaseOrdersService {
  async create(data: any) {
    return prisma.purchaseOrder.create({
      data: {
        organizationId: data.organizationId,
        storeId: data.storeId,
        warehouseId: data.warehouseId,
        vendorId: data.vendorId,
        purchaseNo: data.purchaseNo,
        items: {
          create: data.items.map((item: any) => ({
            variantId: item.variantId,
            unitId: item.unitId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice
          }))
        }
      },
      include: { items: true }
    });
  }

  async findAll(organizationId: string) {
    return prisma.purchaseOrder.findMany({
      where: { organizationId },
      include: { vendor: true, items: true }
    });
  }

  async approve(id: string) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
  }
}
