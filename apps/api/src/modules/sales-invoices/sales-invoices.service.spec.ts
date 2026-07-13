import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesInvoicesService } from './sales-invoices.service';
import { PrismaService } from '../../database/prisma.service';

describe('SalesInvoicesService', () => {
  let service: SalesInvoicesService;
  const prisma = {
    salesInvoice: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    salesInvoiceItem: { deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };

  const baseDto = {
    salesOrderId: 'so-1',
    invoiceNo: 'SINV-001',
    vat: 14,
    items: [
      { variantId: 'v-1', unitId: 'u-1', quantity: 2, unitPrice: 100 },
      { variantId: 'v-2', unitId: 'u-1', quantity: 1, unitPrice: 50 },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.salesInvoice.create.mockResolvedValue({ id: 'si-1' });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesInvoicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<SalesInvoicesService>(SalesInvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects an invoice with no items', async () => {
    await expect(
      service.create({ ...baseDto, items: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('computes subtotal from lines and grandTotal = subtotal + vat', async () => {
    await service.create(baseDto);
    expect(prisma.salesInvoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 250,
          vat: 14,
          grandTotal: 264,
        }),
      }),
    );
  });

  it('filters findAll by salesOrder and excludes soft-deleted rows', () => {
    prisma.salesInvoice.findMany.mockResolvedValue([]);
    service.findAll({ organizationId: 'org-1', salesOrderId: 'so-1' });
    expect(prisma.salesInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          salesOrder: { organizationId: 'org-1' },
          salesOrderId: 'so-1',
        },
      }),
    );
  });

  it('throws NotFoundException when an invoice is missing', async () => {
    prisma.salesInvoice.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 'org-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
