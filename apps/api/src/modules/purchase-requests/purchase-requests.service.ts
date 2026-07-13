import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreatePurchaseRequestDto,
  CreatePurchaseRequestItemDto,
} from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';

@Injectable()
export class PurchaseRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    storeId?: string;
    status?: string;
  }) {
    const whereClause: Prisma.PurchaseRequestWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.storeId) {
      whereClause.storeId = filter.storeId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.purchaseRequest.findMany({
      where: whereClause,
      orderBy: [{ requestDate: 'desc' }],
      include: { store: true },
    });
  }

  async findOne(id: string, organizationId: string) {
    const request = await this.prisma.purchaseRequest.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: this.requestRelations(),
    });

    if (!request) {
      throw new NotFoundException('Purchase request not found');
    }

    return request;
  }

  async create(dto: CreatePurchaseRequestDto, organizationId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Purchase request must contain at least one item',
      );
    }

    try {
      return await this.prisma.purchaseRequest.create({
        data: {
          organizationId,
          storeId: dto.storeId,
          requestNo: dto.requestNo,
          requestBy: dto.requestBy,
          requestDate: dto.requestDate ? new Date(dto.requestDate) : undefined,
          status: dto.status ?? 'DRAFT',
          remark: dto.remark,
          items: { create: this.mapItems(dto.items) },
        },
        include: this.requestRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(
    id: string,
    dto: UpdatePurchaseRequestDto,
    organizationId: string,
  ) {
    await this.findOne(id, organizationId);

    const data: Prisma.PurchaseRequestUpdateInput = {
      requestBy: dto.requestBy,
      requestDate: dto.requestDate ? new Date(dto.requestDate) : undefined,
      status: dto.status,
      remark: dto.remark,
    };

    try {
      if (dto.items) {
        if (dto.items.length === 0) {
          throw new BadRequestException(
            'Purchase request must contain at least one item',
          );
        }

        return await this.prisma.$transaction(async (tx) => {
          await tx.purchaseRequestItem.deleteMany({
            where: { purchaseRequestId: id },
          });
          return tx.purchaseRequest.update({
            where: { id },
            data: { ...data, items: { create: this.mapItems(dto.items!) } },
            include: this.requestRelations(),
          });
        });
      }

      return await this.prisma.purchaseRequest.update({
        where: { id },
        data,
        include: this.requestRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.purchaseRequest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private mapItems(items: CreatePurchaseRequestItemDto[]) {
    return items.map((item) => ({
      variantId: item.variantId,
      unitId: item.unitId,
      quantity: item.quantity,
      remark: item.remark,
    }));
  }

  private requestRelations() {
    return {
      store: true,
      items: { include: { variant: true, unit: true } },
    } satisfies Prisma.PurchaseRequestInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Request number already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related organization, store, variant, or unit not found',
        );
      }
    }

    throw error;
  }
}
