import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreatePriceBookDto,
  CreatePriceBookItemDto,
} from './dto/create-price-book.dto';
import { UpdatePriceBookDto } from './dto/update-price-book.dto';

@Injectable()
export class PriceBooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    customerGroupId?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) {
    const whereClause: Prisma.PriceBookWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.customerGroupId) {
      whereClause.customerGroupId = filter.customerGroupId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.priceBook.findMany({
      where: whereClause,
      orderBy: [{ name: 'asc' }],
      include: { customerGroup: true },
    });
  }

  async findOne(id: string) {
    const priceBook = await this.prisma.priceBook.findFirst({
      where: { id, deletedAt: null },
      include: this.priceBookRelations(),
    });

    if (!priceBook) {
      throw new NotFoundException('Price book not found');
    }

    return priceBook;
  }

  async create(dto: CreatePriceBookDto) {
    try {
      return await this.prisma.priceBook.create({
        data: {
          organizationId: dto.organizationId,
          customerGroupId: dto.customerGroupId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          currency: dto.currency ?? 'THB',
          effectiveDate: dto.effectiveDate
            ? new Date(dto.effectiveDate)
            : undefined,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
          status: dto.status ?? 'ACTIVE',
          items: dto.items ? { create: this.mapItems(dto.items) } : undefined,
        },
        include: this.priceBookRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdatePriceBookDto) {
    await this.findOne(id);

    const data: Prisma.PriceBookUpdateInput = {
      customerGroup: dto.customerGroupId
        ? { connect: { id: dto.customerGroupId } }
        : dto.customerGroupId === null
          ? { disconnect: true }
          : undefined,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      currency: dto.currency,
      effectiveDate: dto.effectiveDate
        ? new Date(dto.effectiveDate)
        : undefined,
      expiryDate:
        dto.expiryDate === null
          ? null
          : dto.expiryDate
            ? new Date(dto.expiryDate)
            : undefined,
      status: dto.status,
    };

    try {
      if (dto.items) {
        return await this.prisma.$transaction(async (tx) => {
          await tx.priceBookItem.deleteMany({ where: { priceBookId: id } });
          return tx.priceBook.update({
            where: { id },
            data: { ...data, items: { create: this.mapItems(dto.items!) } },
            include: this.priceBookRelations(),
          });
        });
      }

      return await this.prisma.priceBook.update({
        where: { id },
        data,
        include: this.priceBookRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.priceBook.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
  }

  private mapItems(items: CreatePriceBookItemDto[]) {
    return items.map((item) => ({
      variantId: item.variantId,
      price: item.price,
      minQuantity: item.minQuantity ?? 1,
    }));
  }

  private priceBookRelations() {
    return {
      customerGroup: true,
      items: { include: { variant: true } },
    } satisfies Prisma.PriceBookInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Price book code already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related organization, customer group, or variant not found',
        );
      }
    }

    throw error;
  }
}
