import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateSalesInvoiceDto,
  CreateSalesInvoiceItemDto,
} from './dto/create-sales-invoice.dto';
import { UpdateSalesInvoiceDto } from './dto/update-sales-invoice.dto';

@Injectable()
export class SalesInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    salesOrderId?: string;
    status?: string;
  }) {
    const whereClause: Prisma.SalesInvoiceWhereInput = {
      deletedAt: null,
      salesOrder: { organizationId: filter.organizationId },
    };

    if (filter.salesOrderId) {
      whereClause.salesOrderId = filter.salesOrderId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.salesInvoice.findMany({
      where: whereClause,
      orderBy: [{ invoiceDate: 'desc' }],
      include: { salesOrder: true },
    });
  }

  async findOne(id: string, organizationId: string) {
    const invoice = await this.prisma.salesInvoice.findFirst({
      where: { id, deletedAt: null, salesOrder: { organizationId } },
      include: this.invoiceRelations(),
    });

    if (!invoice) {
      throw new NotFoundException('Sales invoice not found');
    }

    return invoice;
  }

  async create(dto: CreateSalesInvoiceDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Sales invoice must contain at least one item',
      );
    }

    const { items, subtotal, grandTotal } = this.calculate(dto.items, dto.vat);

    try {
      return await this.prisma.salesInvoice.create({
        data: {
          salesOrderId: dto.salesOrderId,
          invoiceNo: dto.invoiceNo,
          invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
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

  async update(id: string, dto: UpdateSalesInvoiceDto, organizationId: string) {
    const existing = await this.findOne(id, organizationId);

    const data: Prisma.SalesInvoiceUpdateInput = {
      invoiceNo: dto.invoiceNo,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
      status: dto.status,
    };

    try {
      if (dto.items) {
        if (dto.items.length === 0) {
          throw new BadRequestException(
            'Sales invoice must contain at least one item',
          );
        }

        const vat = dto.vat ?? Number(existing.vat);
        const { items, subtotal, grandTotal } = this.calculate(dto.items, vat);
        data.subtotal = subtotal;
        data.vat = this.round(vat);
        data.grandTotal = grandTotal;

        return await this.prisma.$transaction(async (tx) => {
          await tx.salesInvoiceItem.deleteMany({
            where: { salesInvoiceId: id },
          });
          return tx.salesInvoice.update({
            where: { id },
            data: { ...data, items: { create: items } },
            include: this.invoiceRelations(),
          });
        });
      }

      if (dto.vat !== undefined) {
        data.vat = this.round(dto.vat);
        data.grandTotal = this.round(Number(existing.subtotal) + dto.vat);
      }

      return await this.prisma.salesInvoice.update({
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

    return this.prisma.salesInvoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Line: lineTotal = quantity * unitPrice.
   * Header: subtotal = Σ lineTotal; grandTotal = subtotal + vat.
   */
  private calculate(input: CreateSalesInvoiceItemDto[], vat?: number) {
    let subtotal = 0;

    const items = input.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;

      return {
        variantId: item.variantId,
        unitId: item.unitId,
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
      salesOrder: true,
      items: { include: { variant: true, unit: true } },
      receipts: true,
    } satisfies Prisma.SalesInvoiceInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Invoice number already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related sales order, variant, or unit not found',
        );
      }
    }

    throw error;
  }
}
