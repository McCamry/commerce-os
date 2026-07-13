import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceivesService } from './goods-receives.service';
import { PrismaService } from '../../database/prisma.service';

describe('GoodsReceivesService', () => {
  let service: GoodsReceivesService;
  const prisma = { $transaction: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoodsReceivesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<GoodsReceivesService>(GoodsReceivesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const makeTx = () => ({
      inventoryLot: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'lot-1' }),
      },
      inventorySerial: {
        upsert: jest.fn().mockResolvedValue({ id: 'ser-1' }),
      },
      goodsReceive: {
        create: jest.fn().mockResolvedValue({
          id: 'grn-1',
          receiveNo: 'GRN-001',
          receivedBy: 'user-1',
          items: [],
        }),
      },
      purchaseOrder: { update: jest.fn().mockResolvedValue({}) },
      purchaseOrderItem: { update: jest.fn().mockResolvedValue({}) },
      inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
      inventoryLocation: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
    });

    it('creates lot & serial records and keys the inventory row by them', async () => {
      const tx = makeTx();
      prisma.$transaction.mockImplementation((cb: (t: unknown) => unknown) =>
        cb(tx),
      );

      await service.create({
        purchaseOrderId: 'po-1',
        warehouseId: 'wh-1',
        receiveNo: 'GRN-001',
        receivedBy: 'user-1',
        items: [
          {
            variantId: 'v-1',
            unitId: 'u-1',
            locationId: 'loc-1',
            quantity: 5,
            lotNumber: 'LOT-A',
            serialNumber: 'SN-1',
            expireDate: '2027-01-01',
          },
        ],
      });

      expect(tx.inventoryLot.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            variantId: 'v-1',
            lotNumber: 'LOT-A',
            expireDate: new Date('2027-01-01'),
          }),
        }),
      );
      expect(tx.inventorySerial.upsert).toHaveBeenCalled();
      // Inventory is looked up and created keyed by the resolved lot/serial ids
      expect(tx.inventoryLocation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ lotId: 'lot-1', serialId: 'ser-1' }),
        }),
      );
      expect(tx.inventoryLocation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lotId: 'lot-1',
            serialId: 'ser-1',
            quantity: 5,
            availableQty: 5,
          }),
        }),
      );
      // The movement carries the lot/serial linkage too
      expect(tx.inventoryMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lotId: 'lot-1', serialId: 'ser-1' }),
        }),
      );
    });

    it('leaves lot/serial null when not provided', async () => {
      const tx = makeTx();
      prisma.$transaction.mockImplementation((cb: (t: unknown) => unknown) =>
        cb(tx),
      );

      await service.create({
        purchaseOrderId: 'po-1',
        warehouseId: 'wh-1',
        receiveNo: 'GRN-002',
        receivedBy: 'user-1',
        items: [
          { variantId: 'v-1', unitId: 'u-1', locationId: 'loc-1', quantity: 3 },
        ],
      });

      expect(tx.inventoryLot.create).not.toHaveBeenCalled();
      expect(tx.inventorySerial.upsert).not.toHaveBeenCalled();
      expect(tx.inventoryLocation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lotId: null, serialId: null }),
        }),
      );
    });
  });
});
