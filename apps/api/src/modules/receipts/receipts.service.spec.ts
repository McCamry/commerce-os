import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReceiptsService } from './receipts.service';
import { PrismaService } from '../../database/prisma.service';

describe('ReceiptsService', () => {
  let service: ReceiptsService;
  const prisma = {
    receipt: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const baseDto = {
    salesInvoiceId: 'si-1',
    receiptNo: 'RCPT-001',
    paymentMethod: 'TRANSFER',
    amount: 1000,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<ReceiptsService>(ReceiptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters findAll by sales invoice and excludes soft-deleted rows', () => {
    prisma.receipt.findMany.mockResolvedValue([]);
    service.findAll({ organizationId: 'org-1', salesInvoiceId: 'si-1' });
    expect(prisma.receipt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          salesInvoice: { salesOrder: { organizationId: 'org-1' } },
          salesInvoiceId: 'si-1',
        },
      }),
    );
  });

  it('defaults status to COMPLETED on create', async () => {
    prisma.receipt.create.mockResolvedValue({ id: 'r-1' });
    await service.create(baseDto);
    expect(prisma.receipt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'COMPLETED' }),
      }),
    );
  });

  it('maps a unique-constraint violation to ConflictException', async () => {
    prisma.receipt.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(service.create(baseDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('throws NotFoundException when a receipt is missing', async () => {
    prisma.receipt.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 'org-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('soft-deletes by setting deletedAt only', async () => {
    prisma.receipt.findFirst.mockResolvedValue({ id: 'r-1' });
    await service.remove('r-1', 'org-1');
    expect(prisma.receipt.update).toHaveBeenCalledWith({
      where: { id: 'r-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
