import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';

describe('QuotationsService', () => {
  let service: QuotationsService;
  let prisma: {
    quotation: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    quotationItem: { deleteMany: jest.Mock };
    $transaction: jest.Mock;
  };

  const baseDto: CreateQuotationDto = {
    organizationId: 'org-1',
    storeId: 'store-1',
    customerId: 'cust-1',
    quotationNo: 'QT-001',
    items: [
      { variantId: 'v-1', unitId: 'u-1', quantity: 2, unitPrice: 100, taxRate: 7 },
      {
        variantId: 'v-2',
        unitId: 'u-1',
        quantity: 1,
        unitPrice: 50,
        discount: 5,
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      quotation: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'q-1' }),
        update: jest.fn().mockResolvedValue({ id: 'q-1' }),
      },
      quotationItem: { deleteMany: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<QuotationsService>(QuotationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('rejects a quotation with no items', async () => {
      await expect(
        service.create({ ...baseDto, items: [] }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('computes header totals and per-line totals', async () => {
      await service.create(baseDto);

      const arg = prisma.quotation.create.mock.calls[0][0];
      // subtotal = 2*100 + 1*50 = 250; discount = 5; vat = 200*7% = 14
      expect(arg.data.subtotal).toBe(250);
      expect(arg.data.discount).toBe(5);
      expect(arg.data.vat).toBe(14);
      expect(arg.data.grandTotal).toBe(259); // 250 - 5 + 14

      const lines = arg.data.items.create;
      expect(lines[0].lineTotal).toBe(200); // 2*100 - 0
      expect(lines[1].lineTotal).toBe(45); // 1*50 - 5
    });

    it('defaults status to DRAFT', async () => {
      await service.create(baseDto);

      const arg = prisma.quotation.create.mock.calls[0][0];
      expect(arg.data.status).toBe('DRAFT');
    });
  });

  describe('update', () => {
    it('replaces items inside a transaction and recomputes totals', async () => {
      prisma.quotation.findFirst.mockResolvedValue({ id: 'q-1' });
      const tx = {
        quotationItem: { deleteMany: jest.fn() },
        quotation: { update: jest.fn().mockResolvedValue({ id: 'q-1' }) },
      };
      prisma.$transaction.mockImplementation((cb) => cb(tx));

      await service.update('q-1', {
        items: [{ variantId: 'v-9', unitId: 'u-1', quantity: 3, unitPrice: 10 }],
      });

      expect(tx.quotationItem.deleteMany).toHaveBeenCalledWith({
        where: { quotationId: 'q-1' },
      });
      const arg = tx.quotation.update.mock.calls[0][0];
      expect(arg.data.subtotal).toBe(30);
      expect(arg.data.grandTotal).toBe(30);
    });

    it('rejects an update that clears all items', async () => {
      prisma.quotation.findFirst.mockResolvedValue({ id: 'q-1' });

      await expect(
        service.update('q-1', { items: [] }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when missing', async () => {
      prisma.quotation.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('soft-deletes by setting deletedAt only', async () => {
      prisma.quotation.findFirst.mockResolvedValue({ id: 'q-1' });

      await service.remove('q-1');

      expect(prisma.quotation.update).toHaveBeenCalledWith({
        where: { id: 'q-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
