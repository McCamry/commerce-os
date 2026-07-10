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
      runTx({ shipment: { findUnique: jest.fn().mockResolvedValue(null) } });

      await expect(
        service.markAsShipped('missing', 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('rejects shipping a shipment that is not PENDING', async () => {
      runTx({
        shipment: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'sh-1',
            status: 'SHIPPED',
            items: [],
            salesOrder: { warehouseId: 'wh-1' },
          }),
        },
      });

      await expect(
        service.markAsShipped('sh-1', 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
