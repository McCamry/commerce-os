import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreatePurchaseReturnDto,
  CreatePurchaseReturnItemDto,
} from './dto/create-purchase-return.dto';
import { UpdatePurchaseReturnDto } from './dto/update-purchase-return.dto';

@Injectable()
export class PurchaseReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    vendorId?: string;
    status?: string;
  }) {
    const whereClause: Prisma.PurchaseReturnWhereInput = {
      deletedAt: null,
      vendor: { organizationId: filter.organizationId },
    };

    if (filter.vendorId) {
      whereClause.vendorId = filter.vendorId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.purchaseReturn.findMany({
      where: whereClause,
      orderBy: [{ returnDate: 'desc' }],
      include: { vendor: true },
    });
  }

  async findOne(id: string) {
    const purchaseReturn = await this.prisma.purchaseReturn.findFirst({
      where: { id, deletedAt: null },
      include: this.returnRelations(),
    });

    if (!purchaseReturn) {
      throw new NotFoundException('Purchase return not found');
    }

    return purchaseReturn;
  }

  async create(dto: CreatePurchaseReturnDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Purchase return must contain at least one item',
      );
    }

    try {
      return await this.prisma.purchaseReturn.create({
        data: {
          vendorId: dto.vendorId,
          returnNo: dto.returnNo,
          returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined,
          reason: dto.reason,
          status: dto.status ?? 'DRAFT',
          items: { create: this.mapItems(dto.items) },
        },
        include: this.returnRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdatePurchaseReturnDto) {
    await this.findOne(id);

    const data: Prisma.PurchaseReturnUpdateInput = {
      returnNo: dto.returnNo,
      returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined,
      reason: dto.reason,
      status: dto.status,
    };

    try {
      if (dto.items) {
        if (dto.items.length === 0) {
          throw new BadRequestException(
            'Purchase return must contain at least one item',
          );
        }

        return await this.prisma.$transaction(async (tx) => {
          await tx.purchaseReturnItem.deleteMany({
            where: { purchaseReturnId: id },
          });
          return tx.purchaseReturn.update({
            where: { id },
            data: { ...data, items: { create: this.mapItems(dto.items!) } },
            include: this.returnRelations(),
          });
        });
      }

      return await this.prisma.purchaseReturn.update({
        where: { id },
        data,
        include: this.returnRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.purchaseReturn.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private mapItems(items: CreatePurchaseReturnItemDto[]) {
    return items.map((item) => ({
      variantId: item.variantId,
      unitId: item.unitId,
      quantity: item.quantity,
      reason: item.reason,
    }));
  }

  private returnRelations() {
    return {
      vendor: true,
      items: { include: { variant: true, unit: true } },
    } satisfies Prisma.PurchaseReturnInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Return number already exists for this vendor',
        );
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related vendor, variant, or unit not found',
        );
      }
    }

    throw error;
  }
}
