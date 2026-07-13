import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PurchaseInvoicesService } from './purchase-invoices.service';
import { PrismaService } from '../../database/prisma.service';

describe('PurchaseInvoicesService', () => {
  let service: PurchaseInvoicesService;
  const prisma = {
    purchaseInvoice: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'pi-1' }),
      update: jest.fn(),
    },
    purchaseInvoiceItem: { deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };

  const baseDto = {
    vendorId: 'vendor-1',
    invoiceNo: 'INV-001',
    invoiceDate: '2026-07-10',
    vat: 21,
    items: [
      { variantId: 'v-1', unitId: 'u-1', quantity: 2, unitPrice: 100 },
      { variantId: 'v-2', unitId: 'u-1', quantity: 1, unitPrice: 50 },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.purchaseInvoice.create.mockResolvedValue({ id: 'pi-1' });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseInvoicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<PurchaseInvoicesService>(PurchaseInvoicesService);
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
    expect(prisma.purchaseInvoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 250,
          vat: 21,
          grandTotal: 271,
          items: {
            create: [
              expect.objectContaining({ lineTotal: 200 }),
              expect.objectContaining({ lineTotal: 50 }),
            ],
          },
        }),
      }),
    );
  });

  it('filters findAll by vendor and excludes soft-deleted rows', () => {
    prisma.purchaseInvoice.findMany.mockResolvedValue([]);
    service.findAll({
      organizationId: 'org-1',
      vendorId: 'vendor-1',
      status: 'PENDING',
    });
    expect(prisma.purchaseInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          vendor: { organizationId: 'org-1' },
          vendorId: 'vendor-1',
          status: 'PENDING',
        },
      }),
    );
  });

  it('throws NotFoundException when an invoice is missing', async () => {
    prisma.purchaseInvoice.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 'org-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
