import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateQuotationDto,
  CreateQuotationItemDto,
} from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    storeId?: string;
    customerId?: string;
    status?: string;
  }) {
    const whereClause: Prisma.QuotationWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.storeId) {
      whereClause.storeId = filter.storeId;
    }

    if (filter.customerId) {
      whereClause.customerId = filter.customerId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.quotation.findMany({
      where: whereClause,
      orderBy: [{ quotationDate: 'desc' }],
      include: { customer: true, store: true },
    });
  }

  async findOne(id: string, organizationId: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: this.quotationRelations(),
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async create(dto: CreateQuotationDto, organizationId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Quotation must contain at least one item');
    }

    const { items, totals } = this.calculate(dto.items);

    try {
      return await this.prisma.quotation.create({
        data: {
          organizationId,
          storeId: dto.storeId,
          customerId: dto.customerId,
          quotationNo: dto.quotationNo,
          quotationDate: dto.quotationDate
            ? new Date(dto.quotationDate)
            : undefined,
          expireDate: dto.expireDate ? new Date(dto.expireDate) : undefined,
          remark: dto.remark,
          status: dto.status || 'DRAFT',
          subtotal: totals.subtotal,
          discount: totals.discount,
          vat: totals.vat,
          grandTotal: totals.grandTotal,
          items: {
            create: items,
          },
        },
        include: this.quotationRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateQuotationDto, organizationId: string) {
    await this.findOne(id, organizationId);

    const data: Prisma.QuotationUpdateInput = {
      quotationDate: dto.quotationDate
        ? new Date(dto.quotationDate)
        : undefined,
      expireDate:
        dto.expireDate === null
          ? null
          : dto.expireDate
            ? new Date(dto.expireDate)
            : undefined,
      remark: dto.remark,
      status: dto.status,
    };

    if (dto.items) {
      if (dto.items.length === 0) {
        throw new BadRequestException(
          'Quotation must contain at least one item',
        );
      }

      const { items, totals } = this.calculate(dto.items);
      data.subtotal = totals.subtotal;
      data.discount = totals.discount;
      data.vat = totals.vat;
      data.grandTotal = totals.grandTotal;

      try {
        return await this.prisma.$transaction(async (tx) => {
          await tx.quotationItem.deleteMany({ where: { quotationId: id } });
          return tx.quotation.update({
            where: { id },
            data: {
              ...data,
              items: { create: items },
            },
            include: this.quotationRelations(),
          });
        });
      } catch (error) {
        this.handleWriteError(error);
      }
    }

    try {
      return await this.prisma.quotation.update({
        where: { id },
        data,
        include: this.quotationRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.quotation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Computes per-line totals and header roll-ups.
   * Line: net = quantity * unitPrice - discount; tax = net * taxRate%; lineTotal = net (ex-tax).
   * Header: subtotal = Σ gross; discount = Σ line discount; vat = Σ line tax;
   *         grandTotal = subtotal - discount + vat.
   */
  private calculate(input: CreateQuotationItemDto[]) {
    let subtotal = 0;
    let discountTotal = 0;
    let vatTotal = 0;

    const items = input.map((item) => {
      const gross = item.quantity * item.unitPrice;
      const discount = item.discount ?? 0;
      const taxRate = item.taxRate ?? 0;
      const net = gross - discount;
      const lineTax = (net * taxRate) / 100;

      subtotal += gross;
      discountTotal += discount;
      vatTotal += lineTax;

      return {
        variantId: item.variantId,
        unitId: item.unitId,
        quantity: item.quantity,
        unitPrice: this.round(item.unitPrice),
        discount: this.round(discount),
        taxRate: this.round(taxRate),
        lineTotal: this.round(net),
      };
    });

    return {
      items,
      totals: {
        subtotal: this.round(subtotal),
        discount: this.round(discountTotal),
        vat: this.round(vatTotal),
        grandTotal: this.round(subtotal - discountTotal + vatTotal),
      },
    };
  }

  private round(value: number) {
    return Math.round((value + Number.EPSILON) * 10000) / 10000;
  }

  private quotationRelations() {
    return {
      customer: true,
      store: true,
      items: {
        include: { variant: true, unit: true },
      },
    } satisfies Prisma.QuotationInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Quotation number already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related organization, store, customer, variant, or unit not found',
        );
      }
    }

    throw error;
  }
}
