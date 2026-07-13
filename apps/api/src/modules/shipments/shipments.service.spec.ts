import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentsService } from './shipments.service';
import { PrismaService } from '../../database/prisma.service';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  const prisma = { $transaction: jest.fn() };
  const eventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markAsShipped', () => {
    const runTx = (tx: unknown) =>
      prisma.$transaction.mockImplementation((cb: (t: unknown) => unknown) =>
        cb(tx),
      );

    it('throws NotFoundException when the shipment does not exist', async () => {
      runTx({ shipment: { findFirst: jest.fn().mockResolvedValue(null) } });

      await expect(
        service.markAsShipped('missing', 'user-1', 'org-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('rejects shipping a shipment that is not PENDING', async () => {
      runTx({
        shipment: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'sh-1',
            status: 'SHIPPED',
            items: [],
            salesOrder: { warehouseId: 'wh-1' },
          }),
        },
      });

      await expect(
        service.markAsShipped('sh-1', 'user-1', 'org-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('ships across multiple inventory locations (FIFO)', async () => {
      const shipment = {
        id: 'sh-1',
        status: 'PENDING',
        salesOrderId: 'so-1',
        salesOrder: { id: 'so-1', warehouseId: 'wh-1' },
        items: [
          {
            id: 'si-1',
            quantity: 10,
            salesOrderItem: { id: 'oi-1', variantId: 'v-1', quantity: 10 },
          },
        ],
      };
      const invRows = [
        {
          id: 'inv-1',
          warehouseLocationId: 'loc-1',
          reservedQty: 4,
          quantity: 4,
          lotId: null,
          serialId: null,
        },
        {
          id: 'inv-2',
          warehouseLocationId: 'loc-2',
          reservedQty: 6,
          quantity: 6,
          lotId: 'lot-1',
          serialId: null,
        },
      ];
      const tx = {
        shipment: {
          findFirst: jest.fn().mockResolvedValue(shipment),
          update: jest.fn().mockResolvedValue({}),
        },
        inventoryLocation: {
          findMany: jest.fn().mockResolvedValue(invRows),
          update: jest.fn().mockResolvedValue({}),
        },
        inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
        salesOrderItem: {
          update: jest.fn().mockResolvedValue({}),
          findMany: jest
            .fn()
            .mockResolvedValue([{ id: 'oi-1', quantity: 10, shippedQty: 10 }]),
        },
        salesOrder: { update: jest.fn().mockResolvedValue({}) },
      };
      runTx(tx);

      await service.markAsShipped('sh-1', 'user-1', 'org-1');

      expect(tx.inventoryLocation.update).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({
            quantity: { decrement: 4 },
            reservedQty: { decrement: 4 },
          }),
        }),
      );
      expect(tx.inventoryLocation.update).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          where: { id: 'inv-2' },
          data: expect.objectContaining({
            quantity: { decrement: 6 },
            reservedQty: { decrement: 6 },
          }),
        }),
      );
      expect(tx.salesOrderItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'oi-1' },
          data: { shippedQty: { increment: 10 } },
        }),
      );
    });

    it('rejects when aggregate reserved qty is insufficient', async () => {
      const shipment = {
        id: 'sh-2',
        status: 'PENDING',
        salesOrderId: 'so-1',
        salesOrder: { id: 'so-1', warehouseId: 'wh-1' },
        items: [
          {
            id: 'si-2',
            quantity: 10,
            salesOrderItem: { id: 'oi-2', variantId: 'v-2', quantity: 10 },
          },
        ],
      };
      const invRows = [
        {
          id: 'inv-3',
          warehouseLocationId: 'loc-1',
          reservedQty: 5,
          quantity: 8,
          lotId: null,
          serialId: null,
        },
      ];
      const tx = {
        shipment: {
          findFirst: jest.fn().mockResolvedValue(shipment),
          update: jest.fn().mockResolvedValue({}),
        },
        inventoryLocation: {
          findMany: jest.fn().mockResolvedValue(invRows),
          update: jest.fn().mockResolvedValue({}),
        },
        inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
        salesOrderItem: {
          update: jest.fn().mockResolvedValue({}),
          findMany: jest.fn().mockResolvedValue([]),
        },
        salesOrder: { update: jest.fn().mockResolvedValue({}) },
      };
      runTx(tx);

      await expect(
        service.markAsShipped('sh-2', 'user-1', 'org-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
