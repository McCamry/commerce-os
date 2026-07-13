import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SalesOrdersService } from './sales-orders.service';
import { PrismaService } from '../../database/prisma.service';

describe('SalesOrdersService', () => {
  let service: SalesOrdersService;
  const prisma = { $transaction: jest.fn() };
  const eventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesOrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<SalesOrdersService>(SalesOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirmOrder', () => {
    const runTx = (tx: unknown) =>
      prisma.$transaction.mockImplementation((cb: (t: unknown) => unknown) =>
        cb(tx),
      );

    it('throws NotFoundException when the order does not exist', async () => {
      runTx({ salesOrder: { findUnique: jest.fn().mockResolvedValue(null) } });

      await expect(
        service.confirmOrder('missing', 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('rejects confirming an order that is not in DRAFT status', async () => {
      runTx({
        salesOrder: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: 'so-1', status: 'CONFIRMED', items: [] }),
        },
      });

      await expect(
        service.confirmOrder('so-1', 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('reserves across multiple inventory locations (FIFO) and marks RESERVED', async () => {
      const order = {
        id: 'so-1',
        status: 'DRAFT',
        warehouseId: 'wh-1',
        customerId: 'c-1',
        customer: { creditLimit: null },
        grandTotal: 0,
        items: [{ id: 'oi-1', variantId: 'v-1', quantity: 10 }],
      };
      const invRows = [
        {
          id: 'inv-1',
          warehouseLocationId: 'loc-1',
          availableQty: 4,
          reservedQty: 0,
          quantity: 4,
          lotId: null,
          serialId: null,
        },
        {
          id: 'inv-2',
          warehouseLocationId: 'loc-2',
          availableQty: 8,
          reservedQty: 0,
          quantity: 8,
          lotId: 'lot-1',
          serialId: null,
        },
      ];
      const tx = {
        salesOrder: {
          findUnique: jest.fn().mockResolvedValue(order),
          update: jest
            .fn()
            .mockImplementation(({ data }: { data: unknown }) =>
              Promise.resolve({ ...order, ...(data as object) }),
            ),
        },
        inventoryLocation: {
          findMany: jest.fn().mockResolvedValue(invRows),
          update: jest.fn().mockResolvedValue({}),
        },
        salesOrderItem: { update: jest.fn().mockResolvedValue({}) },
        inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
      };
      runTx(tx);

      const result = await service.confirmOrder('so-1', 'user-1');

      expect(tx.inventoryLocation.update).toHaveBeenCalledTimes(2);
      // First location fully drained (4), second takes the remaining 6.
      expect(tx.inventoryLocation.update).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({
            availableQty: { decrement: 4 },
            reservedQty: { increment: 4 },
          }),
        }),
      );
      expect(tx.inventoryLocation.update).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: { id: 'inv-2' },
          data: expect.objectContaining({
            availableQty: { decrement: 6 },
            reservedQty: { increment: 6 },
          }),
        }),
      );
      expect(tx.salesOrderItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'oi-1' },
          data: { reservedQty: 10 },
        }),
      );
      expect(tx.inventoryMovement.create).toHaveBeenCalledTimes(2);
      expect(result.status).toBe('RESERVED');
    });

    it('backorders when aggregate availability is insufficient', async () => {
      const order = {
        id: 'so-2',
        status: 'DRAFT',
        warehouseId: 'wh-1',
        customerId: 'c-1',
        customer: { creditLimit: null },
        grandTotal: 0,
        items: [{ id: 'oi-2', variantId: 'v-2', quantity: 10 }],
      };
      const invRows = [
        {
          id: 'inv-3',
          warehouseLocationId: 'loc-1',
          availableQty: 3,
          reservedQty: 0,
          quantity: 3,
          lotId: null,
          serialId: null,
        },
      ];
      const tx = {
        salesOrder: {
          findUnique: jest.fn().mockResolvedValue(order),
          update: jest
            .fn()
            .mockImplementation(({ data }: { data: unknown }) =>
              Promise.resolve({ ...order, ...(data as object) }),
            ),
        },
        inventoryLocation: {
          findMany: jest.fn().mockResolvedValue(invRows),
          update: jest.fn().mockResolvedValue({}),
        },
        salesOrderItem: { update: jest.fn().mockResolvedValue({}) },
        inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
      };
      runTx(tx);

      const result = await service.confirmOrder('so-2', 'user-1');

      expect(tx.salesOrderItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { reservedQty: 3 } }),
      );
      expect(result.status).toBe('BACKORDERED');
    });
  });
});
