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
  });
});
