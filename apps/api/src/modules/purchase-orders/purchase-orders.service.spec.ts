import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PrismaService } from '../../database/prisma.service';

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;
  const prisma = {
    purchaseOrder: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PurchaseOrdersService>(PurchaseOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('computes line totals, subtotal and grandTotal and scopes to the org', async () => {
      prisma.purchaseOrder.create.mockResolvedValue({ id: 'po-1' });

      await service.create(
        {
          storeId: 's-1',
          warehouseId: 'wh-1',
          vendorId: 'v-1',
          purchaseNo: 'PO-1',
          vat: 7,
          shippingCost: 3,
          discount: 5,
          items: [
            { variantId: 'var-1', unitId: 'u-1', quantity: 2, unitPrice: 10 },
            { variantId: 'var-2', unitId: 'u-1', quantity: 1, unitPrice: 30 },
          ],
        },
        'org-1',
      );

      const arg = prisma.purchaseOrder.create.mock.calls[0][0];
      expect(arg.data.organizationId).toBe('org-1');
      expect(arg.data.subtotal).toBe(50); // 2*10 + 1*30
      expect(arg.data.grandTotal).toBe(55); // 50 + 7 + 3 - 5
      expect(arg.data.items.create[0].lineTotal).toBe(20);
    });

    it('rejects an order with no items', async () => {
      await expect(
        service.create(
          {
            storeId: 's-1',
            warehouseId: 'wh-1',
            vendorId: 'v-1',
            purchaseNo: 'PO-1',
            items: [],
          },
          'org-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('approve', () => {
    it('throws NotFound when the order is not in the caller org', async () => {
      prisma.purchaseOrder.findFirst.mockResolvedValue(null);

      await expect(service.approve('po-1', 'org-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects approving an order that is not DRAFT/WAITING_APPROVAL', async () => {
      prisma.purchaseOrder.findFirst.mockResolvedValue({
        id: 'po-1',
        status: 'COMPLETED',
      });

      await expect(service.approve('po-1', 'org-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
