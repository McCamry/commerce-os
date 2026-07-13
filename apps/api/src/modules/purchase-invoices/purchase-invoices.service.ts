import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreatePurchaseInvoiceDto,
  CreatePurchaseInvoiceItemDto,
} from './dto/create-purchase-invoice.dto';
import { UpdatePurchaseInvoiceDto } from './dto/update-purchase-invoice.dto';

@Injectable()
export class PurchaseInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    vendorId?: string;
    purchaseOrderId?: string;
    status?: string;
  }) {
    const whereClause: Prisma.PurchaseInvoiceWhereInput = {
      deletedAt: null,
      vendor: { organizationId: filter.organizationId },
    };

    if (filter.vendorId) {
      whereClause.vendorId = filter.vendorId;
    }

    if (filter.purchaseOrderId) {
      whereClause.purchaseOrderId = filter.purchaseOrderId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.purchaseInvoice.findMany({
      where: whereClause,
      orderBy: [{ invoiceDate: 'desc' }],
      include: { vendor: true },
    });
  }

  async findOne(id: string, organizationId: string) {
    const invoice = await this.prisma.purchaseInvoice.findFirst({
      where: { id, deletedAt: null, vendor: { organizationId } },
      include: this.invoiceRelations(),
    });

    if (!invoice) {
      throw new NotFoundException('Purchase invoice not found');
    }

    return invoice;
  }

  async create(dto: CreatePurchaseInvoiceDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Purchase invoice must contain at least one item',
      );
    }

    const { items, subtotal, grandTotal } = this.calculate(dto.items, dto.vat);

    try {
      return await this.prisma.purchaseInvoice.create({
        data: {
          vendorId: dto.vendorId,
          purchaseOrderId: dto.purchaseOrderId,
          invoiceNo: dto.invoiceNo,
          invoiceDate: new Date(dto.invoiceDate),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          subtotal,
          vat: this.round(dto.vat ?? 0),
          grandTotal,
          items: { create: items },
        },
        include: this.invoiceRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(
    id: string,
    dto: UpdatePurchaseInvoiceDto,
    organizationId: string,
  ) {
    const existing = await this.findOne(id, organizationId);

    const data: Prisma.PurchaseInvoiceUpdateInput = {
      invoiceNo: dto.invoiceNo,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
      dueDate:
        dto.dueDate === null
          ? null
          : dto.dueDate
            ? new Date(dto.dueDate)
            : undefined,
      status: dto.status,
    };

    try {
      if (dto.items) {
        if (dto.items.length === 0) {
          throw new BadRequestException(
            'Purchase invoice must contain at least one item',
          );
        }

        const vat = dto.vat ?? Number(existing.vat);
        const { items, subtotal, grandTotal } = this.calculate(dto.items, vat);
        data.subtotal = subtotal;
        data.vat = this.round(vat);
        data.grandTotal = grandTotal;

        return await this.prisma.$transaction(async (tx) => {
          await tx.purchaseInvoiceItem.deleteMany({
            where: { purchaseInvoiceId: id },
          });
          return tx.purchaseInvoice.update({
            where: { id },
            data: { ...data, items: { create: items } },
            include: this.invoiceRelations(),
          });
        });
      }

      // Recompute grandTotal if only vat changed.
      if (dto.vat !== undefined) {
        data.vat = this.round(dto.vat);
        data.grandTotal = this.round(Number(existing.subtotal) + dto.vat);
      }

      return await this.prisma.purchaseInvoice.update({
        where: { id },
        data,
        include: this.invoiceRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.purchaseInvoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Line: lineTotal = quantity * unitPrice.
   * Header: subtotal = Σ lineTotal; grandTotal = subtotal + vat.
   */
  private calculate(input: CreatePurchaseInvoiceItemDto[], vat?: number) {
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

    return {
      items,
      subtotal: this.round(subtotal),
      grandTotal: this.round(subtotal + (vat ?? 0)),
    };
  }

  private round(value: number) {
    return Math.round((value + Number.EPSILON) * 10000) / 10000;
  }

  private invoiceRelations() {
    return {
      vendor: true,
      purchaseOrder: true,
      items: { include: { variant: true, unit: true } },
      payments: true,
    } satisfies Prisma.PurchaseInvoiceInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Invoice number already exists for this vendor',
        );
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related vendor, purchase order, variant, or unit not found',
        );
      }
    }

    throw error;
  }
}
