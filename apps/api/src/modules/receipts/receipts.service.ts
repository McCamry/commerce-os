import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    salesInvoiceId?: string;
    status?: string;
  }) {
    const whereClause: Prisma.ReceiptWhereInput = {
      deletedAt: null,
      salesInvoice: { salesOrder: { organizationId: filter.organizationId } },
    };

    if (filter.salesInvoiceId) {
      whereClause.salesInvoiceId = filter.salesInvoiceId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.receipt.findMany({
      where: whereClause,
      orderBy: [{ paymentDate: 'desc' }],
      include: { salesInvoice: true },
    });
  }

  async findOne(id: string, organizationId: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: {
        id,
        deletedAt: null,
        salesInvoice: { salesOrder: { organizationId } },
      },
      include: { salesInvoice: true },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return receipt;
  }

  async create(dto: CreateReceiptDto) {
    try {
      return await this.prisma.receipt.create({
        data: {
          salesInvoiceId: dto.salesInvoiceId,
          receiptNo: dto.receiptNo,
          paymentMethod: dto.paymentMethod,
          amount: dto.amount,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
          reference: dto.reference,
          status: dto.status ?? 'COMPLETED',
        },
        include: { salesInvoice: true },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateReceiptDto, organizationId: string) {
    await this.findOne(id, organizationId);

    try {
      return await this.prisma.receipt.update({
        where: { id },
        data: {
          receiptNo: dto.receiptNo,
          paymentMethod: dto.paymentMethod,
          amount: dto.amount,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
          reference: dto.reference,
          status: dto.status,
        },
        include: { salesInvoice: true },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.receipt.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Receipt number already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException('Related sales invoice not found');
      }
    }

    throw error;
  }
}
