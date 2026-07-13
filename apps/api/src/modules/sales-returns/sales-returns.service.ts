import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateSalesReturnDto,
  CreateSalesReturnItemDto,
} from './dto/create-sales-return.dto';
import { UpdateSalesReturnDto } from './dto/update-sales-return.dto';

@Injectable()
export class SalesReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    salesOrderId?: string;
    status?: string;
  }) {
    const whereClause: Prisma.SalesReturnWhereInput = {
      deletedAt: null,
      salesOrder: { organizationId: filter.organizationId },
    };

    if (filter.salesOrderId) {
      whereClause.salesOrderId = filter.salesOrderId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.salesReturn.findMany({
      where: whereClause,
      orderBy: [{ returnDate: 'desc' }],
      include: { salesOrder: true },
    });
  }

  async findOne(id: string, organizationId: string) {
    const salesReturn = await this.prisma.salesReturn.findFirst({
      where: { id, deletedAt: null, salesOrder: { organizationId } },
      include: this.returnRelations(),
    });

    if (!salesReturn) {
      throw new NotFoundException('Sales return not found');
    }

    return salesReturn;
  }

  async create(dto: CreateSalesReturnDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Sales return must contain at least one item',
      );
    }

    try {
      return await this.prisma.salesReturn.create({
        data: {
          salesOrderId: dto.salesOrderId,
          returnNo: dto.returnNo,
          returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined,
          reason: dto.reason,
          status: dto.status ?? 'COMPLETED',
          items: { create: this.mapItems(dto.items) },
        },
        include: this.returnRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateSalesReturnDto, organizationId: string) {
    await this.findOne(id, organizationId);

    const data: Prisma.SalesReturnUpdateInput = {
      returnNo: dto.returnNo,
      returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined,
      reason: dto.reason,
      status: dto.status,
    };

    try {
      if (dto.items) {
        if (dto.items.length === 0) {
          throw new BadRequestException(
            'Sales return must contain at least one item',
          );
        }

        return await this.prisma.$transaction(async (tx) => {
          await tx.salesReturnItem.deleteMany({
            where: { salesReturnId: id },
          });
          return tx.salesReturn.update({
            where: { id },
            data: { ...data, items: { create: this.mapItems(dto.items!) } },
            include: this.returnRelations(),
          });
        });
      }

      return await this.prisma.salesReturn.update({
        where: { id },
        data,
        include: this.returnRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.salesReturn.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private mapItems(items: CreateSalesReturnItemDto[]) {
    return items.map((item) => ({
      variantId: item.variantId,
      unitId: item.unitId,
      quantity: item.quantity,
      reason: item.reason,
    }));
  }

  private returnRelations() {
    return {
      salesOrder: true,
      items: { include: { variant: true, unit: true } },
    } satisfies Prisma.SalesReturnInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Return number already exists');
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
